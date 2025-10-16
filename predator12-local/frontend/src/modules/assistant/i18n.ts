/**
 * i18n Configuration for AI Assistant
 * Default language: Ukrainian (uk-UA)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ukUA from './locales/uk-UA.json';
import enUS from './locales/en-US.json';

// Initialize i18n with Ukrainian as default
i18n
  .use(initReactI18next)
  .init({
    resources: {
      uk: { translation: ukUA },
      en: { translation: enUS },
    },
    lng: 'uk', // Головна мова — українська
    fallbackLng: 'uk', // Fallback теж українська
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Avoid suspense issues
    },
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
