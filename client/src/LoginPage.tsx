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
      
      // Use full reload to ensure proper auth state handling
      console.log("Login successful - redirecting to dashboard");
      window.location.href = "/";
      // Force reload after a short delay to ensure cookies are set
      setTimeout(() => {
        window.location.reload(true);
      }, 500);
    } catch (err) {
      console.error(`${isSignupMode ? "Registration" : "Login"} error:`, err);
      setError(err instanceof Error ? err.message : `${isSignupMode ? "Registration" : "Login"} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F7] p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        {/* Apple Rainbow Circle Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 200 200" className="absolute w-full h-full">
              <defs>
                <linearGradient id="rainbow-1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF595E" />
                  <stop offset="25%" stopColor="#FFCA3A" />
                  <stop offset="50%" stopColor="#8AC926" />
                  <stop offset="75%" stopColor="#1982C4" />
                  <stop offset="100%" stopColor="#6A4C93" />
                </linearGradient>
              </defs>
              {/* Create rainbow circle made of dots */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i * 6) * Math.PI / 180;
                const radius = 80;
                const x = 100 + radius * Math.cos(angle);
                const y = 100 + radius * Math.sin(angle);
                const size = 3 + Math.random() * 2;
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r={size} 
                    fill={`url(#rainbow-1)`} 
                    opacity={0.7 + Math.random() * 0.3}
                  />
                )
              })}
              {/* Apple Logo in Center */}
              <g transform="translate(100, 100) scale(0.15)">
                <path fill="#000" d="M213.803 167.03c.442 47.295 41.7 63.032 42.197 63.275-.367 1.097-6.798 23.295-22.277 46.155-13.578 19.711-27.699 39.22-49.755 39.629-21.675.398-28.708-12.73-53.496-12.73-24.812 0-32.585 12.343-53.15 13.13-21.12.788-37.274-21.132-50.978-40.785C8.31 244.442-18.01 170.047 17.44 120.687c17.415-24.356 48.554-39.823 82.2-40.22 25.629-.392 49.84 17.147 65.44 17.147 15.584 0 44.747-21.197 75.715-18.074 12.91.512 49.06 5.194 72.322 39.016-.893.564-43.07 24.76-42.617 73.993M174.24 50.199c13.626-16.595 22.853-39.35 20.366-62.201C172.94-9.571 153.047.822 139.156 17.066c-12.957 15.768-24.269 35.696-20.024 56.628 21.756 1.634 44.01-13.802 55.108-23.495"/>
              </g>
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-900">
          {isSignupMode ? "Create Apple ID" : "Sign in with Apple ID"}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm my-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Apple ID" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base text-gray-900 bg-white font-normal placeholder-gray-500"
                required
              />
              {username && (
                <button 
                  type="button"
                  onClick={() => setUsername("")}
                  className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100 w-5 h-5 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {!isSignupMode && (
            <div className="mb-4">
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base text-gray-900 bg-white font-normal placeholder-gray-500"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="mt-4 mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-0" />
              <span className="ml-2 text-sm text-gray-600">Keep me signed in</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading || !username || (!isSignupMode && !password)}
            className={`w-full py-3 rounded-lg font-medium text-gray-900 text-base border border-gray-300 bg-white hover:bg-gray-50 ${(loading || !username || (!isSignupMode && !password)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Processing..." : isSignupMode ? "Continue" : "→"}
          </button>
          
          <div className="mt-6 text-center text-sm space-y-2">
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-blue-600 hover:text-blue-800 font-normal"
            >
              Forgot Apple ID or password?
            </button>
            
            <div>
              <button
                type="button"
                onClick={() => setIsSignupMode(!isSignupMode)}
                className="text-blue-600 hover:text-blue-800 font-normal"
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