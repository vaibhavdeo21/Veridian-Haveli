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

      <Header />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-500">

        <div className="animate-fadeIn">
            <Outlet />
        </div>
      </main>

      <Footer />

      <ScrollToTop />

    </div>
  );
};

export default Layout;