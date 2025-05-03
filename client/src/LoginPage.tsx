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
      
      // Redirect to home page
      window.location.href = "/";
    } catch (err) {
      console.error(`${isSignupMode ? "Registration" : "Login"} error:`, err);
      setError(err instanceof Error ? err.message : `${isSignupMode ? "Registration" : "Login"} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-2xl border-2 border-blue-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 via-red-500 to-pink-500 rounded-full opacity-30"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img 
                src="data:image/png;base64,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"
                alt="Running figure"
                className="h-14 w-14 object-contain"
              />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-black">
          {isSignupMode ? "Create Account" : "Sign In"}
        </h1>
        
        <p className="text-md text-gray-700 text-center mb-6 font-medium">
          {isSignupMode ? "Sign up for Fitness Tracker" : "Sign in to Fitness Tracker"}
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-base font-bold text-gray-900 mb-2 ml-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username" 
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg text-white bg-black font-medium placeholder-gray-400"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-base font-bold text-gray-900 mb-2 ml-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg text-white bg-black font-medium placeholder-gray-400"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full py-4 rounded-lg font-semibold text-white text-lg
              ${(loading || !username || !password) 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
          >
            {loading 
              ? "Processing..." 
              : isSignupMode ? "Create Account" : "Sign In"}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-4">
          <button
            type="button"
            onClick={() => setIsSignupMode(!isSignupMode)}
            className="text-blue-600 hover:text-blue-800 font-medium text-base px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isSignupMode 
              ? "Already have an account? Sign In" 
              : "Don't have an account? Sign Up"}
          </button>
          
          {!isSignupMode && (
            <div>
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-3"
              >
                Forgot username or password?
              </button>
            </div>
          )}
        </div>
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