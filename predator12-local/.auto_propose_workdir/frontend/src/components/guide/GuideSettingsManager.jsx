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
exports.defaultSettings = exports.GuideSettingsManager = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const defaultSettings = {
    avatar: {
        enabled: true,
        quality: 'medium',
        lipSync: true,
        gestures: true,
        eyeTracking: false,
        facialExpressions: true,
        fullBody: false
    },
    voice: {
        synthesis: true,
        recognition: true,
        language: 'uk-UA',
        voice: 'uk-UA-Standard-A',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
        autoSpeak: true
    },
    behavior: {
        proactive: true,
        contextAware: true,
        learningMode: true,
        personalityType: 'professional',
        responseDelay: 1000,
        maxMessageLength: 300
    },
    visual: {
        position: 'left',
        size: 'medium',
        transparency: 0.95,
        theme: 'dark',
        animations: true,
        particles: true,
        glowEffects: true
    },
    modules: {
        dashboard: true,
        etl: true,
        agents: true,
        security: true,
        analytics: true,
        settings: true,
        notifications: true
    },
    advanced: {
        aiModel: 'advanced',
        contextMemory: 30,
        multiLanguage: true,
        emotionalIntelligence: true,
        predictiveAssistance: true,
        customCommands: false
    }
};
exports.defaultSettings = defaultSettings;
const GuideSettingsManager = ({ open, onClose, settings, onSettingsChange, onResetDefaults }) => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('avatar');
    const [tempSettings, setTempSettings] = (0, react_1.useState)(settings);
    (0, react_1.useEffect)(() => {
        setTempSettings(settings);
    }, [settings]);
    const handleSave = () => {
        onSettingsChange(tempSettings);
        onClose();
    };
    const handleReset = () => {
        setTempSettings(defaultSettings);
        onResetDefaults();
    };
    const updateSetting = (category, key, value) => {
        setTempSettings(prev => (Object.assign(Object.assign({}, prev), { [category]: Object.assign(Object.assign({}, prev[category]), { [key]: value }) })));
    };
    const getQualityDescription = (quality) => {
        const descriptions = {
            low: 'Базова якість • Низьке навантаження • Підходить для слабких пристроїв',
            medium: 'Середня якість • Збалансоване навантаження • Рекомендовано',
            high: 'Висока якість • Потребує потужного GPU • Максимальний реалізм',
            ultra: 'Ультра якість • Експериментальна • Потребує топовий GPU'
        };
        return descriptions[quality] || '';
    };
    const renderTabContent = () => {
        switch (activeTab) {
            case 'avatar':
                return (<material_1.Box sx={{ p: 2 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Налаштування 3D Аватара
            </material_1.Typography>

            <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.avatar.enabled} onChange={(e) => updateSetting('avatar', 'enabled', e.target.checked)}/>} label="Увімкнути 3D аватар" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}/>

            <material_1.Box sx={{ mb: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                Якість рендерингу
              </material_1.Typography>
              <material_1.FormControl fullWidth size="small">
                <material_1.Select value={tempSettings.avatar.quality} onChange={(e) => updateSetting('avatar', 'quality', e.target.value)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  <material_1.MenuItem value="low">Низька</material_1.MenuItem>
                  <material_1.MenuItem value="medium">Середня</material_1.MenuItem>
                  <material_1.MenuItem value="high">Висока</material_1.MenuItem>
                  <material_1.MenuItem value="ultra">Ультра</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, mt: 1, display: 'block' }}>
                {getQualityDescription(tempSettings.avatar.quality)}
              </material_1.Typography>
            </material_1.Box>

            <material_1.Grid container spacing={2}>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.avatar.lipSync} onChange={(e) => updateSetting('avatar', 'lipSync', e.target.checked)}/>} label="Синхронізація губ" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.avatar.gestures} onChange={(e) => updateSetting('avatar', 'gestures', e.target.checked)}/>} label="Жестикуляція" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.avatar.eyeTracking} onChange={(e) => updateSetting('avatar', 'eyeTracking', e.target.checked)}/>} label="Відстеження очей" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.avatar.facialExpressions} onChange={(e) => updateSetting('avatar', 'facialExpressions', e.target.checked)}/>} label="Міміка обличчя" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
            </material_1.Grid>

            <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.avatar.fullBody} onChange={(e) => updateSetting('avatar', 'fullBody', e.target.checked)}/>} label="Повне тіло (експериментально)" sx={{ color: nexusTheme_1.nexusColors.frost, mt: 2 }}/>
          </material_1.Box>);
            case 'voice':
                return (<material_1.Box sx={{ p: 2 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Голосові налаштування
            </material_1.Typography>

            <material_1.Grid container spacing={2}>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.voice.synthesis} onChange={(e) => updateSetting('voice', 'synthesis', e.target.checked)}/>} label="Синтез мовлення" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.voice.recognition} onChange={(e) => updateSetting('voice', 'recognition', e.target.checked)}/>} label="Розпізнавання мови" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
            </material_1.Grid>

            <material_1.Box sx={{ mt: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                Мова
              </material_1.Typography>
              <material_1.FormControl fullWidth size="small">
                <material_1.Select value={tempSettings.voice.language} onChange={(e) => updateSetting('voice', 'language', e.target.value)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  <material_1.MenuItem value="uk-UA">Українська</material_1.MenuItem>
                  <material_1.MenuItem value="en-US">English (US)</material_1.MenuItem>
                  <material_1.MenuItem value="ru-RU">Русский</material_1.MenuItem>
                  <material_1.MenuItem value="de-DE">Deutsch</material_1.MenuItem>
                  <material_1.MenuItem value="fr-FR">Français</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Box>

            <material_1.Box sx={{ mt: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
                Швидкість мовлення: {tempSettings.voice.rate.toFixed(1)}x
              </material_1.Typography>
              <material_1.Slider value={tempSettings.voice.rate} onChange={(_, value) => updateSetting('voice', 'rate', value)} min={0.5} max={2.0} step={0.1} sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
            </material_1.Box>

            <material_1.Box sx={{ mt: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
                Висота голосу: {tempSettings.voice.pitch.toFixed(1)}
              </material_1.Typography>
              <material_1.Slider value={tempSettings.voice.pitch} onChange={(_, value) => updateSetting('voice', 'pitch', value)} min={0.5} max={2.0} step={0.1} sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
            </material_1.Box>

            <material_1.Box sx={{ mt: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
                Гучність: {Math.round(tempSettings.voice.volume * 100)}%
              </material_1.Typography>
              <material_1.Slider value={tempSettings.voice.volume} onChange={(_, value) => updateSetting('voice', 'volume', value)} min={0} max={1} step={0.1} sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
            </material_1.Box>

            <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.voice.autoSpeak} onChange={(e) => updateSetting('voice', 'autoSpeak', e.target.checked)}/>} label="Автоматично озвучувати відповіді" sx={{ color: nexusTheme_1.nexusColors.frost, mt: 2 }}/>
          </material_1.Box>);
            case 'behavior':
                return (<material_1.Box sx={{ p: 2 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Поведінка та особистість
            </material_1.Typography>

            <material_1.Box sx={{ mb: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                Тип особистості
              </material_1.Typography>
              <material_1.FormControl fullWidth size="small">
                <material_1.Select value={tempSettings.behavior.personalityType} onChange={(e) => updateSetting('behavior', 'personalityType', e.target.value)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  <material_1.MenuItem value="professional">Професійний</material_1.MenuItem>
                  <material_1.MenuItem value="friendly">Дружелюбний</material_1.MenuItem>
                  <material_1.MenuItem value="technical">Технічний</material_1.MenuItem>
                  <material_1.MenuItem value="casual">Неформальний</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Box>

            <material_1.Grid container spacing={2}>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.behavior.proactive} onChange={(e) => updateSetting('behavior', 'proactive', e.target.checked)}/>} label="Проактивний режим" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.behavior.contextAware} onChange={(e) => updateSetting('behavior', 'contextAware', e.target.checked)}/>} label="Контекстна обізнаність" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.behavior.learningMode} onChange={(e) => updateSetting('behavior', 'learningMode', e.target.checked)}/>} label="Режим навчання" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
            </material_1.Grid>

            <material_1.Box sx={{ mt: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
                Затримка відповіді: {tempSettings.behavior.responseDelay}мс
              </material_1.Typography>
              <material_1.Slider value={tempSettings.behavior.responseDelay} onChange={(_, value) => updateSetting('behavior', 'responseDelay', value)} min={0} max={3000} step={100} sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
            </material_1.Box>

            <material_1.Box sx={{ mt: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
                Макс. довжина повідомлення: {tempSettings.behavior.maxMessageLength} символів
              </material_1.Typography>
              <material_1.Slider value={tempSettings.behavior.maxMessageLength} onChange={(_, value) => updateSetting('behavior', 'maxMessageLength', value)} min={100} max={1000} step={50} sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
            </material_1.Box>
          </material_1.Box>);
            case 'modules':
                return (<material_1.Box sx={{ p: 2 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Інтеграція з модулями
            </material_1.Typography>

            <material_1.Grid container spacing={2}>
              {Object.entries(tempSettings.modules).map(([module, enabled]) => (<material_1.Grid item xs={6} key={module}>
                  <material_1.FormControlLabel control={<material_1.Switch checked={enabled} onChange={(e) => updateSetting('modules', module, e.target.checked)}/>} label={module.charAt(0).toUpperCase() + module.slice(1)} sx={{ color: nexusTheme_1.nexusColors.frost }}/>
                </material_1.Grid>))}
            </material_1.Grid>

            <material_1.Divider sx={{ my: 3, borderColor: nexusTheme_1.nexusColors.quantum }}/>

            <material_1.Typography variant="subtitle1" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Специфічні налаштування модулів
            </material_1.Typography>

            <material_1.Card sx={{
                        backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
                        border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                        mb: 2
                    }}>
              <material_1.CardContent>
                <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.sapphire, mb: 1 }}>
                  Dashboard
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                  Загальний огляд системи, ключові метрики, швидка навігація
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>

            <material_1.Card sx={{
                        backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
                        border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                        mb: 2
                    }}>
              <material_1.CardContent>
                <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.emerald, mb: 1 }}>
                  ETL
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                  Допомога з конвеєрами даних, моніторинг процесів трансформації
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>

            <material_1.Card sx={{
                        backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
                        border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                        mb: 2
                    }}>
              <material_1.CardContent>
                <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.amethyst, mb: 1 }}>
                  Agents
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                  Управління MAS агентами, оптимізація продуктивності
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Box>);
            case 'advanced':
                return (<material_1.Box sx={{ p: 2 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Розширені налаштування
            </material_1.Typography>

            <material_1.Box sx={{ mb: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                AI модель
              </material_1.Typography>
              <material_1.FormControl fullWidth size="small">
                <material_1.Select value={tempSettings.advanced.aiModel} onChange={(e) => updateSetting('advanced', 'aiModel', e.target.value)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  <material_1.MenuItem value="basic">Базова (швидка)</material_1.MenuItem>
                  <material_1.MenuItem value="advanced">Розширена (рекомендовано)</material_1.MenuItem>
                  <material_1.MenuItem value="premium">Преміум (найточніша)</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Box>

            <material_1.Box sx={{ mt: 3 }}>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
                Пам'ять контексту: {tempSettings.advanced.contextMemory} хвилин
              </material_1.Typography>
              <material_1.Slider value={tempSettings.advanced.contextMemory} onChange={(_, value) => updateSetting('advanced', 'contextMemory', value)} min={5} max={120} step={5} sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
            </material_1.Box>

            <material_1.Grid container spacing={2} sx={{ mt: 2 }}>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.advanced.multiLanguage} onChange={(e) => updateSetting('advanced', 'multiLanguage', e.target.checked)}/>} label="Мультимовність" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.advanced.emotionalIntelligence} onChange={(e) => updateSetting('advanced', 'emotionalIntelligence', e.target.checked)}/>} label="Емоційний інтелект" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.advanced.predictiveAssistance} onChange={(e) => updateSetting('advanced', 'predictiveAssistance', e.target.checked)}/>} label="Передбачуваний асистент" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.FormControlLabel control={<material_1.Switch checked={tempSettings.advanced.customCommands} onChange={(e) => updateSetting('advanced', 'customCommands', e.target.checked)}/>} label="Кастомні команди" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.Box>);
            default:
                return null;
        }
    };
    return (<material_1.Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
            sx: {
                backgroundColor: nexusTheme_1.nexusColors.obsidian,
                border: `2px solid ${nexusTheme_1.nexusColors.quantum}`,
                minHeight: '80vh'
            }
        }}>
      <material_1.DialogTitle sx={{
            color: nexusTheme_1.nexusColors.frost,
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1
        }}>
        <icons_material_1.Settings sx={{ color: nexusTheme_1.nexusColors.amethyst }}/>
        Налаштування AI Гіда
      </material_1.DialogTitle>

      <material_1.DialogContent sx={{ p: 0, display: 'flex', height: '600px' }}>
        {/* Навігація по вкладках */}
        <material_1.Box sx={{
            width: 200,
            borderRight: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            backgroundColor: `${nexusTheme_1.nexusColors.darkMatter}40`
        }}>
          {[
            { key: 'avatar', label: '3D Аватар', icon: <icons_material_1.Psychology /> },
            { key: 'voice', label: 'Голос', icon: <icons_material_1.VolumeUp /> },
            { key: 'behavior', label: 'Поведінка', icon: <icons_material_1.Psychology /> },
            { key: 'visual', label: 'Візуал', icon: <icons_material_1.Visibility /> },
            { key: 'modules', label: 'Модулі', icon: <icons_material_1.Settings /> },
            { key: 'advanced', label: 'Розширені', icon: <icons_material_1.HighQuality /> }
        ].map((tab) => (<material_1.Button key={tab.key} fullWidth startIcon={tab.icon} onClick={() => setActiveTab(tab.key)} sx={{
                justifyContent: 'flex-start',
                color: activeTab === tab.key ? nexusTheme_1.nexusColors.frost : nexusTheme_1.nexusColors.nebula,
                backgroundColor: activeTab === tab.key ? `${nexusTheme_1.nexusColors.sapphire}20` : 'transparent',
                borderRadius: 0,
                py: 1.5,
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.sapphire}10`
                }
            }}>
              {tab.label}
            </material_1.Button>))}
        </material_1.Box>

        {/* Контент вкладки */}
        <material_1.Box sx={{ flex: 1, overflow: 'auto' }}>
          {renderTabContent()}
        </material_1.Box>
      </material_1.DialogContent>

      {/* Кнопки управління */}
      <material_1.Box sx={{
            p: 2,
            borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between'
        }}>
        <material_1.Button startIcon={<icons_material_1.RestoreFromTrash />} onClick={handleReset} sx={{ color: nexusTheme_1.nexusColors.warning }}>
          Скинути
        </material_1.Button>

        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          <material_1.Button onClick={onClose} sx={{ color: nexusTheme_1.nexusColors.nebula }}>
            Скасувати
          </material_1.Button>
          <material_1.Button startIcon={<icons_material_1.Save />} onClick={handleSave} variant="contained" sx={{
            backgroundColor: nexusTheme_1.nexusColors.sapphire,
            '&:hover': { backgroundColor: nexusTheme_1.nexusColors.emerald }
        }}>
            Зберегти
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>
    </material_1.Dialog>);
};
exports.GuideSettingsManager = GuideSettingsManager;
