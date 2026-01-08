import React, { useState, useEffect } from 'react';
import IconWrapper from './IconWrapper';

const ScrollToTop: React.FC = () => {
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
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 left-4 lg:bottom-8 z-50 w-12 h-12 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary/90 transition-all duration-300 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <IconWrapper className="fa-solid fa-arrow-up" fa="fa-arrow-up" />
    </button>
  );
};

export default ScrollToTop;
