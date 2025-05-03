import { Route, Switch } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "./hooks/use-auth";
import LoginPage from "./LoginPage";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import WorkoutVideos from "@/pages/WorkoutVideos";
import WorkoutMusic from "@/pages/WorkoutMusic";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

export default function AppRoutes() {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If not authenticated, only show login page for all routes
  if (!user) {
    return <LoginPage />;
  }

  // If authenticated, show app routes
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workouts/:id" component={Workouts} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/workout-builder" component={WorkoutBuilder} />
      <Route path="/workout-videos" component={WorkoutVideos} />
      <Route path="/workout-music" component={WorkoutMusic} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile" component={Profile} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}