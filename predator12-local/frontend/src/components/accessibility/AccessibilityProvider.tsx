// @ts-nocheck
import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Fab,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Palette as PaletteIcon,
  VolumeUp as VolumeUpIcon,
  TextFields as TextFieldsIcon,
  HighContrast as ContrastIcon,
  Keyboard as KeyboardIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number;
  focusVisible: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindnessSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  soundCues: boolean;
  largeClickTargets: boolean;
  underlineLinks: boolean;
  timeout: number;
  announcements: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  announce: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 16,
  focusVisible: true,
  screenReader: false,
  keyboardNavigation: true,
  colorBlindnessSupport: 'none',
  soundCues: false,
  largeClickTargets: false,
  underlineLinks: false,
  timeout: 30,
  announcements: true
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [announcements, setAnnouncements] = useState<string[]>([]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('accessibility-settings', JSON.stringify(updated));

    // Застосування CSS змінних для доступності
    applyAccessibilityStyles(updated);
  };

  const announce = (message: string) => {
    if (settings.announcements) {
      setAnnouncements(prev => [...prev, message].slice(-5));

      // Видалення повідомлення через 5 секунд
      setTimeout(() => {
        setAnnouncements(prev => prev.slice(1));
      }, 5000);
    }
  };

  const applyAccessibilityStyles = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Розмір шрифту
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);

    // Високий контраст
    if (settings.highContrast) {
      root.style.setProperty('--accessibility-bg-contrast', '#000000');
      root.style.setProperty('--accessibility-text-contrast', '#ffffff');
      root.style.setProperty('--accessibility-border-contrast', '#ffffff');
    } else {
      root.style.removeProperty('--accessibility-bg-contrast');
      root.style.removeProperty('--accessibility-text-contrast');
      root.style.removeProperty('--accessibility-border-contrast');
    }

    // Зменшені анімації
    if (settings.reducedMotion) {
      root.style.setProperty('--accessibility-animation-duration', '0.1s');
      root.style.setProperty('--accessibility-transition-duration', '0.1s');
    } else {
      root.style.removeProperty('--accessibility-animation-duration');
      root.style.removeProperty('--accessibility-transition-duration');
    }

    // Великі області кліку
    if (settings.largeClickTargets) {
      root.style.setProperty('--accessibility-min-target-size', '44px');
    } else {
      root.style.removeProperty('--accessibility-min-target-size');
    }

    // Підкреслення посилань
    if (settings.underlineLinks) {
      root.style.setProperty('--accessibility-link-decoration', 'underline');
    } else {
      root.style.removeProperty('--accessibility-link-decoration');
    }

    // Фільтри для сліпоти кольорів
    let colorFilter = 'none';
    switch (settings.colorBlindnessSupport) {
      case 'protanopia':
        colorFilter = 'url(#protanopia-filter)';
        break;
      case 'deuteranopia':
        colorFilter = 'url(#deuteranopia-filter)';
        break;
      case 'tritanopia':
        colorFilter = 'url(#tritanopia-filter)';
        break;
    }
    root.style.setProperty('--accessibility-color-filter', colorFilter);
  };

  useEffect(() => {
    applyAccessibilityStyles(settings);
  }, [settings]);

  // Автоматичне визначення переваг користувача
  useEffect(() => {
    // Перевірка системних налаштувань
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    if (prefersReducedMotion && !settings.reducedMotion) {
      updateSettings({ reducedMotion: true });
      announce('Виявлено системну перевагу зменшених анімацій');
    }

    if (prefersHighContrast && !settings.highContrast) {
      updateSettings({ highContrast: true });
      announce('Виявлено системну перевагу високого контрасту');
    }
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, announce }}>
      {children}

      {/* Область оголошень для скрін-рідерів */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      >
        {announcements.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      {/* SVG фільтри для підтримки сліпоти кольорів */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
          </filter>
        </defs>
      </svg>
    </AccessibilityContext.Provider>
  );
};

const AccessibilityPanel: React.FC = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const { settings, updateSettings, announce } = useAccessibility();

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    updateSettings({ [key]: value });
    announce(`Налаштування ${key} змінено`);
  };

  return (
    <>
      {/* Кнопка відкриття панелі доступності */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Fab
          color="info"
          onClick={() => setPanelOpen(true)}
          aria-label="Відкрити налаштування доступності"
          sx={{
            position: 'fixed',
            bottom: 320,
            right: 24,
            background: 'linear-gradient(45deg, #673ab7, #9c27b0)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5e35b1, #8e24aa)',
              transform: 'scale(1.1)',
            }
          }}
        >
          <AccessibilityIcon />
        </Fab>
      </motion.div>

      {/* Панель налаштувань доступності */}
      <Dialog
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="accessibility-dialog-title"
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusColors.primary.main}`,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle id="accessibility-dialog-title">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <AccessibilityIcon sx={{ color: nexusColors.primary.main, fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                ♿ Доступність
              </Typography>
            </Box>
            <IconButton onClick={() => setPanelOpen(false)} sx={{ color: 'white' }} aria-label="Закрити">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* Візуальні налаштування */}
            <Grid item xs={12}>
              <Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: nexusColors.primary.main, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaletteIcon /> Візуальні налаштування
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.highContrast}
                            onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                          />
                        }
                        label="Високий контраст"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.reducedMotion}
                            onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                          />
                        }
                        label="Зменшені анімації"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Розмір шрифту: {settings.fontSize}px</Typography>
                      <Slider
                        value={settings.fontSize}
                        onChange={(e, value) => handleSettingChange('fontSize', value)}
                        min={12}
                        max={24}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Підтримка сліпоти кольорів</InputLabel>
                        <Select
                          value={settings.colorBlindnessSupport}
                          onChange={(e) => handleSettingChange('colorBlindnessSupport', e.target.value)}
                          label="Підтримка сліпоти кольорів"
                        >
                          <MenuItem value="none">Відсутня</MenuItem>
                          <MenuItem value="protanopia">Протанопія</MenuItem>
                          <MenuItem value="deuteranopia">Дейтеранопія</MenuItem>
                          <MenuItem value="tritanopia">Тританопія</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.underlineLinks}
                            onChange={(e) => handleSettingChange('underlineLinks', e.target.checked)}
                          />
                        }
                        label="Підкреслення посилань"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Навігація та взаємодія */}
            <Grid item xs={12}>
              <Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: nexusColors.secondary.main, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <KeyboardIcon /> Навігація та взаємодія
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.keyboardNavigation}
                            onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
                          />
                        }
                        label="Клавіатурна навігація"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.focusVisible}
                            onChange={(e) => handleSettingChange('focusVisible', e.target.checked)}
                          />
                        }
                        label="Виділення фокусу"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.largeClickTargets}
                            onChange={(e) => handleSettingChange('largeClickTargets', e.target.checked)}
                          />
                        }
                        label="Великі області кліку"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Таймаут сесії: {settings.timeout} хв</Typography>
                      <Slider
                        value={settings.timeout}
                        onChange={(e, value) => handleSettingChange('timeout', value)}
                        min={10}
                        max={120}
                        step={10}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Звукові та голосові налаштування */}
            <Grid item xs={12}>
              <Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: nexusColors.warning.main, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VolumeUpIcon /> Звукові налаштування
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.soundCues}
                            onChange={(e) => handleSettingChange('soundCues', e.target.checked)}
                          />
                        }
                        label="Звукові сигнали"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.screenReader}
                            onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                          />
                        }
                        label="Підтримка скрін-рідера"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.announcements}
                            onChange={(e) => handleSettingChange('announcements', e.target.checked)}
                          />
                        }
                        label="Голосові оголошення"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Інформація про WCAG */}
            <Grid item xs={12}>
              <Alert
                severity="info"
                sx={{
                  background: 'rgba(33,150,243,0.1)',
                  border: '1px solid #2196f3',
                  '& .MuiAlert-icon': { color: '#2196f3' }
                }}
              >
                <Typography variant="body2">
                  Ці налаштування допомагають зробити інтерфейс доступнішим відповідно до стандартів WCAG 2.1 AA.
                  Усі зміни автоматично зберігаються в локальному сховищі браузера.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { AccessibilityPanel };
export default AccessibilityProvider;
