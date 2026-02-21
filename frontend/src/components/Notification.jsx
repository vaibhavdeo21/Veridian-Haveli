import React, { useEffect, useState } from 'react';

const Notification = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); 
    }, 4000); // Increased slightly for premium readability

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  // Design System Classes
  const baseClasses = 'fixed top-24 right-6 p-5 rounded-xl shadow-2xl z-[200] transition-all duration-500 transform border';
  
  const typeClasses = {
    success: 'bg-[#ecfdf5] text-haveli-primary border-haveli-primary/20', // Emerald Soft
    error: 'bg-[#fef2f2] text-red-700 border-red-200',                  // Red Soft
    info: 'bg-haveli-section text-haveli-heading border-haveli-border',  // Heritage Cream
  };

  const iconClasses = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-crown', // Luxury info icon
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* FIXED: Using fas prefix to ensure icons don't show as 'x' */}
        <i className={`fas ${iconClasses[type]} text-lg`}></i>
        <div className="flex flex-col">
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-0.5">System Message</span>
           <span className="text-sm font-medium tracking-wide">{message}</span>
        </div>
      </div>
      
      {/* Decorative Golden Line at the bottom */}
      <div className="absolute bottom-0 left-0 h-1 bg-haveli-accent rounded-b-xl opacity-40 transition-all duration-[4000ms] ease-linear" style={{ width: visible ? '100%' : '0%' }}></div>
    </div>
  );
};

export default Notification;