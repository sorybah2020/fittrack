import { FormEvent, useState } from "react";

export default function BasicLogin() {
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
    <div style={{
      backgroundColor: "#000000",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "380px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "600",
          marginBottom: "5px",
          color: "#000000"
        }}>
          {isSignupMode ? "Create Account" : "Sign In"}
        </h1>
        
        <p style={{
          textAlign: "center",
          fontSize: "16px",
          color: "#505050",
          marginBottom: "20px"
        }}>
          {isSignupMode ? "Sign up for Fitness Tracker" : "Sign in to Fitness Tracker"}
        </p>
        
        {error && (
          <div style={{
            backgroundColor: "#ffeeee",
            color: "#cc0000",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
              color: "#333333"
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #cccccc",
                boxSizing: "border-box"
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
              color: "#333333"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #cccccc",
                boxSizing: "border-box"
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: loading ? "#85b7ff" : "#0066ff",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "20px"
            }}
          >
            {loading 
              ? "Processing..." 
              : isSignupMode ? "Create Account" : "Sign In"}
          </button>
          
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setIsSignupMode(!isSignupMode)}
              style={{
                backgroundColor: "transparent",
                color: "#0066ff",
                border: "none",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {isSignupMode 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}