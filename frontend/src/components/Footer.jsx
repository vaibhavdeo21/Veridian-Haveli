import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-haveli-deep text-white/90 pt-20 pb-10 border-t-4 border-haveli-accent">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Left Section: Branding & Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="border border-haveli-accent text-haveli-accent w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl">
                VH
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display text-white tracking-wide">Veridian Haveli</h2>
                <p className="text-haveli-accent text-sm font-light mt-1">Luxury stays & warm hospitality</p>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-8 leading-relaxed font-light">
              Experience world-class hospitality at Veridian Haveli. Comfort, cleanliness and care — every stay matters.
            </p>
            <div className="space-y-3 text-sm text-white/70 font-light">
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

          {/* Middle Section: Links & Newsletter */}
          <div>
            <h3 className="text-lg font-display text-white mb-6 tracking-wide">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/70 font-light mb-10">
              <Link to="/" className="hover:text-haveli-accent transition">Home</Link>
              <Link to="/booking" className="hover:text-haveli-accent transition">Reserve Suite</Link>
              <Link to="/order" className="hover:text-haveli-accent transition">Order Food</Link>
              {/* Anchor jumping to #admin-login */}
              <a href="/#admin-login" className="hover:text-haveli-accent transition">Admin Panel</a>
            </div>

            <h3 className="text-lg font-display text-white mb-4 tracking-wide">Subscribe to offers</h3>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-haveli-accent placeholder-white/50"
              />
              <button 
                type="submit" 
                className="bg-haveli-accent hover:bg-haveli-accentHover text-white font-medium h-12 rounded-xl transition"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-white/50 font-light mt-3">No spam — only occasional offers and booking updates.</p>
          </div>

          {/* Right Section: Socials & Contact Card */}
          <div>
            <h3 className="text-lg font-display text-white mb-6 tracking-wide">Connect with us</h3>
            <div className="flex space-x-4 mb-8">
              <a href="#!" className="w-12 h-12 border border-white/20 hover:border-haveli-accent text-white/80 hover:text-haveli-accent rounded-xl flex items-center justify-center transition">
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a href="#!" className="w-12 h-12 border border-white/20 hover:border-haveli-accent text-white/80 hover:text-haveli-accent rounded-xl flex items-center justify-center transition">
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a href="#!" className="w-12 h-12 border border-white/20 hover:border-haveli-accent text-white/80 hover:text-haveli-accent rounded-xl flex items-center justify-center transition">
                <i className="fab fa-twitter text-lg"></i>
              </a>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-xl">
              <p className="text-sm text-white/70 font-light mb-2">Need help with a booking or order?</p>
              <p className="text-haveli-accent font-bold text-2xl mb-1">+91 11 1234 5678</p>
              <p className="text-xs text-white/50 font-light">Available 24/7 Service</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 font-light">
          <p>© 2025 Veridian Haveli. All rights reserved.</p>
          <p className="mt-4 md:mt-0">
            Crafted with <i className="fas fa-heart text-haveli-accent mx-1"></i> — 
            <a href="/#admin-login" className="text-white hover:text-haveli-accent hover:underline ml-1 transition">Admin Panel</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;