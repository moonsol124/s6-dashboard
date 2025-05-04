// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    // Ensure this is the immediate child of the body or React root for h-screen to work reliably
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar: Fixed width, will not shrink */}
      <Sidebar />

      {/* Main Content Wrapper: Should grow to fill remaining horizontal space */}
      {/* It stacks header and main content vertically */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* flex-1 is key here */}

        {/* Header: Fixed height, will not shrink */}
        <header className="bg-background shadow-md h-16 flex-shrink-0 flex items-center px-6 z-10">
           <h1 className="text-xl font-secondary font-semibold text-textSecondary">
                Property Management
           </h1>
           {/* User profile etc. */}
        </header>

        {/* Actual Page Content Area: Grows vertically, scrolls vertically */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto bg-blue-50"> {/* Added temporary bg-blue-50 */}
          {/* The content rendered by Outlet should naturally fill this space */}
          {/* Or add w-full to the direct child if needed, e.g., in DashboardPage */}
          <Outlet />
        </main>

      </div> {/* End Main Content Wrapper */}
    </div> // End Parent container
  );
}

export default Layout;