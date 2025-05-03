import { useState, FormEvent } from "react";

export default function SimpleLoginPage() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // If response isn't valid JSON, continue if status is OK
        if (!response.ok) {
          throw new Error(`${isSignupMode ? "Registration" : "Login"} failed`);
        }
      }
      
      if (!response.ok) {
        throw new Error(responseData?.message || `${isSignupMode ? "Registration" : "Login"} failed`);
      }

      console.log(`${isSignupMode ? "Registration" : "Login"} successful!`);
      
      // Force a complete app reload to apply authentication
      window.location.href = "/";
    } catch (err) {
      console.error(`${isSignupMode ? "Registration" : "Login"} error:`, err);
      setError(err instanceof Error ? err.message : `${isSignupMode ? "Registration" : "Login"} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* Top iCloud text - like in the image */}
      <div className="fixed top-0 left-0 p-4">
        <span className="font-medium text-gray-700">Fitness</span>
      </div>
      
      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center">
        {/* Apple-style colorful dots logo */}
        <div className="mb-6">
          <svg width="70" height="70" viewBox="0 0 100 100">
            <g fill="none">
              <circle cx="50" cy="50" r="35" stroke="url(#dotGradient)" strokeWidth="2" />
              {/* Colorful dots around the circle */}
              {Array.from({ length: 30 }).map((_, i) => {
                const angle = (i * 12) * Math.PI / 180;
                const x = 50 + 35 * Math.cos(angle);
                const y = 50 + 35 * Math.sin(angle);
                const hue = i * 12; // Hue value from 0-360
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r="2" 
                    fill={`hsl(${hue}, 80%, 65%)`} 
                  />
                );
              })}
              {/* Apple logo in the center */}
              <g transform="translate(36, 36) scale(1.2)">
                <path fill="black" d="M17.05,20.28c-0.98,0.95-2.05,0.8-3.08,0.35c-1.09-0.46-2.09-0.48-3.24,0c-1.44,0.62-2.2,0.44-3.06-0.35 C2.79,15.5,3.51,7.6,8.56,7.31c1.65,0.07,2.47,0.95,3.56,0.97c1.19-0.15,2.09-1.05,3.6-1.1c1.58,0.06,2.77,0.87,3.55,2.18 c-3.21,1.93-2.62,6.18,0.38,7.53C19.11,18.1,18.36,19.15,17.05,20.28z M13.06,3.14c1.36-1.78,3.9-1.88,4.29-1.9 C16.5,3.95,14.23,4.8,13.06,3.14z"/>
              </g>
            </g>
            <defs>
              <linearGradient id="dotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="25%" stopColor="#FFD166" />
                <stop offset="50%" stopColor="#06D6A0" />
                <stop offset="75%" stopColor="#118AB2" />
                <stop offset="100%" stopColor="#9370DB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <h1 className="text-center text-xl font-medium mb-6">
          {isSignupMode ? "Create Account" : "Sign in with Username"}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 text-center w-full max-w-xs">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
          <div className="mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800"
              required
            />
          </div>
          
          {!isSignupMode && password.length === 0 ? null : (
            <div className="mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>
          )}
          
          <div className="mb-6 flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3 w-3 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600">
              Keep me signed in
            </label>
          </div>
          
          {!isSignupMode && password.length === 0 ? (
            <button
              type="button"
              onClick={() => {/* Continue button action */}}
              className="w-full py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !username || !password}
              className={`w-full py-1.5 rounded-md text-sm ${
                loading || !username || !password
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading 
                ? "Please wait..." 
                : isSignupMode ? "Create Account" : "Sign In"}
            </button>
          )}
        </form>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 mb-2">
            {isSignupMode ? null : (
              <button className="text-blue-500 hover:underline">
                Forgot Username or Password?
              </button>
            )}
          </div>
          
          <div className="text-xs text-blue-500">
            {isSignupMode ? (
              <button 
                className="hover:underline"
                onClick={() => setIsSignupMode(false)}
              >
                Back to Sign In
              </button>
            ) : (
              <button 
                className="hover:underline"
                onClick={() => setIsSignupMode(true)}
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer links */}
      <div className="mt-16 text-center text-xs text-gray-500 space-x-6">
        <span>System Status</span>
        <span>Privacy Policy</span>
        <span>Terms & Conditions</span>
      </div>
      
      <div className="mt-2 text-center text-xs text-gray-500">
        <p>Copyright © {new Date().getFullYear()} Fitness App. All rights reserved.</p>
      </div>
    </div>
  );
}