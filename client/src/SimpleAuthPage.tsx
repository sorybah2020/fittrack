import { FormEvent, useState } from "react";

export default function SimpleAuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Login attempt with:", username);
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      // Get the response content regardless of success/failure
      let responseText;
      let responseData;
      
      try {
        responseText = await response.text();
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.log("Non-JSON response:", responseText);
        }
      } catch (e) {
        console.log("Could not read response body");
      }
      
      if (!response.ok) {
        console.log("Login failed with status:", response.status);
        console.log("Response data:", responseData);
        
        if (responseData && responseData.message) {
          throw new Error(responseData.message);
        } else {
          throw new Error(`Login failed with status ${response.status}`);
        }
      }

      console.log("Login successful:", responseData);
      
      // Redirect to home page
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUsername("demo");
    setPassword("password123");
    
    // Submit the form programmatically
    const form = document.getElementById("login-form") as HTMLFormElement;
    if (form) form.requestSubmit();
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh",
      backgroundColor: "#111",
      color: "#fff",
      padding: "20px"
    }}>
      <h1 style={{ color: "#ff3b30", fontSize: "2rem", marginBottom: "20px" }}>Fitness Tracker</h1>
      <p style={{ marginBottom: "20px" }}>Track your workouts and fitness goals</p>
      
      <div style={{ 
        backgroundColor: "#1c1c1e", 
        padding: "30px", 
        borderRadius: "12px",
        width: "100%",
        maxWidth: "400px" 
      }}>
        <h2 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>Login</h2>
        
        <form id="login-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ 
                width: "100%", 
                padding: "10px 15px", 
                border: "1px solid #333", 
                borderRadius: "6px",
                backgroundColor: "#252527",
                color: "white"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: "100%", 
                padding: "10px 15px", 
                border: "1px solid #333", 
                borderRadius: "6px",
                backgroundColor: "#252527",
                color: "white"
              }}
            />
          </div>
          
          {error && (
            <div style={{ color: "#ff3b30", marginTop: "10px" }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{ 
              backgroundColor: "#ff3b30", 
              color: "white", 
              padding: "12px 20px", 
              border: "none", 
              borderRadius: "6px", 
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              marginTop: "10px"
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{ 
              backgroundColor: "#1e1e1e", 
              color: "white", 
              padding: "12px 20px", 
              border: "1px solid #333", 
              borderRadius: "6px", 
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              marginTop: "5px"
            }}
          >
            Demo Login
          </button>
        </form>
      </div>
    </div>
  );
}