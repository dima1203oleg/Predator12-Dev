// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings,
  VolumeUp,
  Mic,
  Visibility,
  Psychology,
  Speed,
  HighQuality,
  RestoreFromTrash,
  Save
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface GuideSettings {
  // 3D Avatar Settings
  avatar: {
    enabled: boolean;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    lipSync: boolean;
    gestures: boolean;
    eyeTracking: boolean;
    facialExpressions: boolean;
    fullBody: boolean;
  };

  // Voice Settings
  voice: {
    synthesis: boolean;
    recognition: boolean;
    language: string;
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
    autoSpeak: boolean;
  };

  // Behavior Settings
  behavior: {
    proactive: boolean;
    contextAware: boolean;
    learningMode: boolean;
    personalityType: 'professional' | 'friendly' | 'technical' | 'casual';
    responseDelay: number;
    maxMessageLength: number;
  };

  // Visual Settings
  visual: {
    position: 'left' | 'right' | 'center' | 'floating';
    size: 'small' | 'medium' | 'large';
    transparency: number;
    theme: 'dark' | 'light' | 'auto';
    animations: boolean;
    particles: boolean;
    glowEffects: boolean;
  };

  // Module Integration
  modules: {
    dashboard: boolean;
    etl: boolean;
    agents: boolean;
    security: boolean;
    analytics: boolean;
    settings: boolean;
    notifications: boolean;
  };

  // Advanced Features
  advanced: {
    aiModel: 'basic' | 'advanced' | 'premium';
    contextMemory: number; // minutes
    multiLanguage: boolean;
    emotionalIntelligence: boolean;
    predictiveAssistance: boolean;
    customCommands: boolean;
  };
}

interface GuideSettingsManagerProps {
  open: boolean;
  onClose: () => void;
  settings: GuideSettings;
  onSettingsChange: (settings: GuideSettings) => void;
  onResetDefaults: () => void;
}

