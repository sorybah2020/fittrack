import { useState } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema for login form
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for registration form
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dailyMoveGoal: z.coerce.number().min(1, "Daily move goal required").default(450),
  dailyExerciseGoal: z.coerce.number().min(1, "Daily exercise goal required").default(30),
  dailyStandGoal: z.coerce.number().min(1, "Daily stand goal required").default(12),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      dailyMoveGoal: 450,
      dailyExerciseGoal: 30,
      dailyStandGoal: 12,
    },
  });
  
  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data, {
      onError: (error) => {
        loginForm.setError("root", { 
          message: error.message || "Login failed. Please check your credentials."
        });
      }
    });
  }
  
  function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data, {
      onError: (error) => {
        registerForm.setError("root", { 
          message: error.message || "Registration failed. Username may already be taken."
        });
      }
    });
  }
  
  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Auth Form Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Fitness Tracker</h1>
            <p className="text-muted-foreground">Track your workouts and fitness goals</p>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {loginForm.formState.errors.root && (
                    <div className="text-destructive text-sm">
                      {loginForm.formState.errors.root.message}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Log in"}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button 
                      type="button"
                      className="text-primary hover:underline" 
                      onClick={() => setActiveTab("register")}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register" className="mt-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Choose a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="dailyMoveGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Move Goal (min)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="dailyExerciseGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise (min)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="dailyStandGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stand (hours)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={24} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {registerForm.formState.errors.root && (
                    <div className="text-destructive text-sm">
                      {registerForm.formState.errors.root.message}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      type="button"
                      className="text-primary hover:underline" 
                      onClick={() => setActiveTab("login")}
                    >
                      Log in
                    </button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden md:flex flex-1 bg-gradient-to-r from-gray-900 to-black p-12 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('/images/fitness-bg.jpg')] bg-center bg-cover opacity-20" />
        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-5xl font-bold mb-8">Track Your Fitness Journey</h2>
          <ul className="space-y-6">
            <li className="flex items-start">
              <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center mr-4 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Activity Rings</h3>
                <p className="text-gray-300">Monitor your daily move, exercise, and stand goals with beautiful visualizations.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center mr-4 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Workout Tracking</h3>
                <p className="text-gray-300">Log and analyze your workouts, monitor your progress, and achieve your fitness goals.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center mr-4 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Badges & Achievements</h3>
                <p className="text-gray-300">Earn badges for consistency, milestone achievements, and special challenges.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}