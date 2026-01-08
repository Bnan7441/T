import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fa from './locales/fa/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fa: { translation: fa },
      en: { translation: en }
    },
    fallbackLng: 'fa',
    supportedLngs: ['fa', 'en'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', lng === 'fa' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
