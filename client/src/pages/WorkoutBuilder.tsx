import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { WorkoutType, Workout } from '@/lib/fitness-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Plus, Clock, BarChart3, Thermometer, TimerIcon, BoltIcon, HeartPulse, RotateCcw } from 'lucide-react';
import { calculateCaloriesBurned, formatDuration, formatDistance } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';

type WorkoutFormData = {
  name: string;
  workoutTypeId: number;
  duration: number; 
  distance?: number;
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
};

export default function WorkoutBuilder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('type');
  const [formData, setFormData] = useState<WorkoutFormData>({
    name: '',
    workoutTypeId: 0,
    duration: 30,
    distance: undefined,
    intensity: 'medium',
    notes: '',
  });

  // Query to get workout types
  const { data: workoutTypes = [] } = useQuery<WorkoutType[]>({
    queryKey: ['/api/workout-types'],
  });

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: WorkoutFormData) => {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: new Date().toISOString(),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create workout');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workout created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      navigate('/workouts');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get selected workout type name
  const selectedWorkoutType = workoutTypes.find(t => t.id === formData.workoutTypeId)?.name || '';
  
  // Estimated calories
  const estimatedCalories = calculateCaloriesBurned(
    formData.duration,
    formData.intensity,
    selectedWorkoutType
  );

  const handleNextStep = () => {
    if (activeTab === 'type') setActiveTab('details');
    else if (activeTab === 'details') setActiveTab('summary');
  };

  const handlePreviousStep = () => {
    if (activeTab === 'details') setActiveTab('type');
    else if (activeTab === 'summary') setActiveTab('details');
  };

  const handleChange = (key: keyof WorkoutFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!formData.workoutTypeId) {
      toast({
        title: 'Error',
        description: 'Please select a workout type',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Please enter a workout name',
        variant: 'destructive',
      });
      return;
    }

    createWorkoutMutation.mutate(formData);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      workoutTypeId: 0,
      duration: 30,
      distance: undefined,
      intensity: 'medium',
      notes: '',
    });
    setActiveTab('type');
  };

  return (
    <div className="container py-6 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/workouts')}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Custom Workout Builder</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Workout Type</CardTitle>
              <CardDescription>Choose the type of workout you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {workoutTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={formData.workoutTypeId === type.id ? "default" : "outline"}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      formData.workoutTypeId === type.id ? `bg-${type.color}-600 hover:bg-${type.color}-700` : ''
                    }`}
                    onClick={() => handleChange('workoutTypeId', type.id)}
                  >
                    <div className="text-2xl">{type.icon}</div>
                    <div>{type.name}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNextStep} disabled={!formData.workoutTypeId}>
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
              <CardDescription>Customize your workout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Morning Run"
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <Slider
                    value={[formData.duration]}
                    min={5}
                    max={120}
                    step={5}
                    onValueChange={(value) => handleChange('duration', value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{formData.duration}</span>
                </div>
              </div>

              {['Running', 'Cycling', 'Swimming'].includes(
                workoutTypes.find(t => t.id === formData.workoutTypeId)?.name || ''
              ) && (
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={formData.distance === undefined || formData.distance === null ? '' : formData.distance}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      handleChange('distance', value);
                    }}
                    placeholder="e.g. 3.1"
                    min={0}
                    step={0.1}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Intensity</Label>
                <Select
                  value={formData.intensity}
                  onValueChange={(value) => handleChange('intensity', value as 'low' | 'medium' | 'high')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes === undefined || formData.notes === null ? '' : formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any notes about your workout"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousStep}>
                Back
              </Button>
              <Button onClick={handleNextStep} disabled={!formData.name}>
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Summary</CardTitle>
              <CardDescription>Review and save your custom workout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-1">
                    <Clock className="h-5 w-5 mx-auto" />
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold">{formatDuration(formData.duration)}</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-1">
                    <HeartPulse className="h-5 w-5 mx-auto" />
                  </div>
                  <div className="text-sm text-muted-foreground">Intensity</div>
                  <div className="font-semibold capitalize">{formData.intensity}</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-1">
                    <BarChart3 className="h-5 w-5 mx-auto" />
                  </div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                  <div className="font-semibold">{estimatedCalories}</div>
                </div>
                
                {formData.distance && (
                  <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                    <div className="text-muted-foreground mb-1">
                      <RotateCcw className="h-5 w-5 mx-auto" />
                    </div>
                    <div className="text-sm text-muted-foreground">Distance</div>
                    <div className="font-semibold">{formatDistance(formData.distance)}</div>
                  </div>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">Workout Details</h3>
                <div className="mt-2">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {workoutTypes.find(t => t.id === formData.workoutTypeId)?.name}
                    </span>
                  </div>
                  {formData.notes && (
                    <div className="mt-2">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="text-sm mt-1">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousStep}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createWorkoutMutation.isPending}
                >
                  {createWorkoutMutation.isPending ? 'Saving...' : 'Save Workout'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}