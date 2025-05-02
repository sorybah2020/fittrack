import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Workout, WorkoutType } from "@/lib/fitness-types";
import { formatDuration, formatDistance } from "@/lib/utils";
import { 
  ChevronRight,
  Terminal, 
  Zap, 
  Plus,
  Dumbbell,
  Bike,
  Heart,
  Waves,
  Flame
} from "lucide-react";

interface WorkoutCardProps {
  workout: Workout;
}

const workoutIconMap: Record<string, React.ReactNode> = {
  running: <Terminal className="h-5 w-5 text-white" />,
  hiit: <Zap className="h-5 w-5 text-white" />,
  strength: <Dumbbell className="h-5 w-5 text-white" />,
  cycling: <Bike className="h-5 w-5 text-white" />,
  swimming: <Waves className="h-5 w-5 text-white" />,
  cardio: <Heart className="h-5 w-5 text-white" />,
  default: <Flame className="h-5 w-5 text-white" />
};

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const { data: workoutType } = useQuery<WorkoutType>({
    queryKey: ['/api/workout-types', workout.workoutTypeId],
  });

  const iconColor = workoutType?.color || "#0066CC";
  const iconName = workoutType?.icon || "default";
  const workoutIcon = workoutIconMap[iconName] || workoutIconMap.default;

  return (
    <div className="bg-neutral-light rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: iconColor }}
          >
            {workoutIcon}
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{workout.name}</h3>
            <p className="text-xs text-neutral-mid">
              {formatDuration(workout.duration)}
              {workout.distance ? ` · ${formatDistance(workout.distance)}` : ''}
            </p>
          </div>
        </div>
        <Link href={`/workouts`}>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

export function AddWorkoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="rounded-full bg-primary w-12 h-12 flex items-center justify-center"
    >
      <Plus className="h-6 w-6 text-white" />
    </button>
  );
}
