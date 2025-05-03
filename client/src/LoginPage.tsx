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
      
      // Simple approach - force page reload to trigger Router authentication check
      console.log("Login successful - reloading page to refresh auth state");
      
      // Force a complete reload which will cause Router.tsx to re-run its auth check
      // This is the simplest way to ensure consistent authentication state
      window.location.reload();
    } catch (err) {
      console.error(`${isSignupMode ? "Registration" : "Login"} error:`, err);
      setError(err instanceof Error ? err.message : `${isSignupMode ? "Registration" : "Login"} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F7] p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md p-8">
        {/* Apple Rainbow Circle Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="absolute w-full h-full">
              {/* Create rainbow circle made of dots */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i * 6) * Math.PI / 180;
                const radius = 40;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);
                const dotSize = 1.5;
                
                // Generate color based on position in circle
                const hue = (i * 6) % 360;
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r={dotSize} 
                    fill={`hsl(${hue}, 80%, 60%)`}
                    opacity="0.8"
                  />
                )
              })}
              
              {/* Apple Logo in Center */}
              <g transform="translate(50, 50) scale(0.05)">
                <path fill="#000" d="M213.803 167.03c.442 47.295 41.7 63.032 42.197 63.275-.367 1.097-6.798 23.295-22.277 46.155-13.578 19.711-27.699 39.22-49.755 39.629-21.675.398-28.708-12.73-53.496-12.73-24.812 0-32.585 12.343-53.15 13.13-21.12.788-37.274-21.132-50.978-40.785C8.31 244.442-18.01 170.047 17.44 120.687c17.415-24.356 48.554-39.823 82.2-40.22 25.629-.392 49.84 17.147 65.44 17.147 15.584 0 44.747-21.197 75.715-18.074 12.91.512 49.06 5.194 72.322 39.016-.893.564-43.07 24.76-42.617 73.993M174.24 50.199c13.626-16.595 22.853-39.35 20.366-62.201C172.94-9.571 153.047.822 139.156 17.066c-12.957 15.768-24.269 35.696-20.024 56.628 21.756 1.634 44.01-13.802 55.108-23.495"/>
              </g>
            </svg>
          </div>
        </div>
        
        <h2 className="text-[21px] font-medium text-center mb-7 text-gray-900">
          Sign in with Apple ID
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm my-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <div className="mb-3">
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Apple ID" 
                className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[15px] text-gray-900 bg-white font-normal placeholder-gray-500"
                required
              />
              {username && (
                <div className="absolute right-8 top-[9px] text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setUsername("")}
                    className="cursor-pointer hover:text-gray-600"
                  >
                    <circle cx="8" cy="8" r="7.5" stroke="#CCCCCC"/>
                    <path d="M5 5L11 11M5 11L11 5" stroke="#888888" strokeWidth="1.2"/>
                  </svg>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !username || (!isSignupMode && !password)}
                className={`absolute right-2 top-[7px] rounded-full w-5 h-5 flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 ${(loading || !username || (!isSignupMode && !password)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Continue"
              >
                {loading ? (
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {!isSignupMode && (
            <div className="mb-5">
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[15px] text-gray-900 bg-white font-normal placeholder-gray-500"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-0" />
              <span className="ml-2 text-[13px] text-gray-600">Keep me signed in</span>
            </label>
          </div>
          
          <div className="mt-6 text-center text-[13px] text-blue-500 space-y-1">
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-blue-500 hover:text-blue-700 font-normal"
            >
              Forgot Apple ID or password?
            </button>
            
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsSignupMode(!isSignupMode)}
                className="text-blue-500 hover:text-blue-700 font-normal"
              >
                {isSignupMode ? "Already have an Apple ID? Sign In" : "Create Apple ID"}
              </button>
            </div>
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