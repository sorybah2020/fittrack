import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import WorkoutVideos from "@/pages/WorkoutVideos";
import WorkoutMusic from "@/pages/WorkoutMusic";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import AuthPage from "@/pages/auth-page";
import AppleStyleLogin from "./AppleStyleLogin";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  // Use our Apple-style login for better UX
  return <AppleStyleLogin />;
  
  // Original app structure - commented out temporarily while fixing auth issues
  /*
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/workouts/:id" component={Workouts} />
          <ProtectedRoute path="/workouts" component={Workouts} />
          <ProtectedRoute path="/workout-videos" component={WorkoutVideos} />
          <ProtectedRoute path="/workout-music" component={WorkoutMusic} />
          <ProtectedRoute path="/progress" component={Progress} />
          <ProtectedRoute path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
  */
}

export default App;
