// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout Component
import Layout from './components/Layout';

// Import Page Components
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap all main pages within the Layout component */}
        <Route path="/" element={<Layout />}>
          {/* Child routes rendered inside Layout's <Outlet /> */}
          {/* `index` makes DashboardPage the default for "/" */}
          <Route index element={<DashboardPage />} />
          <Route path="add" element={<AddPropertyPage />} />
          <Route path="edit/:id" element={<EditPropertyPage />} />

          {/* Example placeholder routes for sidebar links */}
          <Route path="properties-placeholder" element={<DashboardPage />} /> {/* Pointing back to dashboard for now */}
          <Route path="settings-placeholder" element={<div className='p-4'>Settings Page Placeholder</div>} />
          <Route path="help-placeholder" element={<div className='p-4'>Help Page Placeholder</div>} />

          {/* Catch-all 404 route *within* the layout */}
          {/* You might want a separate 404 route *outside* the layout */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>

        {/* Optional: Separate route for 404 page *outside* the main layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;