/**
 * Utility functions for the application
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate calories burned based on workout duration, intensity, and type
 * This is a simplified estimation
 */
export function calculateCaloriesBurned(
  duration: number,
  intensity: 'low' | 'medium' | 'high',
  workoutType: string
): number {
  // Base calories burned per minute based on intensity
  const intensityFactors = {
    low: 3,
    medium: 5,
    high: 8,
  };

  // Workout type multipliers (simplified)
  const typeMultipliers: Record<string, number> = {
    Running: 1.2,
    Cycling: 1.0,
    Swimming: 1.3,
    'HIIT': 1.4,
    'Weight Training': 0.9,
    Yoga: 0.7,
    Pilates: 0.8,
    Walking: 0.6,
  };

  // Calculate calories
  const baseCalories = duration * intensityFactors[intensity];
  const multiplier = typeMultipliers[workoutType] || 1.0;
  
  return Math.round(baseCalories * multiplier);
}

/**
 * Format duration in minutes to a readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format distance in miles to a readable format
 */
export function formatDistance(distance: number | string | null): string {
  if (distance === null || distance === undefined) return '0 mi';
  
  const numDistance = typeof distance === 'string' ? parseFloat(distance) : distance;
  
  if (isNaN(numDistance)) return '0 mi';
  
  return `${numDistance.toFixed(1)} mi`;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time to AM/PM format
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get a color class based on a percentage value
 */
export function getColorByPercentage(percentage: number): string {
  if (percentage >= 100) return 'text-green-500';
  if (percentage >= 75) return 'text-blue-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Calculate progress percentage
 */
export function getProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Generate a random color from a list of tailwind colors
 */
export function getRandomColor(): string {
  const colors = [
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}