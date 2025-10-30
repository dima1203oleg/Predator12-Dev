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
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AccessibilityPanel = () => {
    const [panelOpen, setPanelOpen] = (0, react_1.useState)(false);
    const [settings, setSettings] = (0, react_1.useState)({
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
    (0, react_1.useEffect)(() => {
        const root = document.documentElement;
        // Високий контраст
        if (settings.highContrast) {
            root.style.setProperty('--nexus-primary', '#ffffff');
            root.style.setProperty('--nexus-background', '#000000');
            root.style.setProperty('--nexus-text', '#ffffff');
        }
        else {
            root.style.removeProperty('--nexus-primary');
            root.style.removeProperty('--nexus-background');
            root.style.removeProperty('--nexus-text');
        }
        // Великий текст
        if (settings.largeText) {
            root.style.fontSize = `${settings.fontSize}px`;
        }
        else {
            root.style.fontSize = '14px';
        }
        // Зменшена анімація
        if (settings.reducedMotion) {
            root.style.setProperty('--motion-duration', '0.01s');
            document.body.classList.add('reduce-motion');
        }
        else {
            root.style.setProperty('--motion-duration', '0.3s');
            document.body.classList.remove('reduce-motion');
        }
        // Фокус індикатор
        if (settings.focusIndicator) {
            document.body.classList.add('focus-indicators');
        }
        else {
            document.body.classList.remove('focus-indicators');
        }
        // Колірна сліпота
        if (settings.colorBlindMode !== 'none') {
            document.body.classList.add(`colorblind-${settings.colorBlindMode}`);
        }
        else {
            document.body.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia');
        }
    }, [settings]);
    // ARIA повідомлення
    const announceChange = (message) => {
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
    const handleSettingChange = (key, value) => {
        setSettings(prev => (Object.assign(Object.assign({}, prev), { [key]: value })));
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
    return (<>
      {/* Кнопка відкриття панелі доступності */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <material_1.Fab color="secondary" onClick={() => setPanelOpen(true)} sx={{
            position: 'fixed',
            bottom: 320,
            right: 24,
            background: 'linear-gradient(45deg, #9c27b0, #673ab7)',
            '&:hover': {
                background: 'linear-gradient(45deg, #7b1fa2, #512da8)',
                transform: 'scale(1.1)',
            }
        }} aria-label="Відкрити панель доступності">
          <icons_material_1.Accessibility />
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* Діалог налаштувань доступності */}
      <material_1.Dialog open={panelOpen} onClose={() => setPanelOpen(false)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                borderRadius: 3
            }
        }} aria-labelledby="accessibility-dialog-title">
        <material_1.DialogTitle id="accessibility-dialog-title">
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
            <material_1.Box display="flex" alignItems="center" gap={2}>
              <icons_material_1.Accessibility sx={{ color: nexusTheme_1.nexusColors.secondary.main, fontSize: 32 }}/>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                ♿ Доступність
              </material_1.Typography>
            </material_1.Box>
            <material_1.IconButton onClick={() => setPanelOpen(false)} sx={{ color: 'white' }} aria-label="Закрити панель доступності">
              <icons_material_1.Close />
            </material_1.IconButton>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent>
          {/* Швидкі налаштування */}
          <material_1.Box mb={4}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.primary.main, mb: 2 }}>
              🚀 Швидкі Налаштування
            </material_1.Typography>
            <material_1.Grid container spacing={2}>
              {quickSettings.map((preset, index) => (<material_1.Grid item xs={12} sm={6} key={index}>
                  <material_1.Button variant="outlined" fullWidth onClick={() => setSettings(prev => (Object.assign(Object.assign({}, prev), preset.settings)))} sx={{
                borderColor: nexusTheme_1.nexusColors.primary.main,
                color: nexusTheme_1.nexusColors.primary.main,
                '&:hover': {
                    borderColor: nexusTheme_1.nexusColors.secondary.main,
                    backgroundColor: `${nexusTheme_1.nexusColors.primary.main}20`
                }
            }}>
                    {preset.name}
                  </material_1.Button>
                </material_1.Grid>))}
            </material_1.Grid>
          </material_1.Box>

          {/* Детальні налаштування */}
          <material_1.Grid container spacing={3}>
            {/* Візуальні налаштування */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Card sx={{ background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h6" sx={{ color: '#2196f3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <icons_material_1.Visibility /> Візуальні
                  </material_1.Typography>

                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.highContrast} onChange={(e) => handleSettingChange('highContrast', e.target.checked)} color="primary"/>} label="Високий контраст" sx={{ mb: 2, display: 'flex' }}/>

                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.largeText} onChange={(e) => handleSettingChange('largeText', e.target.checked)} color="primary"/>} label="Великий текст" sx={{ mb: 2, display: 'flex' }}/>

                  <material_1.Box mb={2}>
                    <material_1.Typography gutterBottom>Розмір шрифту: {settings.fontSize}px</material_1.Typography>
                    <material_1.Slider value={settings.fontSize} onChange={(e, value) => handleSettingChange('fontSize', value)} min={12} max={24} step={1} sx={{ color: nexusTheme_1.nexusColors.primary.main }} aria-label="Розмір шрифту"/>
                  </material_1.Box>

                  <material_1.FormControl fullWidth>
                    <material_1.InputLabel>Режим колірної сліпоти</material_1.InputLabel>
                    <material_1.Select value={settings.colorBlindMode} onChange={(e) => handleSettingChange('colorBlindMode', e.target.value)} label="Режим колірної сліпоти">
                      <material_1.MenuItem value="none">Немає</material_1.MenuItem>
                      <material_1.MenuItem value="deuteranopia">Дейтеранопія</material_1.MenuItem>
                      <material_1.MenuItem value="protanopia">Протанопія</material_1.MenuItem>
                      <material_1.MenuItem value="tritanopia">Тританопія</material_1.MenuItem>
                    </material_1.Select>
                  </material_1.FormControl>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>

            {/* Рухові налаштування */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Card sx={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h6" sx={{ color: '#4caf50', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <icons_material_1.MouseOutlined /> Рухові
                  </material_1.Typography>

                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.reducedMotion} onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)} color="primary"/>} label="Зменшена анімація" sx={{ mb: 2, display: 'flex' }}/>

                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.keyboardNavigation} onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)} color="primary"/>} label="Навігація клавіатурою" sx={{ mb: 2, display: 'flex' }}/>

                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.focusIndicator} onChange={(e) => handleSettingChange('focusIndicator', e.target.checked)} color="primary"/>} label="Індикатори фокусу" sx={{ mb: 2, display: 'flex' }}/>

                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.skipLinks} onChange={(e) => handleSettingChange('skipLinks', e.target.checked)} color="primary"/>} label="Швидкі посилання" sx={{ display: 'flex' }}/>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>

            {/* Аудіо та скрін-рідер */}
            <material_1.Grid item xs={12}>
              <material_1.Card sx={{ background: 'rgba(255,152,0,0.1)', border: '1px solid #ff9800' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h6" sx={{ color: '#ff9800', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <icons_material_1.VolumeUp /> Аудіо та Асистивні Технології
                  </material_1.Typography>

                  <material_1.Grid container spacing={2}>
                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.soundEnabled} onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)} color="primary"/>} label="Звукові ефекти" sx={{ display: 'flex' }}/>
                    </material_1.Grid>

                    <material_1.Grid item xs={12} sm={6}>
                      <material_1.FormControlLabel control={<material_1.Switch checked={settings.screenReader} onChange={(e) => handleSettingChange('screenReader', e.target.checked)} color="primary"/>} label="Підтримка скрін-рідера" sx={{ display: 'flex' }}/>
                    </material_1.Grid>
                  </material_1.Grid>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
          </material_1.Grid>

          {/* Інформація про клавіатурні скорочення */}
          <material_1.Box mt={4}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.primary.main, mb: 2 }}>
              ⌨️ Клавіатурні Скорочення
            </material_1.Typography>
            <material_1.Grid container spacing={1}>
              {[
            { key: 'Tab', desc: 'Навігація між елементами' },
            { key: 'Enter/Space', desc: 'Активація кнопок' },
            { key: 'Esc', desc: 'Закриття діалогів' },
            { key: 'Arrow Keys', desc: 'Навігація в меню' },
            { key: 'Alt + 1-9', desc: 'Швидкий перехід до модулів' },
            { key: 'Ctrl + /', desc: 'Довідка по скороченнях' }
        ].map((shortcut, index) => (<material_1.Grid item xs={12} sm={6} key={index}>
                  <material_1.Box display="flex" alignItems="center" gap={2}>
                    <material_1.Chip label={shortcut.key} size="small" sx={{
                background: nexusTheme_1.nexusColors.primary.main,
                color: 'white',
                fontFamily: 'monospace'
            }}/>
                    <material_1.Typography variant="body2" color="textSecondary">
                      {shortcut.desc}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>))}
            </material_1.Grid>
          </material_1.Box>
        </material_1.DialogContent>
      </material_1.Dialog>

      {/* Невидимі skip links для навігації */}
      {settings.skipLinks && (<material_1.Box sx={{
                position: 'absolute',
                top: -9999,
                left: -9999,
                '&:focus-within': {
                    position: 'fixed',
                    top: 10,
                    left: 10,
                    zIndex: 9999,
                    background: nexusTheme_1.nexusColors.primary.main,
                    color: 'white',
                    padding: 2,
                    borderRadius: 1
                }
            }}>
          <a href="#main-content" style={{ color: 'white', textDecoration: 'none' }}>
            Перейти до основного контенту
          </a>
          <a href="#navigation" style={{ color: 'white', textDecoration: 'none', marginLeft: 16 }}>
            Перейти до навігації
          </a>
        </material_1.Box>)}
    </>);
};
exports.default = AccessibilityPanel;
