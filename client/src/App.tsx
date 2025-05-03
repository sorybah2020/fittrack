import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import WorkoutVideos from "@/pages/WorkoutVideos";
import WorkoutMusic from "@/pages/WorkoutMusic";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import SignUp from "./SignUp";
import FinalLogin from "./FinalLogin";
import NotFound from "@/pages/not-found";
import { useAuth } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ 
  path, 
  component: Component 
}: { 
  path: string; 
  component: () => React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Use useEffect to handle navigation after render
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  // If still loading or redirecting, show loader
  if (isLoading || (!user && !isLoading)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      </Route>
    );
  }

  // If we have a user and are not loading, show the component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}

function App() {
  return (
    <>
      <Switch>
        <Route path="/signup">
          <SignUp />
        </Route>
        
        <Route path="/login">
          <FinalLogin />
        </Route>
        
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/workouts/:id" component={Workouts} />
        <ProtectedRoute path="/workouts" component={Workouts} />
        <ProtectedRoute path="/workout-builder" component={WorkoutBuilder} />
        <ProtectedRoute path="/workout-videos" component={WorkoutVideos} />
        <ProtectedRoute path="/workout-music" component={WorkoutMusic} />
        <ProtectedRoute path="/progress" component={Progress} />
        <ProtectedRoute path="/profile" component={Profile} />

        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
      <Toaster />
    </>
  );
}

export default App;