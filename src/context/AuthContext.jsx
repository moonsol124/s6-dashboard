// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { initiateLogin, logoutUser, refreshAccessToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // --- Function to check auth status based on local storage ---
  // This function's reference must be stable (useCallback) as it's a dependency in effects
  const checkLocalAuth = useCallback(() => {
      console.log("[AuthContext] Checking authentication status from local storage.");
      const accessToken = localStorage.getItem('accessToken');
      // console.log("access token is ", accessToken); // Optional debug log
      const refreshToken = localStorage.getItem('refreshToken');

      let userPayload = null;
      let authenticated = false;

      if (accessToken) {
          try {
              const decoded = jwtDecode(accessToken);

              if (decoded && decoded.exp) {
                   const currentTimeSeconds = Date.now() / 1000;
                   if (decoded.exp > currentTimeSeconds) {
                       userPayload = decoded;
                       authenticated = true;
                       console.log(`[AuthContext] Found valid token in local storage for user ${userPayload.sub}.`);
                   } else {
                       console.log("[AuthContext] Access token found but expired based on 'exp' claim. Clearing expired token.");
                       localStorage.removeItem('accessToken');
                       // Keep refresh token to allow auto-refresh on next API call
                   }
              } else {
                  console.warn("[AuthContext] Access token found but missing 'exp' claim or invalid payload structure. Clearing invalid token.");
                  localStorage.removeItem('accessToken');
                   localStorage.removeItem('refreshToken'); // Clear refresh too if access token is junk
              }
          } catch (error) {
              console.error("[AuthContext] Error decoding access token:", error);
               localStorage.removeItem('accessToken');
               localStorage.removeItem('refreshToken');
          }
      } else {
          console.log("[AuthContext] No access token found in local storage.");
      }

      setIsAuthenticated(authenticated);
      setUser(userPayload);
      setIsLoading(false); // Finished the check
      console.log(`[AuthContext] Authentication state updated: isAuthenticated=${authenticated}, user=${userPayload?.sub || 'None'}`);

  }, []); // checkLocalAuth has no dependencies

  // --- Initial Load Effect ---
  useEffect(() => {
    console.log("[AuthContext] Running initial authentication check effect.");
    // Run checkLocalAuth immediately when the provider mounts
    checkLocalAuth();

    // Optional: Add event listener for localStorage changes from other tabs if needed
    // window.addEventListener('storage', handleStorageChange);
    // return () => {
    //   window.removeEventListener('storage', handleStorageChange);
    // };

  }, [checkLocalAuth]); // checkLocalAuth is stable due to useCallback


  // --- Login Function ---
  const login = useCallback(() => {
      console.log("[AuthContext] Initiating login flow (redirecting to OAuth server).");
      // initiateLogin from api.js handles the browser redirect.
      // It also generates and stores the 'state' parameter in localStorage (TODO: secure).
      initiateLogin(); // This function *redirects the browser*
  }, []);


  // --- Logout Function ---
  const logout = useCallback(async () => {
    console.log("[AuthContext] Initiating logout process.");
    // Optimistically update state for fast UI
    setIsAuthenticated(false);
    setUser(null);

    // Call the api.js function to clear storage and call backend
    await logoutUser();

    // Re-check local storage just in case (should be clear now)
    checkLocalAuth();

    // Redirect to the login page
    navigate('/login?logout=success', { replace: true });

  }, [navigate, checkLocalAuth]); // Depend on navigate and checkLocalAuth


  // --- Context Value ---
  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkLocalAuth, // <<< UNCOMMENTED: EXPOSE checkLocalAuth
  };

  // Render children, showing a loading state if needed
  // You might want a dedicated LoadingPage component here
  if (isLoading) {
      console.log("[AuthContext] Rendering Loading state...");
      return <div>Loading Authentication...</div>;
  }

  // If not loading and not authenticated, render children (assuming root route handles redirect)
  // If authenticated and not loading, render children
   console.log(`[AuthContext] Not loading. Rendering children. IsAuthenticated: ${isAuthenticated}`);
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