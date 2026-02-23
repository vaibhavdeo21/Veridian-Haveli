import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Toggle state when user scrolls more than 50px
      setIsScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  // Determine what to show in the Welcome Banner
  const displayName = user?.fullName ? user.fullName : user?.username;

  return (
    /* FIXED REINFORCEMENT: 
       - !fixed ensures the position remains constant regardless of layout shifts.
       - !z-[100] pushes it above the Admin sidebar and layout main content.
       - isScrolled logic triggers a white background and height reduction (py-2 vs py-4).
    */
    <header className={`!fixed !top-0 !left-0 !right-0 !w-full !z-[100] transition-all duration-500 border-b ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md py-2 shadow-md border-haveli-border' 
        : 'bg-haveli-card py-4 border-transparent'
    } gold-shimmer active`}>
      <nav className="container mx-auto px-6 flex items-center justify-between">

        {/* --- LUXURY LOGO SECTION --- */}
        <Link to="/" className="flex items-center group relative" onClick={closeMenu}>
          {/* Glow Background */}
          <div className="absolute -inset-2 rounded-full bg-haveli-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>

          {/* Royal Seal */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Crown */}
            <i className="fas fa-crown text-[10px] text-haveli-accent mb-[-6px] opacity-80"></i>

            {/* Monogram */}
            <div className="bg-haveli-deep text-haveli-accent w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-display font-semibold text-lg sm:text-xl border border-haveli-accent/40 shadow-inner tracking-widest transition-all duration-500">
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
            <span className="text-[9px] sm:text-[10px] font-medium text-haveli-accent tracking-[0.35em] uppercase mt-1 hidden sm:block">
              Heritage Hotel & Suites
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center space-x-10">
          {["home", "about", "rooms", "gallery"].map((item) => (
            <li key={item}>
              <a href={`/#${item}`} className="relative text-haveli-body hover:text-haveli-primary transition-colors duration-300 font-medium tracking-wide text-sm after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-haveli-accent hover:after:w-full after:transition-all after:duration-300 capitalize">
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
                <Link to="/profile" onClick={closeMenu} className="text-haveli-primary hover:text-haveli-primaryHover font-bold text-xs uppercase tracking-widest px-3 py-1.5 hidden sm:flex items-center">
                  <i className="fas fa-user-circle mr-2 text-lg opacity-80"></i>Profile
                </Link>
              )}

              <div className="hidden xl:flex items-center space-x-4">
                <Link to="/booking" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-bold text-[10px] uppercase tracking-widest transition">
                  Reserve Suite
                </Link>

                <Link to="/order" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-bold text-[10px] uppercase tracking-widest transition">
                  Order Food
                </Link>
              </div>

              {/* LUXURIOUS NAME DISPLAY */}
              <div className="text-haveli-body border border-haveli-border px-4 py-2 rounded-xl font-medium text-xs hidden md:block bg-haveli-section shadow-inner">
                Hi, <span className="text-[#C2A14D] font-serif italic tracking-wide">{displayName}</span>
              </div>

              {user.role === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="btn-secondary h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition flex items-center hidden sm:flex shadow-sm">
                  Dashboard
                </Link>
              )}

              {/* Premium Logout */}
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-haveli-border rounded-xl text-haveli-muted hover:text-red-500 hover:border-red-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="text-haveli-body hover:text-haveli-primary font-bold text-xs uppercase tracking-widest transition mr-2">
                Log In
              </Link>

              <Link to="/register" onClick={closeMenu} className="btn-gold h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition flex items-center justify-center shadow-sm">
                Create Account
              </Link>
            </>
          )}

          {/* Mobile Button */}
          <button
            id="mobileMenuBtn"
            className="lg:hidden text-2xl text-haveli-heading focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`lg:hidden bg-white border-t border-haveli-border transition-all duration-300 ${isMenuOpen ? 'block shadow-xl' : 'hidden'}`}>
        <ul className="container mx-auto px-6 py-6 space-y-6 text-haveli-body">
          <li><a href="/#home" onClick={closeMenu} className="block hover:text-haveli-primary font-bold text-sm uppercase tracking-widest">Home</a></li>
          <li><a href="/#about" onClick={closeMenu} className="block hover:text-haveli-primary font-bold text-sm uppercase tracking-widest">About Us</a></li>
          <li><a href="/#rooms" onClick={closeMenu} className="block hover:text-haveli-primary font-bold text-sm uppercase tracking-widest">Suites</a></li>
          <li><a href="/#gallery" onClick={closeMenu} className="block hover:text-haveli-primary font-bold text-sm uppercase tracking-widest">Gallery</a></li>

          {user && (
            <div className="pt-6 border-t border-haveli-border flex flex-col space-y-4">
              {user.role !== 'admin' && <li><Link to="/profile" onClick={closeMenu} className="font-bold text-sm uppercase tracking-widest">My Profile</Link></li>}
              <li><Link to="/booking" onClick={closeMenu} className="text-haveli-primary font-bold text-sm uppercase tracking-widest">Reserve Suite</Link></li>
              <li><Link to="/order" onClick={closeMenu} className="text-haveli-accent font-bold text-sm uppercase tracking-widest">Order Food</Link></li>
              {user.role === 'admin' && <li><Link to="/admin" onClick={closeMenu} className="font-bold text-sm uppercase tracking-widest">Admin Dashboard</Link></li>}
            </div>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;