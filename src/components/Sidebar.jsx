// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
// Import only the necessary icons
import { FaHome, FaUsers, FaSignOutAlt } from 'react-icons/fa';
// --- REMOVE: import { logoutUser } from '../services/api'; --- // No longer needed directly here
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

function Sidebar() {
  // Get the logout function from the AuthContext
  const { logout } = useAuth();

  // Style function for active/inactive links - remains the same
  const linkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2.5 rounded-brand text-sm font-medium transition-colors duration-150 ease-in-out ${
      isActive
        ? 'bg-primary text-background shadow-sm'
        : 'text-textSecondary hover:bg-primary/10 hover:text-primary'
    }`;

  // Logout handler function - calls the logout function from AuthContext
  const handleLogout = async (e) => {
    e.preventDefault();
    console.log("Logout initiated by user.");
    if (window.confirm('Are you sure you want to log out?')) {
      console.log("User confirmed logout. Calling AuthContext logout.");
      // Call the logout function obtained from useAuth().
      // This function handles clearing tokens and redirecting.
      await logout(); // Await the async logout process

      // The redirect logic (navigate('/login')) is now inside the
      // `logout` function provided by AuthContext.
      // No need for explicit navigation here.
       console.log("Logout function from AuthContext finished.");
    } else {
        console.log("User cancelled logout.");
    }
  };

  return (
    // Main sidebar structure - remains the same
    <aside className="w-64 flex-shrink-0 bg-background p-4 shadow-lg flex flex-col border-r border-grayLight">
      {/* Logo - remains the same */}
      <div className="mb-8 text-center pt-2">
        <NavLink to="/" className="text-2xl font-secondary font-bold text-primary hover:opacity-80 transition-opacity">
          MiCasaEsTuCasa
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-2">
        {/* Properties Link (assuming '/' is the main properties/dashboard page) */}
        <NavLink to="/" end className={linkClasses}> {/* 'end' ensures it's only active for exact '/' */}
          <FaHome className="mr-3 h-5 w-5" />
          Properties
        </NavLink>

        {/* Users Link */}
        <NavLink to="/users" className={linkClasses}>
          <FaUsers className="mr-3 h-5 w-5" />
          Users
        </NavLink>
        {/* Add other NavLinks here */}
      </nav>

      {/* Bottom Area */}
      <div className="mt-auto pt-4 border-t border-grayLight space-y-2">
         {/* Logout Button */}
         <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 rounded-brand text-sm font-medium transition-colors duration-150 ease-in-out text-textSecondary hover:bg-red-100/50 hover:text-red-600"
          >
            <FaSignOutAlt className="mr-3 h-5 w-5" />
            Logout
         </button>
      </div>
    </aside>
  );
}

export default Sidebar;