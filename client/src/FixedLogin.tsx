import { useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FixedLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Trim whitespace from username
      const trimmedUsername = username.trim();
      
      if (!trimmedUsername) {
        toast({
          title: "Validation error",
          description: "Username cannot be empty",
          variant: "destructive"
        });
        return;
      }
      
      let response;
      
      if (isSignupMode) {
        // Registration
        response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: trimmedUsername,
            password,
            dailyMoveGoal: 450,
            dailyExerciseGoal: 30,
            dailyStandGoal: 12
          }),
          credentials: 'include'
        });
      } else {
        // Login
        response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            username: trimmedUsername, 
            password 
          }),
          credentials: 'include'
        });
      }
      
      if (response.ok) {
        toast({
          title: isSignupMode ? "Registration successful" : "Login successful",
          description: isSignupMode ? "Your account has been created" : "Welcome back!",
        });
        
        // Redirect to the dashboard after successful login/registration
        window.location.href = '/';
      } else {
        const errorText = await response.text();
        
        toast({
          title: isSignupMode ? "Registration failed" : "Login failed",
          description: errorText || (isSignupMode ? "Username may already be taken" : "Invalid username or password"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          {isSignupMode ? "Create Account" : "Sign in to Fitness Tracker"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username input */}
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full h-9 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-[15px] text-gray-900 bg-white font-normal placeholder-gray-500"
              required
            />
          </div>
          
          {/* Password input */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-9 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-[15px] text-gray-900 bg-white font-normal placeholder-gray-500"
              required
            />
          </div>
          
          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignupMode ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                <>{isSignupMode ? 'Create Account' : 'Sign In'}</>
              )}
            </button>
          </div>
          
          {/* Toggle between login and signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="text-blue-500 hover:text-blue-700 font-normal text-sm"
            >
              {isSignupMode ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}