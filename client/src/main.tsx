import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  
  try {
    console.log("Mounting React app...");
    root.render(<App />);
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Failed to render React app:", error);
    
    // Fallback to a simple message if React app fails to render
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #111; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: #ff3b30; font-size: 2rem; margin-bottom: 20px;">Fitness Tracker</h1>
        <p>Sorry, we're experiencing technical difficulties. Please try again later.</p>
        <a href="/auth" style="margin-top: 20px; background-color: #ff3b30; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Go to Login</a>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
}
