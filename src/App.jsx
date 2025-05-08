// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
    // Assuming <Router> is wrapping this component in main.jsx
    // <Router>
      <Routes>
        {/* --- Public Routes --- */}
        {/* Routes accessible without authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} /> {/* Handles the redirect back from OAuth */}

        {/* --- Protected Routes --- */}
        {/* All routes defined within this element={<ProtectedRoute />} will
            require the user to be authenticated. ProtectedRoute handles
            rendering a loading state or redirecting to /login if not authenticated. */}
        {/* If you use a Layout component that wraps your main content, you can
            place it here like: <Route element={<ProtectedRoute><Layout/></ProtectedRoute>}>
            and the child routes would render inside the Layout's Outlet.
            Based on your previous App.jsx, it seems ProtectedRoute might already
            contain the Layout logic, or the Layout wraps the Routes/App. Adjust accordingly. */}
        <Route element={<ProtectedRoute />}> {/* ProtectedRoute renders Outlet */}

          {/* Default route for authenticated users (e.g., Dashboard) */}
          {/* Use index to match the parent path '/' exactly */}
          <Route path="/" element={<DashboardPage />} index />

          {/* Dashboard page (if / is not dashboard) - often redundant if '/' is dashboard */}
          
          {/* Property Routes - Keep existing lines as requested */}
          <Route path="/add" element={<AddPropertyPage />} />
          <Route path="/edit/:id" element={<EditPropertyPage />} />

          {/* User Management List Page - Keep existing line as requested */}
          <Route path="/users" element={<UsersPage />} />

          {/* --- ADDED NEW User Add/Edit Routes --- */}
          {/* These are also protected routes and belong within the ProtectedRoute element */}
          <Route path="/users/add" element={<AddUserPage />} /> {/* Add User Page */}
          <Route path="/users/edit/:id" element={<EditUserPage />} /> {/* Edit User Page */}
          {/* --- End ADDED NEW User Add/Edit Routes --- */}


          {/* --- Add other protected routes AND placeholder routes here --- */}
          {/* These will also render inside the ProtectedRoute's Outlet */}
          {/* Keep existing lines as requested */}
          <Route path="properties-placeholder" element={<DashboardPage />} />
          <Route path="settings-placeholder" element={<div className='p-4'>Settings Page Placeholder</div>} />
          <Route path="help-placeholder" element={<div className='p-4'>Help Page Placeholder</div>} />
          {/* --- End of other protected routes --- */}

        </Route> {/* End of the protected route group */}


        {/* --- Catch-all 404 Route --- */}
        {/* This will render if no other route matches. Place it last. */}
        <Route path="*" element={<NotFoundPage />} />

        {/* Optional: Redirect any unmatched route to login if not authenticated?
            This is an alternative to the 404 catch-all above if you want to assume
            any unhandled route requires login. Place it after the 404 or replace it.
            <Route path="*" element={<Navigate to="/login" replace />} />
        */}

      </Routes>
    // </Router>
  );
}

export default App;