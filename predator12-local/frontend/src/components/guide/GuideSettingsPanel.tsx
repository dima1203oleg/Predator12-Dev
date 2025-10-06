// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Button,
  Chip,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  VolumeUp as VolumeIcon,
  Mic as MicIcon,
  Speed as SpeedIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';

interface GuideSettingsPanelProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  guideMode: 'passive' | 'guide' | 'silent';
  onModeChange: (mode: 'passive' | 'guide' | 'silent') => void;
  voiceSettings: {
    ttsEnabled: boolean;
    sttEnabled: boolean;
    language: string;
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
    autoSpeak: boolean;
  };
  onVoiceSettingsChange: (settings: any) => void;
  performanceSettings: {
    mode: 'high' | 'medium' | 'low';
    fps: number;
    fallbackMode: boolean;
    enableCollisionAvoidance: boolean;
  };
  onPerformanceSettingsChange: (settings: any) => void;
  privacySettings: {
    microphoneAccess: boolean;
    dataCollection: boolean;
    contextualHints: boolean;
  };
  onPrivacySettingsChange: (settings: any) => void;
}

const GuideSettingsPanel: React.FC<GuideSettingsPanelProps> = ({
  open,
  anchorEl,
  onClose,
  guideMode,
  onModeChange,
  voiceSettings,
  onVoiceSettingsChange,
  performanceSettings,
  onPerformanceSettingsChange,
  privacySettings,
  onPrivacySettingsChange
}) => {
  const { t } = useI18n();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testingSpeech, setTestingSpeech] = useState(false);
  
  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices.filter(voice => 
        voice.lang.startsWith('uk') || voice.lang.startsWith('en')
      ));
    };
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);
  
  // Test TTS
  const testSpeech = () => {
    if (!voiceSettings.ttsEnabled || testingSpeech) return;
    
    setTestingSpeech(true);
    const utterance = new SpeechSynthesisUtterance(
      t('guide.settings.testSpeech', 'Це тест озвучування. Як вам звучить мій голос?')
    );
    
    utterance.lang = voiceSettings.language;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    
    if (voiceSettings.voice) {
      const voice = availableVoices.find(v => v.name === voiceSettings.voice);
      if (voice) utterance.voice = voice;
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
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        if (settings.guideMode) onModeChange(settings.guideMode);
        if (settings.voiceSettings) onVoiceSettingsChange(settings.voiceSettings);
        if (settings.performanceSettings) onPerformanceSettingsChange(settings.performanceSettings);
        if (settings.privacySettings) onPrivacySettingsChange(settings.privacySettings);
        
        console.log('Settings imported successfully');
      } catch (error) {
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

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
          background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
          border: `1px solid ${nexusColors.quantum}`,
          borderRadius: 2,
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
            {t('guide.settings.title', 'Налаштування гіда')}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: nexusColors.shadow }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Guide Mode */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: nexusColors.frost, mb: 1 }}>
            {t('guide.settings.mode', 'Режим роботи')}
          </Typography>
          <Stack direction="row" spacing={1}>
            {(['passive', 'guide', 'silent'] as const).map((mode) => (
              <Chip
                key={mode}
                label={
                  mode === 'passive' 
                    ? t('guide.modes.passive', 'Пасивний')
                    : mode === 'guide' 
                    ? t('guide.modes.guide', 'Активний') 
                    : t('guide.modes.silent', 'Вимкнений')
                }
                variant={guideMode === mode ? 'filled' : 'outlined'}
                onClick={() => onModeChange(mode)}
                sx={{
                  backgroundColor: guideMode === mode ? `${nexusColors.sapphire}40` : 'transparent',
                  borderColor: nexusColors.quantum,
                  color: nexusColors.frost,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: `${nexusColors.sapphire}20`
                  }
                }}
              />
            ))}
          </Stack>
          <Typography variant="caption" sx={{ color: nexusColors.nebula, display: 'block', mt: 0.5 }}>
            {guideMode === 'passive' && t('guide.settings.modeDesc.passive', 'Відповідає тільки на запити')}
            {guideMode === 'guide' && t('guide.settings.modeDesc.guide', 'Активні підказки та контекстна допомога')}
            {guideMode === 'silent' && t('guide.settings.modeDesc.silent', 'Повністю вимкнений')}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: nexusColors.quantum, mb: 2 }} />

        {/* Voice Settings */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <VolumeIcon sx={{ color: nexusColors.sapphire, fontSize: '1rem' }} />
            <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
              {t('guide.settings.voice', 'Голосові функції')}
            </Typography>
          </Box>
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={voiceSettings.ttsEnabled}
                  onChange={(e) => onVoiceSettingsChange({ ...voiceSettings, ttsEnabled: e.target.checked })}
                  size="small"
                />
              }
              label={t('guide.settings.tts', 'Озвучування відповідей')}
              sx={{ '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={voiceSettings.sttEnabled}
                  onChange={(e) => onVoiceSettingsChange({ ...voiceSettings, sttEnabled: e.target.checked })}
                  size="small"
                />
              }
              label={t('guide.settings.stt', 'Голосовий ввід')}
              sx={{ '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } }}
            />
            
            {voiceSettings.ttsEnabled && (
              <>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: nexusColors.frost }}>
                    {t('guide.settings.language', 'Мова')}
                  </InputLabel>
                  <Select
                    value={voiceSettings.language}
                    onChange={(e) => onVoiceSettingsChange({ ...voiceSettings, language: e.target.value })}
                    sx={{
                      color: nexusColors.frost,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.sapphire }
                    }}
                  >
                    <MenuItem value="uk-UA">{t('guide.settings.lang.ua', 'Українська')}</MenuItem>
                    <MenuItem value="en-US">{t('guide.settings.lang.en', 'English')}</MenuItem>
                  </Select>
                </FormControl>
                
                {availableVoices.length > 0 && (
                  <FormControl size="small" fullWidth>
                    <InputLabel sx={{ color: nexusColors.frost }}>
                      {t('guide.settings.voiceType', 'Голос')}
                    </InputLabel>
                    <Select
                      value={voiceSettings.voice}
                      onChange={(e) => onVoiceSettingsChange({ ...voiceSettings, voice: e.target.value })}
                      sx={{
                        color: nexusColors.frost,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.sapphire }
                      }}
                    >
                      {availableVoices.map((voice) => (
                        <MenuItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <Box>
                  <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                    {t('guide.settings.rate', 'Швидкість')}: {voiceSettings.rate.toFixed(1)}
                  </Typography>
                  <Slider
                    value={voiceSettings.rate}
                    onChange={(_, value) => onVoiceSettingsChange({ ...voiceSettings, rate: value as number })}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    size="small"
                    sx={{ color: nexusColors.sapphire }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                    {t('guide.settings.volume', 'Гучність')}: {Math.round(voiceSettings.volume * 100)}%
                  </Typography>
                  <Slider
                    value={voiceSettings.volume}
                    onChange={(_, value) => onVoiceSettingsChange({ ...voiceSettings, volume: value as number })}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    size="small"
                    sx={{ color: nexusColors.sapphire }}
                  />
                </Box>
                
                <Button
                  size="small"
                  variant="outlined"
                  onClick={testSpeech}
                  disabled={testingSpeech}
                  sx={{
                    borderColor: nexusColors.quantum,
                    color: nexusColors.frost,
                    '&:hover': { borderColor: nexusColors.sapphire }
                  }}
                >
                  {testingSpeech ? t('guide.settings.testing', 'Тестування...') : t('guide.settings.testVoice', 'Тест голосу')}
                </Button>
              </>
            )}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: nexusColors.quantum, mb: 2 }} />

        {/* Performance Settings */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SpeedIcon sx={{ color: nexusColors.emerald, fontSize: '1rem' }} />
            <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
              {t('guide.settings.performance', 'Продуктивність')}
            </Typography>
          </Box>
          
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: nexusColors.frost }}>
                {t('guide.settings.qualityLabel', 'Якість візуалізації')}
              </InputLabel>
              <Select
                value={performanceSettings.mode}
                onChange={(e) => onPerformanceSettingsChange({ 
                  ...performanceSettings, 
                  mode: e.target.value as 'high' | 'medium' | 'low'
                })}
                sx={{
                  color: nexusColors.frost,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.emerald }
                }}
              >
                <MenuItem value="high">{t('guide.settings.quality.high', 'Висока')}</MenuItem>
                <MenuItem value="medium">{t('guide.settings.quality.medium', 'Середня')}</MenuItem>
                <MenuItem value="low">{t('guide.settings.quality.low', 'Низька')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={performanceSettings.fallbackMode}
                  onChange={(e) => onPerformanceSettingsChange({ 
                    ...performanceSettings, 
                    fallbackMode: e.target.checked 
                  })}
                  size="small"
                />
              }
              label={t('guide.settings.fallbackMode', 'Режим сумісності (Canvas)')}
              sx={{ '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={performanceSettings.enableCollisionAvoidance}
                  onChange={(e) => onPerformanceSettingsChange({ 
                    ...performanceSettings, 
                    enableCollisionAvoidance: e.target.checked 
                  })}
                  size="small"
                />
              }
              label={t('guide.settings.collisionAvoidance', 'Уникнення колізій')}
              sx={{ '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } }}
            />
            
            <Box>
              <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                {t('guide.settings.currentFps', 'Поточний FPS')}: {performanceSettings.fps}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(performanceSettings.fps / 60 * 100, 100)}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: nexusColors.quantum + '40',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: performanceSettings.fps >= 50 ? nexusColors.emerald : 
                                   performanceSettings.fps >= 30 ? '#FFA726' : nexusColors.crimson
                  }
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: nexusColors.quantum, mb: 2 }} />

        {/* Privacy Settings */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SecurityIcon sx={{ color: nexusColors.crimson, fontSize: '1rem' }} />
            <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
              {t('guide.settings.privacy', 'Приватність')}
            </Typography>
          </Box>
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.microphoneAccess}
                  onChange={(e) => onPrivacySettingsChange({ 
                    ...privacySettings, 
                    microphoneAccess: e.target.checked 
                  })}
                  size="small"
                />
              }
              label={t('guide.settings.micAccess', 'Доступ до мікрофону')}
              sx={{ '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.contextualHints}
                  onChange={(e) => onPrivacySettingsChange({ 
                    ...privacySettings, 
                    contextualHints: e.target.checked 
                  })}
                  size="small"
                />
              }
              label={t('guide.settings.contextualHints', 'Контекстні підказки')}
              sx={{ '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.dataCollection}
                  onChange={(e) => onPrivacySettingsChange({ 
                    ...privacySettings, 
                    dataCollection: e.target.checked 
                  })}
                  size="small"
                />
              }
              label={t('guide.settings.dataCollection', 'Збір аналітики')}
              sx={{ '& .MuiFormControlLabel-label': { color: nexusColors.frost, fontSize: '0.875rem' } }}
            />
          </Stack>
        </Box>

        <Divider sx={{ borderColor: nexusColors.quantum, mb: 2 }} />

        {/* Actions */}
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportSettings}
              sx={{
                borderColor: nexusColors.quantum,
                color: nexusColors.frost,
                '&:hover': { borderColor: nexusColors.sapphire }
              }}
            >
              {t('guide.settings.export', 'Експорт')}
            </Button>
            
            <Button
              size="small"
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{
                borderColor: nexusColors.quantum,
                color: nexusColors.frost,
                '&:hover': { borderColor: nexusColors.sapphire }
              }}
            >
              {t('guide.settings.import', 'Імпорт')}
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                style={{ display: 'none' }}
              />
            </Button>
          </Stack>
          
          <Button
            size="small"
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={resetToDefaults}
            sx={{
              borderColor: nexusColors.crimson,
              color: nexusColors.crimson,
              '&:hover': { borderColor: nexusColors.crimson + 'AA', backgroundColor: nexusColors.crimson + '10' }
            }}
          >
            {t('guide.settings.reset', 'Скинути до стандартних')}
          </Button>
        </Stack>

        {/* Warning for microphone access */}
        {voiceSettings.sttEnabled && !privacySettings.microphoneAccess && (
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 2, 
              backgroundColor: '#FFA72620',
              color: nexusColors.frost,
              '& .MuiAlert-icon': { color: '#FFA726' }
            }}
          >
            {t('guide.settings.micWarning', 'Для голосового вводу потрібен доступ до мікрофону')}
          </Alert>
        )}
      </Box>
    </Popover>
  );
};

export default GuideSettingsPanel;
