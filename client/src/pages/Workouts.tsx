import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { WorkoutCard } from "@/components/WorkoutCard";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { Workout, WorkoutType } from "@/lib/fitness-types";
import { useParams, useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function Workouts() {
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [isEditWorkoutOpen, setIsEditWorkoutOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const params = useParams();
  const [, navigate] = useLocation();
  
  // If we have a workout ID in the URL, redirect to the main workouts page
  useEffect(() => {
    if (params && params.id) {
      navigate('/workouts');
    }
  }, [params, navigate]);
  
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
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/">
              <ChevronLeft className="h-6 w-6 mr-2" />
            </Link>
            <h1 className="text-2xl font-bold">Workouts</h1>
          </div>
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
        
        <div className="flex flex-col space-y-3">
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <Select 
            value={filter} 
            onValueChange={setFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(workoutTypes as WorkoutType[]).map((type: WorkoutType) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Workout List */}
      <div className="flex-1 px-5 py-4">
        {sortedDates.length > 0 ? (
          sortedDates.map((dateStr) => (
            <div key={dateStr} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {format(new Date(dateStr), 'MMMM d, yyyy')}
              </h2>
              
              {groupedWorkouts[dateStr].map((workout: Workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  onEdit={handleEditWorkout}
                  onDelete={handleDeleteWorkout}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="bg-neutral-light rounded-xl p-8 text-center mt-8">
            <p className="text-neutral-mid mb-2">No workouts found</p>
            <button 
              onClick={() => setIsAddWorkoutOpen(true)}
              className="text-primary font-medium"
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
