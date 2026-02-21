import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-haveli-card border-b border-haveli-border z-50 transition-all duration-500 gold-shimmer ${isScrolled ? 'active shadow-md py-2 backdrop-blur-md' : 'py-4'
        }`}
    >      <nav className="container mx-auto px-6 flex items-center justify-between">

        {/* --- LUXURY LOGO SECTION --- */}
        <Link to="/" className="flex items-center group relative" onClick={closeMenu}>

          {/* Glow Background */}
          <div className="absolute -inset-2 rounded-full bg-haveli-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>

          {/* Royal Seal */}
          <div className="relative flex flex-col items-center justify-center">

            {/* Crown */}
            <i className="fas fa-crown text-[10px] text-haveli-accent mb-[-6px] opacity-80"></i>

            {/* Monogram */}
            <div className="bg-haveli-deep text-haveli-accent w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-display font-semibold text-lg sm:text-xl border border-haveli-accent/40 shadow-inner tracking-widest">
              VH
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-haveli-accent/40 mx-4 hidden sm:block"></div>

          {/* Typography */}
          <div className="flex flex-col justify-center">
            <span className="text-xl sm:text-2xl font-bold font-display text-haveli-heading tracking-[0.12em] uppercase leading-none transition-all duration-300 group-hover:text-haveli-accent">
              Veridian Haveli
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-haveli-accent tracking-[0.35em] uppercase mt-1 hidden sm:block">
              Heritage Hotel & Suites
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center space-x-10">
          {["home", "about", "rooms", "gallery"].map((item) => (
            <li key={item}>
              <a href={`/#${item}`} className="relative text-haveli-body hover:text-haveli-primary transition font-medium tracking-wide after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-haveli-accent hover:after:w-full after:transition-all after:duration-300 capitalize">
                {item === "rooms" ? "Suites" : item}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              {user.role !== 'admin' && (
                <Link to="/profile" onClick={closeMenu} className="text-haveli-primary hover:text-haveli-primaryHover font-medium px-3 py-1.5 hidden sm:flex items-center">
                  <i className="fas fa-user-circle mr-2 text-lg opacity-80"></i>My Profile
                </Link>
              )}

              <Link to="/booking" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-medium text-sm transition hidden sm:block">
                Reserve Suite
              </Link>

              <Link to="/order" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-medium text-sm transition hidden sm:block">
                Order Food
              </Link>

              <div className="text-haveli-body border border-haveli-border px-4 py-2 rounded-xl font-medium text-sm hidden md:block bg-haveli-section shadow-inner">
                Hi, <span className="text-haveli-primary font-semibold">{user.username}</span>
              </div>

              {user.role === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="btn-secondary h-10 px-6 rounded-xl font-medium text-sm transition flex items-center hidden sm:flex shadow-sm">
                  Dashboard
                </Link>
              )}

              {/* Premium Logout */}
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="px-4 py-2 text-sm border border-haveli-border rounded-xl text-haveli-muted hover:text-red-500 hover:border-red-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-medium text-sm transition">
                Log In
              </Link>

              <Link to="/register" onClick={closeMenu} className="btn-gold h-10 px-6 rounded-xl font-medium text-sm sm:text-base transition flex items-center justify-center shadow-sm">
                Create Account
              </Link>
            </>
          )}

          {/* Mobile Button */}
          <button
            id="mobileMenuBtn"
            className="lg:hidden text-2xl text-haveli-heading"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`lg:hidden bg-haveli-card border-t border-haveli-border transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}>
        <ul className="container mx-auto px-6 py-6 space-y-6 text-haveli-body">
          <li><a href="/#home" onClick={closeMenu} className="block hover:text-haveli-primary font-medium text-lg">Home</a></li>
          <li><a href="/#about" onClick={closeMenu} className="block hover:text-haveli-primary font-medium text-lg">About Us</a></li>
          <li><a href="/#rooms" onClick={closeMenu} className="block hover:text-haveli-primary font-medium text-lg">Suites</a></li>
          <li><a href="/#gallery" onClick={closeMenu} className="block hover:text-haveli-primary font-medium text-lg">Gallery</a></li>

          {user && (
            <div className="pt-4 border-t border-haveli-border flex flex-col space-y-4">
              {user.role !== 'admin' && <li><Link to="/profile" onClick={closeMenu}>My Profile</Link></li>}
              <li><Link to="/booking" onClick={closeMenu} className="text-haveli-primary font-semibold">Reserve Suite</Link></li>
              <li><Link to="/order" onClick={closeMenu} className="text-haveli-accent font-semibold">Order Food</Link></li>
              {user.role === 'admin' && <li><Link to="/admin" onClick={closeMenu} className="font-semibold">Admin Dashboard</Link></li>}
            </div>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;