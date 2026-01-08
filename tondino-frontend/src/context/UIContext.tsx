import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UIContextType {
  isMenuOpen: boolean;
  setIsMenuOpen: (v: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (v: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  activePage: string;
  setActivePage: (p: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (v: boolean) => void;
  isSpeedFocusTestOpen: boolean;
  setIsSpeedFocusTestOpen: (v: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  activeCategory: string | null;
  setActiveCategory: (c: string | null) => void;
  activeAgeGroup: any | null;
  setActiveAgeGroup: (g: any | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSpeedFocusTestOpen, setIsSpeedFocusTestOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeAgeGroup, setActiveAgeGroup] = useState<any | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
    } catch {}
    return false;
  });

  useEffect(() => {
    try { document.documentElement.classList.toggle('dark', isDarkMode); } catch {}
    try { localStorage.setItem('theme', isDarkMode ? 'dark' : 'light'); } catch {}
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(v => !v);

  return (
    <UIContext.Provider value={{
      isMenuOpen, setIsMenuOpen,
      isSearchOpen, setIsSearchOpen,
      isNotificationsOpen, setIsNotificationsOpen,
      isChatOpen, setIsChatOpen,
      activePage, setActivePage,
      isAuthModalOpen, setIsAuthModalOpen,
      isSpeedFocusTestOpen, setIsSpeedFocusTestOpen,
      isDarkMode, toggleTheme,
      activeCategory, setActiveCategory,
      activeAgeGroup, setActiveAgeGroup
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
