/**
 * 🎨 THEME CONTEXT
 *
 * React контекст для управління темами в додатку
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ThemeConfig, getDefaultTheme, getThemeById, createNexusTheme } from '../theme/themes';

// ============= TYPES =============

interface ThemeContextValue {
  currentTheme: ThemeConfig;
  currentThemeId: string;
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
  colors: ThemeConfig['colors'];
}

// ============= CONTEXT =============

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============= STORAGE KEY =============

const THEME_STORAGE_KEY = 'predator12-theme';

// ============= PROVIDER =============

interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeId?: string;
}

export const NexusThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultThemeId,
}) => {
  // Initialize theme from localStorage or default
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) return stored;
    }
    return defaultThemeId || getDefaultTheme().id;
  });

  // Get current theme config
  const currentTheme = useMemo(() => {
    return getThemeById(currentThemeId) || getDefaultTheme();
  }, [currentThemeId]);

  // Create MUI theme
  const muiTheme = useMemo(() => {
    return createNexusTheme(currentTheme);
  }, [currentTheme]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, currentThemeId);

      // Emit custom event for theme change
      window.dispatchEvent(
        new CustomEvent('theme-changed', {
          detail: { themeId: currentThemeId, theme: currentTheme },
        })
      );
    }
  }, [currentThemeId, currentTheme]);

  // Set theme by ID
  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    if (theme) {
      setCurrentThemeId(themeId);
    } else {
      console.warn(`Theme with id "${themeId}" not found`);
    }
  };

  // Toggle between dark and light themes
  const toggleTheme = () => {
    const newType = currentTheme.type === 'dark' ? 'light' : 'dark';
    // Find first theme of opposite type
    const oppositeTheme = [
      getThemeById('dark-cyber'),
      getThemeById('light'),
    ].find(t => t?.type === newType);

    if (oppositeTheme) {
      setCurrentThemeId(oppositeTheme.id);
    }
  };

  const contextValue: ThemeContextValue = {
    currentTheme,
    currentThemeId,
    setTheme,
    toggleTheme,
    colors: currentTheme.colors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// ============= HOOK =============

export const useNexusTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useNexusTheme must be used within NexusThemeProvider');
  }
  return context;
};

// ============= UTILITIES =============

/**
 * Get current theme ID from localStorage
 */
export const getCurrentThemeId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(THEME_STORAGE_KEY);
  }
  return null;
};

/**
 * Listen to theme changes
 */
export const onThemeChange = (
  callback: (theme: ThemeConfig) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{
      themeId: string;
      theme: ThemeConfig;
    }>;
    callback(customEvent.detail.theme);
  };

  window.addEventListener('theme-changed', handler);

  return () => {
    window.removeEventListener('theme-changed', handler);
  };
};

// ============= EXPORTS =============

export default NexusThemeProvider;
