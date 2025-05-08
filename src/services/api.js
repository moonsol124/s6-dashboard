// src/services/api.js
import axios from 'axios';

// Get base URL from environment variables - Target the API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3002';
// OAuth Server URL needed only for the initial redirect
const OAUTH_SERVER_URL = import.meta.env.VITE_OAUTH_SERVER_URL || 'http://localhost:3000';
// Client ID and Redirect URI needed only for the initial redirect
// --- FIX: Removed duplicate '.meta' ---
const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const OAUTH_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;
// const PROPERTY_SERVICE_URL= import.meta.env.VITE_PROPERTIES_SERVICE_DIRECT_URL; // This seems to be for direct calls, might need review later


// Create an Axios instance configured to talk to the API Gateway
const apiClient = axios.create({
  baseURL: API_GATEWAY_URL, // Base URL is the Gateway
  // withCredentials: true, // We are not using session cookies for auth anymore.
});

// --- Axios Interceptor for Adding JWT to Headers ---
apiClient.interceptors.request.use(
    config => {
        console.log(`[API Interceptor] Attempting to get token for request: ${config.method.toUpperCase()} ${config.url}`);
        // Get the access token from localStorage
        const accessToken = localStorage.getItem('accessToken');
        console.log(`[API Interceptor] Token found in localStorage: ${accessToken ? 'Yes' : 'No'}`);


        // If an access token exists, add it to the Authorization header
        if (accessToken) {
            // Check if the header is already set (e.g., by a specific function call)
            if (!config.headers.Authorization) {
                 config.headers.Authorization = `Bearer ${accessToken}`;
                 console.log(`[API Interceptor] Added Bearer token.`);
            } else {
                 console.log(`[API Interceptor] Authorization header already exists.`);
            }
        } else {
             console.log(`[API Interceptor] Authorization header NOT added (no token).`);
        }

        return config;
    },
    error => {
        // Do something with request error
        console.error('[API Interceptor] Request Error:', error);
        return Promise.reject(error);
    }
);


// --- Utility Function to Initiate Login (Redirect to OAuth Server) ---
// This redirects the browser directly to the OAuth Server
export const initiateLogin = (state = 'default') => { // Add optional state parameter
    if (!OAUTH_CLIENT_ID || !OAUTH_REDIRECT_URI || !OAUTH_SERVER_URL) {
        console.error("OAuth configuration (Client ID, Redirect URI, or Server URL) is missing in .env");
        alert("Authentication service is not configured correctly. Please contact support.");
        return;
    }

    // Generate a secure random 'state' parameter and store it (e.g., in localStorage)
    // BEFORE redirecting. You will validate this state in the /auth/callback page.
    // Use a cryptographically secure random generator in production!
    const generatedState = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('oauthState', generatedState); // Store the state

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: OAUTH_CLIENT_ID,
        redirect_uri: OAUTH_REDIRECT_URI,
        state: generatedState, // Add the generated state
        // scope: 'profile properties', // Optional: Add scopes if needed later
    });
    const authorizationUrl = `${OAUTH_SERVER_URL}/authorize?${params.toString()}`;
    console.log(`[API] Redirecting to OAuth server: ${authorizationUrl}`);
    window.location.href = authorizationUrl;
};


