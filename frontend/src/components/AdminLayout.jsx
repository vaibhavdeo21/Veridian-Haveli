import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminHeader from './AdminHeader.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx'; 

const AdminLayout = () => {
  const { user } = useAuth();
  
  // State to control Sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Function to toggle the state
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="font-sans bg-haveli-bg min-h-screen overflow-x-hidden antialiased">
      {/* Pass toggle function to Header */}
      <AdminHeader toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16 relative">
        {/* Pass state to Sidebar so it knows when to hide */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* Main Content Area dynamically adjusts its margin */}
        <main 
          className={`flex-1 p-4 md:p-8 transition-all duration-500 w-full min-h-[calc(100vh-4rem)] ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          {/* Subtle page entry animation */}
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;