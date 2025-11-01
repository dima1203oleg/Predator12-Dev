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
const nexusTheme_1 = require("../../theme/nexusTheme");
const I18nProvider_1 = require("../../i18n/I18nProvider");
const GuideSettingsPanel = ({ open, anchorEl, onClose, guideMode, onModeChange, voiceSettings, onVoiceSettingsChange, performanceSettings, onPerformanceSettingsChange, privacySettings, onPrivacySettingsChange }) => {
    const { t } = (0, I18nProvider_1.useI18n)();
    const [availableVoices, setAvailableVoices] = (0, react_1.useState)([]);
    const [testingSpeech, setTestingSpeech] = (0, react_1.useState)(false);
    // Load available voices
    (0, react_1.useEffect)(() => {
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            setAvailableVoices(voices.filter(voice => voice.lang.startsWith('uk') || voice.lang.startsWith('en')));
        };
        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;
    }, []);
    // Test TTS
    const testSpeech = () => {
        if (!voiceSettings.ttsEnabled || testingSpeech)
            return;
        setTestingSpeech(true);
        const utterance = new SpeechSynthesisUtterance(t('guide.settings.testSpeech', 'Це тест озвучування. Як вам звучить мій голос?'));
        utterance.lang = voiceSettings.language;
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        if (voiceSettings.voice) {
            const voice = availableVoices.find(v => v.name === voiceSettings.voice);
            if (voice)
                utterance.voice = voice;
        }
        utterance.onend = () => setTestingSpeech(false);
        utterance.onerror = () => setTestingSpeech(false);
        speechSynthesis.speak(utterance);
    };
    // Export settings
    const exportSettings = () => {
        const settings = {
            guideMode,
            voiceSettings,
            performanceSettings,
            privacySettings,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-guide-settings-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    // Import settings
    const importSettings = (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            try {
                const settings = JSON.parse((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
                if (settings.guideMode)
                    onModeChange(settings.guideMode);
                if (settings.voiceSettings)
                    onVoiceSettingsChange(settings.voiceSettings);
                if (settings.performanceSettings)
                    onPerformanceSettingsChange(settings.performanceSettings);
                if (settings.privacySettings)
                    onPrivacySettingsChange(settings.privacySettings);
                console.log('Settings imported successfully');
            }
            catch (error) {
                console.error('Failed to import settings:', error);
            }
        };
        reader.readAsText(file);
    };
    // Reset to defaults
    const resetToDefaults = () => {
        onModeChange('passive');
        onVoiceSettingsChange({
            ttsEnabled: false,
            sttEnabled: false,
            language: 'uk-UA',
            voice: '',
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8,
            autoSpeak: false
        });
        onPerformanceSettingsChange({
            mode: 'medium',
            fps: 60,
            fallbackMode: false,
            enableCollisionAvoidance: true
        });
        onPrivacySettingsChange({
            microphoneAccess: false,
            dataCollection: false,
            contextualHints: true
        });
    };
    return (<material_1.Popover open={open} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }} PaperProps={{
            sx: {
                width: 400,
                maxHeight: 600,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }
        }}>
      <material_1.Box sx={{ p: 3 }}>
        {/* Header */}
        <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
            {t('guide.settings.title', 'Налаштування гіда')}
          </material_1.Typography>
          <material_1.IconButton size="small" onClick={onClose} sx={{ color: nexusTheme_1.nexusColors.shadow }}>
            <icons_material_1.Close fontSize="small"/>
          </material_1.IconButton>
        </material_1.Box>

        {/* Guide Mode */}
        <material_1.Box sx={{ mb: 3 }}>
          <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
            {t('guide.settings.mode', 'Режим роботи')}
          </material_1.Typography>
          <material_1.Stack direction="row" spacing={1}>
            {['passive', 'guide', 'silent'].map((mode) => (<material_1.Chip key={mode} label={mode === 'passive'
                ? t('guide.modes.passive', 'Пасивний')
                : mode === 'guide'
                    ? t('guide.modes.guide', 'Активний')
                    : t('guide.modes.silent', 'Вимкнений')} variant={guideMode === mode ? 'filled' : 'outlined'} onClick={() => onModeChange(mode)} sx={{
                backgroundColor: guideMode === mode ? `${nexusTheme_1.nexusColors.sapphire}40` : 'transparent',
                borderColor: nexusTheme_1.nexusColors.quantum,
                color: nexusTheme_1.nexusColors.frost,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`
                }
            }}/>))}
          </material_1.Stack>
          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block', mt: 0.5 }}>
            {guideMode === 'passive' && t('guide.settings.modeDesc.passive', 'Відповідає тільки на запити')}
            {guideMode === 'guide' && t('guide.settings.modeDesc.guide', 'Активні підказки та контекстна допомога')}
            {guideMode === 'silent' && t('guide.settings.modeDesc.silent', 'Повністю вимкнений')}
          </material_1.Typography>
        </material_1.Box>

        <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

        {/* Voice Settings */}
        <material_1.Box sx={{ mb: 3 }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <icons_material_1.VolumeUp sx={{ color: nexusTheme_1.nexusColors.sapphire, fontSize: '1rem' }}/>
            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
              {t('guide.settings.voice', 'Голосові функції')}
            </material_1.Typography>
          </material_1.Box>

          <material_1.Stack spacing={2}>
            <material_1.FormControlLabel control={<material_1.Switch checked={voiceSettings.ttsEnabled} onChange={(e) => onVoiceSettingsChange(Object.assign(Object.assign({}, voiceSettings), { ttsEnabled: e.target.checked }))} size="small"/>} label={t('guide.settings.tts', 'Озвучування відповідей')} sx={{ '& .MuiFormControlLabel-label': { color: nexusTheme_1.nexusColors.frost, fontSize: '0.875rem' } }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={voiceSettings.sttEnabled} onChange={(e) => onVoiceSettingsChange(Object.assign(Object.assign({}, voiceSettings), { sttEnabled: e.target.checked }))} size="small"/>} label={t('guide.settings.stt', 'Голосовий ввід')} sx={{ '& .MuiFormControlLabel-label': { color: nexusTheme_1.nexusColors.frost, fontSize: '0.875rem' } }}/>

            {voiceSettings.ttsEnabled && (<>
                <material_1.FormControl size="small" fullWidth>
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    {t('guide.settings.language', 'Мова')}
                  </material_1.InputLabel>
                  <material_1.Select value={voiceSettings.language} onChange={(e) => onVoiceSettingsChange(Object.assign(Object.assign({}, voiceSettings), { language: e.target.value }))} sx={{
                color: nexusTheme_1.nexusColors.frost,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.quantum },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.sapphire }
            }}>
                    <material_1.MenuItem value="uk-UA">{t('guide.settings.lang.ua', 'Українська')}</material_1.MenuItem>
                    <material_1.MenuItem value="en-US">{t('guide.settings.lang.en', 'English')}</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>

                {availableVoices.length > 0 && (<material_1.FormControl size="small" fullWidth>
                    <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.frost }}>
                      {t('guide.settings.voiceType', 'Голос')}
                    </material_1.InputLabel>
                    <material_1.Select value={voiceSettings.voice} onChange={(e) => onVoiceSettingsChange(Object.assign(Object.assign({}, voiceSettings), { voice: e.target.value }))} sx={{
                    color: nexusTheme_1.nexusColors.frost,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.quantum },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.sapphire }
                }}>
                      {availableVoices.map((voice) => (<material_1.MenuItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </material_1.MenuItem>))}
                    </material_1.Select>
                  </material_1.FormControl>)}

                <material_1.Box>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    {t('guide.settings.rate', 'Швидкість')}: {voiceSettings.rate.toFixed(1)}
                  </material_1.Typography>
                  <material_1.Slider value={voiceSettings.rate} onChange={(_, value) => onVoiceSettingsChange(Object.assign(Object.assign({}, voiceSettings), { rate: value }))} min={0.5} max={2.0} step={0.1} size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
                </material_1.Box>

                <material_1.Box>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    {t('guide.settings.volume', 'Гучність')}: {Math.round(voiceSettings.volume * 100)}%
                  </material_1.Typography>
                  <material_1.Slider value={voiceSettings.volume} onChange={(_, value) => onVoiceSettingsChange(Object.assign(Object.assign({}, voiceSettings), { volume: value }))} min={0.1} max={1.0} step={0.1} size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
                </material_1.Box>

                <material_1.Button size="small" variant="outlined" onClick={testSpeech} disabled={testingSpeech} sx={{
                borderColor: nexusTheme_1.nexusColors.quantum,
                color: nexusTheme_1.nexusColors.frost,
                '&:hover': { borderColor: nexusTheme_1.nexusColors.sapphire }
            }}>
                  {testingSpeech ? t('guide.settings.testing', 'Тестування...') : t('guide.settings.testVoice', 'Тест голосу')}
                </material_1.Button>
              </>)}
          </material_1.Stack>
        </material_1.Box>

        <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

        {/* Performance Settings */}
        <material_1.Box sx={{ mb: 3 }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <icons_material_1.Speed sx={{ color: nexusTheme_1.nexusColors.emerald, fontSize: '1rem' }}/>
            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
              {t('guide.settings.performance', 'Продуктивність')}
            </material_1.Typography>
          </material_1.Box>

          <material_1.Stack spacing={2}>
            <material_1.FormControl size="small" fullWidth>
              <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.frost }}>
                {t('guide.settings.qualityLabel', 'Якість візуалізації')}
              </material_1.InputLabel>
              <material_1.Select value={performanceSettings.mode} onChange={(e) => onPerformanceSettingsChange(Object.assign(Object.assign({}, performanceSettings), { mode: e.target.value }))} sx={{
            color: nexusTheme_1.nexusColors.frost,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.quantum },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.emerald }
        }}>
                <material_1.MenuItem value="high">{t('guide.settings.quality.high', 'Висока')}</material_1.MenuItem>
                <material_1.MenuItem value="medium">{t('guide.settings.quality.medium', 'Середня')}</material_1.MenuItem>
                <material_1.MenuItem value="low">{t('guide.settings.quality.low', 'Низька')}</material_1.MenuItem>
              </material_1.Select>
            </material_1.FormControl>

            <material_1.FormControlLabel control={<material_1.Switch checked={performanceSettings.fallbackMode} onChange={(e) => onPerformanceSettingsChange(Object.assign(Object.assign({}, performanceSettings), { fallbackMode: e.target.checked }))} size="small"/>} label={t('guide.settings.fallbackMode', 'Режим сумісності (Canvas)')} sx={{ '& .MuiFormControlLabel-label': { color: nexusTheme_1.nexusColors.frost, fontSize: '0.875rem' } }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={performanceSettings.enableCollisionAvoidance} onChange={(e) => onPerformanceSettingsChange(Object.assign(Object.assign({}, performanceSettings), { enableCollisionAvoidance: e.target.checked }))} size="small"/>} label={t('guide.settings.collisionAvoidance', 'Уникнення колізій')} sx={{ '& .MuiFormControlLabel-label': { color: nexusTheme_1.nexusColors.frost, fontSize: '0.875rem' } }}/>

            <material_1.Box>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                {t('guide.settings.currentFps', 'Поточний FPS')}: {performanceSettings.fps}
              </material_1.Typography>
              <material_1.LinearProgress variant="determinate" value={Math.min(performanceSettings.fps / 60 * 100, 100)} sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: nexusTheme_1.nexusColors.quantum + '40',
            '& .MuiLinearProgress-bar': {
                backgroundColor: performanceSettings.fps >= 50 ? nexusTheme_1.nexusColors.emerald :
                    performanceSettings.fps >= 30 ? '#FFA726' : nexusTheme_1.nexusColors.crimson
            }
        }}/>
            </material_1.Box>
          </material_1.Stack>
        </material_1.Box>

        <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

        {/* Privacy Settings */}
        <material_1.Box sx={{ mb: 3 }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <icons_material_1.Security sx={{ color: nexusTheme_1.nexusColors.crimson, fontSize: '1rem' }}/>
            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
              {t('guide.settings.privacy', 'Приватність')}
            </material_1.Typography>
          </material_1.Box>

          <material_1.Stack spacing={2}>
            <material_1.FormControlLabel control={<material_1.Switch checked={privacySettings.microphoneAccess} onChange={(e) => onPrivacySettingsChange(Object.assign(Object.assign({}, privacySettings), { microphoneAccess: e.target.checked }))} size="small"/>} label={t('guide.settings.micAccess', 'Доступ до мікрофону')} sx={{ '& .MuiFormControlLabel-label': { color: nexusTheme_1.nexusColors.frost, fontSize: '0.875rem' } }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={privacySettings.contextualHints} onChange={(e) => onPrivacySettingsChange(Object.assign(Object.assign({}, privacySettings), { contextualHints: e.target.checked }))} size="small"/>} label={t('guide.settings.contextualHints', 'Контекстні підказки')} sx={{ '& .MuiFormControlLabel-label': { color: nexusTheme_1.nexusColors.frost, fontSize: '0.875rem' } }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={privacySettings.dataCollection} onChange={(e) => onPrivacySettingsChange(Object.assign(Object.assign({}, privacySettings), { dataCollection: e.target.checked }))} size="small"/>} label={t('guide.settings.dataCollection', 'Збір аналітики')} sx={{ '& .MuiFormControlLabel-label': { color: nexusTheme_1.nexusColors.frost, fontSize: '0.875rem' } }}/>
          </material_1.Stack>
        </material_1.Box>

        <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

        {/* Actions */}
        <material_1.Stack spacing={1}>
          <material_1.Stack direction="row" spacing={1}>
            <material_1.Button size="small" variant="outlined" startIcon={<icons_material_1.Download />} onClick={exportSettings} sx={{
            borderColor: nexusTheme_1.nexusColors.quantum,
            color: nexusTheme_1.nexusColors.frost,
            '&:hover': { borderColor: nexusTheme_1.nexusColors.sapphire }
        }}>
              {t('guide.settings.export', 'Експорт')}
            </material_1.Button>

            <material_1.Button size="small" variant="outlined" component="label" startIcon={<icons_material_1.Upload />} sx={{
            borderColor: nexusTheme_1.nexusColors.quantum,
            color: nexusTheme_1.nexusColors.frost,
            '&:hover': { borderColor: nexusTheme_1.nexusColors.sapphire }
        }}>
              {t('guide.settings.import', 'Імпорт')}
              <input type="file" accept=".json" onChange={importSettings} style={{ display: 'none' }}/>
            </material_1.Button>
          </material_1.Stack>

          <material_1.Button size="small" variant="outlined" startIcon={<icons_material_1.Restore />} onClick={resetToDefaults} sx={{
            borderColor: nexusTheme_1.nexusColors.crimson,
            color: nexusTheme_1.nexusColors.crimson,
            '&:hover': { borderColor: nexusTheme_1.nexusColors.crimson + 'AA', backgroundColor: nexusTheme_1.nexusColors.crimson + '10' }
        }}>
            {t('guide.settings.reset', 'Скинути до стандартних')}
          </material_1.Button>
        </material_1.Stack>

        {/* Warning for microphone access */}
        {voiceSettings.sttEnabled && !privacySettings.microphoneAccess && (<material_1.Alert severity="warning" sx={{
                mt: 2,
                backgroundColor: '#FFA72620',
                color: nexusTheme_1.nexusColors.frost,
                '& .MuiAlert-icon': { color: '#FFA726' }
            }}>
            {t('guide.settings.micWarning', 'Для голосового вводу потрібен доступ до мікрофону')}
          </material_1.Alert>)}
      </material_1.Box>
    </material_1.Popover>);
};
exports.default = GuideSettingsPanel;