const defaultSettings: GuideSettings = {
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

const GuideSettingsManager: React.FC<GuideSettingsManagerProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
  onResetDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'voice' | 'behavior' | 'visual' | 'modules' | 'advanced'>('avatar');
  const [tempSettings, setTempSettings] = useState<GuideSettings>(settings);

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

  const updateSetting = (category: keyof GuideSettings, key: string, value: any) => {
    setTempSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const getQualityDescription = (quality: string) => {
    const descriptions = {
      low: 'Базова якість • Низьке навантаження • Підходить для слабких пристроїв',
      medium: 'Середня якість • Збалансоване навантаження • Рекомендовано',
      high: 'Висока якість • Потребує потужного GPU • Максимальний реалізм',
      ultra: 'Ультра якість • Експериментальна • Потребує топовий GPU'
    };
    return descriptions[quality as keyof typeof descriptions] || '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'avatar':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              Налаштування 3D Аватара
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.avatar.enabled}
                  onChange={(e) => updateSetting('avatar', 'enabled', e.target.checked)}
                />
              }
              label="Увімкнути 3D аватар"
              sx={{ color: nexusColors.frost, mb: 2 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 1 }}>
                Якість рендерингу
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={tempSettings.avatar.quality}
                  onChange={(e) => updateSetting('avatar', 'quality', e.target.value)}
                  sx={{ color: nexusColors.frost }}
                >
                  <MenuItem value="low">Низька</MenuItem>
                  <MenuItem value="medium">Середня</MenuItem>
                  <MenuItem value="high">Висока</MenuItem>
                  <MenuItem value="ultra">Ультра</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ color: nexusColors.nebula, mt: 1, display: 'block' }}>
                {getQualityDescription(tempSettings.avatar.quality)}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.avatar.lipSync}
                      onChange={(e) => updateSetting('avatar', 'lipSync', e.target.checked)}
                    />
                  }
                  label="Синхронізація губ"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.avatar.gestures}
                      onChange={(e) => updateSetting('avatar', 'gestures', e.target.checked)}
                    />
                  }
                  label="Жестикуляція"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.avatar.eyeTracking}
                      onChange={(e) => updateSetting('avatar', 'eyeTracking', e.target.checked)}
                    />
                  }
                  label="Відстеження очей"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.avatar.facialExpressions}
                      onChange={(e) => updateSetting('avatar', 'facialExpressions', e.target.checked)}
                    />
                  }
                  label="Міміка обличчя"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.avatar.fullBody}
                  onChange={(e) => updateSetting('avatar', 'fullBody', e.target.checked)}
                />
              }
              label="Повне тіло (експериментально)"
              sx={{ color: nexusColors.frost, mt: 2 }}
            />
          </Box>
        );

      case 'voice':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              Голосові налаштування
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.voice.synthesis}
                      onChange={(e) => updateSetting('voice', 'synthesis', e.target.checked)}
                    />
                  }
                  label="Синтез мовлення"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.voice.recognition}
                      onChange={(e) => updateSetting('voice', 'recognition', e.target.checked)}
                    />
                  }
                  label="Розпізнавання мови"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 1 }}>
                Мова
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={tempSettings.voice.language}
                  onChange={(e) => updateSetting('voice', 'language', e.target.value)}
                  sx={{ color: nexusColors.frost }}
                >
                  <MenuItem value="uk-UA">Українська</MenuItem>
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="ru-RU">Русский</MenuItem>
                  <MenuItem value="de-DE">Deutsch</MenuItem>
                  <MenuItem value="fr-FR">Français</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 2 }}>
                Швидкість мовлення: {tempSettings.voice.rate.toFixed(1)}x
              </Typography>
              <Slider
                value={tempSettings.voice.rate}
                onChange={(_, value) => updateSetting('voice', 'rate', value)}
                min={0.5}
                max={2.0}
                step={0.1}
                sx={{ color: nexusColors.sapphire }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 2 }}>
                Висота голосу: {tempSettings.voice.pitch.toFixed(1)}
              </Typography>
              <Slider
                value={tempSettings.voice.pitch}
                onChange={(_, value) => updateSetting('voice', 'pitch', value)}
                min={0.5}
                max={2.0}
                step={0.1}
                sx={{ color: nexusColors.sapphire }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 2 }}>
                Гучність: {Math.round(tempSettings.voice.volume * 100)}%
              </Typography>
              <Slider
                value={tempSettings.voice.volume}
                onChange={(_, value) => updateSetting('voice', 'volume', value)}
                min={0}
                max={1}
                step={0.1}
                sx={{ color: nexusColors.sapphire }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={tempSettings.voice.autoSpeak}
                  onChange={(e) => updateSetting('voice', 'autoSpeak', e.target.checked)}
                />
              }
              label="Автоматично озвучувати відповіді"
              sx={{ color: nexusColors.frost, mt: 2 }}
            />
          </Box>
        );

      case 'behavior':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              Поведінка та особистість
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 1 }}>
                Тип особистості
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={tempSettings.behavior.personalityType}
                  onChange={(e) => updateSetting('behavior', 'personalityType', e.target.value)}
                  sx={{ color: nexusColors.frost }}
                >
                  <MenuItem value="professional">Професійний</MenuItem>
                  <MenuItem value="friendly">Дружелюбний</MenuItem>
                  <MenuItem value="technical">Технічний</MenuItem>
                  <MenuItem value="casual">Неформальний</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.behavior.proactive}
                      onChange={(e) => updateSetting('behavior', 'proactive', e.target.checked)}
                    />
                  }
                  label="Проактивний режим"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.behavior.contextAware}
                      onChange={(e) => updateSetting('behavior', 'contextAware', e.target.checked)}
                    />
                  }
                  label="Контекстна обізнаність"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.behavior.learningMode}
                      onChange={(e) => updateSetting('behavior', 'learningMode', e.target.checked)}
                    />
                  }
                  label="Режим навчання"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 2 }}>
                Затримка відповіді: {tempSettings.behavior.responseDelay}мс
              </Typography>
              <Slider
                value={tempSettings.behavior.responseDelay}
                onChange={(_, value) => updateSetting('behavior', 'responseDelay', value)}
                min={0}
                max={3000}
                step={100}
                sx={{ color: nexusColors.sapphire }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 2 }}>
                Макс. довжина повідомлення: {tempSettings.behavior.maxMessageLength} символів
              </Typography>
              <Slider
                value={tempSettings.behavior.maxMessageLength}
                onChange={(_, value) => updateSetting('behavior', 'maxMessageLength', value)}
                min={100}
                max={1000}
                step={50}
                sx={{ color: nexusColors.sapphire }}
              />
            </Box>
          </Box>
        );

      case 'modules':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              Інтеграція з модулями
            </Typography>

            <Grid container spacing={2}>
              {Object.entries(tempSettings.modules).map(([module, enabled]) => (
                <Grid item xs={6} key={module}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enabled}
                        onChange={(e) => updateSetting('modules', module, e.target.checked)}
                      />
                    }
                    label={module.charAt(0).toUpperCase() + module.slice(1)}
                    sx={{ color: nexusColors.frost }}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3, borderColor: nexusColors.quantum }} />

            <Typography variant="subtitle1" sx={{ color: nexusColors.frost, mb: 2 }}>
              Специфічні налаштування модулів
            </Typography>

            <Card sx={{
              backgroundColor: `${nexusColors.obsidian}60`,
              border: `1px solid ${nexusColors.quantum}`,
              mb: 2
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: nexusColors.sapphire, mb: 1 }}>
                  Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                  Загальний огляд системи, ключові метрики, швидка навігація
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{
              backgroundColor: `${nexusColors.obsidian}60`,
              border: `1px solid ${nexusColors.quantum}`,
              mb: 2
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: nexusColors.emerald, mb: 1 }}>
                  ETL
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                  Допомога з конвеєрами даних, моніторинг процесів трансформації
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{
              backgroundColor: `${nexusColors.obsidian}60`,
              border: `1px solid ${nexusColors.quantum}`,
              mb: 2
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: nexusColors.amethyst, mb: 1 }}>
                  Agents
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                  Управління MAS агентами, оптимізація продуктивності
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case 'advanced':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              Розширені налаштування
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 1 }}>
                AI модель
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={tempSettings.advanced.aiModel}
                  onChange={(e) => updateSetting('advanced', 'aiModel', e.target.value)}
                  sx={{ color: nexusColors.frost }}
                >
                  <MenuItem value="basic">Базова (швидка)</MenuItem>
                  <MenuItem value="advanced">Розширена (рекомендовано)</MenuItem>
                  <MenuItem value="premium">Преміум (найточніша)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: nexusColors.frost, mb: 2 }}>
                Пам'ять контексту: {tempSettings.advanced.contextMemory} хвилин
              </Typography>
              <Slider
                value={tempSettings.advanced.contextMemory}
                onChange={(_, value) => updateSetting('advanced', 'contextMemory', value)}
                min={5}
                max={120}
                step={5}
                sx={{ color: nexusColors.sapphire }}
              />
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.advanced.multiLanguage}
                      onChange={(e) => updateSetting('advanced', 'multiLanguage', e.target.checked)}
                    />
                  }
                  label="Мультимовність"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.advanced.emotionalIntelligence}
                      onChange={(e) => updateSetting('advanced', 'emotionalIntelligence', e.target.checked)}
                    />
                  }
                  label="Емоційний інтелект"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.advanced.predictiveAssistance}
                      onChange={(e) => updateSetting('advanced', 'predictiveAssistance', e.target.checked)}
                    />
                  }
                  label="Передбачуваний асистент"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tempSettings.advanced.customCommands}
                      onChange={(e) => updateSetting('advanced', 'customCommands', e.target.checked)}
                    />
                  }
                  label="Кастомні команди"
                  sx={{ color: nexusColors.frost }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: nexusColors.obsidian,
          border: `2px solid ${nexusColors.quantum}`,
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{
        color: nexusColors.frost,
        borderBottom: `1px solid ${nexusColors.quantum}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Settings sx={{ color: nexusColors.amethyst }} />
        Налаштування AI Гіда
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', height: '600px' }}>
        {/* Навігація по вкладках */}
        <Box sx={{
          width: 200,
          borderRight: `1px solid ${nexusColors.quantum}`,
          backgroundColor: `${nexusColors.darkMatter}40`
        }}>
          {[
            { key: 'avatar', label: '3D Аватар', icon: <Psychology /> },
            { key: 'voice', label: 'Голос', icon: <VolumeUp /> },
            { key: 'behavior', label: 'Поведінка', icon: <Psychology /> },
            { key: 'visual', label: 'Візуал', icon: <Visibility /> },
            { key: 'modules', label: 'Модулі', icon: <Settings /> },
            { key: 'advanced', label: 'Розширені', icon: <HighQuality /> }
          ].map((tab) => (
            <Button
              key={tab.key}
              fullWidth
              startIcon={tab.icon}
              onClick={() => setActiveTab(tab.key as any)}
              sx={{
                justifyContent: 'flex-start',
                color: activeTab === tab.key ? nexusColors.frost : nexusColors.nebula,
                backgroundColor: activeTab === tab.key ? `${nexusColors.sapphire}20` : 'transparent',
                borderRadius: 0,
                py: 1.5,
                '&:hover': {
                  backgroundColor: `${nexusColors.sapphire}10`
                }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Контент вкладки */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {renderTabContent()}
        </Box>
      </DialogContent>

      {/* Кнопки управління */}
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${nexusColors.quantum}`,
        display: 'flex',
        gap: 2,
        justifyContent: 'space-between'
      }}>
        <Button
          startIcon={<RestoreFromTrash />}
          onClick={handleReset}
          sx={{ color: nexusColors.warning }}
        >
          Скинути
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: nexusColors.nebula }}>
            Скасувати
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: nexusColors.sapphire,
              '&:hover': { backgroundColor: nexusColors.emerald }
            }}
          >
            Зберегти
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export { GuideSettingsManager, defaultSettings };
export type { GuideSettings };
