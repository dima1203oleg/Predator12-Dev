// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Chip,
  Grid
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VolumeUp as VolumeUpIcon,
  TextFields as TextFieldsIcon,
  Colorize as ColorizeIcon,
  KeyboardAlt as KeyboardIcon,
  MouseOutlined as MouseIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  soundEnabled: boolean;
  fontSize: number;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  focusIndicator: boolean;
  skipLinks: boolean;
}

const AccessibilityPanel: React.FC = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    soundEnabled: false,
    fontSize: 16,
    colorBlindMode: 'none',
    focusIndicator: true,
    skipLinks: true
  });

  // Застосування налаштувань доступності
  useEffect(() => {
    const root = document.documentElement;

    // Високий контраст
    if (settings.highContrast) {
      root.style.setProperty('--nexus-primary', '#ffffff');
      root.style.setProperty('--nexus-background', '#000000');
      root.style.setProperty('--nexus-text', '#ffffff');
    } else {
      root.style.removeProperty('--nexus-primary');
      root.style.removeProperty('--nexus-background');
      root.style.removeProperty('--nexus-text');
    }

    // Великий текст
    if (settings.largeText) {
      root.style.fontSize = `${settings.fontSize}px`;
    } else {
      root.style.fontSize = '14px';
    }

    // Зменшена анімація
    if (settings.reducedMotion) {
      root.style.setProperty('--motion-duration', '0.01s');
      document.body.classList.add('reduce-motion');
    } else {
      root.style.setProperty('--motion-duration', '0.3s');
      document.body.classList.remove('reduce-motion');
    }

    // Фокус індикатор
    if (settings.focusIndicator) {
      document.body.classList.add('focus-indicators');
    } else {
      document.body.classList.remove('focus-indicators');
    }

    // Колірна сліпота
    if (settings.colorBlindMode !== 'none') {
      document.body.classList.add(`colorblind-${settings.colorBlindMode}`);
    } else {
      document.body.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia');
    }
  }, [settings]);

  // ARIA повідомлення
  const announceChange = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-9999px';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Повідомлення про зміну
    const messages = {
      highContrast: value ? 'Високий контраст увімкнено' : 'Високий контраст вимкнено',
      largeText: value ? 'Великий текст увімкнено' : 'Великий текст вимкнено',
      reducedMotion: value ? 'Зменшена анімація увімкнена' : 'Зменшена анімація вимкнена',
      screenReader: value ? 'Підтримка скрін-рідера увімкнена' : 'Підтримка скрін-рідера вимкнена',
      keyboardNavigation: value ? 'Навігація клавіатурою увімкнена' : 'Навігація клавіатурою вимкнена',
      soundEnabled: value ? 'Звук увімкнено' : 'Звук вимкнено'
    };

    if (messages[key]) {
      announceChange(messages[key]);
    }
  };

  // Швидкі налаштування
  const quickSettings = [
    {
      name: 'Базова доступність',
      settings: { focusIndicator: true, keyboardNavigation: true, skipLinks: true }
    },
    {
      name: 'Візуальні порушення',
      settings: { highContrast: true, largeText: true, fontSize: 18 }
    },
    {
      name: 'Моторні порушення',
      settings: { reducedMotion: true, keyboardNavigation: true, largeText: true }
    },
    {
      name: 'Слухові порушення',
      settings: { soundEnabled: false, focusIndicator: true }
    }
  ];

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
          color="secondary"
          onClick={() => setPanelOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 320,
            right: 24,
            background: 'linear-gradient(45deg, #9c27b0, #673ab7)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7b1fa2, #512da8)',
              transform: 'scale(1.1)',
            }
          }}
          aria-label="Відкрити панель доступності"
        >
          <AccessibilityIcon />
        </Fab>
      </motion.div>

      {/* Діалог налаштувань доступності */}
      <Dialog
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusColors.primary.main}`,
            borderRadius: 3
          }
        }}
        aria-labelledby="accessibility-dialog-title"
      >
        <DialogTitle id="accessibility-dialog-title">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <AccessibilityIcon sx={{ color: nexusColors.secondary.main, fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                ♿ Доступність
              </Typography>
            </Box>
            <IconButton
              onClick={() => setPanelOpen(false)}
              sx={{ color: 'white' }}
              aria-label="Закрити панель доступності"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Швидкі налаштування */}
          <Box mb={4}>
            <Typography variant="h6" sx={{ color: nexusColors.primary.main, mb: 2 }}>
              🚀 Швидкі Налаштування
            </Typography>
            <Grid container spacing={2}>
              {quickSettings.map((preset, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setSettings(prev => ({ ...prev, ...preset.settings }))}
                    sx={{
                      borderColor: nexusColors.primary.main,
                      color: nexusColors.primary.main,
                      '&:hover': {
                        borderColor: nexusColors.secondary.main,
                        backgroundColor: `${nexusColors.primary.main}20`
                      }
                    }}
                  >
                    {preset.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Детальні налаштування */}
          <Grid container spacing={3}>
            {/* Візуальні налаштування */}
            <Grid item xs={12} md={6}>
              <Card sx={{ background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#2196f3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon /> Візуальні
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.highContrast}
                        onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Високий контраст"
                    sx={{ mb: 2, display: 'flex' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.largeText}
                        onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Великий текст"
                    sx={{ mb: 2, display: 'flex' }}
                  />

                  <Box mb={2}>
                    <Typography gutterBottom>Розмір шрифту: {settings.fontSize}px</Typography>
                    <Slider
                      value={settings.fontSize}
                      onChange={(e, value) => handleSettingChange('fontSize', value)}
                      min={12}
                      max={24}
                      step={1}
                      sx={{ color: nexusColors.primary.main }}
                      aria-label="Розмір шрифту"
                    />
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Режим колірної сліпоти</InputLabel>
                    <Select
                      value={settings.colorBlindMode}
                      onChange={(e) => handleSettingChange('colorBlindMode', e.target.value)}
                      label="Режим колірної сліпоти"
                    >
                      <MenuItem value="none">Немає</MenuItem>
                      <MenuItem value="deuteranopia">Дейтеранопія</MenuItem>
                      <MenuItem value="protanopia">Протанопія</MenuItem>
                      <MenuItem value="tritanopia">Тританопія</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            {/* Рухові налаштування */}
            <Grid item xs={12} md={6}>
              <Card sx={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#4caf50', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MouseIcon /> Рухові
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.reducedMotion}
                        onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Зменшена анімація"
                    sx={{ mb: 2, display: 'flex' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.keyboardNavigation}
                        onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Навігація клавіатурою"
                    sx={{ mb: 2, display: 'flex' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.focusIndicator}
                        onChange={(e) => handleSettingChange('focusIndicator', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Індикатори фокусу"
                    sx={{ mb: 2, display: 'flex' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.skipLinks}
                        onChange={(e) => handleSettingChange('skipLinks', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Швидкі посилання"
                    sx={{ display: 'flex' }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Аудіо та скрін-рідер */}
            <Grid item xs={12}>
              <Card sx={{ background: 'rgba(255,152,0,0.1)', border: '1px solid #ff9800' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ff9800', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VolumeUpIcon /> Аудіо та Асистивні Технології
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.soundEnabled}
                            onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Звукові ефекти"
                        sx={{ display: 'flex' }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.screenReader}
                            onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Підтримка скрін-рідера"
                        sx={{ display: 'flex' }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Інформація про клавіатурні скорочення */}
          <Box mt={4}>
            <Typography variant="h6" sx={{ color: nexusColors.primary.main, mb: 2 }}>
              ⌨️ Клавіатурні Скорочення
            </Typography>
            <Grid container spacing={1}>
              {[
                { key: 'Tab', desc: 'Навігація між елементами' },
                { key: 'Enter/Space', desc: 'Активація кнопок' },
                { key: 'Esc', desc: 'Закриття діалогів' },
                { key: 'Arrow Keys', desc: 'Навігація в меню' },
                { key: 'Alt + 1-9', desc: 'Швидкий перехід до модулів' },
                { key: 'Ctrl + /', desc: 'Довідка по скороченнях' }
              ].map((shortcut, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={shortcut.key}
                      size="small"
                      sx={{
                        background: nexusColors.primary.main,
                        color: 'white',
                        fontFamily: 'monospace'
                      }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {shortcut.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Невидимі skip links для навігації */}
      {settings.skipLinks && (
        <Box
          sx={{
            position: 'absolute',
            top: -9999,
            left: -9999,
            '&:focus-within': {
              position: 'fixed',
              top: 10,
              left: 10,
              zIndex: 9999,
              background: nexusColors.primary.main,
              color: 'white',
              padding: 2,
              borderRadius: 1
            }
          }}
        >
          <a href="#main-content" style={{ color: 'white', textDecoration: 'none' }}>
            Перейти до основного контенту
          </a>
          <a href="#navigation" style={{ color: 'white', textDecoration: 'none', marginLeft: 16 }}>
            Перейти до навігації
          </a>
        </Box>
      )}
    </>
  );
};

export default AccessibilityPanel;
