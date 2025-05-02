import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trophy, Award, Target, Save, LogOut } from "lucide-react";
import { Link } from "wouter";

const profileFormSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  weight: z.string().optional(),
  height: z.string().optional(),
  dailyMoveGoal: z.string(),
  dailyExerciseGoal: z.string(),
  dailyStandGoal: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
  });
  
  const { data: stats } = useQuery({
    queryKey: ['/api/users/stats'],
  });
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      weight: "",
      height: "",
      dailyMoveGoal: "450",
      dailyExerciseGoal: "30",
      dailyStandGoal: "12",
    },
  });
  
  // When user data is loaded, update form values
  useState(() => {
    if (user) {
      form.reset({
        username: user.username || "",
        weight: user.weight ? user.weight.toString() : "",
        height: user.height ? user.height.toString() : "",
        dailyMoveGoal: user.dailyMoveGoal ? user.dailyMoveGoal.toString() : "450",
        dailyExerciseGoal: user.dailyExerciseGoal ? user.dailyExerciseGoal.toString() : "30",
        dailyStandGoal: user.dailyStandGoal ? user.dailyStandGoal.toString() : "12",
      });
    }
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Convert string values to numbers where needed
      const profileData = {
        username: data.username,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        height: data.height ? parseFloat(data.height) : undefined,
        dailyMoveGoal: parseInt(data.dailyMoveGoal),
        dailyExerciseGoal: parseInt(data.dailyExerciseGoal),
        dailyStandGoal: parseInt(data.dailyStandGoal),
      };
      
      const response = await apiRequest("PATCH", "/api/user", profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
  });
  
  function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
  
  function handleLogout() {
    logoutMutation.mutate();
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4">
        <div className="flex items-center mb-4">
          <Link href="/">
            <ChevronLeft className="h-6 w-6 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </div>
      
      {/* Profile */}
      <div className="px-5 py-4">
        <div className="flex items-center mb-6">
          <Avatar className="h-20 w-20 mr-4">
            <AvatarFallback className="bg-primary text-white text-xl">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user?.username}</h2>
            <p className="text-neutral-mid">Fitness Enthusiast</p>
          </div>
        </div>
        
        {/* Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats?.totalWorkouts || 0}</p>
                <p className="text-xs text-neutral-mid">WORKOUTS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#FFCC00]">{stats?.totalCalories || 0}</p>
                <p className="text-xs text-neutral-mid">CALORIES</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#34C759]">{stats?.streakDays || 0}</p>
                <p className="text-xs text-neutral-mid">DAY STREAK</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex flex-wrap gap-2">
              {stats?.badges?.map((badge: string, index: number) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {badge}
                </Badge>
              ))}
              
              {(!stats?.badges || stats.badges.length === 0) && (
                <p className="text-sm text-neutral-mid">Complete workouts to earn badges!</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Your Goals
            </CardTitle>
            <CardDescription>
              Update your fitness goals and profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <h3 className="font-medium mb-2">Daily Goals</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dailyMoveGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Move (min)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dailyExerciseGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise (min)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dailyStandGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stand (hrs)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <span className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </form>
            </Form>
            
            {/* Logout Button */}
            <div className="mt-8">
              <Button 
                variant="outline" 
                className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  "Logging out..."
                ) : (
                  <span className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar onAddClick={() => setIsAddWorkoutOpen(true)} />
      
      {/* Add Workout Modal */}
      <AddWorkoutModal 
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
      />
    </div>
  );
}
