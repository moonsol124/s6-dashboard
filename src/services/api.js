// src/services/api.js
import axios from 'axios';

// Get base URL from environment variables - Target the API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3002';
// OAuth Server URL needed only for the initial redirect
const OAUTH_SERVER_URL = import.meta.env.VITE_OAUTH_SERVER_URL || 'http://localhost:3000';
// Client ID and Redirect URI needed only for the initial redirect
const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const OAUTH_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;
const PROPERTY_SERVICE_URL= import.meta.env.VITE_PROPERTIES_SERVICE_DIRECT_URL;


// Create an Axios instance configured to talk to the API Gateway
const apiClient = axios.create({
  baseURL: API_GATEWAY_URL, // Base URL is the Gateway
  withCredentials: true, // IMPORTANT: Send session cookies with requests to the Gateway
});

// --- Utility Function to Initiate Login ---
// This redirects the browser directly to the OAuth Server
export const initiateLogin = () => {
    if (!OAUTH_CLIENT_ID || !OAUTH_REDIRECT_URI || !OAUTH_SERVER_URL) {
        console.error("OAuth configuration (Client ID, Redirect URI, or Server URL) is missing in .env");
        // Optionally show an error message to the user
        alert("Authentication service is not configured correctly. Please contact support.");
        return;
    }
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: OAUTH_CLIENT_ID,
        redirect_uri: OAUTH_REDIRECT_URI,
        // scope: 'profile properties', // Optional: Add scopes if needed later
    });
    const authorizationUrl = `${OAUTH_SERVER_URL}/authorize?${params.toString()}`;
    console.log(`Redirecting to OAuth server: ${authorizationUrl}`);
    window.location.href = authorizationUrl;
};

// --- Authentication Functions (Targeting API Gateway /auth/* routes) ---
export const checkAuthStatus = async () => {
  console.log(`[API] Checking auth status at: ${API_GATEWAY_URL}/auth/status`);
  try {
    // GET request to the Gateway's status endpoint
    const response = await apiClient.get('/auth/status');
    console.log("[API] Auth status response:", response.data);
    return response.data; // Expected: { authenticated: true/false }
  } catch (error) {
    console.error('[API] Error checking auth status:', error);
    return { authenticated: false };
  }
};

export const logoutUser = async () => {
    console.log(`[API] Calling logout endpoint: ${API_GATEWAY_URL}/auth/logout`);
    try {
        // GET request to the Gateway's logout endpoint
        // Let the Gateway handle the redirect
        await apiClient.get('/auth/logout');
        // Fallback redirect in case Gateway doesn't redirect fully (less ideal)
        // window.location.href = '/login?logout=success';
    } catch (error) {
         console.error('[API] Error during logout call:', error);
         // Redirect on error might hide gateway issues, but provides fallback
         window.location.href = '/login?logout=error';
    }
};


// --- Property Functions (Targeting API Gateway /api/properties/* routes) ---
// The Gateway will proxy these to the Properties Service/properties
export const getAllProperties = async () => {
  console.log(`[API] Fetching all properties from: ${API_GATEWAY_URL}/api/properties/`);
  // GET request to the Gateway's properties proxy path
  const response = await apiClient.get('/api/property-service/properties');
  return response.data;
};

export const getPropertyById = async (id) => {
  console.log(`[API] Fetching property by ID from: ${API_GATEWAY_URL}/api/properties/${id}`);
  // GET request to the Gateway's specific property proxy path
  const response = await apiClient.get(`/api/property-service/properties/${id}`);
  console.log(response)
  return response.data;
};

export const createProperty = async (propertyData) => {
  const PROPERTIES_SERVICE_DIRECT_URL = import.meta.env.VITE_PROPERTIES_SERVICE_URL
  const directUrl = `${PROPERTIES_SERVICE_DIRECT_URL}/properties`; // Direct URL

  // You can also add this code to set state like isError = true to show error
  if (!PROPERTIES_SERVICE_DIRECT_URL) {
      console.error("[API DIRECT CALL] direct call url is undefined");
  }
  try {
    const response = await axios.post(directUrl, propertyData, { // No api client, has correct header?
      headers: {
          'Content-Type': 'application/json',
      },

    });

    return response.data; // Return data
  } catch (error) {
    console.error(`Error creating property:`, error);
     throw error;
  }
};

export const updateProperty = async (id, propertyData) => {
  const PROPERTIES_SERVICE_DIRECT_URL = import.meta.env.VITE_PROPERTIES_SERVICE_URL

  // Construct the full direct URL to the service's specific endpoint
  const directUrl = `${PROPERTIES_SERVICE_DIRECT_URL}/properties/${id}`; // Add the ID to the path

  if (!PROPERTIES_SERVICE_DIRECT_URL) {
      const errorMsg = "Properties Service direct URL is not configured in .env (VITE_PROPERTIES_SERVICE_DIRECT_URL)";
      console.error(`[API DIRECT CALL] Error: ${errorMsg}`);
      alert(errorMsg); // Alert user
      throw new Error(errorMsg);
  }

  try {
      // Use axios directly with the full URL for PUT request
      // NOTE: No authentication is sent here!
      const response = await axios.put(directUrl, propertyData, {
          headers: {
              'Content-Type': 'application/json' // Ensure correct content type
          }
          // `withCredentials: false` is the default for direct axios calls
      });
      console.log(`[API DIRECT CALL] Success updating property directly.`);
      return response.data; // Return data from the direct response
  } catch (error) {
      // Log error details, especially the response data if available
      console.error(`[API DIRECT CALL] Error updating property directly at ${directUrl}:`, error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
          console.error(`[API DIRECT CALL] Network Error: Is the Properties Service running at ${PROPERTIES_SERVICE_DIRECT_URL}?`);
      }
      // Re-throw error for the calling component (e.g., EditPropertyPage) to handle
      throw error;
  }
};

export const deleteProperty = async (id) => {
  console.log(`[API] Deleting property at: ${API_GATEWAY_URL}/api/property-service/properties/${id}`);
  // DELETE request to the Gateway's specific property proxy path
  const response = await apiClient.delete(`/api/property-service/properties/${id}`);
  // DELETE often returns 204 No Content, so status might be more useful than data
  return response.status;
};

// --- User Functions (Targeting API Gateway /api/users/* routes) ---
// The Gateway will proxy these to the User Service
export const getAllUsers = async () => {
  // Path confirmed working via Postman test through the gateway
  const targetPath = '/api/users/profiles';
  console.log(`[API] Fetching all users from: ${API_GATEWAY_URL}${targetPath}`);
  // GET request to the Gateway's user proxy path
  const response = await apiClient.get(targetPath);
  return response.data;
};


// --- Axios Interceptor for Handling 401 Unauthorized ---
// This remains the same - it handles automatic redirection to login if any
// apiClient request (to the Gateway) returns a 401 status.
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('[API Interceptor] Received 401 Unauthorized from Gateway. Session likely invalid. Redirecting to login.');
      // Check if we are already trying to authenticate to prevent loops
      if (!error.config.url.includes('/auth/status')) { // Avoid loop if /auth/status itself fails
        initiateLogin();
      }
      // Reject the promise so the original component call doesn't try to process the error further
      return Promise.reject(new Error("Unauthorized: Redirecting to login."));
    }
    // For non-401 errors, just pass the error along
    console.error('[API Interceptor] Request failed:', error.message, error.config?.url);
    return Promise.reject(error);
  }
);

// Export the configured instance if needed elsewhere (optional)
export default apiClient;