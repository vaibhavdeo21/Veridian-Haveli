import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminHeader from './AdminHeader.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // Import the Auth context

const AdminLayout = () => {
  // Check the global user state
  const { user } = useAuth();

  // If not logged in OR not an admin, redirect them back to the login page
  // This prevents unauthorized users from seeing the dashboard shell
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // NOTE: DataProvider and NotificationProvider were removed from here 
  // because they now correctly wrap the entire app in App.jsx.
  return (
    <div className="font-inter bg-gray-100 min-h-screen">
      <AdminHeader />
      <div className="flex pt-16">
        <Sidebar />
        {/* This main section will now render the shared data from the top-level Provider */}
        <main className="flex-1 p-4 md:p-6 ml-20 lg:ml-64 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;