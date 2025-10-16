import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ukUA from './locales/uk-UA.json';
import enUS from './locales/en-US.json';

/**
 * i18n конфігурація для CYBER-ACE модуля
 */
i18n.use(initReactI18next).init({
  resources: {
    'uk-UA': {
      translation: ukUA
    },
    'en-US': {
      translation: enUS
    }
  },
  lng: localStorage.getItem('cyber-ace-language') || 'uk-UA', // Українська за замовчуванням
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false // Вимикаємо Suspense для запобігання білому екрану
  }
});

// Зберігати мову при зміні
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('cyber-ace-language', lng);
  document.documentElement.lang = lng;
});

export default i18n;
