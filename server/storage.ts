import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, gte, lte, desc, avg, sum, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import bcrypt from "bcrypt";

function calculateCalories(duration: number, intensity: string): number {
  // Simple calculation based on intensity and duration
  const intensityFactors: Record<string, number> = {
    low: 4,
    medium: 7,
    high: 10,
  };
  
  const factor = intensityFactors[intensity] || intensityFactors.medium;
  return Math.round(factor * duration);
}

export const storage = {
  // User operations
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    // Hash password for security
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const [newUser] = await db.insert(schema.users)
      .values({
        ...user,
        password: hashedPassword,
      })
      .returning();
      
    return newUser;
  },
  
  async getUserById(id: number): Promise<schema.User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  },
  
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  },
  
  async updateUser(id: number, userData: Partial<schema.User>): Promise<schema.User | undefined> {
    // Ensure we don't update the password field directly
    if ('password' in userData) {
      delete userData.password;
    }
    
    const [updatedUser] = await db.update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
      
    return updatedUser;
  },
  
  async updateUserPassword(id: number, password: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [updatedUser] = await db.update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id });
      
    return !!updatedUser;
  },
  
  async getUserStats(userId: number): Promise<any> {
    // Get total workouts
    const totalWorkoutsQuery = await db.select({
      count: count()
    })
    .from(schema.workouts)
    .where(eq(schema.workouts.userId, userId));
    
    const totalWorkouts = totalWorkoutsQuery[0]?.count || 0;
    
    // Get total calories
    const totalCaloriesQuery = await db.select({
      total: sum(schema.workouts.calories)
    })
    .from(schema.workouts)
    .where(eq(schema.workouts.userId, userId));
    
    const totalCalories = totalCaloriesQuery[0]?.total || 0;
    
    // Calculate streak days (simplified version)
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const recentActivities = await db.select()
      .from(schema.activities)
      .where(
        and(
          eq(schema.activities.userId, userId),
          gte(schema.activities.date, oneWeekAgo),
          lte(schema.activities.date, today)
        )
      )
      .orderBy(desc(schema.activities.date));
    
    const activeDays = recentActivities.filter(a => a.calories > 0).length;
    
    // Get user badges
    const userBadges = await db.query.userBadges.findMany({
      where: eq(schema.userBadges.userId, userId),
      with: {
        badge: true
      }
    });
    
    const badges = userBadges.map(ub => ub.badge.name);
    
    return {
      totalWorkouts,
      totalCalories,
      streakDays: activeDays,
      badges
    };
  },
  
  // Workout Type operations
  async createWorkoutType(workoutType: schema.InsertWorkoutType): Promise<schema.WorkoutType> {
    const [newWorkoutType] = await db.insert(schema.workoutTypes)
      .values(workoutType)
      .returning();
      
    return newWorkoutType;
  },
  
  async getAllWorkoutTypes(): Promise<schema.WorkoutType[]> {
    return await db.query.workoutTypes.findMany();
  },
  
  async getWorkoutTypeById(id: number): Promise<schema.WorkoutType | undefined> {
    return await db.query.workoutTypes.findFirst({
      where: eq(schema.workoutTypes.id, id),
    });
  },
  
  // Workout operations
  async createWorkout(workout: Omit<schema.InsertWorkout, 'calories'>): Promise<schema.Workout> {
    // Calculate calories based on duration and intensity
    const calories = calculateCalories(workout.duration, workout.intensity);
    
    const [newWorkout] = await db.insert(schema.workouts)
      .values({
        ...workout,
        calories
      })
      .returning();
      
    // Make sure date is a proper Date object before passing it
    const workoutDate = workout.date instanceof Date ? workout.date : new Date(workout.date);
    
    // Update activity for the day
    await this.updateActivityFromWorkouts(workout.userId, workoutDate);
      
    return newWorkout;
  },
  
  async getWorkoutById(id: number): Promise<schema.Workout | undefined> {
    return await db.query.workouts.findFirst({
      where: eq(schema.workouts.id, id),
      with: {
        workoutType: true
      }
    });
  },
  
  async getWorkoutsByUserId(userId: number): Promise<schema.Workout[]> {
    return await db.query.workouts.findMany({
      where: eq(schema.workouts.userId, userId),
      orderBy: [desc(schema.workouts.date)],
      with: {
        workoutType: true
      }
    });
  },
  
  async getWorkoutsByDate(userId: number, date: Date): Promise<schema.Workout[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.query.workouts.findMany({
      where: and(
        eq(schema.workouts.userId, userId),
        gte(schema.workouts.date, startOfDay),
        lte(schema.workouts.date, endOfDay)
      ),
      orderBy: [desc(schema.workouts.date)],
      with: {
        workoutType: true
      }
    });
  },
  
  async updateWorkout(id: number, workoutData: Partial<schema.Workout>): Promise<schema.Workout | undefined> {
    // If duration or intensity is updated, recalculate calories
    if ('duration' in workoutData || 'intensity' in workoutData) {
      const currentWorkout = await this.getWorkoutById(id);
      if (currentWorkout) {
        const duration = workoutData.duration || currentWorkout.duration;
        const intensity = workoutData.intensity || currentWorkout.intensity;
        workoutData.calories = calculateCalories(duration, intensity as string);
      }
    }
    
    const [updatedWorkout] = await db.update(schema.workouts)
      .set(workoutData)
      .where(eq(schema.workouts.id, id))
      .returning();
      
    if (updatedWorkout) {
      // Make sure date is a proper Date object before passing it
      const workoutDate = updatedWorkout.date instanceof Date ? updatedWorkout.date : new Date(updatedWorkout.date);
      
      // Update activity for the day
      await this.updateActivityFromWorkouts(updatedWorkout.userId, workoutDate);
    }
      
    return updatedWorkout;
  },
  
  async deleteWorkout(id: number): Promise<boolean> {
    const workout = await this.getWorkoutById(id);
    if (!workout) return false;
    
    await db.delete(schema.workouts)
      .where(eq(schema.workouts.id, id));
      
    // Make sure date is a proper Date object before passing it
    const workoutDate = workout.date instanceof Date ? workout.date : new Date(workout.date);
    
    // Update activity for the day
    await this.updateActivityFromWorkouts(workout.userId, workoutDate);
      
    return true;
  },
  
  // Activity operations
  async getActivityByDate(userId: number, date: Date): Promise<schema.Activity | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.query.activities.findFirst({
      where: and(
        eq(schema.activities.userId, userId),
        gte(schema.activities.date, startOfDay),
        lte(schema.activities.date, endOfDay)
      )
    });
  },
  
  async updateActivityFromWorkouts(userId: number, date: Date): Promise<schema.Activity> {
    // Get user's goals
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get workouts for the day
    const workouts = await this.getWorkoutsByDate(userId, date);
    
    // Calculate activity metrics
    const calories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
    
    // Simplified calculation for move minutes, exercise minutes, and stand hours
    const moveMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    
    // Exercise minutes are a portion of total workout time based on intensity
    const exerciseMinutes = workouts.reduce((sum, workout) => {
      const factor = workout.intensity === 'high' ? 1 : 
                    workout.intensity === 'medium' ? 0.7 : 0.4;
      return sum + (workout.duration * factor);
    }, 0);
    
    // Stand hours is estimated based on workout duration
    const standHours = Math.min(
      12, // Cap at 12 hours
      workouts.reduce((sum, workout) => {
        // Every 30 minutes of activity counts as 1 standing hour
        return sum + Math.ceil(workout.duration / 30);
      }, 0)
    );
    
    // Format date to YYYY-MM-DD for storage
    const formattedDate = date.toISOString().split('T')[0];
    
    // Check if activity exists for this date
    let activity = await this.getActivityByDate(userId, date);
    
    if (activity) {
      // Update existing activity
      const [updatedActivity] = await db.update(schema.activities)
        .set({
          calories,
          moveMinutes,
          moveTarget: user.dailyMoveGoal,
          exerciseMinutes,
          exerciseTarget: user.dailyExerciseGoal,
          standHours,
          standTarget: user.dailyStandGoal
        })
        .where(eq(schema.activities.id, activity.id))
        .returning();
        
      return updatedActivity;
    } else {
      // Create new activity
      const [newActivity] = await db.insert(schema.activities)
        .values({
          userId,
          date: formattedDate as any, // Date format handling
          calories,
          moveMinutes,
          moveTarget: user.dailyMoveGoal,
          exerciseMinutes,
          exerciseTarget: user.dailyExerciseGoal,
          standHours,
          standTarget: user.dailyStandGoal
        })
        .returning();
        
      return newActivity;
    }
  },
  
  async getWeeklyActivities(userId: number): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Last 7 days
    
    // Get activities
    const activities = await db.select()
      .from(schema.activities)
      .where(
        and(
          eq(schema.activities.userId, userId),
          gte(schema.activities.date, startDate),
          lte(schema.activities.date, endDate)
        )
      )
      .orderBy(schema.activities.date);
      
    // Ensure we have data for all 7 days
    const weekMap = new Map();
    
    // Initialize with empty data
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      weekMap.set(dateStr, {
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        caloriesBurned: 0,
        percentage: 0
      });
    }
    
    // Fill in actual data where available
    activities.forEach(activity => {
      const dateStr = new Date(activity.date).toISOString().split('T')[0];
      
      if (weekMap.has(dateStr)) {
        const movePercentage = activity.moveTarget > 0 
          ? (activity.moveMinutes / activity.moveTarget) * 100 
          : 0;
          
        weekMap.set(dateStr, {
          day: new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short' }),
          date: activity.date,
          caloriesBurned: activity.calories,
          percentage: movePercentage
        });
      }
    });
    
    return Array.from(weekMap.values());
  },
  
  async getMonthlyActivities(userId: number, yearMonth: string): Promise<any[]> {
    const [year, month] = yearMonth.split('-').map(Number);
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
    // Get activities
    const activities = await db.select()
      .from(schema.activities)
      .where(
        and(
          eq(schema.activities.userId, userId),
          gte(schema.activities.date, startDate),
          lte(schema.activities.date, endDate)
        )
      )
      .orderBy(schema.activities.date);
      
    return activities;
  },
  
  async getActivityAverages(userId: number): Promise<any> {
    // Get user's current goals
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Calculate averages from all activities
    const averages = await db.select({
      avgCalories: avg(schema.activities.calories),
      avgMoveMinutes: avg(schema.activities.moveMinutes),
      avgExerciseMinutes: avg(schema.activities.exerciseMinutes),
      avgStandHours: avg(schema.activities.standHours),
    })
    .from(schema.activities)
    .where(eq(schema.activities.userId, userId));
    
    return {
      calories: Math.round(averages[0].avgCalories || 0),
      moveMinutes: averages[0].avgMoveMinutes || 0,
      moveTarget: user.dailyMoveGoal,
      exerciseMinutes: averages[0].avgExerciseMinutes || 0,
      exerciseTarget: user.dailyExerciseGoal,
      standHours: averages[0].avgStandHours || 0, 
      standTarget: user.dailyStandGoal
    };
  },
  
  // Badge operations
  async createBadge(badge: schema.InsertBadge): Promise<schema.Badge> {
    const [newBadge] = await db.insert(schema.badges)
      .values(badge)
      .returning();
      
    return newBadge;
  },
  
  async awardBadgeToUser(userId: number, badgeId: number): Promise<schema.UserBadge> {
    const [userBadge] = await db.insert(schema.userBadges)
      .values({
        userId,
        badgeId,
        earnedAt: new Date()
      })
      .returning();
      
    return userBadge;
  },
  
  async getUserBadges(userId: number): Promise<schema.Badge[]> {
    const badges = await db.query.userBadges.findMany({
      where: eq(schema.userBadges.userId, userId),
      with: {
        badge: true
      }
    });
    
    return badges.map(ub => ub.badge);
  }
};
