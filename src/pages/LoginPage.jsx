// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initiateLogin } from '../services/api';
import { FaSignInAlt } from 'react-icons/fa';

function LoginPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get('error');
  const logoutSuccess = queryParams.get('logout');

  // Display error/logout messages
  useEffect(() => {
    if (error) {
      // You could use a more sophisticated notification system
      alert(`Login Error: ${decodeURIComponent(error)}`);
    }
    if (logoutSuccess === 'success') {
       alert('You have been logged out.');
    }
  }, [error, logoutSuccess]);


  const handleLoginClick = () => {
    initiateLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
    </div>
  );
}

export default LoginPage;