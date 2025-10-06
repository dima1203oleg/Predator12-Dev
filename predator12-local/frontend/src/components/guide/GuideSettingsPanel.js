import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Popover, Box, Typography, Switch, FormControlLabel, Slider, Select, MenuItem, FormControl, InputLabel, Divider, Button, Chip, Stack, Alert, LinearProgress, IconButton } from '@mui/material';
import { Close as CloseIcon, VolumeUp as VolumeIcon, Speed as SpeedIcon, Security as SecurityIcon, Restore as RestoreIcon, Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
const GuideSettingsPanel = ({ open, anchorEl, onClose, guideMode, onModeChange, voiceSettings, onVoiceSettingsChange, performanceSettings, onPerformanceSettingsChange, privacySettings, onPrivacySettingsChange }) => {
    const { t } = useI18n();
    const [availableVoices, setAvailableVoices] = useState([]);
    const [testingSpeech, setTestingSpeech] = useState(false);
    // Load available voices
    useEffect(() => {
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
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target?.result);
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
    return (_jsx(Popover, { open: open, anchorEl: anchorEl, onClose: onClose, anchorOrigin: { vertical: 'top', horizontal: 'left' }, transformOrigin: { vertical: 'bottom', horizontal: 'right' }, PaperProps: {
            sx: {
                width: 400,
                maxHeight: 600,
                background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                border: `1px solid ${nexusColors.quantum}`,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }
        }, children: _jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: t('guide.settings.title', 'Налаштування гіда') }), _jsx(IconButton, { size: "small", onClick: onClose, sx: { color: nexusColors.shadow }, children: _jsx(CloseIcon, { fontSize: "small" }) })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost, mb: 1 }, children: t('guide.settings.mode', 'Режим роботи') }), _jsx(Stack, { direction: "row", spacing: 1, children: ['passive', 'guide', 'silent'].map((mode) => (_jsx(Chip, { label: mode === 'passive'
                                    ? t('guide.modes.passive', 'Пасивний')
                                    : mode === 'guide'
                                        ? t('guide.modes.guide', 'Активний')
                                        : t('guide.modes.silent', 'Вимкнений'), variant: guideMode === mode ? 'filled' : 'outlined', onClick: () => onModeChange(mode), sx: {
                                    backgroundColor: guideMode === mode ? `${nexusColors.sapphire}40` : 'transparent',
                                    borderColor: nexusColors.quantum,
                                    color: nexusColors.frost,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: `${nexusColors.sapphire}20`
                                    }
                                } }, mode))) }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula, display: 'block', mt: 0.5 }, children: [guideMode === 'passive' && t('guide.settings.modeDesc.passive', 'Відповідає тільки на запити'), guideMode === 'guide' && t('guide.settings.modeDesc.guide', 'Активні підказки та контекстна допомога'), guideMode === 'silent' && t('guide.settings.modeDesc.silent', 'Повністю вимкнений')] })] }), _jsx(Divider, { sx: { borderColor: nexusColors.quantum, mb: 2 } }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }, children: [_jsx(VolumeIcon, { sx: { color: nexusColors.sapphire, fontSize: '1rem' } }), _jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost }, children: t('guide.settings.voice', 'Голосові функції') })] }), _jsxs(Stack, { spacing: 2, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: voiceSettings.ttsEnabled, onChange: (e) => onVoiceSettingsChange({ ...voiceSettings, ttsEnabled: e.target.checked }), size: "small" }), label: t('guide.settings.tts', 'Озвучування відповідей'), sx: { '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: voiceSettings.sttEnabled, onChange: (e) => onVoiceSettingsChange({ ...voiceSettings, sttEnabled: e.target.checked }), size: "small" }), label: t('guide.settings.stt', 'Голосовий ввід'), sx: { '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } } }), voiceSettings.ttsEnabled && (_jsxs(_Fragment, { children: [_jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { sx: { color: nexusColors.frost }, children: t('guide.settings.language', 'Мова') }), _jsxs(Select, { value: voiceSettings.language, onChange: (e) => onVoiceSettingsChange({ ...voiceSettings, language: e.target.value }), sx: {
                                                        color: nexusColors.frost,
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.sapphire }
                                                    }, children: [_jsx(MenuItem, { value: "uk-UA", children: t('guide.settings.lang.ua', 'Українська') }), _jsx(MenuItem, { value: "en-US", children: t('guide.settings.lang.en', 'English') })] })] }), availableVoices.length > 0 && (_jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { sx: { color: nexusColors.frost }, children: t('guide.settings.voiceType', 'Голос') }), _jsx(Select, { value: voiceSettings.voice, onChange: (e) => onVoiceSettingsChange({ ...voiceSettings, voice: e.target.value }), sx: {
                                                        color: nexusColors.frost,
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.sapphire }
                                                    }, children: availableVoices.map((voice) => (_jsxs(MenuItem, { value: voice.name, children: [voice.name, " (", voice.lang, ")"] }, voice.name))) })] })), _jsxs(Box, { children: [_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: [t('guide.settings.rate', 'Швидкість'), ": ", voiceSettings.rate.toFixed(1)] }), _jsx(Slider, { value: voiceSettings.rate, onChange: (_, value) => onVoiceSettingsChange({ ...voiceSettings, rate: value }), min: 0.5, max: 2.0, step: 0.1, size: "small", sx: { color: nexusColors.sapphire } })] }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: [t('guide.settings.volume', 'Гучність'), ": ", Math.round(voiceSettings.volume * 100), "%"] }), _jsx(Slider, { value: voiceSettings.volume, onChange: (_, value) => onVoiceSettingsChange({ ...voiceSettings, volume: value }), min: 0.1, max: 1.0, step: 0.1, size: "small", sx: { color: nexusColors.sapphire } })] }), _jsx(Button, { size: "small", variant: "outlined", onClick: testSpeech, disabled: testingSpeech, sx: {
                                                borderColor: nexusColors.quantum,
                                                color: nexusColors.frost,
                                                '&:hover': { borderColor: nexusColors.sapphire }
                                            }, children: testingSpeech ? t('guide.settings.testing', 'Тестування...') : t('guide.settings.testVoice', 'Тест голосу') })] }))] })] }), _jsx(Divider, { sx: { borderColor: nexusColors.quantum, mb: 2 } }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }, children: [_jsx(SpeedIcon, { sx: { color: nexusColors.emerald, fontSize: '1rem' } }), _jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost }, children: t('guide.settings.performance', 'Продуктивність') })] }), _jsxs(Stack, { spacing: 2, children: [_jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { sx: { color: nexusColors.frost }, children: t('guide.settings.qualityLabel', 'Якість візуалізації') }), _jsxs(Select, { value: performanceSettings.mode, onChange: (e) => onPerformanceSettingsChange({
                                                ...performanceSettings,
                                                mode: e.target.value
                                            }), sx: {
                                                color: nexusColors.frost,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.emerald }
                                            }, children: [_jsx(MenuItem, { value: "high", children: t('guide.settings.quality.high', 'Висока') }), _jsx(MenuItem, { value: "medium", children: t('guide.settings.quality.medium', 'Середня') }), _jsx(MenuItem, { value: "low", children: t('guide.settings.quality.low', 'Низька') })] })] }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: performanceSettings.fallbackMode, onChange: (e) => onPerformanceSettingsChange({
                                            ...performanceSettings,
                                            fallbackMode: e.target.checked
                                        }), size: "small" }), label: t('guide.settings.fallbackMode', 'Режим сумісності (Canvas)'), sx: { '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: performanceSettings.enableCollisionAvoidance, onChange: (e) => onPerformanceSettingsChange({
                                            ...performanceSettings,
                                            enableCollisionAvoidance: e.target.checked
                                        }), size: "small" }), label: t('guide.settings.collisionAvoidance', 'Уникнення колізій'), sx: { '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } } }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: [t('guide.settings.currentFps', 'Поточний FPS'), ": ", performanceSettings.fps] }), _jsx(LinearProgress, { variant: "determinate", value: Math.min(performanceSettings.fps / 60 * 100, 100), sx: {
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: nexusColors.quantum + '40',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: performanceSettings.fps >= 50 ? nexusColors.emerald :
                                                        performanceSettings.fps >= 30 ? '#FFA726' : nexusColors.crimson
                                                }
                                            } })] })] })] }), _jsx(Divider, { sx: { borderColor: nexusColors.quantum, mb: 2 } }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }, children: [_jsx(SecurityIcon, { sx: { color: nexusColors.crimson, fontSize: '1rem' } }), _jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost }, children: t('guide.settings.privacy', 'Приватність') })] }), _jsxs(Stack, { spacing: 2, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: privacySettings.microphoneAccess, onChange: (e) => onPrivacySettingsChange({
                                            ...privacySettings,
                                            microphoneAccess: e.target.checked
                                        }), size: "small" }), label: t('guide.settings.micAccess', 'Доступ до мікрофону'), sx: { '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: privacySettings.contextualHints, onChange: (e) => onPrivacySettingsChange({
                                            ...privacySettings,
                                            contextualHints: e.target.checked
                                        }), size: "small" }), label: t('guide.settings.contextualHints', 'Контекстні підказки'), sx: { '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: privacySettings.dataCollection, onChange: (e) => onPrivacySettingsChange({
                                            ...privacySettings,
                                            dataCollection: e.target.checked
                                        }), size: "small" }), label: t('guide.settings.dataCollection', 'Збір аналітики'), sx: { '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } } })] })] }), _jsx(Divider, { sx: { borderColor: nexusColors.quantum, mb: 2 } }), _jsxs(Stack, { spacing: 1, children: [_jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(DownloadIcon, {}), onClick: exportSettings, sx: {
                                        borderColor: nexusColors.quantum,
                                        color: nexusColors.frost,
                                        '&:hover': { borderColor: nexusColors.sapphire }
                                    }, children: t('guide.settings.export', 'Експорт') }), _jsxs(Button, { size: "small", variant: "outlined", component: "label", startIcon: _jsx(UploadIcon, {}), sx: {
                                        borderColor: nexusColors.quantum,
                                        color: nexusColors.frost,
                                        '&:hover': { borderColor: nexusColors.sapphire }
                                    }, children: [t('guide.settings.import', 'Імпорт'), _jsx("input", { type: "file", accept: ".json", onChange: importSettings, style: { display: 'none' } })] })] }), _jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(RestoreIcon, {}), onClick: resetToDefaults, sx: {
                                borderColor: nexusColors.crimson,
                                color: nexusColors.crimson,
                                '&:hover': { borderColor: nexusColors.crimson + 'AA', backgroundColor: nexusColors.crimson + '10' }
                            }, children: t('guide.settings.reset', 'Скинути до стандартних') })] }), voiceSettings.sttEnabled && !privacySettings.microphoneAccess && (_jsx(Alert, { severity: "warning", sx: {
                        mt: 2,
                        backgroundColor: '#FFA72620',
                        color: nexusColors.frost,
                        '& .MuiAlert-icon': { color: '#FFA726' }
                    }, children: t('guide.settings.micWarning', 'Для голосового вводу потрібен доступ до мікрофону') }))] }) }));
};
export default GuideSettingsPanel;