// --- Refreshes the access token using the refresh token ---
export const refreshAccessToken = async () => {
     console.log('[API] Attempting to refresh access token.');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log(`[API Refresh] Attempting to get refresh token from localStorage.`);
    console.log(`[API Refresh] Result of localStorage.getItem('refreshToken'): ${refreshToken ? 'Token found' : 'null'}`); // Log the result


    if (!refreshToken) {
         console.warn('[API] No refresh token found in storage.');
        // No refresh token means we cannot refresh. User must re-login.
        return false;
    }

    try {
         // Make POST request to the API Gateway's refresh endpoint
         const response = await axios.post(`${API_GATEWAY_URL}/auth/refresh`, {
             refresh_token: refreshToken
         });

         console.log('[API] Token refresh response received successfully.');
        // WARNING: Avoid logging the full token data
        // console.log('Refresh Response Data:', response.data);

         const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;

         // Store the new tokens and expiry
         localStorage.setItem('accessToken', access_token);
         if (new_refresh_token) { // OAuth server might rotate refresh tokens
            localStorage.setItem('refreshToken', new_refresh_token);
         }
          if (expires_in !== undefined) {
             localStorage.setItem('expiresIn', expiresIn);
             // Calculate and store the absolute expiry time for easier checks (optional, jwtDecode is primary)
             const expiresAt = Date.now() + parseInt(expiresIn, 10) * 1000;
             localStorage.setItem('tokenExpiresAt', expiresAt.toString());
         }

         console.log('[API] New tokens stored.');
         return true; // Indicate successful refresh

    } catch (error) {
        console.error('[API] Token refresh failed:', error.response?.data || error.message);

        // If the refresh token itself is invalid or expired, the gateway should return a specific error (e.g., 401 with 'invalid_refresh_token')
        if (error.response?.status === 401 || error.response?.data?.error === 'invalid_refresh_token') {
             console.warn('[API] Refresh token invalid or expired. User must re-login.');
            // Clear tokens as they are no longer valid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('expiresIn');
            localStorage.removeItem('tokenExpiresAt');
             // Signal that a full re-login is needed
            return false;
        }

        // Handle other refresh errors (e.g., network issues)
        // You might want to retry or show a temporary error message
        return false; // Indicate refresh failed for other reasons
    }
};


