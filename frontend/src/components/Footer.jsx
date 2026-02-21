import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-haveli-deep text-white/90 pt-24 pb-10 border-t border-haveli-accent/30 relative overflow-hidden">

      {/* Lotus Watermark Background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
        <i className="fas fa-spa text-[420px] text-haveli-accent"></i>
      </div>

      <div className="container mx-auto px-6 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mb-20">

          {/* ================= BRAND SECTION ================= */}
          <div>
            <div className="flex items-center space-x-4 mb-6">

              {/* Royal Monogram Seal */}
              <div className="relative">
                <div className="border border-haveli-accent/40 text-haveli-accent w-14 h-14 rounded-full flex items-center justify-center font-display font-semibold text-xl shadow-inner bg-black/20">
                  VH
                </div>
                <i className="fas fa-crown text-[10px] text-haveli-accent absolute -top-2 left-1/2 -translate-x-1/2"></i>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-display tracking-[0.12em] uppercase">
                  Veridian Haveli
                </h2>
                <p className="text-haveli-accent text-xs tracking-[0.35em] uppercase mt-1">
                  Heritage Hotel & Suites
                </p>
              </div>
            </div>

            <p className="text-white/70 text-sm leading-relaxed font-light max-w-sm">
              Experience refined heritage hospitality where timeless architecture meets modern comfort. Every stay is crafted with warmth, elegance, and care.
            </p>

            <div className="mt-8 space-y-3 text-sm text-white/70 font-light">
              <p className="flex items-center">
                <i className="far fa-map text-haveli-accent w-6"></i>
                Riico industrial area (Reengus), Sikar, Rajasthan
              </p>
              <p className="flex items-center">
                <i className="fas fa-phone-alt text-haveli-accent w-6"></i>
                +91 11 1234 5678
              </p>
              <p className="flex items-center">
                <i className="far fa-envelope text-haveli-accent w-6"></i>
                info@veridianhaveli.com
              </p>
            </div>
          </div>

          {/* ================= NAVIGATION ================= */}
          <div>
            <h3 className="text-lg font-display text-white mb-6 tracking-[0.2em] uppercase">
              Explore
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm text-white/70 font-light mb-12">
              <Link to="/" className="hover:text-haveli-accent transition">Home</Link>
              <Link to="/booking" className="hover:text-haveli-accent transition">Reserve Suite</Link>
              <Link to="/order" className="hover:text-haveli-accent transition">Dining</Link>
              <a href="/#gallery" className="hover:text-haveli-accent transition">Gallery</a>
              <a href="/#about" className="hover:text-haveli-accent transition">About</a>
              <a href="/#admin-login" className="hover:text-haveli-accent transition">Admin Panel</a>
            </div>

            {/* Newsletter */}
            <h3 className="text-sm font-display text-white mb-3 tracking-[0.25em] uppercase">
              Exclusive Offers
            </h3>

            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/5 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-haveli-accent placeholder-white/40"
              />
              <button
                type="submit"
                className="bg-haveli-accent hover:bg-haveli-accentHover text-haveli-deep font-medium h-12 rounded-xl transition tracking-wide"
              >
                Join Mailing List
              </button>
            </form>
            <p className="text-xs text-white/40 mt-3">Occasional offers. No spam.</p>
          </div>

          {/* ================= CONTACT CARD ================= */}
          <div>
            <h3 className="text-lg font-display text-white mb-6 tracking-[0.2em] uppercase">
              Connect
            </h3>

            {/* Social Icons */}
            <div className="flex space-x-4 mb-10">
              {["facebook-f","instagram","twitter"].map((icon,i)=>(
                <a key={i} href="#!" className="w-12 h-12 border border-white/20 hover:border-haveli-accent text-white/70 hover:text-haveli-accent rounded-full flex items-center justify-center transition">
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>

            {/* Call Card */}
            <div className="bg-white/5 border border-haveli-accent/20 p-8 rounded-2xl backdrop-blur-sm">
              <p className="text-sm text-white/70 mb-2">Reservations & Assistance</p>
              <p className="text-haveli-accent font-semibold text-2xl mb-1 tracking-wide">
                +91 11 1234 5678
              </p>
              <p className="text-xs text-white/40">24/7 Guest Support</p>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 tracking-wide">
          <p>© 2025 Veridian Haveli — All rights reserved</p>
          <p className="mt-4 md:mt-0">
            Crafted with <i className="fas fa-heart text-haveli-accent mx-1"></i>
            <a href="/#admin-login" className="hover:text-haveli-accent ml-1 transition">Admin Access</a>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;