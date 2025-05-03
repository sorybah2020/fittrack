import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { User } from "@/lib/fitness-types";
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
  const [, navigate] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
  });
  
  interface UserStats {
    totalWorkouts?: number;
    totalCalories?: number;
    streakDays?: number;
    badges?: Array<string>;
  }
  
  const { data: stats } = useQuery<UserStats>({
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
  useEffect(() => {
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
  }, [user, form]);
  
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
  
  function handleLogout() {
    // Post to logout API and redirect to login page
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      navigate('/login');
    }).catch(error => {
      console.error('Logout error:', error);
      // Redirect anyway
      navigate('/login');
    });
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-black">
      {/* Header */}
      <div className="bg-black px-5 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center mb-4">
          <Link href="/">
            <ChevronLeft className="h-6 w-6 mr-2 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>
      </div>
      
      {/* Profile */}
      <div className="px-5 py-4 space-y-6">
        <div className="flex items-center mb-6">
          <Avatar className="h-20 w-20 mr-4 border-2 border-red-500">
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-pink-600 text-white text-xl">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.username}</h2>
          </div>
        </div>
        
        {/* Statistics Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-white">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Your Stats
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your fitness achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="bg-gray-800 p-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats?.totalWorkouts || 0}</div>
                <div className="text-xs text-gray-400">Workouts</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats?.totalCalories || 0}</div>
                <div className="text-xs text-gray-400">Calories</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats?.streakDays || 0}</div>
                <div className="text-xs text-gray-400">Streak</div>
              </div>
            </div>
            
            <Separator className="mb-4 bg-gray-800" />
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center text-white">
                <Award className="h-4 w-4 mr-1 text-purple-500" />
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats?.badges?.map((badge: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                    {badge}
                  </Badge>
                ))}
                
                {(!stats?.badges || stats.badges.length === 0) && (
                  <p className="text-sm text-gray-500">Complete workouts to earn badges!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-white">
              <Target className="h-5 w-5 mr-2 text-green-500" />
              Your Goals
            </CardTitle>
            <CardDescription className="text-gray-400">
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
                      <FormLabel className="text-gray-300">Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-800 border-gray-700 text-white" 
                        />
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
                        <FormLabel className="text-gray-300">Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1" 
                            className="bg-gray-800 border-gray-700 text-white"
                            value={field.value || ''}
                          />
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
                        <FormLabel className="text-gray-300">Height (cm)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            className="bg-gray-800 border-gray-700 text-white"
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="bg-gray-800" />
                
                <h3 className="text-lg font-medium text-white">Daily Goals</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dailyMoveGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Move (min)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            className="bg-gray-800 border-gray-700 text-white"
                          />
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
                        <FormLabel className="text-gray-300">Exercise (min)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            className="bg-gray-800 border-gray-700 text-white"
                          />
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
                        <FormLabel className="text-gray-300">Stand (hours)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <Button type="submit" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </form>
            </Form>
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