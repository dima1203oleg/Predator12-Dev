"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageSwitcher = exports.useTranslation = exports.I18nProvider = exports.useI18n = void 0;
const react_1 = __importStar(require("react"));
const ua_json_1 = __importDefault(require("./ua.json"));
const en_json_1 = __importDefault(require("./en.json"));
const I18nContext = (0, react_1.createContext)(null);
const useI18n = () => {
    const context = (0, react_1.useContext)(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
};
exports.useI18n = useI18n;
const translations = {
    UA: ua_json_1.default,
    EN: en_json_1.default
};
const I18nProvider = ({ children, defaultLanguage = 'UA' }) => {
    const [language, setLanguage] = (0, react_1.useState)(() => {
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
    (0, react_1.useEffect)(() => {
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
    return (<I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>);
};
exports.I18nProvider = I18nProvider;
// Хук для легкого використання перекладів
const useTranslation = () => {
    const { t, language, setLanguage } = (0, exports.useI18n)();
    return { t, language, setLanguage };
};
exports.useTranslation = useTranslation;
// Компонент для перемикача мови
const LanguageSwitcher = ({ className = '', variant = 'toggle' }) => {
    const { language, setLanguage } = (0, exports.useI18n)();
    if (variant === 'toggle') {
        return (<button className={`language-switcher ${className}`} onClick={() => setLanguage(language === 'UA' ? 'EN' : 'UA')} style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}>
        {language}
      </button>);
    }
    return (<select className={className} value={language} onChange={(e) => setLanguage(e.target.value)} style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            padding: '4px 8px',
            fontSize: '0.8rem'
        }}>
      <option value="UA">🇺🇦 UA</option>
      <option value="EN">🇬🇧 EN</option>
    </select>);
};
exports.LanguageSwitcher = LanguageSwitcher;
exports.default = exports.I18nProvider;
