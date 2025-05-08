// src/App.jsx
import React from 'react';
// --- CHANGE THIS LINE ---
// Remove: import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Keep only what you actually use in this file:
import { Routes, Route } from 'react-router-dom'; // <<< Keep only Routes and Route

// Import Layout Component (if used within protected routes)
// import Layout from './components/Layout'; // Keep if you use a Layout wrapper inside ProtectedRoute

import LoginPage from './pages/LoginPage'; // Import Login Page
import UsersPage from './pages/UsersPage'; // Import Users Page
import ProtectedRoute from './pages/ProtectedRoute'; // Import ProtectedRoute
// Import Page Components
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthCallbackPage from './pages/AuthCallbackPage'; // <<< Import the new page

// --- NEW User Pages Imports ---
import AddUserPage from './pages/AddUserPage'; // Import AddUserPage
import EditUserPage from './pages/EditUserPage'; // Import EditUserPage


function App() {
  return (
    // The <Router> component is NOT needed here.
    // It's provided by main.jsx
    <Routes>
      {/* --- Public Routes --- */}
      {/* Routes accessible without authentication */}
      {/* The paths remain the same, HashRouter handles prepending the hash */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} index />
        <Route path="/add" element={<AddPropertyPage />} />
        <Route path="/edit/:id" element={<EditPropertyPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/add" element={<AddUserPage />} />
        <Route path="/users/edit/:id" element={<EditUserPage />} />
        <Route path="properties-placeholder" element={<DashboardPage />} />
        <Route path="settings-placeholder" element={<div className='p-4'>Settings Page Placeholder</div>} />
        <Route path="help-placeholder" element={<div className='p-4'>Help Page Placeholder</div>} />
      </Route>

      {/* --- Catch-all 404 Route --- */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}

export default App;