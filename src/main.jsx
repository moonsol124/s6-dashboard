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
import { BrowserRouter } from 'react-router-dom'; // <<< Use BrowserRouter here directly


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- CHANGE THIS COMPONENT --- */}
    {/* Replace <HashRouter> with <BrowserRouter> */}
    <BrowserRouter>
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);