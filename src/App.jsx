// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import Layout Component
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage'; // Import Login Page
import UsersPage from './pages/UsersPage'; // Import Users Page
import ProtectedRoute from './pages/ProtectedRoute'; // Import ProtectedRoute
// Import Page Components
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthCallbackPage from './pages/AuthCallbackPage'; // <<< Import the new page

function App() {
  return (
    // Assuming <Router> is wrapping this component in main.jsx
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} /> {/* <<< Add this route */}

      {/* --- Protected Routes --- */}
      {/* This parent route uses ProtectedRoute. If authenticated, ProtectedRoute
          will render <Layout><Outlet/></Layout>. The <Outlet/> will then render
          the matched child route below (DashboardPage, UsersPage, etc.) */}
      <Route element={<ProtectedRoute />}>
        {/* Child routes are rendered inside the Layout's Outlet */}
        <Route path="/" element={<DashboardPage />} index /> {/* Default route for authenticated users */}
        <Route path="/add" element={<AddPropertyPage />} />
        <Route path="/edit/:id" element={<EditPropertyPage />} />
        <Route path="/users" element={<UsersPage />} />

        {/* --- Add other protected routes AND placeholder routes here --- */}
        {/* These will also render inside the main Layout */}
        <Route path="properties-placeholder" element={<DashboardPage />} /> {/* Example placeholder */}
        <Route path="settings-placeholder" element={<div className='p-4'>Settings Page Placeholder</div>} />
        <Route path="help-placeholder" element={<div className='p-4'>Help Page Placeholder</div>} />
        {/* --- End of other protected routes --- */}

      </Route> {/* End of the protected route group */}


      {/* --- Catch-all 404 Route --- */}
      {/* This will render if no other route matches, outside the main Layout */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}

export default App;