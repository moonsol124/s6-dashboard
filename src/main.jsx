// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider

// --- CHANGE THIS LINE ---
// Remove: import { BrowserRouter } from 'react-router-dom';
// Remove: import { BrowserRouter as Router } from 'react-router-dom';

// Add or Uncomment:
import { HashRouter } from 'react-router-dom'; // <<< Use HashRouter here directly


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- CHANGE THIS COMPONENT --- */}
    {/* Replace <Router> with <HashRouter> */}
    <HashRouter>
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);