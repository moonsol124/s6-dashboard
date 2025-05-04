// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTachometerAlt, FaCog, FaQuestionCircle } from 'react-icons/fa';

function Sidebar() {
  const linkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2.5 rounded-brand text-sm font-medium transition-colors duration-150 ease-in-out ${
      isActive
        ? 'bg-primary text-background shadow-sm'
        : 'text-textSecondary hover:bg-primary/10 hover:text-primary'
    }`;

  return (
    // Added flex-shrink-0 to prevent sidebar from shrinking below w-64
    <aside className="w-64 flex-shrink-0 bg-background p-4 shadow-lg flex flex-col border-r border-grayLight">
      {/* Logo/Brand Area */}
      <div className="mb-8 text-center pt-2">
        <NavLink to="/" className="text-2xl font-secondary font-bold text-primary hover:opacity-80 transition-opacity">
          MiCasaEsTuCasa
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-2">
        <NavLink to="/" end className={linkClasses}>
          <FaTachometerAlt className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink to="/properties-placeholder" className={linkClasses}>
          <FaHome className="mr-3 h-5 w-5" />
          Manage Properties
        </NavLink>
        {/* ... other links */}
      </nav>

      {/* Placeholder Content & Bottom Links */}
      <div className="mt-auto pt-4 border-t border-grayLight">
         <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider font-secondary">
            Resources
         </h3>
         <div className='space-y-2'>
            <NavLink to="/settings-placeholder" className={linkClasses}>
                <FaCog className="mr-3 h-5 w-5" />
                Settings
            </NavLink>
             <NavLink to="/help-placeholder" className={linkClasses}>
                <FaQuestionCircle className="mr-3 h-5 w-5" />
                Help & Support
            </NavLink>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;