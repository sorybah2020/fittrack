import { FormEvent, useState } from 'react';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      console.log("Attempting registration for user:", username);
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, 
          password,
          dailyMoveGoal: 450,
          dailyExerciseGoal: 30,
          dailyStandGoal: 12
        }),
        credentials: "include",
      });

      console.log("Registration response status:", response.status);
      
      // Get response as text first
      const responseText = await response.text();
      console.log("Registration response body:", responseText);
      
      // Then parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Could not parse response as JSON:", e);
      }
      
      if (!response.ok) {
        throw new Error((data && data.message) || `Registration failed with status ${response.status}`);
      }

      console.log("Registration successful!");
      
      // Force a full reload to ensure proper login after registration
      window.location.href = "/";
      window.location.reload();
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = "/";
  };

  return (
    <div style={{
      backgroundColor: "#f5f5f7",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: "40px 30px",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "380px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        {/* Colorful dots circle around Apple logo */}
        <div style={{
          width: "80px",
          height: "80px",
          position: "relative",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' stroke='url(%23paint0_linear)' stroke-width='2' stroke-dasharray='2 4'/%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear' x1='0' y1='0' x2='80' y2='80' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF5E3A'/%3E%3Cstop offset='0.25' stop-color='%23FF9500'/%3E%3Cstop offset='0.5' stop-color='%235AC8FA'/%3E%3Cstop offset='0.75' stop-color='%235856D6'/%3E%3Cstop offset='1' stop-color='%23FF2D55'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")`,
            backgroundSize: "contain"
          }} />
          <svg viewBox="0 0 24 24" width="30" height="30" fill="black">
            <path d="M17.543 13.308c-.019-2.060.721-3.946 2.215-5.145-.823-1.104-2.068-1.764-3.432-1.968-1.394-.195-2.914.377-3.675.92-.831.595-1.541.57-2.342.035-1.15-.769-2.017-1.032-2.956-.893-1.535.223-2.824 1.277-3.483 2.838-1.254 2.968-.318 7.337 1.038 9.732.684 1.166 1.513 2.465 2.61 2.419 1.034-.044 1.451-.661 2.716-.661 1.237 0 1.614.661 2.723.644 1.134-.018 1.854-1.026 2.562-2.184.523-.921.965-1.893 1.24-2.897-1.468-.603-2.219-2.14-2.216-3.84zm-2.196-7.197c.782-.991 1.107-2.244.83-3.502-1.031.072-2.005.52-2.71 1.243-.693.71-1.071 1.644-1.03 2.604.03.107.057.214.09.315.117.025.233.045.35.06 1.018-.072 1.945-.537 2.47-1.36z" />
          </svg>
        </div>

        <h1 style={{
          fontSize: "24px",
          fontWeight: "500",
          marginBottom: "8px",
          color: "#1d1d1f"
        }}>
          Create Fitness Account
        </h1>

        {error && (
          <div style={{
            backgroundColor: "#ffe0e0",
            color: "#d00000",
            padding: "10px",
            borderRadius: "6px",
            margin: "15px 0",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d2d2d7",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d2d2d7",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d2d2d7",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || !username || !password || !confirmPassword || password !== confirmPassword}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              backgroundColor: !username || !password || !confirmPassword || password !== confirmPassword || loading ? "#0071e3aa" : "#0071e3",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: (!username || !password || !confirmPassword || password !== confirmPassword || loading) ? "default" : "pointer",
              textAlign: "center"
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div style={{
            marginTop: "20px",
            borderTop: "1px solid #d2d2d7",
            paddingTop: "20px"
          }}>
            <button
              type="button"
              onClick={goToLogin}
              style={{
                color: "#0071e3",
                background: "none",
                border: "none",
                padding: "5px 0",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "none"
              }}
            >
              Already have an account? Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}