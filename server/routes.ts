import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import { pool } from "@db/index";
import { z } from "zod";
import { insertUserSchema, insertWorkoutSchema } from "@shared/schema";
import { json } from "express";

// Passport configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware to check authentication
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const PgSession = connectPgSimple(session);
  
  // Session middleware
  app.use(session({
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'fitness-app-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production'
    }
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Auto-login after registration
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      
      console.error('Error registering user:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // User routes
  app.get('/api/users/me', ensureAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
  app.patch('/api/users/me', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/users/stats', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const stats = await storage.getUserStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Workout Types routes
  app.get('/api/workout-types', async (req, res) => {
    try {
      const workoutTypes = await storage.getAllWorkoutTypes();
      res.json(workoutTypes);
    } catch (error) {
      console.error('Error fetching workout types:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/workout-types/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workoutType = await storage.getWorkoutTypeById(id);
      
      if (!workoutType) {
        return res.status(404).json({ message: "Workout type not found" });
      }
      
      res.json(workoutType);
    } catch (error) {
      console.error('Error fetching workout type:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Workouts routes
  app.get('/api/workouts', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if date query param exists
      if (req.query.date) {
        const date = new Date(req.query.date as string);
        const workouts = await storage.getWorkoutsByDate(userId, date);
        return res.json(workouts);
      }
      
      const workouts = await storage.getWorkoutsByUserId(userId);
      res.json(workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/workouts/:id', ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // Ensure user can only access their own workouts
      if (workout.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(workout);
    } catch (error) {
      console.error('Error fetching workout:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post('/api/workouts', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Parse and validate input, but allow us to handle workout type validation
      const workoutInput = {
        ...req.body,
        userId
      };

      // If date is a string, convert it to a Date object
      if (typeof workoutInput.date === 'string') {
        workoutInput.date = new Date(workoutInput.date);
      }
      
      // Validate workout type exists
      const workoutType = await storage.getWorkoutTypeById(workoutInput.workoutTypeId);
      if (!workoutType) {
        return res.status(400).json({ message: "Invalid workout type" });
      }
      
      const newWorkout = await storage.createWorkout(workoutInput);
      res.status(201).json(newWorkout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      
      console.error('Error creating workout:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch('/api/workouts/:id', ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // Ensure user can only update their own workouts
      if (workout.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedWorkout = await storage.updateWorkout(id, req.body);
      res.json(updatedWorkout);
    } catch (error) {
      console.error('Error updating workout:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete('/api/workouts/:id', ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // Ensure user can only delete their own workouts
      if (workout.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteWorkout(id);
      res.json({ message: "Workout deleted successfully" });
    } catch (error) {
      console.error('Error deleting workout:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Activities routes
  app.get('/api/activities', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      
      const activity = await storage.getActivityByDate(userId, date);
      
      if (!activity) {
        // Return default activity data with user's goals
        const user = await storage.getUserById(userId);
        
        return res.json({
          userId,
          date: date.toISOString().split('T')[0],
          calories: 0,
          moveMinutes: 0,
          moveTarget: user?.dailyMoveGoal || 450,
          exerciseMinutes: 0,
          exerciseTarget: user?.dailyExerciseGoal || 30,
          standHours: 0,
          standTarget: user?.dailyStandGoal || 12,
          caloriesBurned: 0
        });
      }
      
      res.json({
        ...activity,
        caloriesBurned: activity.calories
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/activities/weekly', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const weeklyData = await storage.getWeeklyActivities(userId);
      
      res.json(weeklyData);
    } catch (error) {
      console.error('Error fetching weekly activities:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/activities/monthly/:yearMonth', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const yearMonth = req.params.yearMonth;
      
      const monthlyData = await storage.getMonthlyActivities(userId, yearMonth);
      
      res.json(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly activities:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/activities/averages', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const averages = await storage.getActivityAverages(userId);
      
      res.json(averages);
    } catch (error) {
      console.error('Error fetching activity averages:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Badges routes
  app.get('/api/badges', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const badges = await storage.getUserBadges(userId);
      
      res.json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
