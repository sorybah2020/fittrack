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
    <div className="bg-card/50 rounded-xl p-4 mb-4 border border-gray-800">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: iconColor, 
              boxShadow: `0 0 10px 2px ${iconColor}40` 
            }}
          >
            {workoutIcon}
          </div>
          <div className="ml-4">
            <h3 className="font-medium text-white">{workout.name}</h3>
            <div className="flex items-center mt-1">
              <p className="text-xs text-gray-400">
                {formatDuration(workout.duration)}
                {workout.distance && (
                  <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>
                )}
                {workout.distance && formatDistance(workout.distance)}
              </p>
              <div className="ml-3 rounded-full px-2 py-0.5 bg-gray-800">
                <span className="text-xs font-medium text-white">{workout.calories} Cal</span>
              </div>
            </div>
          </div>
        </div>
        <Link href={`/workouts/${workout.id}`}>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400">
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
      className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 w-14 h-14 flex items-center justify-center shadow-lg shadow-pink-500/20"
      style={{ 
        boxShadow: "0 0 15px 2px rgba(255, 69, 58, 0.3)"
      }}
    >
      <Plus className="h-7 w-7 text-white" />
    </button>
  );
}
