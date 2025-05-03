import { useState, useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { User } from '@shared/schema';
import { UserProvider } from './hooks/use-user';
import LoginPage from './LoginPage';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import WorkoutBuilder from './pages/WorkoutBuilder';
import WorkoutVideos from './pages/WorkoutVideos';
import WorkoutMusic from './pages/WorkoutMusic';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import NotFound from './pages/not-found';

export function AppWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get the current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, []);
  
  // While loading, show a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  // If not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }
  
  // If logged in, show the app with UserProvider context
  return (
    <UserProvider user={user}>
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
    </UserProvider>
  );
}