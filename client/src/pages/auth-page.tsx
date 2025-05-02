import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { ActivityRings } from "@/components/ui/activity-ring";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dailyMoveGoal: z.coerce.number().positive().default(500),
  dailyExerciseGoal: z.coerce.number().positive().default(30),
  dailyStandGoal: z.coerce.number().positive().default(12),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/" />;
  }

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
      dailyMoveGoal: 500,
      dailyExerciseGoal: 30,
      dailyStandGoal: 12,
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md border-gray-800 shadow-lg bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center">
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                Fitness Tracker
              </span>
            </CardTitle>
            <CardDescription className="text-center text-gray-400 mt-2">
              Track your workouts and stay healthy
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4 w-full">
              <TabsTrigger value="login" className="data-[state=active]:bg-card/60">Log In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-card/60">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} className="bg-background/40" />
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
                            <Input type="password" placeholder="••••••" {...field} className="bg-background/40" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-6 bg-gradient-to-r from-pink-500 to-orange-500"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Log In
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="text-sm text-gray-500 text-center">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("register")} 
                    className="text-accent hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="register">
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} className="bg-background/40" />
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
                            <Input type="password" placeholder="••••••" {...field} className="bg-background/40" />
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
                            <FormLabel className="text-xs block truncate">Move Goal</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-background/40" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="dailyExerciseGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs block truncate">Exercise (min)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-background/40" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="dailyStandGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs block truncate">Stand (hrs)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-background/40" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-6 bg-gradient-to-r from-pink-500 to-orange-500"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Sign Up
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="text-sm text-gray-500 text-center">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("login")} 
                    className="text-accent hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Hero Side */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-900 to-black hidden lg:flex items-center justify-center p-12">
        <div className="max-w-xl text-center">
          <div className="flex justify-center mb-6">
            <ActivityRings
              moveProgress={85}
              exerciseProgress={75}
              standProgress={65}
              size="lg"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Track Your Fitness Journey</h2>
          <p className="text-gray-300 mb-8">
            Monitor your daily activity, track workouts, and achieve your fitness goals with our
            comprehensive fitness tracking application.
          </p>
          <div className="flex justify-center gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF453A] to-[#FF9F0A] mx-auto flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <p className="text-sm text-gray-300">Set personal goals</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#32D74B] to-[#30D158] mx-auto flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <p className="text-sm text-gray-300">Track your workouts</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#64D2FF] to-[#5AC8F5] mx-auto flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <p className="text-sm text-gray-300">Monitor progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}