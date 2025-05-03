import { FormEvent, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./hooks/use-auth";
import { X, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
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

  const clearUsername = () => {
    setUsername("");
  };

  return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="max-w-md w-full bg-black rounded-2xl p-8 mx-4">
        {/* Logo with Spiral Dots */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
              {/* Generate dots in a spiral pattern */}
              {Array.from({ length: 40 }).map((_, i) => {
                const angle = i * 0.5;
                const distance = 2 + i * 0.6;
                const x = 40 + distance * Math.cos(angle);
                const y = 40 + distance * Math.sin(angle);
                const size = 1.5 - (i * 0.03);
                
                // Create gradient colors from blue to purple to pink
                const hue = 240 + (i * 3);
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r={size} 
                    fill={`hsl(${hue}, 70%, 70%)`} 
                  />
                );
              })}
              
              {/* Apple logo in center */}
              <g transform="translate(36, 36) scale(0.5)">
                <path fill="#ffffff" d="M12.7,0.3c-0.9,0.9-2.2,1.4-3.5,1.4c-0.1-1.3,0.4-2.5,1.1-3.4C11.2-2.5,12.5-3.1,13.7-3.2C13.8-1.9,13.3-0.7,12.7,0.3z" />
                <path fill="#ffffff" d="M13.7,2.4c-1.9-0.1-3.6,1.1-4.5,1.1C8.2,3.5,6.9,2.5,5.3,2.5c-2.4,0.1-4.7,1.4-5.9,3.6C-3.2,10.8-0.9,16.7,1.5,19.9
                  c1.2,1.6,2.5,3.5,4.3,3.4c1.7-0.1,2.3-1.1,4.4-1.1c2,0,2.6,1.1,4.4,1.1c1.8,0,3-1.7,4.1-3.4c0.7-1,1.2-2.1,1.6-3.2
                  c-3.9-1.5-3.7-7.1,0.2-8.3c-1.2-1.5-2.8-2.4-4.5-2.5C15.1,6,14.5,2.5,13.7,2.4z"/>
              </g>
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-medium text-center text-white mb-6">
          {isSignupMode 
            ? "Create Your Account" 
            : "Sign in with Apple ID"}
        </h1>
        
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Apple ID" 
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                required
                autoComplete="username"
              />
              {username && (
                <button
                  type="button"
                  onClick={clearUsername}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {!isSignupMode && (
            <div className="mt-2">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                required
                autoComplete="current-password"
              />
            </div>
          )}
          
          <div className="flex items-center mt-4">
            <input 
              type="checkbox" 
              id="keepSignedIn" 
              checked={keepSignedIn}
              onChange={() => setKeepSignedIn(!keepSignedIn)}
              className="h-3 w-3 rounded border-gray-600 text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="keepSignedIn" className="ml-2 text-xs text-gray-400">
              Keep me signed in
            </label>
          </div>
          
          {!isSignupMode && (
            <div className="mt-8">
              <button
                type="submit"
                disabled={loginMutation.isPending || !username || !password}
                className={`w-full py-2 rounded-md font-medium text-white text-sm flex items-center justify-center
                  ${(loginMutation.isPending || !username || !password)
                    ? 'bg-gray-800 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </div>
          )}
          
          {isSignupMode && (
            <>
              <div className="mt-4">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                  required
                  autoComplete="new-password"
                />
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={registerMutation.isPending || !username || !password}
                  className={`w-full py-2 rounded-md font-medium text-white text-sm flex items-center justify-center
                    ${(registerMutation.isPending || !username || !password)
                      ? 'bg-gray-800 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <button
            type="button"
            className="text-blue-500 text-xs hover:underline"
          >
            {isSignupMode 
              ? "Forgot Apple ID or password?" 
              : "Forgot Apple ID or password?"}
          </button>
          
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="text-blue-500 text-xs hover:underline"
            >
              {isSignupMode 
                ? "Already have an Apple ID? Sign in" 
                : "Create your Apple ID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}