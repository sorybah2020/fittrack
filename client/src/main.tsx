import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AppWrapper } from './AppWrapper'
import './index.css'

// Create the application root with the AppWrapper which handles routing and auth
const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWrapper />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
