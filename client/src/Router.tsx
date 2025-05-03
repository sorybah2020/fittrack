import { useEffect, useState } from 'react';
import AppleStyleLogin from './AppleStyleLogin';
import App from './App';

export default function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        // Check localStorage first for faster UX
        if (localStorage.getItem('isAuthenticated') === 'true') {
          // Verify with server
          const response = await fetch('/api/user', {
            credentials: 'include'
          });
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // Clear localStorage if server says not authenticated
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authTimestamp');
            setIsAuthenticated(false);
          }
        } else {
          // No localStorage token, check with server
          const response = await fetch('/api/user', {
            credentials: 'include'
          });
          if (response.ok) {
            setIsAuthenticated(true);
            // Set localStorage since server says authenticated
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authTimestamp', Date.now().toString());
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <App />;
  }

  // Otherwise show login page
  return <AppleStyleLogin />;
}