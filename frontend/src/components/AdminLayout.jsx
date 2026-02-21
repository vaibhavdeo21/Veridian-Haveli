import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminHeader from './AdminHeader.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx'; 

const AdminLayout = () => {
  const { user } = useAuth();
  
  // State to control Sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Authentication Guard: Ensure only logged-in administrators can access this layout
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Function to toggle the state passed down to the AdminHeader
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="font-sans bg-haveli-bg min-h-screen overflow-x-hidden antialiased">
      {/* PASS TOGGLE TO HEADER
          The Header is fixed at z-[999] in its own component to stay on top of everything.
      */}
      <AdminHeader toggleSidebar={toggleSidebar} />
      
      {/* FIXED LAYOUT STRUCTURE:
          pt-16 compensates for the 4rem (h-16) height of the fixed AdminHeader.
          z-1 ensures this container stays below the header layer during scroll.
      */}
      <div className="flex pt-16 relative z-10">
        {/* Sidebar Component with dynamic transform logic */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* Main Content Area:
            - Dynamically adjusts margin based on Sidebar state (ml-64 vs ml-0).
            - overflow-x-hidden prevents unwanted horizontal scrolling on small screens.
            - relative z-0 ensures content never overlaps the fixed AdminHeader.
        */}
        <main 
          className={`flex-1 p-4 md:p-8 transition-all duration-500 w-full min-h-[calc(100vh-4rem)] relative z-0 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          {/* Subtle page entry animation for a luxury feel */}
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;