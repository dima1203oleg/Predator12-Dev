import React, { createContext, useContext, useState, useEffect } from 'react';
import uaTranslations from './ua.json';
import enTranslations from './en.json';

type Language = 'UA' | 'EN';
type Translations = typeof uaTranslations;

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Allow either (key), (key, params), (key, fallback), (key, fallback, params)
  t: (key: string, fallbackOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

const translations: Record<Language, Translations> = {
  UA: uaTranslations,
  EN: enTranslations
};

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage = 'UA'
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Зберігаємо вибір мови в localStorage
    const saved = localStorage.getItem('nexus_language') as Language;
    return saved || defaultLanguage;
  });

  // Функція для отримання перекладу по ключу з підтримкою вкладених об'єктів
  const t = (key: string, fallbackOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback на англійську
        let fallbackValue: any = translations['EN'];
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            // Якщо передано текст за замовчуванням як другий аргумент
            if (typeof fallbackOrParams === 'string') {
              return fallbackOrParams;
            }
            return `[${key}]`;
          }
        }
        value = fallbackValue;
        break;
      }
    }

    if (typeof value !== 'string') {
      if (typeof fallbackOrParams === 'string') {
        return fallbackOrParams;
      }
      return `[${key}]`;
    }

    // Визначаємо params залежно від того, що прийшло другим/третім аргументом
    const interpolationParams = (typeof fallbackOrParams === 'object' && fallbackOrParams !== null)
      ? fallbackOrParams
      : (params || undefined);

    if (interpolationParams) {
      return value.replace(/\$\{(\w+)\}|\{\{(\w+)\}\}/g, (match, p1, p2) => {
        const key = p1 || p2;
        const replacement = interpolationParams[key];
        return (replacement !== undefined && replacement !== null) ? String(replacement) : match;
      });
    }

    return value;
  };

  // Зберігаємо мову при зміні
  useEffect(() => {
    localStorage.setItem('nexus_language', language);
    
    // Можемо також оновити HTML lang атрибут
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const value: I18nContextValue = {
    language,
    setLanguage,
    t,
    translations: translations[language]
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Хук для легкого використання перекладів
export const useTranslation = () => {
  const { t, language, setLanguage } = useI18n();
  return { t, language, setLanguage };
};

// Компонент для перемикача мови
export const LanguageSwitcher: React.FC<{
  className?: string;
  variant?: 'button' | 'select' | 'toggle';
}> = ({ 
  className = '', 
  variant = 'toggle' 
}) => {
  const { language, setLanguage } = useI18n();
  
  if (variant === 'toggle') {
    return (
      <button
        className={`language-switcher ${className}`}
        onClick={() => setLanguage(language === 'UA' ? 'EN' : 'UA')}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          padding: '4px 8px',
          fontSize: '0.8rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {language}
      </button>
    );
  }

  return (
    <select
      className={className}
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      style={{
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        color: '#fff',
        padding: '4px 8px',
        fontSize: '0.8rem'
      }}
    >
      <option value="UA">🇺🇦 UA</option>
      <option value="EN">🇬🇧 EN</option>
    </select>
  );
};

export default I18nProvider;
