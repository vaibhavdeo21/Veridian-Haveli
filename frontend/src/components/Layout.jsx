import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = () => {
  const { user } = useAuth();

  // Keep admins strictly on dashboard
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="font-sans bg-[var(--cream-soft)] min-h-screen">

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll Helper */}
      <ScrollToTop />

    </div>
  );
};

export default Layout;