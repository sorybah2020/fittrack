import { FormEvent, useState } from "react";

export default function StableLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegistering ? "/api/register" : "/api/login";
    const payload = isRegistering 
      ? { 
          username, 
          password, 
          dailyMoveGoal: 450, 
          dailyExerciseGoal: 30, 
          dailyStandGoal: 12 
        } 
      : { username, password };

    try {
      console.log(`Attempting ${isRegistering ? "registration" : "login"} for user:`, username);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      console.log("Response status:", response.status);
      
      // Get response as text first
      const responseText = await response.text();
      console.log("Response body:", responseText);
      
      // Then parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Could not parse response as JSON:", e);
      }
      
      if (!response.ok) {
        throw new Error((data && data.message) || `Action failed with status ${response.status}`);
      }

      console.log("Action successful!");
      
      // Redirect to home page after success with cache busting
      window.location.href = "/?login=" + new Date().getTime();
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          Fitness Tracker
        </h1>
        
        <p className="text-gray-400 text-center mb-6">
          {isRegistering ? "Create a new account" : "Sign in to your account"}
        </p>
        
        {error && (
          <div className="bg-red-900/30 text-red-300 p-3 rounded-md mb-4 text-center text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-2 rounded-md text-white font-medium transition bg-blue-600 hover:bg-blue-500"
          >
            {loading 
              ? "Processing..." 
              : isRegistering 
                ? "Create Account" 
                : "Sign In"
            }
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            {isRegistering 
              ? "Already have an account? Sign In" 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
