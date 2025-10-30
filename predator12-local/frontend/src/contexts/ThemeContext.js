"use strict";
/**
 * 🎨 THEME CONTEXT
 *
 * React контекст для управління темами в додатку
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onThemeChange = exports.getCurrentThemeId = exports.useNexusTheme = exports.NexusThemeProvider = void 0;
const react_1 = __importStar(require("react"));
const styles_1 = require("@mui/material/styles");
const material_1 = require("@mui/material");
const themes_1 = require("../theme/themes");
// ============= CONTEXT =============
const ThemeContext = (0, react_1.createContext)(undefined);
// ============= STORAGE KEY =============
const THEME_STORAGE_KEY = 'predator12-theme';
const NexusThemeProvider = ({ children, defaultThemeId, }) => {
    // Initialize theme from localStorage or default
    const [currentThemeId, setCurrentThemeId] = (0, react_1.useState)(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored)
                return stored;
        }
        return defaultThemeId || (0, themes_1.getDefaultTheme)().id;
    });
    // Get current theme config
    const currentTheme = (0, react_1.useMemo)(() => {
        return (0, themes_1.getThemeById)(currentThemeId) || (0, themes_1.getDefaultTheme)();
    }, [currentThemeId]);
    // Create MUI theme
    const muiTheme = (0, react_1.useMemo)(() => {
        return (0, themes_1.createNexusTheme)(currentTheme);
    }, [currentTheme]);
    // Save theme to localStorage when it changes
    (0, react_1.useEffect)(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, currentThemeId);
            // Emit custom event for theme change
            window.dispatchEvent(new CustomEvent('theme-changed', {
                detail: { themeId: currentThemeId, theme: currentTheme },
            }));
        }
    }, [currentThemeId, currentTheme]);
    // Set theme by ID
    const setTheme = (themeId) => {
        const theme = (0, themes_1.getThemeById)(themeId);
        if (theme) {
            setCurrentThemeId(themeId);
        }
        else {
            console.warn(`Theme with id "${themeId}" not found`);
        }
    };
    // Toggle between dark and light themes
    const toggleTheme = () => {
        const newType = currentTheme.type === 'dark' ? 'light' : 'dark';
        // Find first theme of opposite type
        const oppositeTheme = [
            (0, themes_1.getThemeById)('dark-cyber'),
            (0, themes_1.getThemeById)('light'),
        ].find(t => (t === null || t === void 0 ? void 0 : t.type) === newType);
        if (oppositeTheme) {
            setCurrentThemeId(oppositeTheme.id);
        }
    };
    const contextValue = {
        currentTheme,
        currentThemeId,
        setTheme,
        toggleTheme,
        colors: currentTheme.colors,
    };
    return (<ThemeContext.Provider value={contextValue}>
      <styles_1.ThemeProvider theme={muiTheme}>
        <material_1.CssBaseline />
        {children}
      </styles_1.ThemeProvider>
    </ThemeContext.Provider>);
};
exports.NexusThemeProvider = NexusThemeProvider;
// ============= HOOK =============
const useNexusTheme = () => {
    const context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error('useNexusTheme must be used within NexusThemeProvider');
    }
    return context;
};
exports.useNexusTheme = useNexusTheme;
// ============= UTILITIES =============
/**
 * Get current theme ID from localStorage
 */
const getCurrentThemeId = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(THEME_STORAGE_KEY);
    }
    return null;
};
exports.getCurrentThemeId = getCurrentThemeId;
/**
 * Listen to theme changes
 */
const onThemeChange = (callback) => {
    if (typeof window === 'undefined') {
        return () => { };
    }
    const handler = (event) => {
        const customEvent = event;
        callback(customEvent.detail.theme);
    };
    window.addEventListener('theme-changed', handler);
    return () => {
        window.removeEventListener('theme-changed', handler);
    };
};
exports.onThemeChange = onThemeChange;
// ============= EXPORTS =============
exports.default = exports.NexusThemeProvider;
