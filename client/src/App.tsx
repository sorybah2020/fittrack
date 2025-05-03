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

function App() {
  const [page, setPage] = useState('/');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleUrlChange() {
      setPage(window.location.pathname);
    }

    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setPage(path);
  };

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
      window.location.href = "/login";
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

  // Simple manual routing
  switch (page) {
    case '/':
      return <Dashboard />;
    case '/workouts':
      return <Workouts />;
    case '/workout-builder':
      return <WorkoutBuilder />;
    case '/workout-videos':
      return <WorkoutVideos />;
    case '/workout-music':
      return <WorkoutMusic />;
    case '/progress':
      return <Progress />;
    case '/profile':
      return <Profile />;
    default:
      if (page.startsWith('/workouts/')) {
        const id = parseInt(page.split('/')[2]);
        return <Workouts />;
      }
      return <NotFound />;
  }
}

export default App;