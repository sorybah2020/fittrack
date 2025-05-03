import { FormEvent, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./hooks/use-auth";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [_, setLocation] = useLocation();
  
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isSignupMode) {
      registerMutation.mutate({
        username,
        password,
        dailyMoveGoal: 450,
        dailyExerciseGoal: 30,
        dailyStandGoal: 12
      }, {
        onError: (error: Error) => {
          setError(error.message);
        }
      });
    } else {
      loginMutation.mutate({
        username,
        password
      }, {
        onError: (error: Error) => {
          setError(error.message);
        }
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm mb-8 mx-auto">
            <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none">
              <path d="M18.06,13.62c-0.02-2.03,0.88-3.97,2.48-5.3c-0.97-1.35-2.47-2.26-4.12-2.53c-1.72-0.18-3.44,1.02-4.33,1.02 c-0.92,0-2.28-1.01-3.77-0.98C5.57,5.89,3.2,7.33,2.06,9.61c-2.48,4.3-0.63,10.63,1.74,14.11c1.19,1.69,2.56,3.55,4.36,3.49 c1.77-0.07,2.42-1.12,4.55-1.12c2.1,0,2.73,1.12,4.57,1.07c1.89-0.03,3.08-1.68,4.21-3.39c0.83-1.19,1.47-2.5,1.91-3.89 C20.65,18.41,18.08,16.37,18.06,13.62z" fill="currentColor" />
              <path d="M15.84,4.09c1.03-1.24,1.37-2.88,0.93-4.4c-1.49,0.3-2.78,1.16-3.66,2.44c-0.99,1.24-1.31,2.86-0.89,4.36 C13.77,6.19,15.04,5.32,15.84,4.09z" fill="currentColor" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            {isSignupMode 
              ? "Create Your Account" 
              : "Sign in with Your ID"}
          </h1>
          
          <p className="text-lg text-gray-400 text-center mb-8">
            {isSignupMode 
              ? "Start tracking your fitness journey" 
              : "Continue to Fitness App"}
          </p>
          
          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" 
                className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-lg text-white"
                required
                autoComplete="username"
              />
            </div>
            
            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-lg text-white"
                required
                autoComplete={isSignupMode ? "new-password" : "current-password"}
              />
            </div>
            
            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending || !username || !password}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg flex items-center justify-center space-x-2
                ${(loginMutation.isPending || registerMutation.isPending || !username || !password)
                  ? 'bg-gray-800 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 shadow-lg'}`}
            >
              {(loginMutation.isPending || registerMutation.isPending) ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignupMode ? "Create Account" : "Continue"}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="text-red-500 hover:text-red-400 font-medium text-base"
            >
              {isSignupMode 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Section - Hero Image (visible only on larger screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
          <div className="w-full max-w-lg">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Track Your Fitness <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">Journey</span>
            </h2>
            <p className="text-gray-300 text-xl mb-8">
              Your all-in-one fitness companion. Monitor workouts, track progress, and achieve your fitness goals.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <div className="text-red-500 font-bold text-4xl">450+</div>
                <div className="text-gray-400">Exercise Minutes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <div className="text-red-500 font-bold text-4xl">1,200</div>
                <div className="text-gray-400">Calories Burned</div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Abstract rings graphics */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 border-4 border-red-500/20 rounded-full"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 border-4 border-pink-600/10 rounded-full"></div>
        <div className="absolute -top-20 left-20 w-72 h-72 border-4 border-red-500/20 rounded-full"></div>
      </div>
    </div>
  );
}