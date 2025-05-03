import { FormEvent, useState } from "react";

export default function AppleIDLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login for user:", username);
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      console.log("Login response status:", response.status);
      
      // Get response as text first
      const responseText = await response.text();
      console.log("Login response body:", responseText);
      
      // Then parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Could not parse response as JSON:", e);
      }
      
      if (!response.ok) {
        throw new Error((data && data.message) || `Login failed with status ${response.status}`);
      }

      console.log("Login successful!");
      
      // Redirect to home page after success with cache busting
      window.location.href = "/?login=" + new Date().getTime();
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
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
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '350px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px 20px',
        boxShadow: '0px 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Apple ID logo - colorful circles around apple icon */}
        <div style={{
          marginBottom: '16px',
          position: 'relative',
          width: '80px',
          height: '80px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'><circle cx=\'50\' cy=\'50\' r=\'45\' fill=\'none\' stroke=\'%23F9BF8F\' stroke-width=\'1.5\' stroke-dasharray=\'1, 5\' /></svg>"), url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'><circle cx=\'50\' cy=\'50\' r=\'45\' fill=\'none\' stroke=\'%2392EFFD\' stroke-width=\'1.5\' stroke-dasharray=\'1, 5\' transform=\'rotate(60 50 50)\' /></svg>"), url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'><circle cx=\'50\' cy=\'50\' r=\'45\' fill=\'none\' stroke=\'%23C792FD\' stroke-width=\'1.5\' stroke-dasharray=\'1, 5\' transform=\'rotate(120 50 50)\' /></svg>")',
            backgroundSize: 'contain'
          }} />
          <svg viewBox="0 0 24 30" width="30" height="35" style={{ position: 'relative', zIndex: 1 }}>
            <path d="M18.06,13.62c-0.02-2.03,0.88-3.97,2.48-5.3c-0.97-1.35-2.47-2.26-4.12-2.53c-1.72-0.18-3.44,1.02-4.33,1.02 c-0.92,0-2.28-1.01-3.77-0.98C5.57,5.89,3.2,7.33,2.06,9.61c-2.48,4.3-0.63,10.63,1.74,14.11c1.19,1.69,2.56,3.55,4.36,3.49 c1.77-0.07,2.42-1.12,4.55-1.12c2.1,0,2.73,1.12,4.57,1.07c1.89-0.03,3.08-1.68,4.21-3.39c0.83-1.19,1.47-2.5,1.91-3.89 C20.65,18.41,18.08,16.37,18.06,13.62z" fill="black" />
            <path d="M15.84,4.09c1.03-1.24,1.37-2.88,0.93-4.4c-1.49,0.3-2.78,1.16-3.66,2.44c-0.99,1.24-1.31,2.86-0.89,4.36 C13.77,6.19,15.04,5.32,15.84,4.09z" fill="black" />
          </svg>
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '500',
          margin: '0 0 4px 0',
          color: '#1D1D1F'
        }}>
          Apple ID
        </h2>
        
        <p style={{
          fontSize: '13px',
          color: '#86868b',
          margin: '0 0 25px 0',
          textAlign: 'center'
        }}>
          Manage to Apple Account
        </p>
        
        {error && (
          <div style={{
            backgroundColor: '#FFECEC',
            color: '#FF3B30',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            width: '100%',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={{ marginBottom: '10px', position: 'relative' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Apple ID"
              style={{
                width: '100%',
                padding: '12px 35px 12px 12px',
                border: '1px solid #d2d2d7',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            {username && (
              <button
                type="button"
                onClick={() => setUsername('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#8e8e93">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                </svg>
              </button>
            )}
          </div>
          
          {showPassword && (
            <div style={{ marginBottom: '10px' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d2d2d7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
          
          <button 
            type="button"
            onClick={() => setShowPassword(true)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#E5E5EA',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              display: showPassword ? 'none' : 'block',
              textAlign: 'center'
            }}
          >
            Continue with Password
          </button>
          
          {showPassword && (
            <button 
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '10px',
                backgroundColor: '#0070F3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: (loading || !username || !password) ? 'default' : 'pointer',
                opacity: (loading || !username || !password) ? 0.7 : 1,
                textAlign: 'center'
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          )}
          
          <button 
            type="button"
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#E5E5EA',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Sign in with iPhone
          </button>
          
          <p style={{
            fontSize: '12px',
            color: '#86868b',
            textAlign: 'center',
            margin: '0'
          }}>
            Requires iOS 17 or later
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '15px'
          }}>
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: '13px', color: '#86868b' }}>
              Remember Me
            </label>
          </div>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          borderTop: '1px solid #d2d2d7',
          paddingTop: '20px',
          width: '100%'
        }}>
          <button 
            type="button"
            onClick={() => {
              if (username && password) {
                handleRegister();
              } else {
                setError("Please enter a username and password to register");
                setShowPassword(true);
              }
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#0070F3',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Create New Apple ID
          </button>
        </div>
      </div>
    </div>
  );
}