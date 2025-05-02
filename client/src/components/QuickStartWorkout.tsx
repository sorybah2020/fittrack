import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Workout, WorkoutType } from "@/lib/fitness-types";
import { useToast } from "@/hooks/use-toast";
import { formatDuration } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface QuickWorkout {
  name: string;
  type: number; // workoutTypeId
  duration: number; // in minutes
  intensity: "low" | "medium" | "high";
}

interface QuickStartWorkoutProps {
  workoutTypes: WorkoutType[];
}

export function QuickStartWorkout({ workoutTypes }: QuickStartWorkoutProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isStarting, setIsStarting] = useState<number | undefined>(undefined);

  // Predefined quick start workout options
  const quickWorkouts: QuickWorkout[] = [
    {
      name: "Quick Run",
      type: 1, // Running workoutTypeId
      duration: 20,
      intensity: "medium",
    },
    {
      name: "Quick HIIT Session",
      type: 2, // Cycling workoutTypeId (for HIIT)
      duration: 15,
      intensity: "high",
    },
    {
      name: "Quick Yoga Flow",
      type: 3, // Swimming workoutTypeId (for Yoga)
      duration: 30,
      intensity: "low",
    },
  ];

  // Filter only workouts that have matching workout types
  const availableQuickWorkouts = quickWorkouts.filter(workout => 
    workoutTypes.some(type => type.id === workout.type)
  );

  // Mutation to create a new workout
  const startWorkoutMutation = useMutation({
    mutationFn: async (workoutData: Omit<Workout, "id" | "userId" | "calories" | "date">) => {
      const res = await apiRequest("POST", "/api/workouts", {
        ...workoutData,
        date: new Date().toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Workout started!",
        description: "Your workout has been added to your log.",
      });
      setIsStarting(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start workout",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setIsStarting(undefined);
    },
  });

  const startQuickWorkout = (workout: QuickWorkout) => {
    // Find the workout type to get the name and details
    const workoutType = workoutTypes.find(type => type.id === workout.type);
    
    if (!workoutType) {
      toast({
        title: "Workout type not available",
        description: "This workout type is not available. Please try another one.",
        variant: "destructive",
      });
      return;
    }

    setIsStarting(workout.type);

    // Start the workout
    startWorkoutMutation.mutate({
      workoutTypeId: workout.type,
      name: workout.name,
      duration: workout.duration,
      distance: undefined,
      notes: "Quick start workout",
      intensity: workout.intensity,
    });
  };

  // If no matching workout types are found
  if (availableQuickWorkouts.length === 0) {
    return <></>;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white mb-3">Quick Start</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {availableQuickWorkouts.map((workout, index) => {
          const workoutType = workoutTypes.find(type => type.id === workout.type);
          if (!workoutType) return null;
          
          return (
            <div key={index} className="bg-[#1c1c1e] rounded-xl overflow-hidden">
              <div className="p-5">
                <h3 className="text-2xl font-bold text-white mb-2">
                  <span 
                    className="text-base font-normal mr-2 block"
                    style={{ color: workoutType.color }}
                  >
                    {workoutType.name.toLowerCase()}
                  </span>
                  {workout.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {workoutType.name} • {formatDuration(workout.duration)} • {workout.intensity} intensity
                </p>
                
                <Button 
                  onClick={() => startQuickWorkout(workout)} 
                  disabled={isStarting !== undefined}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  style={{ 
                    backgroundColor: isStarting === workout.type ? "#ff3b30aa" : "#ff3b30",
                    height: "44px",
                    fontSize: "16px",
                    fontWeight: "500"
                  }}
                >
                  {isStarting === workout.type ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    "Start Now"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}