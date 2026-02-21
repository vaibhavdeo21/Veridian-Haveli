import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth(); // Hook into our AuthContext

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`fixed top-0 left-0 right-0 bg-haveli-card border-b border-haveli-border z-50 transition-all duration-300 ${isScrolled ? 'shadow-sm py-2' : 'py-4'}`}>
      <nav className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3" onClick={closeMenu}>
          <div className="bg-haveli-deep text-haveli-accent w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg sm:text-xl border border-haveli-border">
            VH
          </div>
          <span className="text-xl sm:text-2xl font-bold font-display text-haveli-heading tracking-wide">
            Veridian Haveli
          </span>
        </Link>

        <ul className="hidden lg:flex items-center space-x-8">
          <li><a href="/#home" className="text-haveli-body hover:text-haveli-primary transition font-medium">Home</a></li>
          <li><a href="/#about" className="text-haveli-body hover:text-haveli-primary transition font-medium">About Us</a></li>
          <li><a href="/#rooms" className="text-haveli-body hover:text-haveli-primary transition font-medium">Suites</a></li>
          <li><a href="/#gallery" className="text-haveli-body hover:text-haveli-primary transition font-medium">Gallery</a></li>
        </ul>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              {/* Logged in View */}
              {user.role !== 'admin' && (
                <Link to="/profile" onClick={closeMenu} className="text-haveli-primary hover:text-haveli-primaryHover font-medium px-3 py-1.5 hidden sm:flex items-center">
                  <i className="far fa-user-circle mr-2 text-lg"></i>My Profile
                </Link>
              )}
              <Link to="/booking" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-medium text-sm transition hidden sm:block">
                Reserve Suite
              </Link>
              <Link to="/order" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-medium text-sm transition hidden sm:block">
                Order Food
              </Link>
              
              <div className="text-haveli-body border border-haveli-border px-4 py-2 rounded-xl font-medium text-sm hidden md:block">
                Hi, <span className="text-haveli-primary">{user.username}</span>
              </div>
              
              {user.role === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="bg-haveli-deep hover:bg-haveli-primary text-white px-6 h-10 rounded-xl font-medium text-sm transition flex items-center hidden sm:flex">
                  Dashboard
                </Link>
              )}
              
              <button onClick={() => { logout(); closeMenu(); }} className="text-haveli-muted hover:text-red-500 font-medium text-sm transition ml-2">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Logged out View */}
              <Link to="/login" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-medium text-sm transition">
                Log In
              </Link>
              <Link to="/register" onClick={closeMenu} className="bg-haveli-accent hover:bg-haveli-accentHover text-white px-6 h-10 rounded-xl font-medium text-sm sm:text-base transition flex items-center justify-center">
                Create Account
              </Link>
            </>
          )}

          <button
            id="mobileMenuBtn"
            className="lg:hidden text-2xl text-haveli-heading"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`far ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      <div id="mobileMenu" className={`lg:hidden bg-haveli-card border-t border-haveli-border transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}>
        <ul className="container mx-auto px-6 py-4 space-y-4 text-haveli-body">
          <li><a href="/#home" onClick={closeMenu} className="block hover:text-haveli-primary transition font-medium">Home</a></li>
          <li><a href="/#about" onClick={closeMenu} className="block hover:text-haveli-primary transition font-medium">About Us</a></li>
          <li><a href="/#rooms" onClick={closeMenu} className="block hover:text-haveli-primary transition font-medium">Rooms</a></li>
          <li><a href="/#gallery" onClick={closeMenu} className="block hover:text-haveli-primary transition font-medium">Gallery</a></li>
          {user && (
            <>
              {user.role !== 'admin' && <li><Link to="/profile" onClick={closeMenu} className="block hover:text-haveli-primary transition font-medium">My Profile</Link></li>}
              <li><Link to="/booking" onClick={closeMenu} className="block text-haveli-primary font-medium">Reserve Suite</Link></li>
              <li><Link to="/order" onClick={closeMenu} className="block text-haveli-accent font-medium">Order Food</Link></li>
              {user.role === 'admin' && <li><Link to="/admin" onClick={closeMenu} className="block text-haveli-heading font-medium">Admin Dashboard</Link></li>}
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;