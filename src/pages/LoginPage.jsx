// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { initiateLogin } from '../services/api';
import { FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Import useAuth

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate(); // Get navigate hook
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state

  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get('error');
  const logoutSuccess = queryParams.get('logout');

  // Display error/logout messages
  useEffect(() => {
    if (error) {
      // You could use a more sophisticated notification system
      // alert(`Login Error: ${decodeURIComponent(error)}`); // Consider using a better UI notification
      console.error('Login Error:', decodeURIComponent(error));
    }
    if (logoutSuccess === 'success') {
       console.log('You have been logged out.'); // Consider using a better UI notification
    }

    // Optional: Clean up query params after displaying message
    // const cleanUrl = location.pathname;
    // navigate(cleanUrl, { replace: true }); // Or use history API if you prefer

  }, [error, logoutSuccess]); // Depend on error and logoutSuccess


  // Redirect authenticated users away from the login page
  useEffect(() => {
      console.log(`[LoginPage] Auth state check: isLoading=${isLoading}, isAuthenticated=${isAuthenticated}`);
      // Redirect to dashboard if authenticated and no longer loading
      // Use location.pathname !== '/' to avoid infinite redirects if '/' is the login page itself (which it isn't here)
      if (!isLoading && isAuthenticated && location.pathname === '/login') {
          console.log('[LoginPage] User is authenticated, redirecting to /');
          navigate('/', { replace: true }); // Redirect to the root (dashboard)
      }
  }, [isAuthenticated, isLoading, navigate, location.pathname]); // Depend on auth state, loading, navigate, and path

  const handleLoginClick = () => {
    console.log("[LoginPage] Login button clicked, initiating login flow.");
    // This function redirects the browser, so no need for React Router navigate here.
    initiateLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Add a conditional render based on loading state */}
      {isLoading ? (
          <div className="p-8">Loading authentication status...</div>
      ) : (
          <div className="p-8 bg-white rounded-lg shadow-md text-center w-full max-w-sm">
              <h1 className="text-2xl font-bold mb-6 text-textSecondary font-secondary">
                Welcome Back!
              </h1>
              {error && (
                <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-brand text-sm">
                  Login failed: {error.replace(/_/g, ' ')}. Please try again.
                </p>
              )}
               {logoutSuccess === 'success' && (
                <p className="mb-4 text-green-600 bg-green-100 p-3 rounded-brand text-sm">
                  You have been successfully logged out.
                </p>
              )}
              <p className="mb-6 text-gray-600 text-sm">
                Please log in to access your dashboard.
              </p>
              <button
                onClick={handleLoginClick}
                className="w-full flex justify-center items-center bg-primary text-background px-4 py-2.5 rounded-brand hover:opacity-80 transition-opacity font-medium"
              >
                <FaSignInAlt className="mr-2 h-4 w-4" /> Log In
              </button>
          </div>
      )}
    </div>
  );
}

export default LoginPage;