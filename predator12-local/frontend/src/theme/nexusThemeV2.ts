/**
 * 🎨 NEXUS THEME V2 - DARK CYBER THEME
 *
 * Темна тема на основі порту 3000 з підтримкою множинних варіантів
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

// ============= КОЛІРНІ ПАЛІТРИ =============

// Основна темна палітра (як порт 3000)
export const nexusColorsDark = {
  // Background
  background: {
    default: '#0a0e1a',      // Глибокий темно-синій
    paper: '#111827',        // Темно-сірий
    elevated: '#1a1f35',     // Піднесений елемент
  },

  // Primary colors
  primary: {
    main: '#00f2ff',         // Яскравий cyan
    light: '#33f4ff',
    dark: '#00b8c4',
    glow: 'rgba(0, 242, 255, 0.3)'
  },

  // Secondary colors
  secondary: {
    main: '#8a2be2',         // Фіолетовий
    light: '#a855f7',
    dark: '#6b21a8',
    glow: 'rgba(138, 43, 226, 0.3)'
  },

  // Accent colors
  accent: {
    cyan: '#00f2ff',
    purple: '#8a2be2',
    pink: '#ff006e',
    green: '#00ff88',
    yellow: '#ffd700',
    orange: '#ff7b00'
  },

  // Status colors
  status: {
    success: '#00ff88',
    warning: '#ffd700',
    error: '#ff006e',
    info: '#00f2ff'
  },

  // Text colors
  text: {
    primary: '#e4e4e7',      // Світло-сірий
    secondary: '#a1a1aa',    // Сірий
    disabled: '#52525b',     // Темно-сірий
    glow: '#00f2ff'
  },

  // Border colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    heavy: 'rgba(0, 242, 255, 0.5)'
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #00f2ff 0%, #8a2be2 100%)',
    secondary: 'linear-gradient(135deg, #8a2be2 0%, #ff006e 100%)',
    success: 'linear-gradient(135deg, #00ff88 0%, #00f2ff 100%)',
    danger: 'linear-gradient(135deg, #ff006e 0%, #ff7b00 100%)',
  }
};

// Світла тема (другорядна)
export const nexusColorsLight = {
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    elevated: '#f1f5f9',
  },
  primary: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
    glow: 'rgba(14, 165, 233, 0.3)'
  },
  secondary: {
    main: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.3)'
  },
  accent: {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316'
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#cbd5e1',
    glow: '#0ea5e9'
  },
  border: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    heavy: 'rgba(14, 165, 233, 0.3)'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
  }
};

// ============= MUI THEME CONFIGURATION =============

export const createNexusTheme = (mode: 'dark' | 'light' = 'dark') => {
  const colors = mode === 'dark' ? nexusColorsDark : nexusColorsLight;

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
      },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
      success: {
        main: colors.status.success,
      },
      warning: {
        main: colors.status.warning,
      },
      error: {
        main: colors.status.error,
      },
      info: {
        main: colors.status.info,
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontFamily: "'Orbitron', monospace",
        fontWeight: 700,
      },
      h2: {
        fontFamily: "'Orbitron', monospace",
        fontWeight: 700,
      },
      h3: {
        fontFamily: "'Orbitron', monospace",
        fontWeight: 600,
      },
      h4: {
        fontFamily: "'Orbitron', monospace",
        fontWeight: 600,
      },
      h5: {
        fontFamily: "'Orbitron', monospace",
        fontWeight: 500,
      },
      h6: {
        fontFamily: "'Orbitron', monospace",
        fontWeight: 500,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.background.paper,
            border: `1px solid ${colors.border.light}`,
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: colors.border.medium,
              boxShadow: `0 8px 32px ${colors.primary.glow}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          },
          contained: {
            background: colors.gradients.primary,
            color: '#ffffff',
            '&:hover': {
              background: colors.gradients.primary,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 24px ${colors.primary.glow}`,
            },
          },
          outlined: {
            borderColor: colors.border.medium,
            '&:hover': {
              borderColor: colors.primary.main,
              backgroundColor: colors.primary.glow,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: colors.border.medium,
              },
              '&:hover fieldset': {
                borderColor: colors.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary.main,
                boxShadow: `0 0 0 3px ${colors.primary.glow}`,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: colors.background.elevated,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: 16,
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
  };

  return createTheme(themeOptions);
};

// ============= EXPORT =============

export const nexusThemeDark = createNexusTheme('dark');
export const nexusThemeLight = createNexusTheme('light');

export default nexusThemeDark;
