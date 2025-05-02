import React from 'react'
import ReactDOM from 'react-dom/client'
import BasicLogin from './BasicLogin'
import './index.css'

// Just render the BasicLogin component for now
// This is a simplified approach to fix the blinking issue
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BasicLogin />
  </React.StrictMode>,
)
