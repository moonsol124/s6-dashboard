// src/pages/AddUserPage.jsx
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../services/api'; // Import the createUser API function
import { FaUserPlus, FaSpinner } from 'react-icons/fa'; // Icons

function AddUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    // Note: Role is often NOT set during user creation via a public endpoint.
    // If this endpoint is only for admins adding users, you might include 'role' here.
    // For now, we'll exclude it unless your User Service /register endpoint expects it.
    // role: 'user', // Example if adding role here
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // State for success message

  // --- Form Input Change Handler ---
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear previous error/success messages when user starts typing
    setError(null);
    setSuccess(null);
  }, []);

  // --- Form Submit Handler ---
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log('[AddUserPage] Form submitted:', formData);

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation (more robust validation needed in production)
    if (!formData.username || !formData.email || !formData.password) {
        setError('Username, email, and password are required.');
        setLoading(false);
        return;
    }

    try {
      // Call the createUser API function
      const newUser = await createUser(formData);
      console.log('[AddUserPage] User created successfully:', newUser);

      setSuccess('User created successfully!');
      setLoading(false);

      // Optional: Redirect to the users list page after a short delay
      setTimeout(() => {
        navigate('/users', { replace: true }); // Redirect after 2 seconds
      }, 2000);

       // Or clear the form for adding another user:
       // setFormData({ username: '', email: '', password: '', role: 'user' }); // Include role if applicable

    } catch (err) {
      console.error('[AddUserPage] Failed to create user:', err);
       // The API interceptor handles 401 redirects.
        if (err.message?.includes("Unauthorized") || err.message?.includes("redirecting to login")) {
             setError("Session expired or invalid. Redirecting to login...");
        } else if (err.response?.data?.error) {
             // Display specific error from the API if available
             setError(`Failed to create user: ${err.response.data.error}`);
        }
        else {
             setError('Failed to create user. Please try again later.');
        }
      setLoading(false);
    }
  }, [formData, navigate]); // Depend on formData and navigate

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-secondary font-bold text-textSecondary mb-6 text-center">
        Add New User
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
            type="email" // Use type="email" for better validation
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
             className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
             className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

         {/* Optional: Add role selection if this is an admin endpoint for adding users */}
         {/*
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">Role</label>
            <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-primary focus:border-primary"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
         </div>
         */}

        {error && (
          <p className="text-red-600 bg-red-100 p-2 rounded-brand text-sm">{error}</p>
        )}
        {success && (
           <p className="text-green-600 bg-green-100 p-2 rounded-brand text-sm">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center bg-primary text-background px-4 py-2.5 rounded-brand hover:opacity-80 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
              <FaSpinner className="animate-spin mr-2" />
          ) : (
              <FaUserPlus className="mr-2 h-4 w-4" />
          )}
           Add User
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/users" className="text-primary hover:underline text-sm">Back to User Management</Link>
      </div>
    </div>
  );
}

export default AddUserPage;