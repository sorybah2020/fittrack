import { useEffect, useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import FinalLogin from './FinalLogin';
import SignUp from './SignUp';
import App from './App';
import { AuthProvider } from "./hooks/use-auth";

export default function Router() {
  const [path, setPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status - but only once when the app starts
  useEffect(() => {
    // Use URL check to avoid excessive API calls
    // If we're on /login or /signup pages, we don't need to check auth
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/login.html' || 
        currentPath === '/signup' || currentPath === '/signup.html') {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    // Only check auth if we're not on login/signup pages
    async function checkAuth() {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // If not authenticated, redirect to login page
          window.location.href = '/login';
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        window.location.href = '/login';
        return;
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  // Listen for path changes
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Custom navigate function
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000000'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333333',
          borderTop: '3px solid #FF2D55',
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

  // QueryClientProvider
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isAuthenticated ? (
          <App />
        ) : (
          // Routes
          <>
            {path === '/signup' ? (
              <SignUp />
            ) : (
              <FinalLogin />
            )}
          </>
        )}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}