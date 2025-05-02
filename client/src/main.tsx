import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './hooks/use-auth'
import App from './App'
import BasicLogin from './BasicLogin'
import './index.css'

// Check if we're on the login page or if we're trying to redirect
const isLoggedOut = !document.cookie.includes('connect.sid') || window.location.pathname === '/auth'

// Render the appropriate component based on authentication status
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isLoggedOut ? (
      <BasicLogin />
    ) : (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    )}
  </React.StrictMode>,
)
