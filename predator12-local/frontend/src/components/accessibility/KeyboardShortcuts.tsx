// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Chip,
  IconButton,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Keyboard as KeyboardIcon,
  Close as CloseIcon,
  Speed as SpeedIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'view' | 'accessibility' | 'game';
  enabled: boolean;
}

interface KeyboardShortcutsProps {
  onViewChange: (view: string) => void;
  onGameModeToggle: () => void;
  onSoundToggle: () => void;
  onFullscreenToggle: () => void;
  onSettingsOpen: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onViewChange,
  onGameModeToggle,
  onSoundToggle,
  onFullscreenToggle,
  onSettingsOpen
}) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [lastCommand, setLastCommand] = useState<string>('');
  const [commandVisible, setCommandVisible] = useState(false);

  // Визначення клавіатурних скорочень
  const shortcuts: KeyboardShortcut[] = [
    // Навігація
    {
      keys: ['Alt', 'D'],
      description: 'Перейти до Dashboard',
      action: () => onViewChange('dashboard'),
      category: 'navigation',
      enabled: true
    },
    {
      keys: ['Alt', 'A'],
      description: 'Перейти до AI Агентів',
      action: () => onViewChange('agents'),
      category: 'navigation',
      enabled: true
    },
    {
      keys: ['Alt', 'M'],
      description: 'Перейти до Моделей',
      action: () => onViewChange('models'),
      category: 'navigation',
      enabled: true
    },
    {
      keys: ['Alt', 'S'],
      description: 'Перейти до Системного Моніторингу',
      action: () => onViewChange('monitor'),
      category: 'navigation',
      enabled: true
    },
    {
      keys: ['Alt', 'N'],
      description: 'Перейти до Аналітики',
      action: () => onViewChange('analytics'),
      category: 'navigation',
      enabled: true
    },
    {
      keys: ['Alt', 'C'],
      description: 'Перейти до Nexus Core',
      action: () => onViewChange('nexus-core'),
      category: 'navigation',
      enabled: true
    },

    // Дії
    {
      keys: ['Ctrl', 'G'],
      description: 'Переключити ігровий режим',
      action: onGameModeToggle,
      category: 'actions',
      enabled: true
    },
    {
      keys: ['Ctrl', 'T'],
      description: 'Переключити звук',
      action: onSoundToggle,
      category: 'actions',
      enabled: true
    },
    {
      keys: ['F11'],
      description: 'Повноекранний режим',
      action: onFullscreenToggle,
      category: 'view',
      enabled: true
    },
    {
      keys: ['Ctrl', ','],
      description: 'Відкрити налаштування',
      action: onSettingsOpen,
      category: 'actions',
      enabled: true
    },

    // Доступність
    {
      keys: ['Alt', 'H'],
      description: 'Показати довідку з клавіатурних скорочень',
      action: () => setHelpOpen(true),
      category: 'accessibility',
      enabled: true
    },
    {
      keys: ['Escape'],
      description: 'Закрити поточний діалог',
      action: () => {
        setHelpOpen(false);
        // Можна додати логіку для закриття інших діалогів
      },
      category: 'accessibility',
      enabled: true
    },

    // Ігрові команди
    {
      keys: ['Ctrl', 'Space'],
      description: 'Швидка дія (контекстно-залежна)',
      action: () => {
        setLastCommand('Швидка дія виконана');
        setCommandVisible(true);
        setTimeout(() => setCommandVisible(false), 2000);
      },
      category: 'game',
      enabled: true
    },
    {
      keys: ['Ctrl', 'R'],
      description: 'Оновити поточний модуль',
      action: () => {
        setLastCommand('Модуль оновлено');
        setCommandVisible(true);
        setTimeout(() => setCommandVisible(false), 2000);
        window.location.reload();
      },
      category: 'actions',
      enabled: true
    }
  ];

  // Обробка натискання клавіш
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    setPressedKeys(prev => new Set([...prev, key]));

    // Перевірка комбінацій клавіш
    const currentKeys = Array.from(pressedKeys).concat(key);

    shortcuts.forEach(shortcut => {
      if (shortcut.enabled && shortcut.keys.every(k => currentKeys.includes(k))) {
        event.preventDefault();
        event.stopPropagation();

        shortcut.action();
        setLastCommand(shortcut.description);
        setCommandVisible(true);
        setTimeout(() => setCommandVisible(false), 2000);

        setPressedKeys(new Set());
      }
    });
  }, [pressedKeys, shortcuts]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(event.key);
      return newSet;
    });
  }, []);

  // Реєстрація обробників подій
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Очищення натиснутих клавіш при втраті фокусу
  useEffect(() => {
    const handleBlur = () => setPressedKeys(new Set());

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return nexusColors.primary.main;
      case 'actions': return nexusColors.secondary.main;
      case 'view': return nexusColors.warning.main;
      case 'accessibility': return nexusColors.success.main;
      case 'game': return nexusColors.error.main;
      default: return nexusColors.grey[500];
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return '🧭';
      case 'actions': return '⚡';
      case 'view': return '👁️';
      case 'accessibility': return '♿';
      case 'game': return '🎮';
      default: return '⌨️';
    }
  };

  return (
    <>
      {/* Кнопка відкриття довідки */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Fab
          size="small"
          onClick={() => setHelpOpen(true)}
          aria-label="Клавіатурні скорочення"
          sx={{
            position: 'fixed',
            bottom: 400,
            right: 24,
            background: 'linear-gradient(45deg, #607d8b, #90a4ae)',
            '&:hover': {
              background: 'linear-gradient(45deg, #546e7a, #78909c)',
              transform: 'scale(1.1)',
            }
          }}
        >
          <KeyboardIcon fontSize="small" />
        </Fab>
      </motion.div>

      {/* Індикатор поточної команди */}
      <AnimatePresence>
        {commandVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000
            }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.9), rgba(160, 32, 240, 0.9))',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.primary.main}`,
                boxShadow: `0 0 20px ${nexusColors.primary.main}`
              }}
            >
              <CardContent sx={{ py: 1, px: 2 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  ⌨️ {lastCommand}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Індикатор натиснутих клавіш (для відладки) */}
      {pressedKeys.size > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 1500,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap'
          }}
        >
          {Array.from(pressedKeys).map(key => (
            <Chip
              key={key}
              label={key}
              size="small"
              sx={{
                background: nexusColors.primary.main,
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          ))}
        </Box>
      )}

      {/* Діалог довідки */}
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="keyboard-shortcuts-title"
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusColors.primary.main}`,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle id="keyboard-shortcuts-title">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <KeyboardIcon sx={{ color: nexusColors.primary.main, fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                ⌨️ Клавіатурні Скорочення
              </Typography>
            </Box>
            <IconButton onClick={() => setHelpOpen(false)} sx={{ color: 'white' }} aria-label="Закрити">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Alert
            severity="info"
            sx={{
              mb: 3,
              background: 'rgba(33,150,243,0.1)',
              border: '1px solid #2196f3',
              '& .MuiAlert-icon': { color: '#2196f3' }
            }}
          >
            <Typography variant="body2">
              Використовуйте клавіатурні скорочення для швидшої навігації та керування системою.
              Натисніть <strong>Alt + H</strong> в будь-який час, щоб відкрити цю довідку.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {['navigation', 'actions', 'view', 'accessibility', 'game'].map(category => {
              const categoryShortcuts = shortcuts.filter(s => s.category === category && s.enabled);

              if (categoryShortcuts.length === 0) return null;

              return (
                <Grid item xs={12} md={6} key={category}>
                  <Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          color: getCategoryColor(category),
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        {getCategoryIcon(category)} {category === 'navigation' ? 'Навігація' :
                                                    category === 'actions' ? 'Дії' :
                                                    category === 'view' ? 'Вигляд' :
                                                    category === 'accessibility' ? 'Доступність' : 'Гра'}
                      </Typography>

                      <TableContainer component={Paper} sx={{ background: 'transparent' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                                Комбінація
                              </TableCell>
                              <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                                Дія
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {categoryShortcuts.map((shortcut, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Box display="flex" gap={0.5}>
                                    {shortcut.keys.map((key, keyIndex) => (
                                      <React.Fragment key={keyIndex}>
                                        <Chip
                                          label={key}
                                          size="small"
                                          sx={{
                                            background: getCategoryColor(category),
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontFamily: 'monospace'
                                          }}
                                        />
                                        {keyIndex < shortcut.keys.length - 1 && (
                                          <Typography variant="caption" sx={{ alignSelf: 'center', mx: 0.5 }}>
                                            +
                                          </Typography>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ color: nexusColors.text.secondary }}>
                                  {shortcut.description}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box mt={3}>
            <Typography variant="h6" sx={{ color: nexusColors.warning.main, mb: 1 }}>
              💡 Поради:
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • Всі скорочення працюють глобально в межах додатка
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • Деякі браузери можуть перехоплювати певні комбінації клавіш
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • Використовуйте Tab для навігації між елементами інтерфейсу
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Enter або Space для активації кнопок та посилань
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KeyboardShortcuts;
