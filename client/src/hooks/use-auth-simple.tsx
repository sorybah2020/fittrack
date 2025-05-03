import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, dailyMoveGoal: number, dailyExerciseGoal: number, dailyStandGoal: number) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
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
      } catch (err) {
        console.error('Authentication check error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
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
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.username}!`
        });
        
        return true;
      } else {
        // Handle error responses
        const errorData = await response.json().catch(() => ({ 
          message: "Invalid username or password" 
        }));
        
        setError(errorData.message || "Login failed");
        
        toast({
          title: "Login failed",
          description: errorData.message || "Please check your credentials and try again",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      
      toast({
        title: "Login error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Register function
  const register = async (
    username: string, 
    password: string, 
    dailyMoveGoal: number, 
    dailyExerciseGoal: number, 
    dailyStandGoal: number
  ): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password, 
          dailyMoveGoal, 
          dailyExerciseGoal, 
          dailyStandGoal 
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${userData.username}!`
        });
        
        return true;
      } else {
        // Handle error responses
        const errorData = await response.json().catch(() => ({ 
          message: "Registration failed" 
        }));
        
        setError(errorData.message || "Registration failed");
        
        toast({
          title: "Registration failed",
          description: errorData.message || "Please try a different username",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      
      toast({
        title: "Registration error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUser(null);
        
        toast({
          title: "Logout successful",
          description: "You've been logged out"
        });
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: "Logout failed" 
        }));
        
        toast({
          title: "Logout failed",
          description: errorData.message || "There was a problem logging out",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (err) {
      toast({
        title: "Logout error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        error, 
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}