import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-blue-500 to-green-500 rounded-full opacity-20"></div>
            <svg className="relative z-10 w-full h-full" viewBox="0 0 24 24" fill="none">
              <path d="M18.06,13.62c-0.02-2.03,0.88-3.97,2.48-5.3c-0.97-1.35-2.47-2.26-4.12-2.53c-1.72-0.18-3.44,1.02-4.33,1.02 c-0.92,0-2.28-1.01-3.77-0.98C5.57,5.89,3.2,7.33,2.06,9.61c-2.48,4.3-0.63,10.63,1.74,14.11c1.19,1.69,2.56,3.55,4.36,3.49 c1.77-0.07,2.42-1.12,4.55-1.12c2.1,0,2.73,1.12,4.57,1.07c1.89-0.03,3.08-1.68,4.21-3.39c0.83-1.19,1.47-2.5,1.91-3.89 C20.65,18.41,18.08,16.37,18.06,13.62z" fill="currentColor" />
              <path d="M15.84,4.09c1.03-1.24,1.37-2.88,0.93-4.4c-1.49,0.3-2.78,1.16-3.66,2.44c-0.99,1.24-1.31,2.86-0.89,4.36 C13.77,6.19,15.04,5.32,15.84,4.09z" fill="currentColor" />
            </svg>
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-black bg-white"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
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
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignupMode(!isSignupMode)}
            className="text-blue-600 hover:text-blue-800 font-medium text-base px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isSignupMode 
              ? "Already have an account? Sign In" 
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}