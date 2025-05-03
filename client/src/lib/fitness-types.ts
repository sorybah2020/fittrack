export interface WorkoutType {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Activity {
  id: number;
  date: string;
  calories: number;
  moveMinutes: number;
  moveTarget: number;
  exerciseMinutes: number;
  exerciseTarget: number;
  standHours: number;
  standTarget: number;
}

export interface Workout {
  id: number;
  workoutTypeId: number;
  name: string;
  date: string;
  duration: number; // in minutes
  distance?: number; // in miles
  calories: number;
  notes?: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface User {
  id: number;
  username: string;
  weight?: number; // in kg
  height?: number; // in cm
  dailyMoveGoal: number; // in minutes
  dailyExerciseGoal: number; // in minutes
  dailyStandGoal: number; // in hours
}

export interface ActivitySummary {
  moveProgress: number;
  exerciseProgress: number;
  standProgress: number;
  caloriesBurned: number;
  moveMinutes: number;
  moveTarget: number;
  exerciseMinutes: number;
  exerciseTarget: number;
  standHours: number;
  standTarget: number;
}

export interface WeeklyActivity {
  day: string;
  date: string;
  caloriesBurned: number;
  percentage: number;
}
