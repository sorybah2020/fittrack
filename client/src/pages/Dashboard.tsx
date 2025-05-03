import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlayCircle, Music, Headphones } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateSelector } from "@/components/DateSelector";
import { ActivitySummary } from "@/components/ActivitySummary";
import { WorkoutCard } from "@/components/WorkoutCard";
import { TrendsChart } from "@/components/TrendsChart";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { QuickStartWorkout } from "@/components/QuickStartWorkout";
import { Activity, Workout, WeeklyActivity, WorkoutType } from "@/lib/fitness-types";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const { user } = useAuth();
  
  const { data: activity } = useQuery({
    queryKey: ['/api/activities', formattedDate],
  });
  
  const { data: workouts = [] } = useQuery({
    queryKey: ['/api/workouts', formattedDate],
  });
  
  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['/api/activities/weekly'],
  });
  
  const { data: workoutTypes = [] } = useQuery<WorkoutType[]>({
    queryKey: ['/api/workout-types'],
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
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsAddWorkoutOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full px-4 py-2 flex items-center shadow-md"
              style={{ boxShadow: "0 0 10px 2px rgba(255, 69, 58, 0.2)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              Add Workout
            </button>
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
      
      {/* Quick Start Workout */}
      <div className="px-5">
        <QuickStartWorkout workoutTypes={workoutTypes as WorkoutType[]} />
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
              <div className="flex space-x-2 items-center">
                <button 
                  onClick={() => setIsAddWorkoutOpen(true)}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full px-3 py-1 text-xs flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add
                </button>
                <Link href="/workouts" className="text-xs text-primary">See All</Link>
              </div>
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
      
      {/* Workout Videos Section */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white/80">Workout Videos</h2>
              <Link href="/workout-videos" className="text-xs text-primary">See All</Link>
            </div>
            
            <Link href="/workout-videos" className="block">
              <div className="rounded-xl overflow-hidden relative mb-3">
                <img 
                  src="https://i.ytimg.com/vi/2L2lnxIcNmo/hqdefault.jpg" 
                  alt="Workout video thumbnail"
                  className="w-full h-auto object-cover rounded-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 rounded-full p-3">
                    <PlayCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium py-1 px-2 rounded">
                  15 min
                </div>
              </div>
              <h3 className="text-white font-medium">Quick workout videos from Chloe Ting</h3>
              <p className="text-xs text-gray-400">Access full-length workout videos to follow along</p>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Workout Music Section */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white/80">Workout Music</h2>
              <Link href="/workout-music" className="text-xs text-primary">See All</Link>
            </div>
            
            <Link href="/workout-music" className="block">
              <div className="flex">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">Create personalized workout playlists</h3>
                  <p className="text-xs text-gray-400 mb-3">Generate music that matches your workout intensity with Spotify</p>
                  
                  <div className="flex space-x-2">
                    <div className="bg-green-500/30 text-green-400 text-xs font-medium py-1 px-2 rounded-full flex items-center">
                      <Headphones className="h-3 w-3 mr-1" />
                      Running
                    </div>
                    <div className="bg-blue-500/30 text-blue-400 text-xs font-medium py-1 px-2 rounded-full flex items-center">
                      <Headphones className="h-3 w-3 mr-1" />
                      HIIT
                    </div>
                    <div className="bg-purple-500/30 text-purple-400 text-xs font-medium py-1 px-2 rounded-full flex items-center">
                      <Headphones className="h-3 w-3 mr-1" />
                      Yoga
                    </div>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Music className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </div>
            </Link>
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
