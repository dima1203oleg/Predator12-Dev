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
exports.SystemControlPanel = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const systemSettings = [
    // Display Settings
    {
        id: 'theme-mode',
        name: 'Темна тема',
        description: 'Увімкнути темну тему інтерфейсу',
        category: 'display',
        type: 'toggle',
        value: true,
        icon: <icons_material_1.Brightness6 />,
        color: '#2196F3'
    },
    {
        id: 'ui-scale',
        name: 'Масштаб інтерфейсу',
        description: 'Налаштування розміру елементів UI',
        category: 'display',
        type: 'slider',
        value: 100,
        min: 75,
        max: 150,
        step: 25,
        icon: <icons_material_1.Palette />,
        color: '#9C27B0'
    },
    {
        id: 'language',
        name: 'Мова інтерфейсу',
        description: 'Оберіть мову системи',
        category: 'display',
        type: 'select',
        value: 'uk',
        options: [
            { label: 'Українська', value: 'uk' },
            { label: 'English', value: 'en' },
            { label: 'Русский', value: 'ru' }
        ],
        icon: <icons_material_1.Language />,
        color: '#4CAF50'
    },
    // Audio Settings
    {
        id: 'system-volume',
        name: 'Гучність системи',
        description: 'Загальна гучність звукових ефектів',
        category: 'audio',
        type: 'slider',
        value: 75,
        min: 0,
        max: 100,
        step: 5,
        icon: <icons_material_1.VolumeUp />,
        color: '#FF9800'
    },
    {
        id: 'sound-notifications',
        name: 'Звукові сповіщення',
        description: 'Увімкнути звуки для сповіщень',
        category: 'audio',
        type: 'toggle',
        value: true,
        icon: <icons_material_1.Notifications />,
        color: '#FF5722'
    },
    // System Settings
    {
        id: 'auto-save',
        name: 'Автозбереження',
        description: 'Автоматично зберігати налаштування',
        category: 'system',
        type: 'toggle',
        value: true,
        icon: <icons_material_1.Save />,
        color: '#4CAF50'
    },
    {
        id: 'cache-size',
        name: 'Розмір кешу',
        description: 'Максимальний розмір кешу в MB',
        category: 'system',
        type: 'slider',
        value: 512,
        min: 128,
        max: 2048,
        step: 128,
        icon: <icons_material_1.Memory />,
        color: '#607D8B',
        advanced: true
    },
    {
        id: 'performance-mode',
        name: 'Режим продуктивності',
        description: 'Оберіть режим роботи системи',
        category: 'system',
        type: 'select',
        value: 'balanced',
        options: [
            { label: 'Економний', value: 'power-saver' },
            { label: 'Збалансований', value: 'balanced' },
            { label: 'Продуктивність', value: 'performance' }
        ],
        icon: <icons_material_1.Speed />,
        color: '#795548',
        advanced: true
    },
    // Network Settings
    {
        id: 'auto-connect',
        name: 'Автопідключення',
        description: 'Автоматично підключатися до мережі',
        category: 'network',
        type: 'toggle',
        value: true,
        icon: <icons_material_1.Wifi />,
        color: '#00BCD4'
    },
    {
        id: 'data-compression',
        name: 'Стиснення даних',
        description: 'Стискати дані для економії трафіку',
        category: 'network',
        type: 'toggle',
        value: false,
        icon: <icons_material_1.CloudDownload />,
        color: '#3F51B5',
        advanced: true
    },
    // Security Settings
    {
        id: 'two-factor',
        name: 'Двофакторна аутентифікація',
        description: 'Увімкнути 2FA для додаткової безпеки',
        category: 'security',
        type: 'toggle',
        value: true,
        icon: <icons_material_1.Security />,
        color: '#F44336'
    },
    {
        id: 'session-timeout',
        name: 'Час сесії (хв)',
        description: 'Автоматичний вихід через неактивність',
        category: 'security',
        type: 'slider',
        value: 60,
        min: 15,
        max: 240,
        step: 15,
        icon: <icons_material_1.Security />,
        color: '#E91E63',
        advanced: true
    }
];
const SystemControlPanel = ({ onSettingChange, onExportSettings, onImportSettings }) => {
    const [settings, setSettings] = (0, react_1.useState)({});
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const [showAdvanced, setShowAdvanced] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [unsavedChanges, setUnsavedChanges] = (0, react_1.useState)(false);
    const [showExportDialog, setShowExportDialog] = (0, react_1.useState)(false);
    const [showImportDialog, setShowImportDialog] = (0, react_1.useState)(false);
    const [importData, setImportData] = (0, react_1.useState)('');
    // Initialize settings
    (0, react_1.useEffect)(() => {
        const initialSettings = {};
        systemSettings.forEach(setting => {
            initialSettings[setting.id] = setting.value;
        });
        setSettings(initialSettings);
    }, []);
    const categories = ['all', 'display', 'audio', 'system', 'network', 'security'];
    const filteredSettings = systemSettings.filter(setting => {
        const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
        const matchesAdvanced = showAdvanced || !setting.advanced;
        const matchesSearch = setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            setting.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesAdvanced && matchesSearch;
    });
    const handleSettingChange = (settingId, value) => {
        setSettings(prev => (Object.assign(Object.assign({}, prev), { [settingId]: value })));
        setUnsavedChanges(true);
        onSettingChange === null || onSettingChange === void 0 ? void 0 : onSettingChange(settingId, value);
    };
    const handleSaveSettings = () => {
        // Simulate save
        setUnsavedChanges(false);
        // Show success notification
    };
    const handleResetSettings = () => {
        const initialSettings = {};
        systemSettings.forEach(setting => {
            initialSettings[setting.id] = setting.value;
        });
        setSettings(initialSettings);
        setUnsavedChanges(false);
    };
    const handleExportSettings = () => {
        const exportData = JSON.stringify(settings, null, 2);
        navigator.clipboard.writeText(exportData);
        setShowExportDialog(false);
        onExportSettings === null || onExportSettings === void 0 ? void 0 : onExportSettings();
    };
    const handleImportSettings = () => {
        try {
            const importedSettings = JSON.parse(importData);
            setSettings(importedSettings);
            setUnsavedChanges(true);
            setShowImportDialog(false);
            setImportData('');
            onImportSettings === null || onImportSettings === void 0 ? void 0 : onImportSettings(importedSettings);
        }
        catch (error) {
            console.error('Invalid JSON');
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'display': return <icons_material_1.Palette />;
            case 'audio': return <icons_material_1.VolumeUp />;
            case 'system': return <icons_material_1.Settings />;
            case 'network': return <icons_material_1.Wifi />;
            case 'security': return <icons_material_1.Security />;
            default: return <icons_material_1.Settings />;
        }
    };
    const getCategoryColor = (category) => {
        switch (category) {
            case 'display': return '#9C27B0';
            case 'audio': return '#FF9800';
            case 'system': return '#607D8B';
            case 'network': return '#00BCD4';
            case 'security': return '#F44336';
            default: return '#2196F3';
        }
    };
    const renderSettingControl = (setting) => {
        var _a;
        switch (setting.type) {
            case 'toggle':
                return (<material_1.Switch checked={settings[setting.id] || false} onChange={(e) => handleSettingChange(setting.id, e.target.checked)} sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: setting.color
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: setting.color
                        }
                    }}/>);
            case 'slider':
                return (<material_1.Box sx={{ width: 200, px: 2 }}>
            <material_1.Slider value={settings[setting.id] || setting.value} onChange={(_, value) => handleSettingChange(setting.id, value)} min={setting.min} max={setting.max} step={setting.step} valueLabelDisplay="auto" sx={{
                        color: setting.color,
                        '& .MuiSlider-thumb': {
                            backgroundColor: setting.color
                        },
                        '& .MuiSlider-track': {
                            backgroundColor: setting.color
                        }
                    }}/>
            <material_1.Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {settings[setting.id] || setting.value} {setting.id.includes('size') ? 'MB' : setting.id.includes('timeout') ? 'хв' : '%'}
            </material_1.Typography>
          </material_1.Box>);
            case 'select':
                return (<material_1.TextField select size="small" value={settings[setting.id] || setting.value} onChange={(e) => handleSettingChange(setting.id, e.target.value)} sx={{ minWidth: 150 }}>
            {(_a = setting.options) === null || _a === void 0 ? void 0 : _a.map((option) => (<material_1.MenuItem key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
                {typeof option === 'string' ? option : option.label}
              </material_1.MenuItem>))}
          </material_1.TextField>);
            case 'text':
                return (<material_1.TextField size="small" value={settings[setting.id] || setting.value} onChange={(e) => handleSettingChange(setting.id, e.target.value)} sx={{ minWidth: 200 }}/>);
            default:
                return null;
        }
    };
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Typography variant="h4" sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 1
        }}>
          ⚙️ Системна панель управління
        </material_1.Typography>
        <material_1.Typography variant="subtitle1" color="text.secondary">
          Налаштування та конфігурація системи
        </material_1.Typography>
      </material_1.Box>

      {/* Controls Bar */}
      <material_1.Paper sx={{
            p: 2,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
        <material_1.Grid container spacing={2} alignItems="center">
          {/* Search */}
          <material_1.Grid item xs={12} md={4}>
            <material_1.TextField fullWidth size="small" placeholder="Пошук налаштувань..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
          </material_1.Grid>

          {/* Category Filter */}
          <material_1.Grid item xs={12} md={4}>
            <material_1.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map((category) => (<material_1.Chip key={category} size="small" icon={getCategoryIcon(category)} label={category === 'all' ? 'Всі' : category} onClick={() => setSelectedCategory(category)} variant={selectedCategory === category ? 'filled' : 'outlined'} sx={Object.assign({}, (selectedCategory === category && {
                bgcolor: getCategoryColor(category),
                color: 'white'
            }))}/>))}
            </material_1.Box>
          </material_1.Grid>

          {/* Advanced Toggle */}
          <material_1.Grid item xs={12} md={4}>
            <material_1.Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <material_1.FormControlLabel control={<material_1.Switch checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} size="small"/>} label="Розширені"/>
            </material_1.Box>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Paper>

      {/* Action Buttons */}
      <material_1.Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <material_1.Button variant="contained" startIcon={<icons_material_1.Save />} onClick={handleSaveSettings} disabled={!unsavedChanges} sx={{
            background: unsavedChanges
                ? 'linear-gradient(45deg, #4CAF50, #8BC34A)'
                : undefined
        }}>
          Зберегти {unsavedChanges && '●'}
        </material_1.Button>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.RestoreFromTrash />} onClick={handleResetSettings}>
          Скинути
        </material_1.Button>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.CloudUpload />} onClick={() => setShowExportDialog(true)}>
          Експорт
        </material_1.Button>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.CloudDownload />} onClick={() => setShowImportDialog(true)}>
          Імпорт
        </material_1.Button>
      </material_1.Box>

      {/* Settings List */}
      <material_1.List>
        {filteredSettings.map((setting, index) => (<framer_motion_1.motion.div key={setting.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <material_1.Card sx={{
                mb: 2,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateX(5px)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                }
            }}>
              <material_1.ListItem sx={{ p: 3 }}>
                <material_1.ListItemIcon>
                  <material_1.Avatar sx={{
                bgcolor: setting.color,
                width: 40,
                height: 40
            }}>
                    {setting.icon}
                  </material_1.Avatar>
                </material_1.ListItemIcon>

                <material_1.ListItemText primary={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <material_1.Typography variant="h6" fontWeight="bold">
                        {setting.name}
                      </material_1.Typography>
                      {setting.advanced && (<material_1.Chip label="Розширено" size="small" sx={{
                        bgcolor: 'orange',
                        color: 'white',
                        fontSize: '0.7rem'
                    }}/>)}
                    </material_1.Box>} secondary={<material_1.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {setting.description}
                    </material_1.Typography>} sx={{ mr: 2 }}/>

                <material_1.Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {renderSettingControl(setting)}
                </material_1.Box>
              </material_1.ListItem>
            </material_1.Card>
          </framer_motion_1.motion.div>))}
      </material_1.List>

      {/* Export Dialog */}
      <material_1.Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="md" fullWidth>
        <material_1.DialogTitle>Експорт налаштувань</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Typography variant="body2" sx={{ mb: 2 }}>
            Налаштування будуть скопійовані до буферу обміну у форматі JSON.
          </material_1.Typography>
          <material_1.TextField fullWidth multiline rows={10} value={JSON.stringify(settings, null, 2)} InputProps={{ readOnly: true }}/>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowExportDialog(false)}>
            Скасувати
          </material_1.Button>
          <material_1.Button variant="contained" startIcon={<icons_material_1.CloudUpload />} onClick={handleExportSettings}>
            Копіювати
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Import Dialog */}
      <material_1.Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} maxWidth="md" fullWidth>
        <material_1.DialogTitle>Імпорт налаштувань</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Typography variant="body2" sx={{ mb: 2 }}>
            Вставте JSON з налаштуваннями для імпорту.
          </material_1.Typography>
          <material_1.TextField fullWidth multiline rows={10} placeholder="Вставте JSON тут..." value={importData} onChange={(e) => setImportData(e.target.value)}/>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowImportDialog(false)}>
            Скасувати
          </material_1.Button>
          <material_1.Button variant="contained" startIcon={<icons_material_1.CloudDownload />} onClick={handleImportSettings} disabled={!importData.trim()}>
            Імпортувати
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Unsaved Changes Warning */}
      <framer_motion_1.AnimatePresence>
        {unsavedChanges && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1000
            }}>
            <material_1.Paper sx={{
                p: 2,
                background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 2
            }}>
              <material_1.Typography variant="body2">
                У вас є незбережені зміни
              </material_1.Typography>
              <material_1.Button size="small" variant="contained" startIcon={<icons_material_1.Save />} onClick={handleSaveSettings} sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                }
            }}>
                Зберегти
              </material_1.Button>
            </material_1.Paper>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </material_1.Box>);
};
exports.SystemControlPanel = SystemControlPanel;
exports.default = exports.SystemControlPanel;
