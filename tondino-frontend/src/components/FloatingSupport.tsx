import React, { useState } from 'react';
import Icon from './Icon';

const FloatingSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 lg:bottom-8 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">پشتیبانی</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Icon fa="fa-times" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            چطور می‌توانیم به شما کمک کنیم؟
          </p>
          <div className="space-y-2">
              <a
              href="tel:+989123456789"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon fa="fa-phone" className="text-brand-primary" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">تماس تلفنی</span>
            </a>
            <a
              href="mailto:support@tondino.com"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon fa="fa-envelope" className="text-brand-primary" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">ایمیل</span>
            </a>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-accent text-white rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center"
        aria-label="Support"
      >
        <Icon fa="fa-headset" className="text-xl" />
      </button>
    </div>
  );
};

export default FloatingSupport;
