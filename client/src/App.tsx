import { useState, useEffect } from "react";
import { Route, Router, Switch } from "wouter";
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
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
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
  
  return (
    <Router>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/workouts" component={Workouts} />
        <Route path="/workout-builder" component={WorkoutBuilder} />
        <Route path="/workout-videos" component={WorkoutVideos} />
        <Route path="/workout-music" component={WorkoutMusic} />
        <Route path="/progress" component={Progress} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;