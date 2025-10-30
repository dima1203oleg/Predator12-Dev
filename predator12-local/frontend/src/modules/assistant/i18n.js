"use strict";
/**
 * i18n Configuration for AI Assistant
 * Default language: Ukrainian (uk-UA)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const react_i18next_1 = require("react-i18next");
const uk_UA_json_1 = __importDefault(require("./locales/uk-UA.json"));
const en_US_json_1 = __importDefault(require("./locales/en-US.json"));
// Initialize i18n with Ukrainian as default
i18next_1.default
    .use(react_i18next_1.initReactI18next)
    .init({
    resources: {
        uk: { translation: uk_UA_json_1.default },
        en: { translation: en_US_json_1.default },
    },
    lng: 'uk',
    fallbackLng: 'uk',
    interpolation: {
        escapeValue: false, // React already escapes
    },
    react: {
        useSuspense: false, // Avoid suspense issues
    },
    debug: process.env.NODE_ENV === 'development',
});
exports.default = i18next_1.default;
