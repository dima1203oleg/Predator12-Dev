/**
 * 🎨 NEXUS MULTI-THEME SYSTEM
 *
 * Колекція тем для Predator12 Nexus Core V3
 * Підтримка динамічного переключення тем
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

// ============= ТИПИ =============

export interface ThemeColorPalette {
  background: {
    default: string;
    paper: string;
    elevated: string;
  };
  primary: {
    main: string;
    light: string;
    dark: string;
    glow: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    glow: string;
  };
  accent: {
    [key: string]: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    glow: string;
  };
  border: {
    light: string;
    medium: string;
    heavy: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  colors: ThemeColorPalette;
  type: 'dark' | 'light';
}

// ============= THEME 1: DARK CYBER =============

export const darkCyberTheme: ThemeConfig = {
  id: 'dark-cyber',
  name: 'Dark Cyber',
  description: 'Темна кіберпанк тема з cyan та purple акцентами',
  icon: '🌌',
  type: 'dark',
  colors: {
    background: {
      default: '#0a0e1a',
      paper: '#111827',
      elevated: '#1a1f35',
    },
    primary: {
      main: '#00f2ff',
      light: '#33f4ff',
      dark: '#00b8c4',
      glow: 'rgba(0, 242, 255, 0.3)'
    },
    secondary: {
      main: '#8a2be2',
      light: '#a855f7',
      dark: '#6b21a8',
      glow: 'rgba(138, 43, 226, 0.3)'
    },
    accent: {
      cyan: '#00f2ff',
      purple: '#8a2be2',
      pink: '#ff006e',
      green: '#00ff88',
      yellow: '#ffd700',
      orange: '#ff7b00'
    },
    status: {
      success: '#00ff88',
      warning: '#ffd700',
      error: '#ff006e',
      info: '#00f2ff'
    },
    text: {
      primary: '#e4e4e7',
      secondary: '#a1a1aa',
      disabled: '#52525b',
      glow: '#00f2ff'
    },
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      heavy: 'rgba(0, 242, 255, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00f2ff 0%, #8a2be2 100%)',
      secondary: 'linear-gradient(135deg, #8a2be2 0%, #ff006e 100%)',
      success: 'linear-gradient(135deg, #00ff88 0%, #00f2ff 100%)',
      danger: 'linear-gradient(135deg, #ff006e 0%, #ff7b00 100%)',
    }
  }
};

// ============= THEME 2: MATRIX =============

export const matrixTheme: ThemeConfig = {
  id: 'matrix',
  name: 'Matrix',
  description: 'Класична зелена матриця',
  icon: '🟢',
  type: 'dark',
  colors: {
    background: {
      default: '#0d0d0d',
      paper: '#1a1a1a',
      elevated: '#262626',
    },
    primary: {
      main: '#00ff41',
      light: '#39ff6f',
      dark: '#00cc34',
      glow: 'rgba(0, 255, 65, 0.4)'
    },
    secondary: {
      main: '#00cc34',
      light: '#00ff41',
      dark: '#009926',
      glow: 'rgba(0, 204, 52, 0.3)'
    },
    accent: {
      green: '#00ff41',
      lime: '#39ff14',
      emerald: '#00cc34',
      mint: '#98fb98',
      forest: '#228b22',
      neon: '#39ff6f'
    },
    status: {
      success: '#00ff41',
      warning: '#ffff00',
      error: '#ff0000',
      info: '#00cc34'
    },
    text: {
      primary: '#00ff41',
      secondary: '#00cc34',
      disabled: '#004d1a',
      glow: '#00ff41'
    },
    border: {
      light: 'rgba(0, 255, 65, 0.1)',
      medium: 'rgba(0, 255, 65, 0.3)',
      heavy: 'rgba(0, 255, 65, 0.6)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00ff41 0%, #00cc34 100%)',
      secondary: 'linear-gradient(135deg, #39ff14 0%, #00cc34 100%)',
      success: 'linear-gradient(135deg, #00ff41 0%, #98fb98 100%)',
      danger: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
    }
  }
};

// ============= THEME 3: SUNSET =============

export const sunsetTheme: ThemeConfig = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Тепла помаранчево-фіолетова гама',
  icon: '🌅',
  type: 'dark',
  colors: {
    background: {
      default: '#1a0f1f',
      paper: '#2a1838',
      elevated: '#3a2048',
    },
    primary: {
      main: '#ff6b35',
      light: '#ff8c5f',
      dark: '#e55525',
      glow: 'rgba(255, 107, 53, 0.4)'
    },
    secondary: {
      main: '#c44cff',
      light: '#d673ff',
      dark: '#a330e6',
      glow: 'rgba(196, 76, 255, 0.4)'
    },
    accent: {
      orange: '#ff6b35',
      coral: '#ff7f50',
      purple: '#c44cff',
      magenta: '#ff00ff',
      pink: '#ff69b4',
      amber: '#ffbf00'
    },
    status: {
      success: '#32cd32',
      warning: '#ffbf00',
      error: '#ff4444',
      info: '#ff6b35'
    },
    text: {
      primary: '#ffe4d6',
      secondary: '#d4a5a5',
      disabled: '#6b4848',
      glow: '#ff6b35'
    },
    border: {
      light: 'rgba(255, 107, 53, 0.15)',
      medium: 'rgba(255, 107, 53, 0.3)',
      heavy: 'rgba(255, 107, 53, 0.6)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ff6b35 0%, #c44cff 100%)',
      secondary: 'linear-gradient(135deg, #c44cff 0%, #ff00ff 100%)',
      success: 'linear-gradient(135deg, #32cd32 0%, #90ee90 100%)',
      danger: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
    }
  }
};

// ============= THEME 4: OCEAN =============

export const oceanTheme: ThemeConfig = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Глибокі сині відтінки океану',
  icon: '🌊',
  type: 'dark',
  colors: {
    background: {
      default: '#001220',
      paper: '#002030',
      elevated: '#003048',
    },
    primary: {
      main: '#00d4ff',
      light: '#33dfff',
      dark: '#00a8cc',
      glow: 'rgba(0, 212, 255, 0.4)'
    },
    secondary: {
      main: '#0099cc',
      light: '#33addb',
      dark: '#0077a3',
      glow: 'rgba(0, 153, 204, 0.4)'
    },
    accent: {
      cyan: '#00d4ff',
      azure: '#007fff',
      teal: '#008080',
      aqua: '#00ffff',
      navy: '#000080',
      sky: '#87ceeb'
    },
    status: {
      success: '#00ff88',
      warning: '#ffa500',
      error: '#ff6b6b',
      info: '#00d4ff'
    },
    text: {
      primary: '#e0f4ff',
      secondary: '#9dcfe6',
      disabled: '#4a6b7c',
      glow: '#00d4ff'
    },
    border: {
      light: 'rgba(0, 212, 255, 0.12)',
      medium: 'rgba(0, 212, 255, 0.25)',
      heavy: 'rgba(0, 212, 255, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
      secondary: 'linear-gradient(135deg, #007fff 0%, #00d4ff 100%)',
      success: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
      danger: 'linear-gradient(135deg, #ff6b6b 0%, #ff4444 100%)',
    }
  }
};

// ============= THEME 5: NEON TOKYO =============

export const neonTokyoTheme: ThemeConfig = {
  id: 'neon-tokyo',
  name: 'Neon Tokyo',
  description: 'Яскраві неонові кольори японських вулиць',
  icon: '🗼',
  type: 'dark',
  colors: {
    background: {
      default: '#0f0517',
      paper: '#1a0a2e',
      elevated: '#271542',
    },
    primary: {
      main: '#ff0099',
      light: '#ff33ad',
      dark: '#cc0077',
      glow: 'rgba(255, 0, 153, 0.5)'
    },
    secondary: {
      main: '#00ffff',
      light: '#33ffff',
      dark: '#00cccc',
      glow: 'rgba(0, 255, 255, 0.5)'
    },
    accent: {
      pink: '#ff0099',
      cyan: '#00ffff',
      yellow: '#ffff00',
      purple: '#bf00ff',
      green: '#00ff00',
      orange: '#ff6600'
    },
    status: {
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0099',
      info: '#00ffff'
    },
    text: {
      primary: '#ffffff',
      secondary: '#ccccff',
      disabled: '#6633cc',
      glow: '#ff0099'
    },
    border: {
      light: 'rgba(255, 0, 153, 0.2)',
      medium: 'rgba(255, 0, 153, 0.4)',
      heavy: 'rgba(255, 0, 153, 0.7)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ff0099 0%, #bf00ff 100%)',
      secondary: 'linear-gradient(135deg, #00ffff 0%, #bf00ff 100%)',
      success: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)',
      danger: 'linear-gradient(135deg, #ff0099 0%, #ff6600 100%)',
    }
  }
};

// ============= THEME 6: RETRO TERMINAL =============

export const retroTerminalTheme: ThemeConfig = {
  id: 'retro-terminal',
  name: 'Retro Terminal',
  description: 'Класичний amber монохромний термінал',
  icon: '💾',
  type: 'dark',
  colors: {
    background: {
      default: '#000000',
      paper: '#0a0a0a',
      elevated: '#1a1a1a',
    },
    primary: {
      main: '#ffb000',
      light: '#ffc233',
      dark: '#cc8c00',
      glow: 'rgba(255, 176, 0, 0.5)'
    },
    secondary: {
      main: '#ff9500',
      light: '#ffaa33',
      dark: '#cc7700',
      glow: 'rgba(255, 149, 0, 0.4)'
    },
    accent: {
      amber: '#ffb000',
      gold: '#ffd700',
      orange: '#ff9500',
      yellow: '#ffcc00',
      bronze: '#cd7f32',
      copper: '#b87333'
    },
    status: {
      success: '#00ff00',
      warning: '#ffb000',
      error: '#ff0000',
      info: '#ffb000'
    },
    text: {
      primary: '#ffb000',
      secondary: '#cc8c00',
      disabled: '#664600',
      glow: '#ffb000'
    },
    border: {
      light: 'rgba(255, 176, 0, 0.15)',
      medium: 'rgba(255, 176, 0, 0.3)',
      heavy: 'rgba(255, 176, 0, 0.6)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ffb000 0%, #ff9500 100%)',
      secondary: 'linear-gradient(135deg, #ffd700 0%, #ffb000 100%)',
      success: 'linear-gradient(135deg, #00ff00 0%, #90ee90 100%)',
      danger: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
    }
  }
};

// ============= THEME 7: LIGHT =============

export const lightTheme: ThemeConfig = {
  id: 'light',
  name: 'Light',
  description: 'Чиста світла тема для денного використання',
  icon: '☀️',
  type: 'light',
  colors: {
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
      elevated: '#f1f5f9',
    },
    primary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      glow: 'rgba(14, 165, 233, 0.2)'
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      glow: 'rgba(139, 92, 246, 0.2)'
    },
    accent: {
      cyan: '#06b6d4',
      purple: '#8b5cf6',
      pink: '#ec4899',
      green: '#10b981',
      orange: '#f97316',
      yellow: '#f59e0b'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#cbd5e1',
      glow: '#0ea5e9'
    },
    border: {
      light: 'rgba(0, 0, 0, 0.08)',
      medium: 'rgba(0, 0, 0, 0.15)',
      heavy: 'rgba(14, 165, 233, 0.4)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
      secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
      danger: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    }
  }
};

// ============= КОЛЕКЦІЯ ВСІХ ТЕМ =============

export const allThemes: ThemeConfig[] = [
  darkCyberTheme,
  matrixTheme,
  sunsetTheme,
  oceanTheme,
  neonTokyoTheme,
  retroTerminalTheme,
  lightTheme,
];

// ============= УТИЛІТИ =============

export const getThemeById = (id: string): ThemeConfig | undefined => {
  return allThemes.find(theme => theme.id === id);
};

export const getDefaultTheme = (): ThemeConfig => {
  return darkCyberTheme;
};

// ============= ГЕНЕРАЦІЯ MUI THEME =============

export const createNexusTheme = (themeConfig: ThemeConfig) => {
  const { colors, type } = themeConfig;

  const themeOptions: ThemeOptions = {
    palette: {
      mode: type,
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
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.02em'
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: `${colors.primary.main} ${colors.background.paper}`,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: colors.background.paper,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: colors.primary.main,
              borderRadius: '4px',
              border: `2px solid ${colors.background.paper}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 0 20px ${colors.primary.glow}`,
            },
          },
          contained: {
            background: colors.gradients.primary,
            '&:hover': {
              background: colors.gradients.primary,
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.background.paper,
            borderRadius: 16,
            border: `1px solid ${colors.border.light}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: colors.border.medium,
              boxShadow: `0 8px 32px ${colors.primary.glow}`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
          filled: {
            border: `1px solid ${colors.border.medium}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.background.paper,
          },
          elevation1: {
            backgroundColor: colors.background.elevated,
            boxShadow: `0 4px 16px ${colors.primary.glow}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: colors.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary.main,
                boxShadow: `0 0 12px ${colors.primary.glow}`,
              },
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
