import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupSpotifyRoutes } from "./spotify";
import { setupPasswordReset } from "./reset-password";
import { z } from "zod";
import { insertWorkoutSchema } from "@shared/schema";
import { pool } from "../db";

// Middleware to check authentication
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication with Passport.js
  setupAuth(app);
  
  // Set up password reset functionality
  setupPasswordReset(app);
  
  // Set up Spotify integration
  setupSpotifyRoutes(app);

  // User routes - rename to use same endpoint naming as setupAuth (/api/user)
  app.get('/api/user', ensureAuthenticated, (req, res) => {
    // Password is already removed in setupAuth's /api/user route,
    // but we're keeping the route here for clarity with our existing routes
    const userResponse = { ...req.user };
    delete (userResponse as any).password;
    res.json(userResponse);
  });
  
  // User stats endpoint
  app.get('/api/users/stats', ensureAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });
  
  app.patch('/api/user', ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const userResponse = { ...updatedUser };
      delete (userResponse as any).password;
      res.json(userResponse);
    } catch (error) {
      console.error('Error updating user:', error);
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
