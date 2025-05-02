import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  return format(dateObj, 'MMM d');
}

export function formatTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, 'h:mm a');
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  
  return `${hours} hr${hours === 1 ? '' : 's'} ${remainingMinutes} min${remainingMinutes === 1 ? '' : 's'}`;
}

export function formatDistance(miles: number): string {
  return `${miles.toFixed(1)} mile${miles === 1 ? '' : 's'}`;
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function calculateCaloriesBurned(
  duration: number,
  intensity: 'low' | 'medium' | 'high',
  weight: number = 70 // Default weight in kg if not provided
): number {
  // Approximate MET values for different intensities
  const metValues = {
    low: 3,
    medium: 6,
    high: 9,
  };
  
  // Calories burned = MET * weight (kg) * duration (hours)
  const durationInHours = duration / 60;
  const calories = metValues[intensity] * weight * durationInHours;
  
  return Math.round(calories);
}

export function getProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(percentage, 100); // Cap at 100%
}

export function getDayOfWeekShort(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, 'EEE');
}

export function getDayOfMonth(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, 'd');
}
