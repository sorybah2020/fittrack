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
  return (
    <div className="flex flex-col">
      <div className="text-xs font-medium mb-1 uppercase" style={{ color }}>{label}</div>
      <div className="text-base font-semibold text-white">{current}<span className="text-gray-400">/{target}{label === "MOVE" ? "CAL" : label === "EXERCISE" ? "MIN" : "HRS"}</span></div>
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
    <div className="flex">
      <div className="flex-1">
        <div className="flex justify-center py-4">
          <ActivityRings
            moveProgress={moveProgress}
            exerciseProgress={exerciseProgress}
            standProgress={standProgress}
            size="lg"
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-3">
        <ActivityProgress 
          current={data.caloriesBurned} 
          target={data.moveTarget} 
          label="Move" 
          color="#FF453A" 
        />
        <ActivityProgress 
          current={data.exerciseMinutes} 
          target={data.exerciseTarget} 
          label="Exercise" 
          color="#92F73A" 
        />
        <ActivityProgress 
          current={data.standHours} 
          target={data.standTarget} 
          label="Stand" 
          color="#30D1F9" 
        />
      </div>
    </div>
  );
}
