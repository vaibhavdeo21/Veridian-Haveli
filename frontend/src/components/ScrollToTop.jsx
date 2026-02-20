import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      id="scrollTop"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 bg-amber-600 hover:bg-amber-700 text-white w-12 h-12 rounded-full shadow-lg items-center justify-center transition-opacity duration-300 z-40 ${
        isVisible ? 'flex' : 'hidden'
      }`}
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
};

export default ScrollToTop;