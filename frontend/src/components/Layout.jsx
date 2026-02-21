import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = () => {
  const { user } = useAuth();

  // Keep admins strictly on dashboard to maintain operational focus
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="font-sans bg-haveli-bg min-h-screen selection:bg-haveli-accent selection:text-white antialiased">

      {/* Header - Fixed navigation with heritage styling */}
      <Header />

      {/* Main Content 
          Padding top (pt-24) ensures content starts below the fixed header.
          Containerized with max-w-7xl to maintain luxury breathing room on ultra-wide screens.
      */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-500">
        {/* Animated entry for child routes */}
        <div className="animate-fadeIn">
            <Outlet />
        </div>
      </main>

      {/* Footer - Heritage site information and links */}
      <Footer />

      {/* Scroll Helper - Floating golden action button */}
      <ScrollToTop />

    </div>
  );
};

export default Layout;