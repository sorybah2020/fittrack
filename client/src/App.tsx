import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import WorkoutVideos from "@/pages/WorkoutVideos";
import WorkoutMusic from "@/pages/WorkoutMusic";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";

import FinalLogin from "./FinalLogin";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
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

  if (!isLoading && !user) {
    navigate("/login");
    return null;
  }

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : (
        <Component />
      )}
    </Route>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/login">
            <FinalLogin />
          </Route>
          <Route path="/auth">
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;