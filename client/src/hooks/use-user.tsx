import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Define the schema for user data
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  dailyMoveGoal: z.number().optional().default(450),
  dailyExerciseGoal: z.number().optional().default(30),
  dailyStandGoal: z.number().optional().default(12),
  weight: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  // These fields are used in type checking but stripped from returned API data
  password: z.string().optional(),
  createdAt: z.date().optional(),
});

// Export the type based on the schema
export type User = z.infer<typeof userSchema>;

// Context interface
interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, moveGoal?: number, exerciseGoal?: number, standGoal?: number) => Promise<boolean>;
  logout: () => Promise<boolean>;
  refetchUser: () => Promise<void>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | null>(null);

// Provider component
export function UserProvider({ 
  children, 
  user: initialUser = null 
}: { 
  children: ReactNode;
  user?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(initialUser === null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Validate user data with zod schema
        const validatedUser = userSchema.parse(userData);
        setUser(validatedUser);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError(null);
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        return true;
      } else {
        const errorText = await response.text();
        
        toast({
          title: "Login failed",
          description: errorText || "Invalid username or password",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
      
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (
    username: string, 
    password: string,
    moveGoal: number = 450,
    exerciseGoal: number = 30,
    standGoal: number = 12
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          dailyMoveGoal: moveGoal,
          dailyExerciseGoal: exerciseGoal,
          dailyStandGoal: standGoal
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError(null);
        
        toast({
          title: "Registration successful",
          description: "Your account has been created",
        });
        
        return true;
      } else {
        const errorText = await response.text();
        
        toast({
          title: "Registration failed",
          description: errorText || "Username may already be taken",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err : new Error('Registration failed'));
      
      toast({
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUser(null);
        setError(null);
        
        // A small delay to ensure state changes are processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
      } else {
        const errorText = await response.text();
        
        toast({
          title: "Logout failed",
          description: errorText || "There was a problem logging out",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Logout failed'));
      
      toast({
        title: "Logout error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Provide context value
  const contextValue: UserContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refetchUser: fetchUser
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Hook for using the context
// Using a named function declaration instead of an arrow function to maintain consistent exports
export const useUser = function useUser() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}