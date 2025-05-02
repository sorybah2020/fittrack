import { ActivityRings } from "@/components/ui/activity-ring";
import { ActivitySummary as ActivitySummaryType } from "@/lib/fitness-types";
import { getProgressPercentage } from "@/lib/utils";

interface ActivityProgressProps {
  current: number;
  target: number;
  label: string;
  color: string;
}

function ActivityProgress({ current, target, label, color }: ActivityProgressProps) {
  const progress = Math.min(current, target);
  return (
    <div className="text-center">
      <div className="w-full h-1 rounded-full mb-1" style={{ backgroundColor: color }}></div>
      <p className="font-medium">{progress}/{target}</p>
      <p className="text-xs text-neutral-mid">{label}</p>
    </div>
  );
}

interface ActivitySummaryProps {
  data: ActivitySummaryType;
}

export function ActivitySummary({ data }: ActivitySummaryProps) {
  const moveProgress = getProgressPercentage(data.moveMinutes, data.moveTarget);
  const exerciseProgress = getProgressPercentage(data.exerciseMinutes, data.exerciseTarget);
  const standProgress = getProgressPercentage(data.standHours, data.standTarget);

  return (
    <div className="bg-white mt-2 px-5 py-6">
      <h2 className="text-lg font-semibold mb-4">Activity</h2>
      <div className="flex justify-center mb-6">
        <ActivityRings
          moveProgress={moveProgress}
          exerciseProgress={exerciseProgress}
          standProgress={standProgress}
        >
          <p className="text-lg font-bold">{data.caloriesBurned}</p>
          <p className="text-xs text-neutral-mid">CALORIES</p>
        </ActivityRings>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <ActivityProgress 
          current={data.moveMinutes} 
          target={data.moveTarget} 
          label="MOVE" 
          color="#FF3B30" 
        />
        <ActivityProgress 
          current={data.exerciseMinutes} 
          target={data.exerciseTarget} 
          label="EXERCISE" 
          color="#FFCC00" 
        />
        <ActivityProgress 
          current={data.standHours} 
          target={data.standTarget} 
          label="STAND" 
          color="#34C759" 
        />
      </div>
    </div>
  );
}
