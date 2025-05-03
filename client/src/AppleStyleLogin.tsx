import { FormEvent, useState, MouseEvent } from "react";
import { useLocation } from "wouter";

export default function AppleStyleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting regular login for user:", username);
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      console.log("Login response status:", response.status);
      
      // Try to get response as text first
      const responseText = await response.text();
      console.log("Login response body:", responseText);
      
      // Then parse it as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Login parsed data:", data);
      } catch (e) {
        console.error("Could not parse response as JSON:", e);
      }
      
      if (!response.ok) {
        throw new Error((data && data.message) || `Login failed with status ${response.status}`);
      }

      console.log("Login successful!");
      
      // Use window.location for a full page refresh with cache busting parameter
      window.location.href = "/?login=" + new Date().getTime();
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: FormEvent | MouseEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    setError("");
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
      
      // Try to get response as text first
      const responseText = await response.text();
      console.log("Registration response body:", responseText);
      
      // Then parse it as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Registration parsed data:", data);
      } catch (e) {
        console.error("Could not parse response as JSON:", e);
      }
      
      if (!response.ok) {
        throw new Error((data && data.message) || `Registration failed with status ${response.status}`);
      }

      console.log("Registration successful!");
      
      // Redirect to home page after successful registration with cache busting
      window.location.href = "/?login=" + new Date().getTime();
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1D1D1F',
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#fff'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        color: '#1D1D1F'
      }}>
        {/* Apple-like colorful logo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '16px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #FF2D55, #FFD60A, #32D74B, #0A84FF, #BF5AF2, #FF2D55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Apple logo symbol */}
              <svg viewBox="0 0 24 24" width="30" height="30" fill="#000">
                <path d="M14.94,5.19A4.38,4.38,0,0,0,16,2,4.44,4.44,0,0,0,13,3.52,4.17,4.17,0,0,0,12,6.61,3.69,3.69,0,0,0,14.94,5.19Zm2.52,7.44a4.51,4.51,0,0,1,2.16-3.81,4.66,4.66,0,0,0-3.66-2c-1.56-.16-3,.91-3.83.91s-2-.89-3.3-.87A4.92,4.92,0,0,0,4.69,9.39C2.93,12.45,4.24,17,6,19.47,6.8,20.68,7.8,22.05,9.12,22s1.75-.82,3.28-.82,2,.82,3.3.79,2.22-1.24,3.06-2.45a11,11,0,0,0,1.38-2.85A4.41,4.41,0,0,1,17.46,12.63Z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '4px'
        }}>
          Fitness Tracker
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#86868b',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Sign in or create a new account
        </p>
        
        {error && (
          <div style={{
            color: '#FF3B30',
            fontSize: '14px',
            marginBottom: '16px',
            padding: '10px',
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #d2d2d7',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              {username && (
                <button
                  type="button"
                  onClick={() => setUsername('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0 16px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#8e8e93">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {showPassword && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #d2d2d7',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0 16px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8e8e93">
                    {isPasswordVisible ? (
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    ) : (
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <button 
            type="button"
            onClick={() => setShowPassword(true)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: '#E5E5EA',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: showPassword ? 'none' : 'block'
            }}
          >
            Continue with Password
          </button>
          
          <button 
            type="submit"
            disabled={loading || !showPassword || !username || !password}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: showPassword ? '#0A84FF' : '#E5E5EA',
              color: showPassword ? '#fff' : '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: showPassword ? 'pointer' : 'default',
              opacity: (loading || !username || !password) ? 0.7 : 1,
              display: showPassword ? 'block' : 'none'
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '16px'
          }}>
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: '14px', color: '#86868b' }}>
              Remember Me
            </label>
          </div>
        </form>
        
        <div style={{
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <button 
            type="button"
            onClick={(e) => {
              if (username && password) {
                handleRegister(e);
              } else {
                setError("Please enter a username and password to register");
                setShowPassword(true);
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#32D74B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}