// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/api'; // Assuming api.js exports getAllUsers

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllUsers();
        // Ensure data is always an array, even if API returns null/undefined
        setUsers(data || []);
      } catch (err) {
        console.error("Failed to load users:", err);
        // Check if the error is the redirecting error from the interceptor
        if (err.message?.includes("Unauthorized")) {
             setError("Session expired. Redirecting to login...");
             // No need to set users or stop loading, redirect will happen
             return; // Stop further processing
        } else {
             setError('Failed to load users. Please try again later.');
             setUsers([]); // Clear users on other errors
        }

      } finally {
        // Only set loading to false if not being redirected
         if (!error?.includes("Redirecting")) {
             setLoading(false);
         }
      }
    };

    fetchUsers();
  }, [error]); // Add error as dependency to potentially stop loading

  return (
    <div>
      <h1 className="text-3xl font-secondary font-bold text-textSecondary mb-6">
        User Management
      </h1>

      {loading && <p className="text-center p-4">Loading users...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-brand">{error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-grayLight">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-gray-500 uppercase tracking-wider">
                  Joined At
                </th>
                {/* Add other relevant non-sensitive headers */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-grayLight">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textPrimary">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{user.id}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                        {new Date(user.created_at).toLocaleDateString()}
                     </td>
                    {/* Render other user data cells */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-sm text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UsersPage;