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
      type: 4, // HIIT workoutTypeId (assumed)
      duration: 15,
      intensity: "high",
    },
    {
      name: "Quick Yoga Flow",
      type: 5, // Yoga workoutTypeId (assumed)
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
            <Card key={index} className="bg-card border-gray-800 hover:bg-card/80 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <span 
                    className="mr-2 flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: workoutType.color + "20", color: workoutType.color }}
                  >
                    <span className="text-xl">{workoutType.icon}</span>
                  </span>
                  {workout.name}
                </CardTitle>
                <CardDescription>
                  {workoutType.name} • {formatDuration(workout.duration)} • {workout.intensity} intensity
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  onClick={() => startQuickWorkout(workout)} 
                  disabled={isStarting !== undefined}
                  className="w-full"
                  variant="default"
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
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}