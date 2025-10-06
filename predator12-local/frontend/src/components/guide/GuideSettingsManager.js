import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, Typography, Slider, Switch, FormControlLabel, Select, MenuItem, FormControl, Divider, Button, Grid, Card, CardContent } from '@mui/material';
import { Settings, VolumeUp, Visibility, Psychology, HighQuality, RestoreFromTrash, Save } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
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
const GuideSettingsManager = ({ open, onClose, settings, onSettingsChange, onResetDefaults }) => {
    const [activeTab, setActiveTab] = useState('avatar');
    const [tempSettings, setTempSettings] = useState(settings);
    useEffect(() => {
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
        setTempSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
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
                return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F 3D \u0410\u0432\u0430\u0442\u0430\u0440\u0430" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.avatar.enabled, onChange: (e) => updateSetting('avatar', 'enabled', e.target.checked) }), label: "\u0423\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 3D \u0430\u0432\u0430\u0442\u0430\u0440", sx: { color: nexusColors.frost, mb: 2 } }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { sx: { color: nexusColors.frost, mb: 1 }, children: "\u042F\u043A\u0456\u0441\u0442\u044C \u0440\u0435\u043D\u0434\u0435\u0440\u0438\u043D\u0433\u0443" }), _jsx(FormControl, { fullWidth: true, size: "small", children: _jsxs(Select, { value: tempSettings.avatar.quality, onChange: (e) => updateSetting('avatar', 'quality', e.target.value), sx: { color: nexusColors.frost }, children: [_jsx(MenuItem, { value: "low", children: "\u041D\u0438\u0437\u044C\u043A\u0430" }), _jsx(MenuItem, { value: "medium", children: "\u0421\u0435\u0440\u0435\u0434\u043D\u044F" }), _jsx(MenuItem, { value: "high", children: "\u0412\u0438\u0441\u043E\u043A\u0430" }), _jsx(MenuItem, { value: "ultra", children: "\u0423\u043B\u044C\u0442\u0440\u0430" })] }) }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula, mt: 1, display: 'block' }, children: getQualityDescription(tempSettings.avatar.quality) })] }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.avatar.lipSync, onChange: (e) => updateSetting('avatar', 'lipSync', e.target.checked) }), label: "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0456\u0437\u0430\u0446\u0456\u044F \u0433\u0443\u0431", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.avatar.gestures, onChange: (e) => updateSetting('avatar', 'gestures', e.target.checked) }), label: "\u0416\u0435\u0441\u0442\u0438\u043A\u0443\u043B\u044F\u0446\u0456\u044F", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.avatar.eyeTracking, onChange: (e) => updateSetting('avatar', 'eyeTracking', e.target.checked) }), label: "\u0412\u0456\u0434\u0441\u0442\u0435\u0436\u0435\u043D\u043D\u044F \u043E\u0447\u0435\u0439", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.avatar.facialExpressions, onChange: (e) => updateSetting('avatar', 'facialExpressions', e.target.checked) }), label: "\u041C\u0456\u043C\u0456\u043A\u0430 \u043E\u0431\u043B\u0438\u0447\u0447\u044F", sx: { color: nexusColors.frost } }) })] }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.avatar.fullBody, onChange: (e) => updateSetting('avatar', 'fullBody', e.target.checked) }), label: "\u041F\u043E\u0432\u043D\u0435 \u0442\u0456\u043B\u043E (\u0435\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u043E)", sx: { color: nexusColors.frost, mt: 2 } })] }));
            case 'voice':
                return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.voice.synthesis, onChange: (e) => updateSetting('voice', 'synthesis', e.target.checked) }), label: "\u0421\u0438\u043D\u0442\u0435\u0437 \u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.voice.recognition, onChange: (e) => updateSetting('voice', 'recognition', e.target.checked) }), label: "\u0420\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u0432\u0430\u043D\u043D\u044F \u043C\u043E\u0432\u0438", sx: { color: nexusColors.frost } }) })] }), _jsxs(Box, { sx: { mt: 3 }, children: [_jsx(Typography, { sx: { color: nexusColors.frost, mb: 1 }, children: "\u041C\u043E\u0432\u0430" }), _jsx(FormControl, { fullWidth: true, size: "small", children: _jsxs(Select, { value: tempSettings.voice.language, onChange: (e) => updateSetting('voice', 'language', e.target.value), sx: { color: nexusColors.frost }, children: [_jsx(MenuItem, { value: "uk-UA", children: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430" }), _jsx(MenuItem, { value: "en-US", children: "English (US)" }), _jsx(MenuItem, { value: "ru-RU", children: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" }), _jsx(MenuItem, { value: "de-DE", children: "Deutsch" }), _jsx(MenuItem, { value: "fr-FR", children: "Fran\u00E7ais" })] }) })] }), _jsxs(Box, { sx: { mt: 3 }, children: [_jsxs(Typography, { sx: { color: nexusColors.frost, mb: 2 }, children: ["\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F: ", tempSettings.voice.rate.toFixed(1), "x"] }), _jsx(Slider, { value: tempSettings.voice.rate, onChange: (_, value) => updateSetting('voice', 'rate', value), min: 0.5, max: 2.0, step: 0.1, sx: { color: nexusColors.sapphire } })] }), _jsxs(Box, { sx: { mt: 3 }, children: [_jsxs(Typography, { sx: { color: nexusColors.frost, mb: 2 }, children: ["\u0412\u0438\u0441\u043E\u0442\u0430 \u0433\u043E\u043B\u043E\u0441\u0443: ", tempSettings.voice.pitch.toFixed(1)] }), _jsx(Slider, { value: tempSettings.voice.pitch, onChange: (_, value) => updateSetting('voice', 'pitch', value), min: 0.5, max: 2.0, step: 0.1, sx: { color: nexusColors.sapphire } })] }), _jsxs(Box, { sx: { mt: 3 }, children: [_jsxs(Typography, { sx: { color: nexusColors.frost, mb: 2 }, children: ["\u0413\u0443\u0447\u043D\u0456\u0441\u0442\u044C: ", Math.round(tempSettings.voice.volume * 100), "%"] }), _jsx(Slider, { value: tempSettings.voice.volume, onChange: (_, value) => updateSetting('voice', 'volume', value), min: 0, max: 1, step: 0.1, sx: { color: nexusColors.sapphire } })] }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.voice.autoSpeak, onChange: (e) => updateSetting('voice', 'autoSpeak', e.target.checked) }), label: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E \u043E\u0437\u0432\u0443\u0447\u0443\u0432\u0430\u0442\u0438 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456", sx: { color: nexusColors.frost, mt: 2 } })] }));
            case 'behavior':
                return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\u041F\u043E\u0432\u0435\u0434\u0456\u043D\u043A\u0430 \u0442\u0430 \u043E\u0441\u043E\u0431\u0438\u0441\u0442\u0456\u0441\u0442\u044C" }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { sx: { color: nexusColors.frost, mb: 1 }, children: "\u0422\u0438\u043F \u043E\u0441\u043E\u0431\u0438\u0441\u0442\u043E\u0441\u0442\u0456" }), _jsx(FormControl, { fullWidth: true, size: "small", children: _jsxs(Select, { value: tempSettings.behavior.personalityType, onChange: (e) => updateSetting('behavior', 'personalityType', e.target.value), sx: { color: nexusColors.frost }, children: [_jsx(MenuItem, { value: "professional", children: "\u041F\u0440\u043E\u0444\u0435\u0441\u0456\u0439\u043D\u0438\u0439" }), _jsx(MenuItem, { value: "friendly", children: "\u0414\u0440\u0443\u0436\u0435\u043B\u044E\u0431\u043D\u0438\u0439" }), _jsx(MenuItem, { value: "technical", children: "\u0422\u0435\u0445\u043D\u0456\u0447\u043D\u0438\u0439" }), _jsx(MenuItem, { value: "casual", children: "\u041D\u0435\u0444\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u0438\u0439" })] }) })] }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.behavior.proactive, onChange: (e) => updateSetting('behavior', 'proactive', e.target.checked) }), label: "\u041F\u0440\u043E\u0430\u043A\u0442\u0438\u0432\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.behavior.contextAware, onChange: (e) => updateSetting('behavior', 'contextAware', e.target.checked) }), label: "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u043D\u0430 \u043E\u0431\u0456\u0437\u043D\u0430\u043D\u0456\u0441\u0442\u044C", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.behavior.learningMode, onChange: (e) => updateSetting('behavior', 'learningMode', e.target.checked) }), label: "\u0420\u0435\u0436\u0438\u043C \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F", sx: { color: nexusColors.frost } }) })] }), _jsxs(Box, { sx: { mt: 3 }, children: [_jsxs(Typography, { sx: { color: nexusColors.frost, mb: 2 }, children: ["\u0417\u0430\u0442\u0440\u0438\u043C\u043A\u0430 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456: ", tempSettings.behavior.responseDelay, "\u043C\u0441"] }), _jsx(Slider, { value: tempSettings.behavior.responseDelay, onChange: (_, value) => updateSetting('behavior', 'responseDelay', value), min: 0, max: 3000, step: 100, sx: { color: nexusColors.sapphire } })] }), _jsxs(Box, { sx: { mt: 3 }, children: [_jsxs(Typography, { sx: { color: nexusColors.frost, mb: 2 }, children: ["\u041C\u0430\u043A\u0441. \u0434\u043E\u0432\u0436\u0438\u043D\u0430 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F: ", tempSettings.behavior.maxMessageLength, " \u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432"] }), _jsx(Slider, { value: tempSettings.behavior.maxMessageLength, onChange: (_, value) => updateSetting('behavior', 'maxMessageLength', value), min: 100, max: 1000, step: 50, sx: { color: nexusColors.sapphire } })] })] }));
            case 'modules':
                return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\u0406\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0456\u044F \u0437 \u043C\u043E\u0434\u0443\u043B\u044F\u043C\u0438" }), _jsx(Grid, { container: true, spacing: 2, children: Object.entries(tempSettings.modules).map(([module, enabled]) => (_jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: enabled, onChange: (e) => updateSetting('modules', module, e.target.checked) }), label: module.charAt(0).toUpperCase() + module.slice(1), sx: { color: nexusColors.frost } }) }, module))) }), _jsx(Divider, { sx: { my: 3, borderColor: nexusColors.quantum } }), _jsx(Typography, { variant: "subtitle1", sx: { color: nexusColors.frost, mb: 2 }, children: "\u0421\u043F\u0435\u0446\u0438\u0444\u0456\u0447\u043D\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u043C\u043E\u0434\u0443\u043B\u0456\u0432" }), _jsx(Card, { sx: {
                                backgroundColor: `${nexusColors.obsidian}60`,
                                border: `1px solid ${nexusColors.quantum}`,
                                mb: 2
                            }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.sapphire, mb: 1 }, children: "Dashboard" }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0438\u0439 \u043E\u0433\u043B\u044F\u0434 \u0441\u0438\u0441\u0442\u0435\u043C\u0438, \u043A\u043B\u044E\u0447\u043E\u0432\u0456 \u043C\u0435\u0442\u0440\u0438\u043A\u0438, \u0448\u0432\u0438\u0434\u043A\u0430 \u043D\u0430\u0432\u0456\u0433\u0430\u0446\u0456\u044F" })] }) }), _jsx(Card, { sx: {
                                backgroundColor: `${nexusColors.obsidian}60`,
                                border: `1px solid ${nexusColors.quantum}`,
                                mb: 2
                            }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.emerald, mb: 1 }, children: "ETL" }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: "\u0414\u043E\u043F\u043E\u043C\u043E\u0433\u0430 \u0437 \u043A\u043E\u043D\u0432\u0435\u0454\u0440\u0430\u043C\u0438 \u0434\u0430\u043D\u0438\u0445, \u043C\u043E\u043D\u0456\u0442\u043E\u0440\u0438\u043D\u0433 \u043F\u0440\u043E\u0446\u0435\u0441\u0456\u0432 \u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u0457" })] }) }), _jsx(Card, { sx: {
                                backgroundColor: `${nexusColors.obsidian}60`,
                                border: `1px solid ${nexusColors.quantum}`,
                                mb: 2
                            }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.amethyst, mb: 1 }, children: "Agents" }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F MAS \u0430\u0433\u0435\u043D\u0442\u0430\u043C\u0438, \u043E\u043F\u0442\u0438\u043C\u0456\u0437\u0430\u0446\u0456\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0456" })] }) })] }));
            case 'advanced':
                return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\u0420\u043E\u0437\u0448\u0438\u0440\u0435\u043D\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { sx: { color: nexusColors.frost, mb: 1 }, children: "AI \u043C\u043E\u0434\u0435\u043B\u044C" }), _jsx(FormControl, { fullWidth: true, size: "small", children: _jsxs(Select, { value: tempSettings.advanced.aiModel, onChange: (e) => updateSetting('advanced', 'aiModel', e.target.value), sx: { color: nexusColors.frost }, children: [_jsx(MenuItem, { value: "basic", children: "\u0411\u0430\u0437\u043E\u0432\u0430 (\u0448\u0432\u0438\u0434\u043A\u0430)" }), _jsx(MenuItem, { value: "advanced", children: "\u0420\u043E\u0437\u0448\u0438\u0440\u0435\u043D\u0430 (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u043E\u0432\u0430\u043D\u043E)" }), _jsx(MenuItem, { value: "premium", children: "\u041F\u0440\u0435\u043C\u0456\u0443\u043C (\u043D\u0430\u0439\u0442\u043E\u0447\u043D\u0456\u0448\u0430)" })] }) })] }), _jsxs(Box, { sx: { mt: 3 }, children: [_jsxs(Typography, { sx: { color: nexusColors.frost, mb: 2 }, children: ["\u041F\u0430\u043C'\u044F\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0443: ", tempSettings.advanced.contextMemory, " \u0445\u0432\u0438\u043B\u0438\u043D"] }), _jsx(Slider, { value: tempSettings.advanced.contextMemory, onChange: (_, value) => updateSetting('advanced', 'contextMemory', value), min: 5, max: 120, step: 5, sx: { color: nexusColors.sapphire } })] }), _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 2 }, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.advanced.multiLanguage, onChange: (e) => updateSetting('advanced', 'multiLanguage', e.target.checked) }), label: "\u041C\u0443\u043B\u044C\u0442\u0438\u043C\u043E\u0432\u043D\u0456\u0441\u0442\u044C", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.advanced.emotionalIntelligence, onChange: (e) => updateSetting('advanced', 'emotionalIntelligence', e.target.checked) }), label: "\u0415\u043C\u043E\u0446\u0456\u0439\u043D\u0438\u0439 \u0456\u043D\u0442\u0435\u043B\u0435\u043A\u0442", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.advanced.predictiveAssistance, onChange: (e) => updateSetting('advanced', 'predictiveAssistance', e.target.checked) }), label: "\u041F\u0435\u0440\u0435\u0434\u0431\u0430\u0447\u0443\u0432\u0430\u043D\u0438\u0439 \u0430\u0441\u0438\u0441\u0442\u0435\u043D\u0442", sx: { color: nexusColors.frost } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: tempSettings.advanced.customCommands, onChange: (e) => updateSetting('advanced', 'customCommands', e.target.checked) }), label: "\u041A\u0430\u0441\u0442\u043E\u043C\u043D\u0456 \u043A\u043E\u043C\u0430\u043D\u0434\u0438", sx: { color: nexusColors.frost } }) })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, PaperProps: {
            sx: {
                backgroundColor: nexusColors.obsidian,
                border: `2px solid ${nexusColors.quantum}`,
                minHeight: '80vh'
            }
        }, children: [_jsxs(DialogTitle, { sx: {
                    color: nexusColors.frost,
                    borderBottom: `1px solid ${nexusColors.quantum}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }, children: [_jsx(Settings, { sx: { color: nexusColors.amethyst } }), "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F AI \u0413\u0456\u0434\u0430"] }), _jsxs(DialogContent, { sx: { p: 0, display: 'flex', height: '600px' }, children: [_jsx(Box, { sx: {
                            width: 200,
                            borderRight: `1px solid ${nexusColors.quantum}`,
                            backgroundColor: `${nexusColors.darkMatter}40`
                        }, children: [
                            { key: 'avatar', label: '3D Аватар', icon: _jsx(Psychology, {}) },
                            { key: 'voice', label: 'Голос', icon: _jsx(VolumeUp, {}) },
                            { key: 'behavior', label: 'Поведінка', icon: _jsx(Psychology, {}) },
                            { key: 'visual', label: 'Візуал', icon: _jsx(Visibility, {}) },
                            { key: 'modules', label: 'Модулі', icon: _jsx(Settings, {}) },
                            { key: 'advanced', label: 'Розширені', icon: _jsx(HighQuality, {}) }
                        ].map((tab) => (_jsx(Button, { fullWidth: true, startIcon: tab.icon, onClick: () => setActiveTab(tab.key), sx: {
                                justifyContent: 'flex-start',
                                color: activeTab === tab.key ? nexusColors.frost : nexusColors.nebula,
                                backgroundColor: activeTab === tab.key ? `${nexusColors.sapphire}20` : 'transparent',
                                borderRadius: 0,
                                py: 1.5,
                                '&:hover': {
                                    backgroundColor: `${nexusColors.sapphire}10`
                                }
                            }, children: tab.label }, tab.key))) }), _jsx(Box, { sx: { flex: 1, overflow: 'auto' }, children: renderTabContent() })] }), _jsxs(Box, { sx: {
                    p: 2,
                    borderTop: `1px solid ${nexusColors.quantum}`,
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between'
                }, children: [_jsx(Button, { startIcon: _jsx(RestoreFromTrash, {}), onClick: handleReset, sx: { color: nexusColors.warning }, children: "\u0421\u043A\u0438\u043D\u0443\u0442\u0438" }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { onClick: onClose, sx: { color: nexusColors.nebula }, children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }), _jsx(Button, { startIcon: _jsx(Save, {}), onClick: handleSave, variant: "contained", sx: {
                                    backgroundColor: nexusColors.sapphire,
                                    '&:hover': { backgroundColor: nexusColors.emerald }
                                }, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438" })] })] })] }));
};
export { GuideSettingsManager, defaultSettings };
