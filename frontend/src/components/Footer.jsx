import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Left Section: Branding & Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white w-10 h-10 rounded flex items-center justify-center font-bold text-xl">
                JH
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display">Jhankar Hotel</h2>
                <p className="text-gray-400 text-sm">Luxury stays & warm hospitality — Reengus, Rajasthan</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Experience world-class hospitality at Jhankar Hotel. Comfort, cleanliness and care — every stay matters.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-center">
                <i className="fas fa-map-marker-alt text-amber-600 mr-3"></i>
                Riico industrial area (Reengus), Sikar, Rajasthan, India
              </p>
              <p className="flex items-center">
                <i className="fas fa-phone text-amber-600 mr-3"></i>
                +91 11 1234 5678
              </p>
              <p className="flex items-center">
                <i className="fas fa-envelope text-amber-600 mr-3"></i>
                info@Jhankar@gmail.com
              </p>
            </div>
          </div>

          {/* Middle Section: Links & Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-display">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-8">
              <Link to="/" className="hover:text-amber-600 transition">Home</Link>
              <Link to="/booking" className="hover:text-amber-600 transition">Book Room</Link>
              <Link to="/order" className="hover:text-amber-600 transition">Order Food</Link>
              {/* Changed from Link to Anchor jumping to #admin-login */}
              <a href="/#admin-login" className="hover:text-amber-600 transition">Admin Panel</a>
            </div>

            <h3 className="text-lg font-bold mb-4 font-display">Subscribe to offers</h3>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white text-gray-800 px-4 py-2 rounded focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded transition"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">No spam — only occasional offers and booking updates.</p>
          </div>

          {/* Right Section: Socials & Contact Card */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-display">Connect with us</h3>
            <div className="flex space-x-4 mb-8">
              <a href="#!" className="w-10 h-10 bg-gray-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#!" className="w-10 h-10 bg-gray-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#!" className="w-10 h-10 bg-gray-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition">
                <i className="fab fa-twitter"></i>
              </a>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-lg mb-6 shadow-lg">
              <p className="text-sm text-gray-400 mb-2">Need help with a booking or order?</p>
              <p className="text-amber-500 font-bold text-xl">+91 11 1234 5678</p>
              <p className="text-xs text-gray-500">Available 24/7 Service</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2025 Jhankar Hotel. All rights reserved.</p>
          <p>
            Crafted with <i className="fas fa-heart text-red-500 mx-1"></i> — 
            {/* Changed from Link to Anchor jumping to #admin-login */}
            <a href="/#admin-login" className="text-amber-600 hover:underline ml-1">Admin Panel</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;