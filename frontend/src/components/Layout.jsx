import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // NEW: Import Auth

const Layout = () => {
  const { user } = useAuth();

  // NEW: Bouncer Logic - Keep admins strictly on the dashboard
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="font-sans">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;