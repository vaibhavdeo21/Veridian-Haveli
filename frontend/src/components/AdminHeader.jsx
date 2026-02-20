import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext.jsx'; // FIX: Import live feed context

// NEW: Accept toggleSidebar as a prop
const AdminHeader = ({ toggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { liveFeed, clearFeed } = useNotification(); // FIX: Access real-time data

  return (
    <header className="fixed top-0 left-0 right-0 bg-white text-gray-800 shadow-md z-50 px-4 md:px-6 transition-all duration-300">
      <div className="grid grid-cols-3 items-center h-16">
        
        {/* 1. Left Section: Hamburger Menu + Exact Logo Styling */}
        <div className="flex items-center justify-start space-x-3">
          
          {/* NEW: Hamburger Button */}
          <button 
            onClick={toggleSidebar} 
            className="text-gray-500 hover:text-[#a35d14] focus:outline-none p-2 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-[#a35d14] text-white w-9 h-9 rounded-md flex items-center justify-center font-bold text-lg">
              JH
            </div>
            <span className="text-xl font-serif font-bold text-[#63320c] hidden sm:block">
              Jhankar Hotel
            </span>
          </Link>
        </div>

        {/* 2. Center Section: Admin Dashboard Title */}
        <div className="flex items-center justify-center">
          <span className="text-sm font-black text-[#a35d14] uppercase tracking-widest text-center hidden md:block">
            Hotel Admin Dashboard
          </span>
        </div>
        
        {/* 3. Right Section: Navigation & Notifications */}
        <div className="flex items-center justify-end space-x-6">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#a35d14] transition hidden md:block">
            Home Page
          </Link>
          <a href="/#about" className="text-sm font-medium text-gray-600 hover:text-[#a35d14] transition hidden md:block">
            About Page
          </a>
          
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition relative"
            >
              <i className="fas fa-bell text-xl"></i>
              {/* FIX: Badge now shows real notification count */}
              {liveFeed.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {liveFeed.length}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown: Now using liveFeed state */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-82 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                <div className="py-3 px-4 bg-gray-50 border-b flex justify-between items-center">
                  <span className="font-bold text-xs uppercase text-gray-400">Live Activity Feed</span>
                  {liveFeed.length > 0 && (
                    <button 
                      onClick={clearFeed}
                      className="text-[10px] font-bold text-amber-700 hover:underline uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                  {liveFeed.length > 0 ? (
                    liveFeed.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-orange-50 cursor-pointer transition">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-gray-800">{item.title}</p>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">{item.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <i className="fas fa-bell-slash text-gray-200 text-3xl mb-2"></i>
                      <p className="text-xs text-gray-400">No recent activity to show</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;