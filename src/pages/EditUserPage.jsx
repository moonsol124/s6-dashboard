// src/pages/EditUserPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../services/api'; // Import API functions
import { FaSave, FaSpinner } from 'react-icons/fa'; // Icons


function EditUserPage() {
  const { id } = useParams(); // Get the user ID from the URL params
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '', // Include role in form data state
    // Password field is usually separate or handled differently for edits
  });

  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [saving, setSaving] = useState(false); // Loading state for update save
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // State for success message
  const [fetchError, setFetchError] = useState(null); // Separate error for initial fetch


  // --- Fetch User Data on Mount ---
  useEffect(() => {
    console.log(`[EditUserPage] Fetching user data for ID: ${id}`);
    const fetchUserData = async () => {
      setLoading(true);
      setFetchError(null); // Clear fetch error
      try {
        const userData = await getUserById(id);
        console.log('[EditUserPage] Fetched user data:', userData);

        // Pre-populate form with fetched data
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          role: userData.role || 'user', // Default role if missing
        });
         setLoading(false);

      } catch (err) {
        console.error(`[EditUserPage] Failed to fetch user ${id}:`, err);
         // The API interceptor handles 401 redirects.
        if (err.message?.includes("Unauthorized") || err.message?.includes("redirecting to login")) {
             setFetchError("Session expired or invalid. Redirecting to login...");
        } else if (err.response?.status === 404) {
             setFetchError(`User with ID ${id} not found.`);
        } else {
             setFetchError('Failed to load user data. Please try again later.');
        }
         setLoading(false);
      }
    };

    if (id) { // Ensure ID exists before fetching
       fetchUserData();
    } else {
       setFetchError("User ID is missing from the URL.");
       setLoading(false);
    }

  }, [id]); // Depend on the user ID from params


  // --- Form Input Change Handler ---
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
     setError(null); // Clear errors on input change
     setSuccess(null); // Clear success on input change
  }, []);


  // --- Form Submit Handler (Update User) ---
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log(`[EditUserPage] Update form submitted for ID ${id}:`, formData);

    setSaving(true); // Set saving state
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success

    // Basic validation
    if (!formData.username || !formData.email || !formData.role) {
        setError('Username, email, and role are required.');
        setSaving(false);
        return;
    }

    try {
      // Call the updateUser API function with the ID and updated data
      // Note: We are not sending the password here. Password changes should be a separate flow.
      const updatedUserData = await updateUser(id, {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          // Add other updateable fields here
      });

      console.log('[EditUserPage] User updated successfully:', updatedUserData);
      setSuccess('User updated successfully!');
      setSaving(false);

      // Optional: Redirect back to the users list after a short delay
      setTimeout(() => {
        navigate('/users'); // Navigate back
      }, 2000);

    } catch (err) {
      console.error(`[EditUserPage] Failed to update user ${id}:`, err);
       // The API interceptor handles 401 redirects.
        if (err.message?.includes("Unauthorized") || err.message?.includes("redirecting to login")) {
             setError("Session expired or invalid. Redirecting to login...");
        } else if (err.response?.data?.error) {
             setError(`Failed to update user: ${err.response.data.error}`);
        }
        else {
             setError('Failed to update user. Please try again later.');
        }
      setSaving(false);
    }
  }, [id, formData, navigate]); // Depend on id, formData, and navigate

   // --- Render ---
  // Show loading state for initial data fetch
  if (loading) {
      return (
           <div className="flex items-center justify-center p-4">Loading user data...</div>
      );
  }

   // Show fetch error if initial data loading failed
   if (fetchError) {
       return (
            <div className="p-4">
                <p className="text-center text-red-600 bg-red-100 p-4 rounded-brand">{fetchError}</p>
                 <div className="mt-6 text-center">
                    <Link to="/users" className="text-primary hover:underline text-sm">Back to User Management</Link>
                 </div>
            </div>
       );
   }


  // Render the form if data is loaded successfully
  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-secondary font-bold text-textSecondary mb-6 text-center">
        Edit User
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
          <input
            type="email" // Use type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
             className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

         {/* Role Selection for Editing */}
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">Role</label>
            <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-grayLight rounded-brand bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
         </div>


        {error && (
          <p className="text-red-600 bg-red-100 p-2 rounded-brand text-sm">{error}</p>
        )}
        {success && (
           <p className="text-green-600 bg-green-100 p-2 rounded-brand text-sm">{success}</p>
        )}

        <button
          type="submit"
          disabled={saving} // Disable button while saving
          className="w-full flex justify-center items-center bg-primary text-background px-4 py-2.5 rounded-brand hover:opacity-80 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
              <FaSpinner className="animate-spin mr-2" />
          ) : (
              <FaSave className="mr-2 h-4 w-4" />
          )}
           Save Changes
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/users" className="text-primary hover:underline text-sm">Back to User Management</Link>
      </div>
    </div>
  );
}

export default EditUserPage;