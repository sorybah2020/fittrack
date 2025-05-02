import { WeeklyActivity } from "@/lib/fitness-types";
import { getDayOfWeekShort } from "@/lib/utils";

interface TrendsChartProps {
  data: WeeklyActivity[];
  onViewAll?: () => void;
}

export function TrendsChart({ data, onViewAll }: TrendsChartProps) {
  // Find max value to normalize heights
  const maxCalories = Math.max(...data.map(d => d.caloriesBurned), 1);
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="mt-2 px-5 py-6 bg-white mb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Trends</h2>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-primary text-sm font-medium"
          >
            See All
          </button>
        )}
      </div>
      
      <div className="bg-neutral-light rounded-xl p-4">
        <h3 className="font-medium mb-2">Weekly Activity</h3>
        <div className="h-40 flex items-end justify-between px-2">
          {data.map((item) => {
            const height = `${(item.caloriesBurned / maxCalories) * 100}%`;
            const isToday = item.date.split('T')[0] === today;
            
            return (
              <div key={item.day} className="flex flex-col items-center">
                <div 
                  className={`w-8 rounded-t-md ${isToday ? 'bg-primary' : 'bg-neutral-mid'}`} 
                  style={{ height }}
                ></div>
                <span className="text-xs mt-1 text-neutral-mid">
                  {getDayOfWeekShort(item.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
