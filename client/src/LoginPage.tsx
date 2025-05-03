import { FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setResetSubmitting(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to request password reset");
      }
      
      toast({
        title: "Password Reset Requested",
        description: "If an account exists with this email, you will receive password reset instructions.",
        duration: 5000,
      });
      setShowPasswordReset(false);
      setResetEmail("");
    } catch (err) {
      console.error("Password reset error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to request password reset",
        duration: 5000,
      });
    } finally {
      setResetSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignupMode ? "/api/register" : "/api/login";
      const bodyData = isSignupMode 
        ? { 
            username, 
            password,
            dailyMoveGoal: 450,
            dailyExerciseGoal: 30,
            dailyStandGoal: 12
          }
        : { username, password };

      console.log(`Attempting ${isSignupMode ? "registration" : "login"} for user:`, username);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
        credentials: "include",
      });

      console.log(`${isSignupMode ? "Registration" : "Login"} response status:`, response.status);
      
      // Get response as text first
      const responseText = await response.text();
      console.log(`${isSignupMode ? "Registration" : "Login"} response body:`, responseText);
      
      // Then parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Could not parse response as JSON:", e);
      }
      
      if (!response.ok) {
        throw new Error((data && data.message) || `${isSignupMode ? "Registration" : "Login"} failed with status ${response.status}`);
      }

      console.log(`${isSignupMode ? "Registration" : "Login"} successful!`);
      
      // Force a complete page reload to ensure proper auth state handling
      setTimeout(() => {
        window.location.href = "/";
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error(`${isSignupMode ? "Registration" : "Login"} error:`, err);
      setError(err instanceof Error ? err.message : `${isSignupMode ? "Registration" : "Login"} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-xl">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full opacity-20"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-blue-600">
                <path d="M17.05,20.28c-0.98,0.95-2.05,0.8-3.08,0.35c-1.09-0.46-2.09-0.48-3.24,0c-1.44,0.62-2.2,0.44-3.06-0.35 C2.79,15.5,3.51,7.6,8.56,7.31c1.65,0.07,2.47,0.95,3.56,0.97c1.19-0.15,2.09-1.05,3.6-1.1c1.58,0.06,2.77,0.87,3.55,2.18 c-3.21,1.93-2.62,6.18,0.38,7.53C19.11,18.1,18.36,19.15,17.05,20.28z M13.06,3.14c1.36-1.78,3.9-1.88,4.29-1.9 C16.5,3.95,14.23,4.8,13.06,3.14z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-center mb-2 text-gray-900">
          {isSignupMode ? "Create Fitness Account" : "Sign in with Username"}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm my-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="space-y-4">
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900 bg-gray-50 font-normal placeholder-gray-500"
                required
              />
              {username && (
                <button 
                  type="button"
                  onClick={() => setUsername("")}
                  className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900 bg-gray-50 font-normal placeholder-gray-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !username || !password}
              className={`w-full py-3 rounded-lg font-medium text-white text-base mt-2
                ${(loading || !username || !password) 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading 
                ? "Processing..." 
                : "Continue"}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              {isSignupMode 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Create one now"}
            </button>
            
            {!isSignupMode && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Forgot username or password?
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      
      {/* Password Reset Dialog */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="font-medium">
                Email Address
              </Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="bg-white text-black"
                required
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPasswordReset(false)}
                disabled={resetSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!resetEmail || resetSubmitting}>
                {resetSubmitting ? "Sending..." : "Send Reset Instructions"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}