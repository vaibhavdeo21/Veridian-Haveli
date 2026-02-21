import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Logic to show button after scrolling 300px
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
      aria-label="Scroll to top"
      className={`fixed bottom-8 right-8 bg-haveli-deep hover:bg-haveli-primary text-haveli-accent hover:text-white w-12 h-12 rounded-full shadow-2xl items-center justify-center transition-all duration-500 z-[60] border border-haveli-accent/30 group active:scale-95 ${
        isVisible ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-10'
      }`}
    >
      {/* Decorative inner ring */}
      <div className="absolute inset-1 rounded-full border border-haveli-accent/10 pointer-events-none"></div>
      
      <i className="fas fa-chevron-up transition-transform group-hover:-translate-y-1"></i>
    </button>
  );
};

export default ScrollToTop;