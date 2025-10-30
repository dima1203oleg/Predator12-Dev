"use strict";
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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const KeyboardShortcuts = ({ onViewChange, onGameModeToggle, onSoundToggle, onFullscreenToggle, onSettingsOpen }) => {
    const [helpOpen, setHelpOpen] = (0, react_1.useState)(false);
    const [pressedKeys, setPressedKeys] = (0, react_1.useState)(new Set());
    const [lastCommand, setLastCommand] = (0, react_1.useState)('');
    const [commandVisible, setCommandVisible] = (0, react_1.useState)(false);
    // Визначення клавіатурних скорочень
    const shortcuts = [
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
    const handleKeyDown = (0, react_1.useCallback)((event) => {
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
    const handleKeyUp = (0, react_1.useCallback)((event) => {
        setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(event.key);
            return newSet;
        });
    }, []);
    // Реєстрація обробників подій
    (0, react_1.useEffect)(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);
    // Очищення натиснутих клавіш при втраті фокусу
    (0, react_1.useEffect)(() => {
        const handleBlur = () => setPressedKeys(new Set());
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, []);
    const getCategoryColor = (category) => {
        switch (category) {
            case 'navigation': return nexusTheme_1.nexusColors.primary.main;
            case 'actions': return nexusTheme_1.nexusColors.secondary.main;
            case 'view': return nexusTheme_1.nexusColors.warning.main;
            case 'accessibility': return nexusTheme_1.nexusColors.success.main;
            case 'game': return nexusTheme_1.nexusColors.error.main;
            default: return nexusTheme_1.nexusColors.grey[500];
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'navigation': return '🧭';
            case 'actions': return '⚡';
            case 'view': return '👁️';
            case 'accessibility': return '♿';
            case 'game': return '🎮';
            default: return '⌨️';
        }
    };
    return (<>
      {/* Кнопка відкриття довідки */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <material_1.Fab size="small" onClick={() => setHelpOpen(true)} aria-label="Клавіатурні скорочення" sx={{
            position: 'fixed',
            bottom: 400,
            right: 24,
            background: 'linear-gradient(45deg, #607d8b, #90a4ae)',
            '&:hover': {
                background: 'linear-gradient(45deg, #546e7a, #78909c)',
                transform: 'scale(1.1)',
            }
        }}>
          <icons_material_1.Keyboard fontSize="small"/>
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* Індикатор поточної команди */}
      <framer_motion_1.AnimatePresence>
        {commandVisible && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} style={{
                position: 'fixed',
                bottom: 100,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2000
            }}>
            <material_1.Card sx={{
                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.9), rgba(160, 32, 240, 0.9))',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.primary.main}`
            }}>
              <material_1.CardContent sx={{ py: 1, px: 2 }}>
                <material_1.Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  ⌨️ {lastCommand}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Індикатор натиснутих клавіш (для відладки) */}
      {pressedKeys.size > 0 && (<material_1.Box sx={{
                position: 'fixed',
                top: 20,
                left: 20,
                zIndex: 1500,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap'
            }}>
          {Array.from(pressedKeys).map(key => (<material_1.Chip key={key} label={key} size="small" sx={{
                    background: nexusTheme_1.nexusColors.primary.main,
                    color: 'white',
                    fontSize: '0.7rem'
                }}/>))}
        </material_1.Box>)}

      {/* Діалог довідки */}
      <material_1.Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="lg" fullWidth aria-labelledby="keyboard-shortcuts-title" PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                borderRadius: 3
            }
        }}>
        <material_1.DialogTitle id="keyboard-shortcuts-title">
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
            <material_1.Box display="flex" alignItems="center" gap={2}>
              <icons_material_1.Keyboard sx={{ color: nexusTheme_1.nexusColors.primary.main, fontSize: 32 }}/>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                ⌨️ Клавіатурні Скорочення
              </material_1.Typography>
            </material_1.Box>
            <material_1.IconButton onClick={() => setHelpOpen(false)} sx={{ color: 'white' }} aria-label="Закрити">
              <icons_material_1.Close />
            </material_1.IconButton>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent>
          <material_1.Alert severity="info" sx={{
            mb: 3,
            background: 'rgba(33,150,243,0.1)',
            border: '1px solid #2196f3',
            '& .MuiAlert-icon': { color: '#2196f3' }
        }}>
            <material_1.Typography variant="body2">
              Використовуйте клавіатурні скорочення для швидшої навігації та керування системою.
              Натисніть <strong>Alt + H</strong> в будь-який час, щоб відкрити цю довідку.
            </material_1.Typography>
          </material_1.Alert>

          <material_1.Grid container spacing={3}>
            {['navigation', 'actions', 'view', 'accessibility', 'game'].map(category => {
            const categoryShortcuts = shortcuts.filter(s => s.category === category && s.enabled);
            if (categoryShortcuts.length === 0)
                return null;
            return (<material_1.Grid item xs={12} md={6} key={category}>
                  <material_1.Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <material_1.CardContent>
                      <material_1.Typography variant="h6" sx={{
                    color: getCategoryColor(category),
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                        {getCategoryIcon(category)} {category === 'navigation' ? 'Навігація' :
                    category === 'actions' ? 'Дії' :
                        category === 'view' ? 'Вигляд' :
                            category === 'accessibility' ? 'Доступність' : 'Гра'}
                      </material_1.Typography>

                      <material_1.TableContainer component={material_1.Paper} sx={{ background: 'transparent' }}>
                        <material_1.Table size="small">
                          <material_1.TableHead>
                            <material_1.TableRow>
                              <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                                Комбінація
                              </material_1.TableCell>
                              <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                                Дія
                              </material_1.TableCell>
                            </material_1.TableRow>
                          </material_1.TableHead>
                          <material_1.TableBody>
                            {categoryShortcuts.map((shortcut, index) => (<material_1.TableRow key={index}>
                                <material_1.TableCell>
                                  <material_1.Box display="flex" gap={0.5}>
                                    {shortcut.keys.map((key, keyIndex) => (<react_1.default.Fragment key={keyIndex}>
                                        <material_1.Chip label={key} size="small" sx={{
                            background: getCategoryColor(category),
                            color: 'white',
                            fontSize: '0.7rem',
                            fontFamily: 'monospace'
                        }}/>
                                        {keyIndex < shortcut.keys.length - 1 && (<material_1.Typography variant="caption" sx={{ alignSelf: 'center', mx: 0.5 }}>
                                            +
                                          </material_1.Typography>)}
                                      </react_1.default.Fragment>))}
                                  </material_1.Box>
                                </material_1.TableCell>
                                <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                                  {shortcut.description}
                                </material_1.TableCell>
                              </material_1.TableRow>))}
                          </material_1.TableBody>
                        </material_1.Table>
                      </material_1.TableContainer>
                    </material_1.CardContent>
                  </material_1.Card>
                </material_1.Grid>);
        })}
          </material_1.Grid>

          <material_1.Box mt={3}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.warning.main, mb: 1 }}>
              💡 Поради:
            </material_1.Typography>
            <material_1.Typography variant="body2" color="textSecondary" paragraph>
              • Всі скорочення працюють глобально в межах додатка
            </material_1.Typography>
            <material_1.Typography variant="body2" color="textSecondary" paragraph>
              • Деякі браузери можуть перехоплювати певні комбінації клавіш
            </material_1.Typography>
            <material_1.Typography variant="body2" color="textSecondary" paragraph>
              • Використовуйте Tab для навігації між елементами інтерфейсу
            </material_1.Typography>
            <material_1.Typography variant="body2" color="textSecondary">
              • Enter або Space для активації кнопок та посилань
            </material_1.Typography>
          </material_1.Box>
        </material_1.DialogContent>
      </material_1.Dialog>
    </>);
};
exports.default = KeyboardShortcuts;
