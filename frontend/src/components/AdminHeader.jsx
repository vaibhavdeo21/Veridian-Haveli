import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext.jsx'; 

const AdminHeader = ({ toggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { liveFeed, clearFeed } = useNotification(); 

  return (
    <header className="fixed top-0 left-0 right-0 bg-haveli-card border-b border-haveli-border shadow-sm z-[100] px-4 md:px-6 transition-all duration-300 h-16 flex items-center gold-shimmer active">
      <div className="grid grid-cols-3 items-center w-full">
        
        <div className="flex items-center justify-start space-x-4">
          <button 
            onClick={toggleSidebar} 
            className="text-haveli-muted hover:text-haveli-primary focus:outline-none p-2 rounded-xl hover:bg-haveli-section transition-colors"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          <Link to="/admin" className="flex items-center group relative">
            {/* Glow Background */}
            <div className="absolute -inset-2 rounded-full bg-haveli-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            {/* Royal Seal Monogram */}
            <div className="bg-haveli-deep text-haveli-accent w-9 h-9 rounded-full flex items-center justify-center font-display font-medium text-base border border-haveli-accent/30 shadow-inner relative">
              <i className="fas fa-crown text-[6px] absolute -top-1 text-haveli-accent opacity-80"></i>
              VH
            </div>
            
            {/* Vertical Divider Line */}
            <div className="h-6 w-px bg-haveli-accent/40 mx-3 hidden sm:block"></div>
            
            {/* Refined Typography */}
            <div className="flex flex-col justify-center leading-none">
              <span className="text-sm sm:text-base font-bold font-display text-haveli-heading tracking-widest uppercase">
                Veridian Haveli
              </span>
              <span className="text-[8px] font-medium text-haveli-accent tracking-[0.2em] uppercase mt-0.5 hidden sm:block">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-[10px] font-black text-haveli-primary uppercase tracking-[0.3em] text-center hidden md:block bg-haveli-section border border-haveli-border px-4 py-1 rounded-full">
            Hotel Management Dashboard
          </span>
        </div>
        
        <div className="flex items-center justify-end space-x-6">
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2.5 rounded-xl text-haveli-muted hover:bg-haveli-section transition-all relative border border-transparent hover:border-haveli-border"
            >
              <i className="fas fa-bell text-lg"></i>
              {liveFeed.length > 0 && (
                <span className="absolute top-1 right-1 bg-haveli-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm ring-2 ring-white">
                  {liveFeed.length}
                </span>
              )}
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-haveli-card rounded-xl shadow-2xl overflow-hidden z-50 border border-haveli-border animate-fadeIn">
                <div className="py-3 px-5 bg-haveli-section border-b border-haveli-border flex justify-between items-center">
                  <span className="font-bold text-[10px] uppercase text-haveli-muted tracking-widest">Live Activity Feed</span>
                  {liveFeed.length > 0 && (
                    <button 
                      onClick={clearFeed}
                      className="text-[9px] font-bold text-haveli-primary hover:text-haveli-deep uppercase tracking-tighter"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="divide-y divide-haveli-border max-h-80 overflow-y-auto">
                  {liveFeed.length > 0 ? (
                    liveFeed.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-haveli-section cursor-pointer transition">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-haveli-heading">{item.title}</p>
                          <span className="text-[8px] font-bold text-haveli-accent bg-haveli-section border border-haveli-border px-1.5 py-0.5 rounded uppercase">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-haveli-body leading-relaxed font-light">{item.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <i className="fas fa-bell-slash text-haveli-border text-4xl mb-4"></i>
                      <p className="text-xs text-haveli-muted font-light">No recent activity to show</p>
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