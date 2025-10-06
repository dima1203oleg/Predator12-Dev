import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import uaTranslations from './ua.json';
import enTranslations from './en.json';
const I18nContext = createContext(null);
export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
};
const translations = {
    UA: uaTranslations,
    EN: enTranslations
};
export const I18nProvider = ({ children, defaultLanguage = 'UA' }) => {
    const [language, setLanguage] = useState(() => {
        // Зберігаємо вибір мови в localStorage
        const saved = localStorage.getItem('nexus_language');
        return saved || defaultLanguage;
    });
    // Функція для отримання перекладу по ключу з підтримкою вкладених об'єктів
    const t = (key, fallbackOrParams, params) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                // Fallback на англійську
                let fallbackValue = translations['EN'];
                for (const fk of keys) {
                    if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
                        fallbackValue = fallbackValue[fk];
                    }
                    else {
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
    const value = {
        language,
        setLanguage,
        t,
        translations: translations[language]
    };
    return (_jsx(I18nContext.Provider, { value: value, children: children }));
};
// Хук для легкого використання перекладів
export const useTranslation = () => {
    const { t, language, setLanguage } = useI18n();
    return { t, language, setLanguage };
};
// Компонент для перемикача мови
export const LanguageSwitcher = ({ className = '', variant = 'toggle' }) => {
    const { language, setLanguage } = useI18n();
    if (variant === 'toggle') {
        return (_jsx("button", { className: `language-switcher ${className}`, onClick: () => setLanguage(language === 'UA' ? 'EN' : 'UA'), style: {
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }, children: language }));
    }
    return (_jsxs("select", { className: className, value: language, onChange: (e) => setLanguage(e.target.value), style: {
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            padding: '4px 8px',
            fontSize: '0.8rem'
        }, children: [_jsx("option", { value: "UA", children: "\uD83C\uDDFA\uD83C\uDDE6 UA" }), _jsx("option", { value: "EN", children: "\uD83C\uDDEC\uD83C\uDDE7 EN" })] }));
};
export default I18nProvider;
