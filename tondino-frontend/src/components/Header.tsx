import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { setIsSearchOpen, setIsAuthModalOpen, isDarkMode, toggleTheme } = useUI();
  const { isAuthenticated, userProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev;
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-white/40 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20" dir="rtl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl font-black text-brand-primary dark:text-white">تندینو</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary rounded-lg sm:rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg sm:text-xl italic">T</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <Link to="/" className="nav-link text-sm lg:text-base">
              {t('header.home')}
            </Link>
            <Link to="/courses" className="nav-link text-sm lg:text-base">
              {t('header.courses')}
            </Link>
            <Link to="/club" className="nav-link text-sm lg:text-base">
              {t('header.club')}
            </Link>
            <Link to="/blog" className="nav-link text-sm lg:text-base">
              {t('header.blog')}
            </Link>
            <Link to="/about" className="nav-link text-sm lg:text-base">
              {t('header.about')}
            </Link>
          </nav>

          {/* Mobile hamburger (below md) */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              data-testid="header-search-button"
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
            >
              {isDarkMode ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
            </button>

            <LanguageSwitcher />

            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center gap-2">
                <img src={userProfile?.avatar} loading="lazy" decoding="async" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-brand-primary" alt={`پروفایل ${userProfile?.name || 'کاربر'}`} />
              </Link>
            ) : (
              <button
                data-testid="header-login-button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 sm:px-6 py-2 text-xs sm:text-sm bg-brand-primary text-white rounded-full font-black hover:bg-brand-primary/90 transition-colors active:scale-95 min-h-[40px] sm:min-h-[44px]"
              >
                {t('header.loginSignup')}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu drawer */}
      {menuOpen && (
        <div id="mobile-menu" role="menu" tabIndex={0} className="md:hidden border-t border-white/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 dark:text-gray-300 font-bold py-2">{t('header.home')}</Link>
            <Link to="/courses" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 dark:text-gray-300 font-bold py-2">{t('header.courses')}</Link>
            <Link to="/club" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 dark:text-gray-300 font-bold py-2">{t('header.club')}</Link>
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 dark:text-gray-300 font-bold py-2">{t('header.blog')}</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 dark:text-gray-300 font-bold py-2">{t('header.about')}</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
