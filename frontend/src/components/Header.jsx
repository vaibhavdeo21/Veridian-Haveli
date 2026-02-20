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
    <header className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 transition-all duration-300 ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl">
            JH
          </div>
          <span className="text-xl sm:text-2xl font-bold font-display text-amber-800">
            Jhankar Hotel
          </span>
        </Link>

        <ul className="hidden lg:flex items-center space-x-8">
          <li><a href="/#home" className="hover:text-amber-600 transition font-medium">Home</a></li>
          <li><a href="/#about" className="hover:text-amber-600 transition font-medium">About Us</a></li>
          <li><a href="/#rooms" className="hover:text-amber-600 transition font-medium">Rooms</a></li>
          <li><a href="/#gallery" className="hover:text-amber-600 transition font-medium">Gallery</a></li>
        </ul>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              {/* Logged in View */}
              {user.role !== 'admin' && (
                <Link to="/profile" onClick={closeMenu} className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md font-semibold text-sm transition hover:bg-amber-200 hidden sm:block">
                  <i className="fas fa-user-circle mr-2"></i>My Profile
                </Link>
              )}
              <Link to="/booking" onClick={closeMenu} className="text-gray-700 hover:text-amber-600 font-semibold text-sm transition hidden sm:block">
                Book Room
              </Link>
              <Link to="/order" onClick={closeMenu} className="text-gray-700 hover:text-amber-600 font-semibold text-sm transition hidden sm:block">
                Order Food
              </Link>
              
              <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md font-semibold text-sm hidden md:block">
                Hi, {user.username}
              </div>
              
              {user.role === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="bg-gray-800 hover:bg-black text-white px-3 py-1.5 rounded-md font-semibold text-sm transition shadow-md hidden sm:block">
                  Dashboard
                </Link>
              )}
              
              <button onClick={() => { logout(); closeMenu(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-semibold text-sm transition shadow-md">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Logged out View */}
              <Link to="/login" onClick={closeMenu} className="text-gray-700 hover:text-amber-600 font-semibold text-sm transition">
                Log In
              </Link>
              <Link to="/register" onClick={closeMenu} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-semibold text-sm sm:text-base transition shadow-md hover:shadow-lg">
                Create Account
              </Link>
            </>
          )}

          <button
            id="mobileMenuBtn"
            className="lg:hidden text-2xl text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      <div id="mobileMenu" className={`lg:hidden bg-white border-t ${isMenuOpen ? 'block' : 'hidden'}`}>
        <ul className="container mx-auto px-4 py-3 space-y-2 text-gray-700">
          <li><a href="/#home" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium">Home</a></li>
          <li><a href="/#about" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium">About Us</a></li>
          <li><a href="/#rooms" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium">Rooms</a></li>
          <li><a href="/#gallery" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium">Gallery</a></li>
          {user && (
            <>
              {user.role !== 'admin' && <li><Link to="/profile" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium">My Profile</Link></li>}
              <li><Link to="/booking" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium text-amber-600">Book Room</Link></li>
              <li><Link to="/order" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium text-green-600">Order Food</Link></li>
              {user.role === 'admin' && <li><Link to="/admin" onClick={closeMenu} className="block hover:text-amber-600 transition font-medium text-gray-900">Admin Dashboard</Link></li>}
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;