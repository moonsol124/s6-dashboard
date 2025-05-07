// src/pages/AuthCallbackPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

function AuthCallbackPage() {
    const navigate = useNavigate();
    // Get checkLocalAuth, isAuthenticated, and isLoading from the AuthContext
    const { checkLocalAuth, isAuthenticated, isLoading } = useAuth();

    // --- Effect 1: Process the URL hash and store tokens ---
    useEffect(() => {
        console.log('[AuthCallbackPage] Effect 1: Processing hash.');

        // If authentication is already confirmed and not loading, we might have already
        // processed the hash or the user was already logged in. Navigate away.
        // This also helps prevent reprocessing if the component re-renders after the state is updated.
        if (!isLoading && isAuthenticated) {
            console.log('[AuthCallbackPage] Effect 1: Auth already confirmed. Navigating to dashboard (/).');
             // Ensure the hash is cleared before navigating
            window.history.replaceState("", document.title, window.location.pathname + window.location.search);
            navigate('/', { replace: true });
            return; // Stop execution of this effect instance
        }


        // Get the URL fragment (the part after the #)
        const hash = window.location.hash.substring(1);

        // Only process if there's a hash and we are not already authenticated and loading is done
        // We check !isLoading && !isAuthenticated here because if tokens were JUST stored,
        // AuthContext's state hasn't updated yet, but isLoading will become false soon.
        // The second useEffect will handle the navigation based on the updated state.
         if (!hash && !isLoading && !isAuthenticated) {
             // If no hash AND AuthContext says not authenticated (and finished loading),
             // then this is a real failure or the user landed here incorrectly.
             console.error('[AuthCallbackPage] Effect 1: No hash fragment found and not authenticated. Authentication failed.');
             navigate('/login?error=authentication_failed', { replace: true });
             return;
         }


        if (hash) {
             console.log('[AuthCallbackPage] Effect 1: Hash fragment found.');
            const params = new URLSearchParams(hash);

            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const expiresIn = params.get('expires_in');
            const state = params.get('state');

             // Clear the hash from the URL bar *after* reading it (important for security and cleanliness)
             window.history.replaceState("", document.title, window.location.pathname + window.location.search);


            if (accessToken) {
                console.log('[AuthCallbackPage] Effect 1: Access token found in hash. Storing tokens.');
                console.log('Access Token:', accessToken.substring(0, 10) + '...');
                console.log('Refresh Token:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'N/A');
                console.log('Expires In:', expiresIn);
                console.log('State (if any):', state);

                // TODO: IMPORTANT SECURITY CHECK: Validate the 'state' parameter here
                // Retrieve the stored state (generated before redirecting to /authorize)
                // and compare it with the 'state' parameter received here.
                // If validation fails: Clear any stored tokens, log error, navigate to login.
                 console.log('[AuthCallbackPage] Effect 1: State validation TBD.');


                // --- Store the tokens in localStorage ---
                try {
                     localStorage.setItem('accessToken', accessToken);
                     if (refreshToken) {
                        localStorage.setItem('refreshToken', refreshToken);
                     }
                     if (expiresIn !== undefined) {
                         localStorage.setItem('expiresIn', expiresIn);
                     }
                     console.log('[AuthCallbackPage] Effect 1: Tokens stored. Triggering AuthContext re-check.');

                     // --- Trigger AuthContext to Re-check Local Storage ---
                     // Call this AFTER storing the tokens. This will cause AuthContext
                     // to update its state (isAuthenticated, isLoading) in the next render cycle.
                     checkLocalAuth();

                    // DO NOT navigate here. Navigation will happen in Effect 2
                    // once AuthContext state is confirmed.

                } catch (storageError) {
                    console.error('[AuthCallbackPage] Effect 1: Error storing tokens:', storageError);
                    navigate('/login?error=storage_failed', { replace: true });
                }

            } else {
                // Hash fragment found, but no access_token parameter (shouldn't happen if Gateway works)
                console.error('[AuthCallbackPage] Effect 1: Hash fragment found, but no access_token parameter.');
                 navigate('/login?error=no_token_in_fragment', { replace: true });
            }
        } else {
             // No hash found, and we weren't already authenticated and loading isn't done.
             // This means the initial check in the first 'if' failed, and there was no hash.
             // This is the state where the component mounts without tokens or hash.
             // The first 'if' already handled the case where !hash && !isLoading && !isAuthenticated,
             // so if we reach here, it might be the initial mount where isLoading is still true,
             // or it's already being handled by the first 'if'.
             console.log('[AuthCallbackPage] Effect 1: No hash found on mount. Awaiting AuthContext state...');
        }


    }, [navigate, checkLocalAuth, isAuthenticated, isLoading]); // Depend on navigate, checkLocalAuth, isAuthenticated, isLoading

     // --- Effect 2: Wait for Authentication State and Navigate ---
     useEffect(() => {
         console.log(`[AuthCallbackPage] Effect 2: Checking AuthContext state - isLoading=${isLoading}, isAuthenticated=${isAuthenticated}`);
         // Wait until AuthContext is not loading AND confirms the user is authenticated.
         if (!isLoading && isAuthenticated) {
             console.log('[AuthCallbackPage] Effect 2: AuthContext state confirmed authenticated. Navigating to dashboard (/).');
             // Navigate to the root path, which is your dashboard
             navigate('/', { replace: true });
         }
         // Note: We don't navigate to login here. If authentication fails,
         // Effect 1 handles the navigation based on the lack of hash/token
         // or storage error.

     }, [isLoading, isAuthenticated, navigate]); // Depend on isLoading, isAuthenticated, navigate


    return (
        <div>
            {/* Display a message while processing */}
            <h1>Processing Login...</h1>
            <p>Please wait...</p>
            {/* This component will likely unmount quickly after navigation */}
        </div>
    );
}

export default AuthCallbackPage;