// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { checkAuthStatus, initiateLogin } from '../services/api'; // Assuming logout is handled by api.js interceptor/redirect

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading until first check is done

  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await checkAuthStatus();
      console.log("Auth status checked:", status);
      setIsAuthenticated(status.authenticated);
    } catch (error) {
      console.error("Error verifying auth:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication status when the provider mounts
    verifyAuth();
  }, [verifyAuth]);

  // The login initiation is handled by the API service redirecting the browser
  // The logout is handled by the API service triggering gateway logout & redirect

  const value = {
    isAuthenticated,
    isLoading,
    verifyAuth, // Expose if needed for manual refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};