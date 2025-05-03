import { useState, useEffect } from "react";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import WorkoutVideos from "@/pages/WorkoutVideos";
import WorkoutMusic from "@/pages/WorkoutMusic";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { BottomNavbar } from "./components/BottomNavbar";
import { AddWorkoutModal } from "./components/AddWorkoutModal";

function App() {
  const [page, setPage] = useState(window.location.pathname);
  const [loading, setLoading] = useState(false);
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);

  useEffect(() => {
    function handleUrlChange() {
      setPage(window.location.pathname);
    }

    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
      
      // Clear localStorage auth data on logout
      localStorage.removeItem('keepMeSignedIn');
      localStorage.removeItem('user');
      
      window.location.href = "/login.html";
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  // Render the main content based on current page
  let content;
  switch (page) {
    case '/':
      content = <Dashboard />;
      break;
    case '/workouts':
      content = <Workouts />;
      break;
    case '/workout-builder':
      content = <WorkoutBuilder />;
      break;
    case '/workout-videos':
      content = <WorkoutVideos />;
      break;
    case '/workout-music':
      content = <WorkoutMusic />;
      break;
    case '/progress':
      content = <Progress />;
      break;
    case '/profile':
      content = <Profile />;
      break;
    default:
      if (page.startsWith('/workouts/')) {
        const id = parseInt(page.split('/')[2]);
        content = <Workouts />;
      } else {
        content = <NotFound />;
      }
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {content}
      
      {/* Global Bottom Navigation */}
      <BottomNavbar onAddClick={() => setIsAddWorkoutOpen(true)} />
      
      {/* Global Add Workout Modal */}
      <AddWorkoutModal 
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
      />
    </div>
  );
}

export default App;