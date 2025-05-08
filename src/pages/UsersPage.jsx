// src/pages/UsersPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link, useNavigate
import { getAllUsers, deleteUser } from '../services/api'; // Import deleteUser
import { FaChevronLeft, FaChevronRight, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'; // Added icons


function UsersPage() {
  const navigate = useNavigate(); // Get navigate for edit redirects
  const [users, setUsers] = useState([]); // Holds ALL fetched users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({}); // State to track loading for individual delete operations

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  // --- Filtering State ---
  const [selectedRole, setSelectedRole] = useState('all');

  // --- Fetch ALL users ---
  const fetchUsers = useCallback(async () => {
    console.log("[UsersPage] Fetching all users...");
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      console.log("[UsersPage] Raw fetched users data:", data); // <-- **CHECK THIS LOG IN BROWSER CONSOLE**
      setUsers(data || []);
       console.log(`[UsersPage] Successfully fetched ${data?.length || 0} users.`);
    } catch (err) {
      console.error("Failed to load users:", err);
        if (err.message?.includes("Unauthorized") || err.message?.includes("redirecting to login")) {
             setError("Session expired or invalid. Redirecting to login...");
        } else {
             setError('Failed to load users. Please try again later.');
             setUsers([]);
        }
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Effect to fetch users on component mount ---
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  // --- Delete Handler ---
  const handleDelete = useCallback(async (id) => {
    if (window.confirm(`Are you sure you want to delete user ${id}?`)) {
      setDeleteLoading(prev => ({ ...prev, [id]: true }));
      setError(null);
      try {
        await deleteUser(id);
        console.log(`[UsersPage] User ${id} deleted successfully.`);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      } catch (err) {
        console.error(`Failed to delete user ${id}:`, err);
        if (err.message?.includes("Unauthorized") || err.message?.includes("redirecting to login")) {
             setError("Session expired or invalid. Redirecting to login...");
        } else {
             setError(`Failed to delete user ${id}. Please try again later.`);
        }
      } finally {
         setDeleteLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  }, []);

  // --- Edit Handler (Redirects to Edit Page) ---
  const handleEdit = useCallback((id) => {
      console.log(`[UsersPage] Editing user ${id}. Navigating to edit page.`);
      navigate(`/users/edit/${id}`);
  }, [navigate]);


  // --- Filtering and Pagination Logic ---
  const { itemsToDisplay, totalPages, filteredUsersCount } = useMemo(() => {
    console.log("[UsersPage] Recalculating filtered and paginated data. Selected Role:", selectedRole);

    // 1. Apply Filtering
    const filteredUsers = selectedRole === 'all'
        ? users
        : users.filter(user =>
            // This is the filter condition. It expects user.role to exist and be a string
            // with value 'user' or 'admin' (case/whitespace-insensitive).
            user.role && typeof user.role === 'string'
            && user.role.toLowerCase().trim() === selectedRole.toLowerCase().trim()
        );

    const totalFilteredItems = filteredUsers.length;
    const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage);

    // 2. Apply Pagination to the FILTERED list
    let adjustedCurrentPage = currentPage;
     if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        adjustedCurrentPage = calculatedTotalPages;
     } else if (calculatedTotalPages === 0) {
         adjustedCurrentPage = 1;
     }

    const startIndex = (adjustedCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredUsers.slice(startIndex, endIndex);

    if (adjustedCurrentPage !== currentPage) {
       console.log(`[UsersPage] Adjusting currentPage from ${currentPage} to ${adjustedCurrentPage}`);
       setCurrentPage(adjustedCurrentPage);
    }

    return {
        itemsToDisplay: currentItems,
        totalPages: calculatedTotalPages,
        filteredUsersCount: totalFilteredItems
    };
  }, [users, currentPage, itemsPerPage, selectedRole]);


  // --- Pagination & Filtering Handlers ---
  const handleItemsPerPageChange = useCallback((event) => {
    const newItemsPerPage = Number(event.target.value);
    console.log(`[UsersPage] Changing items per page to: ${newItemsPerPage}`);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const handleNextPage = useCallback(() => {
     const nextPage = Math.min(currentPage + 1, totalPages);
     console.log(`[UsersPage] Going to next page: ${nextPage}`);
     setCurrentPage(nextPage);
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
     const prevPage = Math.max(currentPage - 1, 1);
      console.log(`[UsersPage] Going to previous page: ${prevPage}`);
     setCurrentPage(prevPage);
  }, [currentPage]);

  const handleRoleChange = useCallback((event) => {
      const newRole = event.target.value;
      console.log(`[UsersPage] Changing role filter to: ${newRole}`);
      setSelectedRole(newRole);
      setCurrentPage(1);
  }, []);


  // --- Render ---
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-secondary font-bold text-textSecondary">
          User Management
        </h1>
        <Link
          to="/users/add"
          className="flex items-center bg-primary text-background px-4 py-2 rounded-brand hover:opacity-80 transition-opacity text-sm font-medium whitespace-nowrap"
        >
          <FaPlus className="mr-2 h-4 w-4" /> Add New User
        </Link>
      </div>

      {/* Display Loading/Error messages */}
      {loading && <p className="text-center p-4">Loading users...</p>}
      {error && !error.includes("Redirecting") && (
        <p className="text-center text-red-600 bg-red-100 p-4 rounded-brand">{error}</p>
      )}
       {error && error.includes("Redirecting") && (
           <p className="text-center text-yellow-600 bg-yellow-100 p-4 rounded-brand">{error}</p>
       )}


      {!loading && !error && (
          filteredUsersCount > 0 ? (
            <>
               {users.length > 0 && ( // Only show filter if there are *any* users fetched
                   <div className="mb-4 flex items-center gap-2 text-sm text-textSecondary">
                      <span>Filter by Role:</span>
                       <select
                          id="roleFilter"
                          value={selectedRole}
                          onChange={handleRoleChange}
                          className="px-2 py-1 border border-grayLight rounded-brand bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                          <option value="all">All Roles</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                   </div>
               )}


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
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-gray-500 uppercase tracking-wider">
                        Joined At
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                         <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-grayLight">
                    {itemsToDisplay.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textPrimary">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{user.email}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{user.id}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                           {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                               onClick={() => handleEdit(user.id)}
                               className="text-primary hover:text-primary/80 mr-4"
                               aria-label={`Edit user ${user.username}`}
                             >
                                <FaEdit className="inline-block h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deleteLoading[user.id]}
                                className={`text-red-600 hover:text-red-800 ${deleteLoading[user.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                aria-label={`Delete user ${user.username}`}
                             >
                                {deleteLoading[user.id] ? (
                                     <svg className="animate-spin inline-block h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <FaTrash className="inline-block h-4 w-4" />
                                )}
                            </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm text-textSecondary">
                  <div className="flex items-center gap-2">
                    <span>Show:</span>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="px-2 py-1 border border-grayLight rounded-brand bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <span>entries</span>
                  </div>

                  <div className="flex items-center gap-3">
                     <span>
                       Page {currentPage} of {totalPages} ({filteredUsersCount} {filteredUsersCount === 1 ? 'user' : 'users'} filtered)
                     </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-brand border border-grayLight transition-colors ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                        }`}
                        aria-label="Previous Page"
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                         className={`p-1.5 rounded-brand border border-grayLight transition-colors ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                        }`}
                        aria-label="Next Page"
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
              // Message when no *filtered* users are found
              // Only show this if loading is false and no error, and filteredUsersCount is 0
              <p className="text-center py-4 text-sm text-gray-500">No users found matching the selected criteria.</p>
          )
      )}
       {/* Message when no users are fetched at all */}
      {!loading && !error && users.length === 0 && (
          <p className="text-center py-4 text-sm text-gray-500">No users found in the system.</p>
      )}
    </div>
  );
}

export default UsersPage;