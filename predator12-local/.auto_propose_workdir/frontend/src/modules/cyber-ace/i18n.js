"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const react_i18next_1 = require("react-i18next");
const uk_UA_json_1 = __importDefault(require("./locales/uk-UA.json"));
const en_US_json_1 = __importDefault(require("./locales/en-US.json"));
/**
 * i18n конфігурація для CYBER-ACE модуля
 */
i18next_1.default.use(react_i18next_1.initReactI18next).init({
    resources: {
        'uk-UA': {
            translation: uk_UA_json_1.default
        },
        'en-US': {
            translation: en_US_json_1.default
        }
    },
    lng: localStorage.getItem('cyber-ace-language') || 'uk-UA',
    fallbackLng: 'en-US',
    interpolation: {
        escapeValue: false
    },
    react: {
        useSuspense: false // Вимикаємо Suspense для запобігання білому екрану
    }
});
// Зберігати мову при зміні
i18next_1.default.on('languageChanged', (lng) => {
    localStorage.setItem('cyber-ace-language', lng);
    document.documentElement.lang = lng;
});
exports.default = i18next_1.default;
