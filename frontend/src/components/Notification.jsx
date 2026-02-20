import React, { useEffect, useState } from 'react';

const Notification = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const baseClasses = 'fixed top-20 right-6 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform';
  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const iconClasses = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-center">
        <i className={`fas ${iconClasses[type]} mr-2`}></i>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Notification;