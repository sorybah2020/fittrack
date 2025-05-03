import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { WorkoutCard } from "@/components/WorkoutCard";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { Workout, WorkoutType } from "@/lib/fitness-types";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut } from "lucide-react";
import { Link } from "wouter";

interface RouteParams {
  id?: string;
}

// Component that accepts route params for wouter compatibility
export default function Workouts({ params }: { params?: RouteParams } = {}) {
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [isEditWorkoutOpen, setIsEditWorkoutOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Extract the workoutId from either passed params or route params
  const routeParams = useParams<RouteParams>();
  const workoutId = params?.id || routeParams.id;
  
  // If we have a workout ID in the URL params or passed as a prop, check it
  useEffect(() => {
    if (workoutId) {
      // Handle specific workout ID logic if needed
      // For now, just redirect to the main workouts page
      navigate('/workouts');
    }
  }, [workoutId, navigate]);
  
  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // First, try the normal logout
      const success = await logout();
      
      // Regardless of the success status, we'll force a hard reset of the app state
      toast({
        title: "Logging out",
        description: "Please wait while we log you out...",
      });
      
      // Short delay to allow toast to show
      setTimeout(() => {
        // Clear any local storage items related to auth if they exist
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Force a hard refresh to completely reset the application state
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
      });
      setIsLoggingOut(false);
    }
  };
  
  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsEditWorkoutOpen(true);
  };
  
  const handleDeleteWorkout = (workoutId: number) => {
    // Find the workout to delete and open the edit modal with it
    // This way we can use the delete confirmation in the edit modal
    const workoutToDelete = (workouts as Workout[]).find((w: Workout) => w.id === workoutId);
    if (workoutToDelete) {
      setSelectedWorkout(workoutToDelete);
      setIsEditWorkoutOpen(true);
    }
  };
  
  // Get all workouts
  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ['/api/workouts'],
  });
  
  // Get workout types for dropdown menu
  const { data: workoutTypes = [] } = useQuery<WorkoutType[]>({
    queryKey: ['/api/workout-types'],
  });
  
  // Filter workouts based on type and search term
  const filteredWorkouts = (workouts as Workout[]).filter((workout: Workout) => {
    const matchesType = filter === "all" || workout.workoutTypeId.toString() === filter;
    const matchesSearch = searchTerm === "" || 
      workout.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });
  
  // Group workouts by date
  const groupedWorkouts: Record<string, Workout[]> = {};
  
  filteredWorkouts.forEach((workout: Workout) => {
    const date = new Date(workout.date);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (!groupedWorkouts[dateStr]) {
      groupedWorkouts[dateStr] = [];
    }
    
    groupedWorkouts[dateStr].push(workout);
  });
  
  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="bg-black px-5 pt-12 pb-4 sticky top-0 z-10 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/">
              <ChevronLeft className="h-6 w-6 mr-2 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Your Workouts</h1>
              <p className="text-gray-400 text-sm">Track and manage your fitness activity</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href="/workout-builder">
              <button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-4 py-2 flex items-center shadow-lg shadow-blue-500/20"
                style={{ boxShadow: "0 0 10px 2px rgba(100, 149, 237, 0.2)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Build Custom
              </button>
            </Link>
            <button 
              onClick={() => setIsAddWorkoutOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full px-4 py-2 flex items-center shadow-lg shadow-pink-500/20"
              style={{ boxShadow: "0 0 10px 2px rgba(255, 69, 58, 0.2)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Workout
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Input
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <Select 
              value={filter} 
              onValueChange={setFilter}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Workout Types</SelectItem>
                {(workoutTypes as WorkoutType[]).map((type: WorkoutType) => (
                  <SelectItem key={type.id} value={type.id.toString()} className="text-white">
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="px-5 py-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-white" 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-1" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
      
      {/* Workout List */}
      <div className="flex-1 px-5 py-2">
        {sortedDates.length > 0 ? (
          sortedDates.map((dateStr) => (
            <div key={dateStr} className="mb-6">
              <div className="flex items-center mb-2">
                <div className="h-1 w-1 bg-primary rounded-full mr-2"></div>
                <h2 className="text-lg font-semibold text-white">
                  {format(new Date(dateStr), 'MMMM d, yyyy')}
                </h2>
              </div>
              
              <div className="space-y-3">
                {groupedWorkouts[dateStr].map((workout: Workout) => (
                  <WorkoutCard 
                    key={workout.id} 
                    workout={workout} 
                    onEdit={handleEditWorkout}
                    onDelete={handleDeleteWorkout}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl p-8 text-center mt-8 border border-gray-800">
            <p className="text-gray-400 mb-4">No workouts found with the current filters</p>
            <button 
              onClick={() => setIsAddWorkoutOpen(true)}
              className="text-primary font-medium bg-primary/10 hover:bg-primary/20 py-2 px-4 rounded-lg transition-colors"
            >
              Add your first workout
            </button>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar onAddClick={() => setIsAddWorkoutOpen(true)} />
      
      {/* Add Workout Modal */}
      <AddWorkoutModal 
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
      />
      
      {/* Edit Workout Modal */}
      {selectedWorkout && (
        <EditWorkoutModal
          isOpen={isEditWorkoutOpen}
          onClose={() => {
            setIsEditWorkoutOpen(false);
            setSelectedWorkout(null);
          }}
          workout={selectedWorkout}
          workoutTypes={workoutTypes as WorkoutType[]}
        />
      )}
    </div>
  );
}
