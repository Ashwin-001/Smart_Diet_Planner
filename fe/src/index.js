import React from "react";
import ReactDOM from "react-dom/client"; // Use ReactDOM from 'react-dom/client' in React 18+
import App from "./App.jsx";
import "./index.css"; // Ensure this file exists

// Create a root instance for rendering
const root = ReactDOM.createRoot(document.getElementById("root")); // Ensure the 'root' div exists in public/index.html

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
