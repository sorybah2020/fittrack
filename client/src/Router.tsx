import { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import App from './App';

export default function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status whenever page loads
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("Checking authentication status...");
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        if (response.ok) {
          console.log("User is authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("User is not authenticated");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();

    // Listen for page visibilitychange to recheck auth when user returns to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f7'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #0071e3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // If authenticated, show the app, otherwise show the login page
  return isAuthenticated ? <App /> : <LoginPage />;
}