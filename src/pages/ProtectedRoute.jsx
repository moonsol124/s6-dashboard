// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout'; // Import the main layout
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log ("protected mounted with ", isAuthenticated, isLoading)
  }, [])

  if (isLoading) {
    // Show a loading indicator while checking auth status
    // You can replace this with a proper spinner component
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading authentication...</p>
        </div>
    );
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    // The initiateLogin logic is now handled by the 401 interceptor or login page button
    console.log("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the main Layout which contains the Outlet
  // for nested routes (Dashboard, AddProperty, Users, etc.)
  return <Layout><Outlet /></Layout>;
}

export default ProtectedRoute;