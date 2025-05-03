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
            <div className="h-24 w-24 bg-gray-800 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
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