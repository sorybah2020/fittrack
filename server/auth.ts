import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { pool } from "../db";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "fitness-tracker-secret",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool,
      tableName: 'session', // Use the same table name that's already set up
      createTableIfMissing: false // Don't try to create the table again
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = res.rows[0];
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = res.rows[0];
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const checkRes = await pool.query('SELECT * FROM users WHERE username = $1', [req.body.username]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(req.body.password);
      
      const userResult = await pool.query(
        'INSERT INTO users (username, password, daily_move_goal, daily_exercise_goal, daily_stand_goal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [req.body.username, hashedPassword, req.body.dailyMoveGoal, req.body.dailyExerciseGoal, req.body.dailyStandGoal]
      );
      
      const user = userResult.rows[0];
      
      // Convert snake_case to camelCase for client-side
      const formattedUser = {
        ...user,
        dailyMoveGoal: user.daily_move_goal,
        dailyExerciseGoal: user.daily_exercise_goal,
        dailyStandGoal: user.daily_stand_goal
      };

      req.login(formattedUser, (err) => {
        if (err) return next(err);
        
        // Don't send password back to client
        delete formattedUser.password;
        res.status(201).json(formattedUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Don't send password back to client
        const userResponse = { ...user } as any;
        if (userResponse && typeof userResponse === 'object') {
          delete userResponse.password;
        }
        
        return res.status(200).json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    // Don't send password back to client
    const userResponse = { ...req.user } as any;
    if (userResponse && typeof userResponse === 'object') {
      delete userResponse.password;
    }
    
    res.json(userResponse);
  });
}