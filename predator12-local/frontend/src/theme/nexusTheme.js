"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nexusTheme = exports.nexusColors = void 0;
const styles_1 = require("@mui/material/styles");
// Nexus Core Color Palette
exports.nexusColors = {
    // Backgrounds
    void: '#000000',
    obsidian: '#0F121A',
    darkMatter: '#1A1D2E',
    // Neon Accents
    emerald: '#00FFC6',
    sapphire: '#0A75FF',
    amethyst: '#A020F0',
    crimson: '#FF0033',
    // Text
    frost: '#F0F8FF',
    nebula: '#C5D1E6',
    shadow: '#7A8B9A',
    // Special Effects
    quantum: 'rgba(0, 255, 198, 0.3)',
    hologram: 'rgba(10, 117, 255, 0.2)',
    energy: 'rgba(160, 32, 240, 0.4)',
    // Status
    success: '#00FF88',
    warning: '#FFB800',
    error: '#FF0033',
    info: '#0A75FF',
    // Modern structure for theme usage
    primary: {
        main: '#00FFC6',
        dark: '#00CC9F',
        light: '#33FFD1',
    },
    secondary: {
        main: '#0A75FF',
        dark: '#0856CC',
        light: '#3D8EFF',
    },
    accent: {
        main: '#A020F0',
        dark: '#7B1FA2',
        light: '#D1A3FF',
    },
    text: {
        primary: '#F0F8FF',
        secondary: '#C5D1E6',
        disabled: '#7A8B9A',
    },
};
exports.nexusTheme = (0, styles_1.createTheme)({
    palette: {
        mode: 'dark',
        primary: {
            main: exports.nexusColors.emerald,
            dark: '#00CC9F',
            light: '#33FFD1',
        },
        secondary: {
            main: exports.nexusColors.sapphire,
            dark: '#0856CC',
            light: '#3D8EFF',
        },
        background: {
            default: exports.nexusColors.void,
            paper: exports.nexusColors.obsidian,
        },
        text: {
            primary: exports.nexusColors.frost,
            secondary: exports.nexusColors.nebula,
            disabled: exports.nexusColors.shadow,
        },
        error: {
            main: exports.nexusColors.crimson,
        },
        warning: {
            main: exports.nexusColors.warning,
        },
        info: {
            main: exports.nexusColors.sapphire,
        },
        success: {
            main: exports.nexusColors.success,
        },
    },
    typography: {
        fontFamily: [
            'Orbitron',
            'Fira Code',
            'Hack',
            'Monaco',
            'Consolas',
            'monospace',
        ].join(','),
        h1: {
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            fontSize: '2.5rem',
            textShadow: `0 0 10px ${exports.nexusColors.emerald}`,
            letterSpacing: '0.1em',
        },
        h2: {
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 600,
            fontSize: '2rem',
            textShadow: `0 0 8px ${exports.nexusColors.sapphire}`,
            letterSpacing: '0.08em',
        },
        h3: {
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 500,
            fontSize: '1.5rem',
            textShadow: `0 0 6px ${exports.nexusColors.amethyst}`,
            letterSpacing: '0.06em',
        },
        body1: {
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.95rem',
            lineHeight: 1.6,
        },
        body2: {
            fontFamily: 'Hack, monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
        },
        button: {
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    border: `1px solid ${exports.nexusColors.emerald}`,
                    background: `linear-gradient(45deg, ${exports.nexusColors.quantum}, transparent)`,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: `0 0 20px ${exports.nexusColors.emerald}`,
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: `linear-gradient(135deg, ${exports.nexusColors.obsidian}CC, ${exports.nexusColors.darkMatter}99)`,
                    backdropFilter: 'blur(15px)',
                    border: `1px solid ${exports.nexusColors.quantum}`,
                    borderRadius: '12px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: `linear-gradient(135deg, ${exports.nexusColors.obsidian}E6, ${exports.nexusColors.darkMatter}B3)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${exports.nexusColors.hologram}`,
                    borderRadius: '16px',
                    boxShadow: `0 8px 32px ${exports.nexusColors.quantum}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 48px ${exports.nexusColors.energy}`,
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        background: `${exports.nexusColors.darkMatter}80`,
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                            borderColor: exports.nexusColors.quantum,
                        },
                        '&:hover fieldset': {
                            borderColor: exports.nexusColors.emerald,
                            boxShadow: `0 0 10px ${exports.nexusColors.emerald}30`,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: exports.nexusColors.emerald,
                            boxShadow: `0 0 15px ${exports.nexusColors.emerald}50`,
                        },
                    },
                },
            },
        },
    },
});
