import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut, User, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BottomNavbar } from "@/components/BottomNavbar";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";

export default function Profile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutMutation.mutateAsync();
      window.location.href = '/auth';
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8 px-4 pb-24">
      <Card className="max-w-md mx-auto bg-gray-900 rounded-xl border border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center pb-4">
            <div className="h-24 w-24 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0.5 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="h-20 w-20 text-orange-500" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="runner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFF00"/>
                      <stop offset="20%" stopColor="#FFC107"/>
                      <stop offset="50%" stopColor="#FF9800"/>
                      <stop offset="80%" stopColor="#FF5722"/>
                      <stop offset="100%" stopColor="#F44336"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#runner-gradient)" d="M180.5,100.5c-7-2.3-10.8-10-8.5-17c2.3-7,10-10.8,17-8.5c7,2.3,10.8,10,8.5,17
                    C195.2,99,187.5,102.8,180.5,100.5z M218,185.6l-15-50.9l-14.1-12.9c-3.9-3.6-7-4-13-2.8c-6,1.2-15.7,4.9-25.5,8.5
                    c-9.8,3.6-14,7.1-17.2,13.4l-25.1,50.4l14.5,7.2l23.4-46.8l9.2-3.5l-16.9,64.7l-43.8,28.9l8.4,12.6l48.2-25.9
                    c2.9-1.6,5.3-3.9,7-6.7l6.4-10.7l20.7,29l24.6,7.9l7.3-13.5l-22.4-5l-15.3-27.7l10.3-39.6l8.6,29.2L218,185.6z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Username</span>
              <span className="text-lg font-medium text-white">{user.username}</span>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <Separator className="my-2 bg-gray-800" />
          
          <div className="space-y-4 pt-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Personal Information
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Add Workout Modal */}
      <AddWorkoutModal 
        isOpen={showAddWorkoutModal} 
        onClose={() => setShowAddWorkoutModal(false)} 
      />
      
      {/* Bottom Navigation */}
      <BottomNavbar onAddClick={() => setShowAddWorkoutModal(true)} />
    </div>
  );
}