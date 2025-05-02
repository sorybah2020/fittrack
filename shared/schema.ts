import { pgTable, text, serial, integer, timestamp, decimal, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  dailyMoveGoal: integer("daily_move_goal").default(450).notNull(),
  dailyExerciseGoal: integer("daily_exercise_goal").default(30).notNull(),
  dailyStandGoal: integer("daily_stand_goal").default(12).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  workouts: many(workouts),
}));

// Workout Types Table
export const workoutTypes = pgTable("workout_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutTypesRelations = relations(workoutTypes, ({ many }) => ({
  workouts: many(workouts),
}));

// Workouts Table
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workoutTypeId: integer("workout_type_id").references(() => workoutTypes.id).notNull(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  distance: decimal("distance", { precision: 5, scale: 2 }), // in miles
  calories: integer("calories").notNull().default(0),
  notes: text("notes"),
  intensity: text("intensity").notNull().default("medium"), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutsRelations = relations(workouts, ({ one }) => ({
  user: one(users, { fields: [workouts.userId], references: [users.id] }),
  workoutType: one(workoutTypes, { fields: [workouts.workoutTypeId], references: [workoutTypes.id] }),
}));

// Activities Table (Daily Summary)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  calories: integer("calories").notNull().default(0),
  moveMinutes: integer("move_minutes").notNull().default(0),
  moveTarget: integer("move_target").notNull().default(450),
  exerciseMinutes: integer("exercise_minutes").notNull().default(0),
  exerciseTarget: integer("exercise_target").notNull().default(30),
  standHours: integer("stand_hours").notNull().default(0),
  standTarget: integer("stand_target").notNull().default(12),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

// Badges Table (Achievements)
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Badges (Many-to-Many)
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));

// Validation Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertWorkoutTypeSchema = createInsertSchema(workoutTypes);
export const selectWorkoutTypeSchema = createSelectSchema(workoutTypes);

export const insertWorkoutSchema = createInsertSchema(workouts, {
  intensity: (schema) => z.enum(["low", "medium", "high"]),
});
export const selectWorkoutSchema = createSelectSchema(workouts);

export const insertActivitySchema = createInsertSchema(activities);
export const selectActivitySchema = createSelectSchema(activities);

export const insertBadgeSchema = createInsertSchema(badges);
export const selectBadgeSchema = createSelectSchema(badges);

export const insertUserBadgeSchema = createInsertSchema(userBadges);
export const selectUserBadgeSchema = createSelectSchema(userBadges);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WorkoutType = typeof workoutTypes.$inferSelect;
export type InsertWorkoutType = z.infer<typeof insertWorkoutTypeSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
