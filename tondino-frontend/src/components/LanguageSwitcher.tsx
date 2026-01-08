import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
      aria-label={i18n.language === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
      title={i18n.language === 'fa' ? 'EN' : 'FA'}
    >
      <Globe size={20} />
    </button>
  );
};

export default LanguageSwitcher;
