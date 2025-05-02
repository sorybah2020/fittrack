import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { Activity } from "@/lib/fitness-types";
import { getProgressPercentage } from "@/lib/utils";
import { ActivityRings } from "@/components/ui/activity-ring";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function Progress() {
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  const { data: monthlyActivities = [] } = useQuery({
    queryKey: ['/api/activities/monthly', selectedMonth],
  });
  
  const { data: weeklyActivities = [] } = useQuery({
    queryKey: ['/api/activities/weekly'],
  });
  
  const { data: averages } = useQuery({
    queryKey: ['/api/activities/averages'],
  });
  
  // Prepare data for charts
  const caloriesData = selectedPeriod === "week" 
    ? weeklyActivities.map((day: any) => ({
        name: format(new Date(day.date), 'EEE'),
        calories: day.caloriesBurned
      }))
    : monthlyActivities.map((day: Activity) => ({
        name: format(new Date(day.date), 'd'),
        calories: day.calories
      }));
  
  // Get all days of the selected month
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);
  const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Map activities to days
  const monthMap = new Map(
    monthlyActivities.map((activity: Activity) => [
      activity.date.split('T')[0],
      activity
    ])
  );
  
  // Calculate average move, exercise, and stand
  const moveAvg = averages?.moveMinutes || 0;
  const exerciseAvg = averages?.exerciseMinutes || 0; 
  const standAvg = averages?.standHours || 0;
  const moveTarget = averages?.moveTarget || 60;
  const exerciseTarget = averages?.exerciseTarget || 30;
  const standTarget = averages?.standTarget || 12;
  
  const moveProgress = getProgressPercentage(moveAvg, moveTarget);
  const exerciseProgress = getProgressPercentage(exerciseAvg, exerciseTarget);
  const standProgress = getProgressPercentage(standAvg, standTarget);
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4">
        <div className="flex items-center mb-4">
          <Link href="/">
            <ChevronLeft className="h-6 w-6 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold">Progress</h1>
        </div>
        
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="averages">Averages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts">
            <div className="flex justify-between items-center mb-4 mt-4">
              <h2 className="text-lg font-semibold">Calories Burned</h2>
              <Select 
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPeriod === "month" && (
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
                className="mb-4"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const value = format(date, 'yyyy-MM');
                    const label = format(date, 'MMMM yyyy');
                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            
            <Card>
              <CardContent className="p-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={caloriesData}>
                      <XAxis 
                        dataKey="name" 
                        padding={{ left: 10, right: 10 }} 
                      />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#0066CC" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              {allDaysInMonth.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const activity = monthMap.get(dateStr);
                const completed = activity && activity.calories > 0;
                
                return (
                  <div 
                    key={dateStr} 
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                      completed ? 'bg-primary text-white' : 'bg-neutral-light'
                    }`}
                  >
                    <span className="text-xs opacity-80">
                      {format(day, 'EEE')}
                    </span>
                    <span className="font-medium">
                      {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="averages">
            <div className="mt-4 flex flex-col space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Averages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <ActivityRings
                      moveProgress={moveProgress}
                      exerciseProgress={exerciseProgress}
                      standProgress={standProgress}
                    >
                      <p className="text-lg font-bold">
                        {averages?.calories || 0}
                      </p>
                      <p className="text-xs text-neutral-mid">
                        AVG CALORIES
                      </p>
                    </ActivityRings>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-full h-1 bg-[#FF3B30] rounded-full mb-1"></div>
                      <p className="font-medium">{Math.round(moveAvg)}/{moveTarget}</p>
                      <p className="text-xs text-neutral-mid">MOVE</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-1 bg-[#FFCC00] rounded-full mb-1"></div>
                      <p className="font-medium">{Math.round(exerciseAvg)}/{exerciseTarget}</p>
                      <p className="text-xs text-neutral-mid">EXERCISE</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-1 bg-[#34C759] rounded-full mb-1"></div>
                      <p className="font-medium">{Math.round(standAvg)}/{standTarget}</p>
                      <p className="text-xs text-neutral-mid">STAND</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Active Days</span>
                      <span className="font-semibold">
                        {weeklyActivities.filter((day: any) => day.caloriesBurned > 0).length}/7
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calories Burned</span>
                      <span className="font-semibold">
                        {weeklyActivities.reduce((sum: number, day: any) => sum + day.caloriesBurned, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Move Goal Completion</span>
                      <span className="font-semibold">
                        {weeklyActivities.filter((day: any) => 
                          day.percentage >= 100
                        ).length}/7
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
