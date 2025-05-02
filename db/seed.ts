import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  try {
    // Seed workout types
    const workoutTypes = [
      { name: "Running", icon: "running", color: "#FF3B30" },
      { name: "HIIT", icon: "hiit", color: "#FFCC00" },
      { name: "Strength Training", icon: "strength", color: "#FF9500" },
      { name: "Cycling", icon: "cycling", color: "#34C759" },
      { name: "Swimming", icon: "swimming", color: "#5AC8FA" },
      { name: "Cardio", icon: "cardio", color: "#007AFF" },
    ];
    
    // Check if workout types already exist
    const existingTypes = await db.query.workoutTypes.findMany();
    
    if (existingTypes.length === 0) {
      console.log("Seeding workout types...");
      
      for (const workoutType of workoutTypes) {
        await db.insert(schema.workoutTypes).values(workoutType);
      }
      
      console.log("Workout types seeded successfully!");
    } else {
      console.log("Workout types already exist, skipping seed.");
    }
    
    // Create default user if none exists
    const existingUsers = await db.query.users.findMany();
    
    if (existingUsers.length === 0) {
      console.log("Creating default users...");
      
      const defaultPassword = await bcrypt.hash("password123", 10);
      
      // Create main default user
      const [user] = await db.insert(schema.users).values({
        username: "fitnessuser",
        password: defaultPassword,
        dailyMoveGoal: 450,
        dailyExerciseGoal: 30,
        dailyStandGoal: 12
      }).returning();
      
      // Create demo user
      await db.insert(schema.users).values({
        username: "demo",
        password: defaultPassword,
        dailyMoveGoal: 500,
        dailyExerciseGoal: 40,
        dailyStandGoal: 10
      });
      
      console.log("Default users created: 'fitnessuser' and 'demo' (both with password 'password123')");
      
      // Create some sample workouts for the default user
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      
      const sampleWorkouts = [
        {
          userId: user.id,
          workoutTypeId: 1, // Running
          name: "Morning Run",
          date: today,
          duration: 30,
          distance: 3.2,
          intensity: "medium",
          notes: "Felt good today"
        },
        {
          userId: user.id,
          workoutTypeId: 2, // HIIT
          name: "HIIT Session",
          date: yesterday,
          duration: 45,
          intensity: "high",
          notes: "Intense workout"
        },
        {
          userId: user.id,
          workoutTypeId: 3, // Strength Training
          name: "Strength Training",
          date: twoDaysAgo,
          duration: 60,
          intensity: "medium",
          notes: "Full body workout"
        }
      ];
      
      console.log("Creating sample workouts...");
      
      for (const workout of sampleWorkouts) {
        // Calculate calories based on duration and intensity
        let calories = 0;
        if (workout.intensity === "high") {
          calories = workout.duration * 10;
        } else if (workout.intensity === "medium") {
          calories = workout.duration * 7;
        } else {
          calories = workout.duration * 4;
        }
        
        await db.insert(schema.workouts).values({
          ...workout,
          calories
        });
      }
      
      console.log("Sample workouts created!");
      
      // Create activities for each workout day
      const storage = await import("../server/storage").then(m => m.storage);
      
      console.log("Creating activity summaries...");
      
      await storage.updateActivityFromWorkouts(user.id, today);
      await storage.updateActivityFromWorkouts(user.id, yesterday);
      await storage.updateActivityFromWorkouts(user.id, twoDaysAgo);
      
      console.log("Activity summaries created!");
      
      // Create some badges
      const badges = [
        { name: "First Workout", description: "Completed your first workout", icon: "trophy" },
        { name: "Early Bird", description: "Completed a workout before 8am", icon: "sunrise" },
        { name: "Streak Master", description: "Worked out for 7 days in a row", icon: "flame" }
      ];
      
      console.log("Creating badges...");
      
      for (const badge of badges) {
        await db.insert(schema.badges).values(badge);
      }
      
      // Award the "First Workout" badge to the user
      const firstBadge = await db.query.badges.findFirst({
        where: (badges, { eq }) => eq(badges.name, "First Workout")
      });
      
      if (firstBadge) {
        await db.insert(schema.userBadges).values({
          userId: user.id,
          badgeId: firstBadge.id,
          earnedAt: new Date()
        });
      }
      
      console.log("Badges created and awarded!");
    } else {
      console.log("Users already exist, skipping seed.");
    }
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
