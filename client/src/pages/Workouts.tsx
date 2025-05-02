import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { WorkoutCard } from "@/components/WorkoutCard";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { Workout } from "@/lib/fitness-types";
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
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: workouts = [] } = useQuery({
    queryKey: ['/api/workouts'],
  });
  
  const { data: workoutTypes = [] } = useQuery({
    queryKey: ['/api/workout-types'],
  });
  
  // Filter workouts based on type and search term
  const filteredWorkouts = workouts.filter((workout: Workout) => {
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
        <div className="flex items-center mb-4">
          <Link href="/">
            <ChevronLeft className="h-6 w-6 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold">Workouts</h1>
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
              {workoutTypes.map((type: any) => (
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
                <WorkoutCard key={workout.id} workout={workout} />
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
    </div>
  );
}
