import React, { useState, useEffect } from 'react';

const ScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalHeight > 0) {
        setProgress((currentScroll / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[100] pointer-events-none bg-brand-primary/10 backdrop-blur-sm">
      <div 
        className="h-full bg-gradient-to-r from-brand-accent to-brand-accentDark shadow-glow transition-all duration-300 ease-out relative" 
        style={{ width: `${progress}%` }}
      >
        <div className="absolute top-0 right-0 h-full w-20 bg-white/20 blur-md"></div>
      </div>
    </div>
  );
};

export default ScrollProgress;