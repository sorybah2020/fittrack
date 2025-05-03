export interface Activity {
  id: number;
  userId: number;
  date: string;
  caloriesBurned: number;
  moveProgress: number;
  exerciseProgress: number;
  standProgress: number;
  moveGoal: number;
  exerciseGoal: number;
  standGoal: number;
  stepCount: number;
  stepDistance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySummaryType {
  moveProgress: number;
  exerciseProgress: number;
  standProgress: number;
  caloriesBurned: number;
  moveGoal: number;
  exerciseGoal: number;
  standGoal: number;
}

export interface Workout {
  id: number;
  userId: number;
  workoutTypeId: number;
  name: string; // Add name property
  date: string;
  duration: number;
  intensity: string;
  calories: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  workoutType?: WorkoutType;
}

export interface WorkoutType {
  id: number;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyActivity {
  date: string;
  moveProgress: number;
  exerciseProgress: number;
  standProgress: number;
  caloriesBurned: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  createdAt: string;
  updatedAt: string;
}