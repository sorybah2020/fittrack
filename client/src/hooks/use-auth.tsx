import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  dailyMoveGoal: number;
  dailyExerciseGoal: number;
  dailyStandGoal: number;
};

function useUserQuery() {
  return useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        if (res.status === 401) {
          return null;
        }
        return await res.json();
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

function useLoginMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest('POST', '/api/login', credentials);
        if (!res.ok) {
          // Handle error when response isn't OK but is valid JSON
          if (res.headers.get('content-type')?.includes('application/json')) {
            const error = await res.json();
            throw new Error(error.message || 'Login failed');
          } else {
            // Handle non-JSON errors (like 'Unauthorized')
            throw new Error('Invalid username or password');
          }
        }
        return await res.json();
      } catch (err) {
        // Handle any other errors including JSON parsing errors
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Login failed. Please try again.');
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const res = await apiRequest('POST', '/api/register', data);
        if (!res.ok) {
          // Handle error when response isn't OK but is valid JSON
          if (res.headers.get('content-type')?.includes('application/json')) {
            const error = await res.json();
            throw new Error(error.message || 'Registration failed');
          } else {
            // Handle non-JSON errors
            throw new Error('Registration failed. Please try again.');
          }
        }
        return await res.json();
      } catch (err) {
        // Handle any other errors including JSON parsing errors
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Registration failed. Please try again.');
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try a different username.",
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest('POST', '/api/logout');
        if (!res.ok) {
          // Handle error when response isn't OK but is valid JSON
          if (res.headers.get('content-type')?.includes('application/json')) {
            const error = await res.json();
            throw new Error(error.message || 'Logout failed');
          } else {
            // Handle non-JSON errors
            throw new Error('Session expired. Please log in again.');
          }
        }
        return;
      } catch (err) {
        // Handle any other errors including JSON parsing errors
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Logout failed. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: "Logout successful",
        description: "You've been logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "There was a problem logging out.",
        variant: "destructive",
      });
    },
  });
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useUserQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}