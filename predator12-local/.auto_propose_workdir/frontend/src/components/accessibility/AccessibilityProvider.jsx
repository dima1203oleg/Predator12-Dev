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
exports.AccessibilityPanel = exports.AccessibilityProvider = exports.useAccessibility = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AccessibilityContext = (0, react_1.createContext)(null);
const useAccessibility = () => {
    const context = (0, react_1.useContext)(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};
exports.useAccessibility = useAccessibility;
const defaultSettings = {
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
const AccessibilityProvider = ({ children }) => {
    const [settings, setSettings] = (0, react_1.useState)(() => {
        const saved = localStorage.getItem('accessibility-settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });
    const [announcements, setAnnouncements] = (0, react_1.useState)([]);
    const updateSettings = (newSettings) => {
        const updated = Object.assign(Object.assign({}, settings), newSettings);
        setSettings(updated);
        localStorage.setItem('accessibility-settings', JSON.stringify(updated));
        // Застосування CSS змінних для доступності
        applyAccessibilityStyles(updated);
    };
    const announce = (message) => {
        if (settings.announcements) {
            setAnnouncements(prev => [...prev, message].slice(-5));
            // Видалення повідомлення через 5 секунд
            setTimeout(() => {
                setAnnouncements(prev => prev.slice(1));
            }, 5000);
        }
    };
    const applyAccessibilityStyles = (settings) => {
        const root = document.documentElement;
        // Розмір шрифту
        root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);
        // Високий контраст
        if (settings.highContrast) {
            root.style.setProperty('--accessibility-bg-contrast', '#000000');
            root.style.setProperty('--accessibility-text-contrast', '#ffffff');
            root.style.setProperty('--accessibility-border-contrast', '#ffffff');
        }
        else {
            root.style.removeProperty('--accessibility-bg-contrast');
            root.style.removeProperty('--accessibility-text-contrast');
            root.style.removeProperty('--accessibility-border-contrast');
        }
        // Зменшені анімації
        if (settings.reducedMotion) {
            root.style.setProperty('--accessibility-animation-duration', '0.1s');
            root.style.setProperty('--accessibility-transition-duration', '0.1s');
        }
        else {
            root.style.removeProperty('--accessibility-animation-duration');
            root.style.removeProperty('--accessibility-transition-duration');
        }
        // Великі області кліку
        if (settings.largeClickTargets) {
            root.style.setProperty('--accessibility-min-target-size', '44px');
        }
        else {
            root.style.removeProperty('--accessibility-min-target-size');
        }
        // Підкреслення посилань
        if (settings.underlineLinks) {
            root.style.setProperty('--accessibility-link-decoration', 'underline');
        }
        else {
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
    (0, react_1.useEffect)(() => {
        applyAccessibilityStyles(settings);
    }, [settings]);
    // Автоматичне визначення переваг користувача
    (0, react_1.useEffect)(() => {
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
    return (<AccessibilityContext.Provider value={{ settings, updateSettings, announce }}>
      {children}

      {/* Область оголошень для скрін-рідерів */}
      <div aria-live="polite" aria-atomic="true" style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
        }}>
        {announcements.map((message, index) => (<div key={index}>{message}</div>))}
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
    </AccessibilityContext.Provider>);
};
exports.AccessibilityProvider = AccessibilityProvider;
const AccessibilityPanel = () => {
    const [panelOpen, setPanelOpen] = (0, react_1.useState)(false);
    const { settings, updateSettings, announce } = (0, exports.useAccessibility)();
    const handleSettingChange = (key, value) => {
        updateSettings({ [key]: value });
        announce(`Налаштування ${key} змінено`);
    };
    return (<>
      {/* Кнопка відкриття панелі доступності */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <material_1.Fab color="info" onClick={() => setPanelOpen(true)} aria-label="Відкрити налаштування доступності" sx={{
            position: 'fixed',
            bottom: 320,
            right: 24,
            background: 'linear-gradient(45deg, #673ab7, #9c27b0)',
            '&:hover': {
                background: 'linear-gradient(45deg, #5e35b1, #8e24aa)',
                transform: 'scale(1.1)',
            }
        }}>
          <icons_material_1.Accessibility />
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* Панель налаштувань доступності */}
      <material_1.Dialog open={panelOpen} onClose={() => setPanelOpen(false)} maxWidth="md" fullWidth aria-labelledby="accessibility-dialog-title" PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                borderRadius: 3
            }
        }}>
        <material_1.DialogTitle id="accessibility-dialog-title">
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
            <material_1.Box display="flex" alignItems="center" gap={2}>
              <icons_material_1.Accessibility sx={{ color: nexusTheme_1.nexusColors.primary.main, fontSize: 32 }}/>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                ♿ Доступність
              </material_1.Typography>
            </material_1.Box>
            <material_1.IconButton onClick={() => setPanelOpen(false)} sx={{ color: 'white' }} aria-label="Закрити">
              <icons_material_1.Close />
            </material_1.IconButton>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent>
          <material_1.Grid container spacing={3}>
            {/* Візуальні налаштування */}
            <material_1.Grid item xs={12}>
              <material_1.Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.primary.main, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <icons_material_1.Palette /> Візуальні налаштування
                  </material_1.Typography>

                  <material_1.Grid container spacing={2}>
                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.highContrast} onChange={(e) => handleSettingChange('highContrast', e.target.checked)}/>} label="Високий контраст"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.reducedMotion} onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}/>} label="Зменшені анімації"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.Typography gutterBottom>Розмір шрифту: {settings.fontSize}px</material_1.Typography>
                      <material_1.Slider value={settings.fontSize} onChange={(e, value) => handleSettingChange('fontSize', value)} min={12} max={24} step={1} marks valueLabelDisplay="auto"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControl fullWidth>
                        <material_1.InputLabel>Підтримка сліпоти кольорів</material_1.InputLabel>
                        <material_1.Select value={settings.colorBlindnessSupport} onChange={(e) => handleSettingChange('colorBlindnessSupport', e.target.value)} label="Підтримка сліпоти кольорів">
                          <material_1.MenuItem value="none">Відсутня</material_1.MenuItem>
                          <material_1.MenuItem value="protanopia">Протанопія</material_1.MenuItem>
                          <material_1.MenuItem value="deuteranopia">Дейтеранопія</material_1.MenuItem>
                          <material_1.MenuItem value="tritanopia">Тританопія</material_1.MenuItem>
                        </material_1.Select>
                      </material_1.FormControl>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.underlineLinks} onChange={(e) => handleSettingChange('underlineLinks', e.target.checked)}/>} label="Підкреслення посилань"/>
                    </material_1.Grid>
                  </material_1.Grid>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>

            {/* Навігація та взаємодія */}
            <material_1.Grid item xs={12}>
              <material_1.Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.secondary.main, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <icons_material_1.Keyboard /> Навігація та взаємодія
                  </material_1.Typography>

                  <material_1.Grid container spacing={2}>
                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.keyboardNavigation} onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}/>} label="Клавіатурна навігація"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.focusVisible} onChange={(e) => handleSettingChange('focusVisible', e.target.checked)}/>} label="Виділення фокусу"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.largeClickTargets} onChange={(e) => handleSettingChange('largeClickTargets', e.target.checked)}/>} label="Великі області кліку"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.Typography gutterBottom>Таймаут сесії: {settings.timeout} хв</material_1.Typography>
                      <material_1.Slider value={settings.timeout} onChange={(e, value) => handleSettingChange('timeout', value)} min={10} max={120} step={10} marks valueLabelDisplay="auto"/>
                    </material_1.Grid>
                  </material_1.Grid>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>

            {/* Звукові та голосові налаштування */}
            <material_1.Grid item xs={12}>
              <material_1.Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.warning.main, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <icons_material_1.VolumeUp /> Звукові налаштування
                  </material_1.Typography>

                  <material_1.Grid container spacing={2}>
                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.soundCues} onChange={(e) => handleSettingChange('soundCues', e.target.checked)}/>} label="Звукові сигнали"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.screenReader} onChange={(e) => handleSettingChange('screenReader', e.target.checked)}/>} label="Підтримка скрін-рідера"/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.announcements} onChange={(e) => handleSettingChange('announcements', e.target.checked)}/>} label="Голосові оголошення"/>
                    </material_1.Grid>
                  </material_1.Grid>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>

            {/* Інформація про WCAG */}
            <material_1.Grid item xs={12}>
              <material_1.Alert severity="info" sx={{
            background: 'rgba(33,150,243,0.1)',
            border: '1px solid #2196f3',
            '& .MuiAlert-icon': { color: '#2196f3' }
        }}>
                <material_1.Typography variant="body2">
                  Ці налаштування допомагають зробити інтерфейс доступнішим відповідно до стандартів WCAG 2.1 AA.
                  Усі зміни автоматично зберігаються в локальному сховищі браузера.
                </material_1.Typography>
              </material_1.Alert>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.DialogContent>
      </material_1.Dialog>
    </>);
};
exports.AccessibilityPanel = AccessibilityPanel;
exports.default = exports.AccessibilityProvider;
