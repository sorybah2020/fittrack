import { useState, FormEvent } from "react";

export default function SimpleLoginPage() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `${isSignupMode ? "Registration" : "Login"} failed`);
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 sm:p-8">
        {/* Apple-style logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-30"></div>
            <svg viewBox="0 0 24 24" className="h-14 w-14 mx-auto text-black relative z-10">
              <path fill="currentColor" d="M17.05,20.28c-0.98,0.95-2.05,0.8-3.08,0.35c-1.09-0.46-2.09-0.48-3.24,0c-1.44,0.62-2.2,0.44-3.06-0.35 C2.79,15.5,3.51,7.6,8.56,7.31c1.65,0.07,2.47,0.95,3.56,0.97c1.19-0.15,2.09-1.05,3.6-1.1c1.58,0.06,2.77,0.87,3.55,2.18 c-3.21,1.93-2.62,6.18,0.38,7.53C19.11,18.1,18.36,19.15,17.05,20.28z M13.06,3.14c1.36-1.78,3.9-1.88,4.29-1.9 C16.5,3.95,14.23,4.8,13.06,3.14z"/>
            </svg>
          </div>
        </div>
        
        <h1 className="text-center text-xl sm:text-2xl font-medium mb-6">
          {isSignupMode ? "Create your account" : "Sign in with your username"}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          
          {!isSignupMode && (
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                Keep me signed in
              </label>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full py-2 px-4 rounded-md ${
              loading || !username || !password
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading 
              ? "Please wait..." 
              : isSignupMode ? "Create Account" : "Continue"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          {!isSignupMode ? (
            <p className="text-sm text-gray-600">
              <button type="button" className="text-blue-500 hover:text-blue-700" onClick={() => setIsSignupMode(true)}>
                Create Account
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button type="button" className="text-blue-500 hover:text-blue-700" onClick={() => setIsSignupMode(false)}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Copyright © {new Date().getFullYear()} Fitness App</p>
      </div>
    </div>
  );
}