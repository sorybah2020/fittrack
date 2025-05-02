import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateSelector } from "@/components/DateSelector";
import { ActivitySummary } from "@/components/ActivitySummary";
import { WorkoutCard } from "@/components/WorkoutCard";
import { TrendsChart } from "@/components/TrendsChart";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { Activity, Workout, WeeklyActivity } from "@/lib/fitness-types";
import { Link } from "wouter";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
  });
  
  const { data: activity } = useQuery({
    queryKey: ['/api/activities', formattedDate],
  });
  
  const { data: workouts = [] } = useQuery({
    queryKey: ['/api/workouts', formattedDate],
  });
  
  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['/api/activities/weekly'],
  });
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-16 bg-black">
      {/* Status Bar */}
      <div className="px-4 pt-12 pb-2 bg-black text-white">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            {format(new Date(), 'h:mm a')}
          </div>
        </div>
      </div>
      
      {/* Summary Header */}
      <div className="px-5 py-4 bg-black text-white">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-xs text-gray-400 uppercase">
              {format(new Date(), 'EEEE, MMM d')}
            </p>
            <h1 className="text-3xl font-bold">Summary</h1>
          </div>
          <Link href="/profile">
            <Avatar className="w-8 h-8 border border-gray-700">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-primary text-white">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
      
      {/* Activity Rings Card */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="p-4">
            <h2 className="text-sm font-medium mb-3 text-white/80">Activity Rings</h2>
            {activity && (
              <ActivitySummary data={activity} />
            )}
          </div>
        </div>
      </div>
      
      {/* Step Count Card */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white/80">Step Count</h2>
              <div className="text-xs text-gray-400">Today</div>
            </div>
            
            <div className="flex items-center">
              <div className="text-3xl font-bold text-white mr-3">13,818</div>
              <div className="flex-1 h-16 flex items-end">
                {/* Simple bar graph visualization */}
                <div className="h-6 w-1 bg-purple-600 mx-0.5"></div>
                <div className="h-8 w-1 bg-purple-600 mx-0.5"></div>
                <div className="h-4 w-1 bg-purple-600 mx-0.5"></div>
                <div className="h-10 w-1 bg-purple-600 mx-0.5"></div>
                <div className="h-7 w-1 bg-purple-600 mx-0.5"></div>
                <div className="h-16 w-1 bg-purple-600 mx-0.5"></div>
                <div className="h-9 w-1 bg-purple-600 mx-0.5"></div>
                <div className="h-12 w-1 bg-purple-600 mx-0.5"></div>
                {/* Additional bars for visualization */}
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className={`h-${Math.floor(Math.random() * 16) + 3} w-1 bg-purple-600 mx-0.5`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step Distance Card */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white/80">Step Distance</h2>
              <div className="text-xs text-gray-400">Today</div>
            </div>
            
            <div className="flex items-center">
              <div className="text-3xl font-bold text-white mr-3">6.58<span className="text-lg">mi</span></div>
              <div className="flex-1 h-16 flex items-end">
                {/* Simple bar graph visualization with different color */}
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className={`h-${Math.floor(Math.random() * 16) + 3} w-1 bg-blue-500 mx-0.5`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Workouts Section */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white/80">Sessions</h2>
              <Link href="/workouts" className="text-xs text-primary">See All</Link>
            </div>
            
            {workouts.length > 0 ? (
              workouts.map((workout: Workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))
            ) : (
              <div className="bg-card/30 rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-2">No workouts for this day</p>
                <button 
                  onClick={() => setIsAddWorkoutOpen(true)}
                  className="text-primary font-medium"
                >
                  Add a workout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Trainer Tips */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white/80">Trainer Tips</h2>
            </div>
            
            <div className="flex">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">How to mix up your routine for better results</h3>
                <p className="text-xs text-gray-400">with Fitness+ Trainer James</p>
              </div>
              <div className="ml-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar onAddClick={() => setIsAddWorkoutOpen(true)} />
      
      {/* Add Workout Modal */}
      <AddWorkoutModal 
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
      />
    </div>
  );
}
