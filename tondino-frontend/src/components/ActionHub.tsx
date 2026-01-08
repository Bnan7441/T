
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@/context/UIContext';
import Icon from './Icon';

const ActionHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const { setIsChatOpen } = useUI();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsScrollVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-6 lg:bottom-8 lg:right-8 z-[70] flex flex-col items-center gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3"
          >
            {/* Support Options */}
            <button onClick={() => window.open('https://wa.me/YOUR_NUMBER', '_blank')} className="w-12 h-12 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all">
              <Icon fa="fa-whatsapp" />
            </button>
            <button onClick={() => setIsChatOpen(true)} className="w-12 h-12 rounded-full bg-brand-accent text-white shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all">
              <Icon fa="fa-comments" />
            </button>
            {/* Scroll to Top Option inside Menu */}
            {isScrollVisible && (
              <button 
                  onClick={scrollToTop}
                  className="w-12 h-12 rounded-full bg-white text-brand-primary shadow-lg border border-gray-100 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all"
               >
                <Icon fa="fa-arrow-up" />
               </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-xl transition-all active:scale-90 ${isOpen ? 'bg-brand-primary rotate-45' : 'bg-brand-primary hover:bg-brand-primaryDark'}`}
      >
        <Icon fa={isOpen ? 'fa-plus' : 'fa-headset'} />
      </button>
    </div>
  );
};

export default ActionHub;
