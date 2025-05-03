import React from 'react'
import ReactDOM from 'react-dom/client'
import SimpleLoginPage from './SimpleLoginPage'
import './index.css'

// Render our SimpleLoginPage component directly
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleLoginPage />
  </React.StrictMode>,
)