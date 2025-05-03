import { useState, useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { User } from '@shared/schema';
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
  
  // If logged in, show the app
  return (
    <Switch>
      <Route path="/">
        <Dashboard user={user} />
      </Route>
      <Route path="/workouts/:id">
        {params => <Workouts id={params.id} user={user} />}
      </Route>
      <Route path="/workouts">
        <Workouts user={user} />
      </Route>
      <Route path="/workout-builder">
        <WorkoutBuilder user={user} />
      </Route>
      <Route path="/workout-videos">
        <WorkoutVideos user={user} />
      </Route>
      <Route path="/workout-music">
        <WorkoutMusic user={user} />
      </Route>
      <Route path="/progress">
        <Progress user={user} />
      </Route>
      <Route path="/profile">
        <Profile user={user} />
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
  );
}