// --- Axios Interceptor for Handling 401 Unauthorized (JWT Expiry/Invalid) ---
// This handles automatic token refresh and request retry
apiClient.interceptors.response.use(
  response => response,
  async error => { // Made this async to await refreshAccessToken
    const originalRequest = error.config;

    // Check if the response is a 401 Unauthorized and it's not the refresh request itself
    // Also check if we've already tried to retry this request to prevent loops
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== `${API_GATEWAY_URL}/auth/refresh`) {
      console.warn('[API Interceptor] Received 401 Unauthorized from Gateway.');

      originalRequest._retry = true; // Mark this request as having been retried

      const refreshed = await refreshAccessToken();

      if (refreshed) {
        console.log('[API Interceptor] Token refreshed successfully. Retrying original request.');
        // Retry the original request with the new access token (added by request interceptor)
        return apiClient(originalRequest); // Call the original request again using the apiClient instance
      } else {
        // Refresh failed (invalid refresh token or other issue). Full re-login needed.
        console.log('[API Interceptor] Token refresh failed. Redirecting user to login.');
        // Clear any potentially stale tokens just in case
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expiresIn');
        localStorage.removeItem('tokenExpiresAt');
        // Redirect to the login flow (this function handles window.location.href)
        initiateLogin();

        // Reject the promise to stop propagation of the error to the original caller
        // The redirect will handle the rest
        return Promise.reject(new Error("Unauthorized: Token refresh failed, redirecting to login."));
      }
    }

    // For non-401 errors, or if the 401 was for the refresh request itself, just pass the error along
    console.error('[API Interceptor] Request failed:', error.message, error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);

// --- Authentication Functions (Managed by AuthContext and Interceptor) ---
export const logoutUser = async () => {
    console.log('[API] Initiating logout.');
    const refreshToken = localStorage.getItem('refreshToken');

    // Clear tokens from local storage IMMEDIATELY on logout attempt
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('tokenExpiresAt');
    console.log('[API] Tokens cleared from local storage.');

    // Call the API Gateway's logout endpoint to potentially revoke the refresh token server-side
    // This call is fire-and-forget from the frontend's perspective after clearing local tokens.
    if (refreshToken) {
        try {
            // Use axios directly or apiClient without interceptors if needed, but simplest is direct call
            // We send refresh_token in the body as per your gateway's logout endpoint
            await axios.post(`${API_GATEWAY_URL}/auth/logout`, { refresh_token: refreshToken });
             console.log('[API] Logout endpoint called successfully.');
        } catch (error) {
            console.error('[API] Error calling logout endpoint:', error.response?.data || error.message);
             // Decide how to handle this error. Clearing local tokens is primary logout action.
        }
    }
    // The AuthContext handles the client-side navigation after this completes
};


// --- Property Functions (Targeting API Gateway /api/property-service/* routes) ---
// These will now automatically have the JWT added by the request interceptor
export const getAllProperties = async () => {
  console.log(`[API] Fetching all properties from: ${API_GATEWAY_URL}/api/property-service/properties`);
  const response = await apiClient.get('/api/property-service/properties');
  return response.data;
};

export const getPropertyById = async (id) => {
  console.log(`[API] Fetching property by ID from: ${API_GATEWAY_URL}/api/property-service/properties/${id}`);
  const response = await apiClient.get(`/api/property-service/properties/${id}`);
  return response.data;
};

export const createProperty = async (propertyData) => {
  console.log(`[API] Creating property via Gateway: ${API_GATEWAY_URL}/api/property-service/properties`);
  const response = await apiClient.post('/api/property-service/properties', propertyData, {
      headers: { 'Content-Type': 'application/json' } // Ensure header is set
  });
  return response.data;
};

export const updateProperty = async (id, propertyData) => {
   console.log(`[API] Updating property ${id} via Gateway: ${API_GATEWAY_URL}/api/property-service/properties/${id}`);
  const response = await apiClient.put(`/api/property-service/properties/${id}`, propertyData, {
       headers: { 'Content-Type': 'application/json' } // Ensure header is set
  });
  return response.data;
};


export const deleteProperty = async (id) => {
  console.log(`[API] Deleting property at: ${API_GATEWAY_URL}/api/property-service/properties/${id}`);
  const response = await apiClient.delete(`/api/property-service/properties/${id}`);
  return response.status; // DELETE often returns 204 No Content
};

// --- User Functions (Targeting API Gateway /api/users/* routes) ---
// These will now automatically have the JWT added by the request interceptor

export const getAllUsers = async () => {
  const targetPath = '/api/users/profiles';
  console.log(`[API] Fetching all users from: ${API_GATEWAY_URL}${targetPath}`);
  // The response from the Gateway/User Service should now include the 'role' field
  const response = await apiClient.get(targetPath);
  return response.data; // Expecting [{ id, username, email, created_at, role }, ...]
};

// --- NEW: Get User by ID ---
export const getUserById = async (id) => {
    const targetPath = `/api/users/profiles/${id}`; // Assuming your User Service supports GET /profiles/:id
    console.log(`[API] Fetching user by ID ${id} from: ${API_GATEWAY_URL}${targetPath}`);
    const response = await apiClient.get(targetPath);
    return response.data; // Expecting { id, username, email, created_at, role }
};

// --- NEW: Create User ---
// Note: User creation might typically be handled by the OAuth server's /register endpoint
// or require specific admin privileges. This assumes an admin endpoint on the User Service
// accessible via the Gateway.
export const createUser = async (userData) => { // userData should include username, email, password, role
     const targetPath = '/api/users/register'; // Assuming your User Service supports POST /register via gateway
     console.log(`[API] Creating user via Gateway: ${API_GATEWAY_URL}${targetPath}`);
     // Important: Your User Service /register currently expects 'username', 'email', 'password'.
     // If you want to set role here, User Service /register needs to be updated to accept 'role'.
     // Or, create a separate admin endpoint like /api/users/admin/users if /register is public.
     const response = await apiClient.post(targetPath, userData, {
          headers: { 'Content-Type': 'application/json' }
     });
     return response.data; // Expecting the new user object
};

// --- NEW: Update User ---
// This assumes an endpoint like PUT /profiles/:id or /admin/users/:id on User Service via Gateway
export const updateUser = async (id, userData) => { // userData might include username, email, role (password changes usually separate)
    const targetPath = `/api/users/profiles/${id}`; // Assuming PUT /profiles/:id or similar
    console.log(`[API] Updating user ${id} via Gateway: ${API_GATEWAY_URL}${targetPath}`);
     const response = await apiClient.put(targetPath, userData, {
          headers: { 'Content-Type': 'application/json' }
     });
     return response.data; // Expecting the updated user object
};

// --- NEW: Delete User ---
// This assumes an endpoint like DELETE /profiles/:id or /admin/users/:id on User Service via Gateway
export const deleteUser = async (id) => {
    const targetPath = `/api/users/profiles/${id}`; // Assuming DELETE /profiles/:id or similar
    console.log(`[API] Deleting user ${id} via Gateway: ${API_GATEWAY_URL}${targetPath}`);
    const response = await apiClient.delete(targetPath);
    return response.status; // DELETE often returns 204 No Content
};


// Export the configured instance if needed elsewhere (optional)
export default apiClient;