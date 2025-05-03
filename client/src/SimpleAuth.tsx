import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User is authenticated", userData);
          setUser(userData);
        } else {
          console.log("User is not authenticated");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
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
        const errorMessage = await response.text();
        
        toast({
          title: "Login failed",
          description: errorMessage || "Invalid username or password",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Register function
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          dailyMoveGoal: 450,
          dailyExerciseGoal: 30,
          dailyStandGoal: 12
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
        const errorMessage = await response.text();
        
        toast({
          title: "Registration failed",
          description: errorMessage || "Username may already be taken",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
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
        toast({
          title: "Logout failed",
          description: "There was a problem logging out",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      toast({
        title: "Logout error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}