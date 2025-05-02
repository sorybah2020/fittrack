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
    <div className="flex flex-col min-h-screen pb-16">
      {/* Status Bar */}
      <div className="bg-white px-4 pt-12 pb-2">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            {format(new Date(), 'h:mm a')}
          </div>
        </div>
      </div>
      
      {/* Summary Header */}
      <div className="bg-white px-5 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Summary</h1>
          <Link href="/profile">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-primary text-white">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        
        <DateSelector 
          onDateSelected={handleDateChange}
          selectedDate={selectedDate}
        />
      </div>
      
      {/* Activity Rings */}
      {activity && (
        <ActivitySummary data={activity} />
      )}
      
      {/* Workouts */}
      <div className="mt-2 px-5 py-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Workouts</h2>
          <Link href="/workouts" className="text-primary text-sm font-medium">See All</Link>
        </div>
        
        {workouts.length > 0 ? (
          workouts.map((workout: Workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))
        ) : (
          <div className="bg-neutral-light rounded-xl p-8 text-center">
            <p className="text-neutral-mid mb-2">No workouts for this day</p>
            <button 
              onClick={() => setIsAddWorkoutOpen(true)}
              className="text-primary font-medium"
            >
              Add a workout
            </button>
          </div>
        )}
      </div>
      
      {/* Trends */}
      <TrendsChart 
        data={weeklyActivity}
        onViewAll={() => {
          // Navigate to progress page
          window.location.href = "/progress";
        }}
      />
      
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
