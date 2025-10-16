// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import {
  Settings,
  Palette,
  Brightness6,
  VolumeUp,
  Notifications,
  Language,
  Security,
  Storage,
  Wifi,
  Bluetooth,
  Battery90,
  Memory,
  Speed,
  Save,
  RestoreFromTrash,
  CloudDownload,
  CloudUpload,
  Refresh,
  Check,
  Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemSetting {
  id: string;
  name: string;
  description: string;
  category: 'display' | 'audio' | 'system' | 'network' | 'security';
  type: 'toggle' | 'slider' | 'select' | 'text';
  value: any;
  options?: string[] | { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  icon: React.ReactNode;
  color: string;
  advanced?: boolean;
}

const systemSettings: SystemSetting[] = [
  // Display Settings
  {
    id: 'theme-mode',
    name: 'Темна тема',
    description: 'Увімкнути темну тему інтерфейсу',
    category: 'display',
    type: 'toggle',
    value: true,
    icon: <Brightness6 />,
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
    icon: <Palette />,
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
    icon: <Language />,
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
    icon: <VolumeUp />,
    color: '#FF9800'
  },
  {
    id: 'sound-notifications',
    name: 'Звукові сповіщення',
    description: 'Увімкнути звуки для сповіщень',
    category: 'audio',
    type: 'toggle',
    value: true,
    icon: <Notifications />,
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
    icon: <Save />,
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
    icon: <Memory />,
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
    icon: <Speed />,
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
    icon: <Wifi />,
    color: '#00BCD4'
  },
  {
    id: 'data-compression',
    name: 'Стиснення даних',
    description: 'Стискати дані для економії трафіку',
    category: 'network',
    type: 'toggle',
    value: false,
    icon: <CloudDownload />,
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
    icon: <Security />,
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
    icon: <Security />,
    color: '#E91E63',
    advanced: true
  }
];

interface SystemControlPanelProps {
  onSettingChange?: (settingId: string, value: any) => void;
  onExportSettings?: () => void;
  onImportSettings?: (settings: any) => void;
}

export const SystemControlPanel: React.FC<SystemControlPanelProps> = ({
  onSettingChange,
  onExportSettings,
  onImportSettings
}) => {
  const [settings, setSettings] = useState<{ [key: string]: any }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  // Initialize settings
  useEffect(() => {
    const initialSettings: { [key: string]: any } = {};
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

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => ({ ...prev, [settingId]: value }));
    setUnsavedChanges(true);
    onSettingChange?.(settingId, value);
  };

  const handleSaveSettings = () => {
    // Simulate save
    setUnsavedChanges(false);
    // Show success notification
  };

  const handleResetSettings = () => {
    const initialSettings: { [key: string]: any } = {};
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
    onExportSettings?.();
  };

  const handleImportSettings = () => {
    try {
      const importedSettings = JSON.parse(importData);
      setSettings(importedSettings);
      setUnsavedChanges(true);
      setShowImportDialog(false);
      setImportData('');
      onImportSettings?.(importedSettings);
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'display': return <Palette />;
      case 'audio': return <VolumeUp />;
      case 'system': return <Settings />;
      case 'network': return <Wifi />;
      case 'security': return <Security />;
      default: return <Settings />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'display': return '#9C27B0';
      case 'audio': return '#FF9800';
      case 'system': return '#607D8B';
      case 'network': return '#00BCD4';
      case 'security': return '#F44336';
      default: return '#2196F3';
    }
  };

  const renderSettingControl = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <Switch
            checked={settings[setting.id] || false}
            onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: setting.color
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: setting.color
              }
            }}
          />
        );

      case 'slider':
        return (
          <Box sx={{ width: 200, px: 2 }}>
            <Slider
              value={settings[setting.id] || setting.value}
              onChange={(_, value) => handleSettingChange(setting.id, value)}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              valueLabelDisplay="auto"
              sx={{
                color: setting.color,
                '& .MuiSlider-thumb': {
                  backgroundColor: setting.color
                },
                '& .MuiSlider-track': {
                  backgroundColor: setting.color
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {settings[setting.id] || setting.value} {setting.id.includes('size') ? 'MB' : setting.id.includes('timeout') ? 'хв' : '%'}
            </Typography>
          </Box>
        );

      case 'select':
        return (
          <TextField
            select
            size="small"
            value={settings[setting.id] || setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {setting.options?.map((option: any) => (
              <MenuItem key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
                {typeof option === 'string' ? option : option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'text':
        return (
          <TextField
            size="small"
            value={settings[setting.id] || setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            sx={{ minWidth: 200 }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          ⚙️ Системна панель управління
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Налаштування та конфігурація системи
        </Typography>
      </Box>

      {/* Controls Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Пошук налаштувань..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  size="small"
                  icon={getCategoryIcon(category)}
                  label={category === 'all' ? 'Всі' : category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                  sx={{
                    ...(selectedCategory === category && {
                      bgcolor: getCategoryColor(category),
                      color: 'white'
                    })
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Advanced Toggle */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAdvanced}
                    onChange={(e) => setShowAdvanced(e.target.checked)}
                    size="small"
                  />
                }
                label="Розширені"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={!unsavedChanges}
          sx={{
            background: unsavedChanges
              ? 'linear-gradient(45deg, #4CAF50, #8BC34A)'
              : undefined
          }}
        >
          Зберегти {unsavedChanges && '●'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<RestoreFromTrash />}
          onClick={handleResetSettings}
        >
          Скинути
        </Button>

        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={() => setShowExportDialog(true)}
        >
          Експорт
        </Button>

        <Button
          variant="outlined"
          startIcon={<CloudDownload />}
          onClick={() => setShowImportDialog(true)}
        >
          Імпорт
        </Button>
      </Box>

      {/* Settings List */}
      <List>
        {filteredSettings.map((setting, index) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateX(5px)',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <ListItem sx={{ p: 3 }}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: setting.color,
                      width: 40,
                      height: 40
                    }}
                  >
                    {setting.icon}
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {setting.name}
                      </Typography>
                      {setting.advanced && (
                        <Chip
                          label="Розширено"
                          size="small"
                          sx={{
                            bgcolor: 'orange',
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {setting.description}
                    </Typography>
                  }
                  sx={{ mr: 2 }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {renderSettingControl(setting)}
                </Box>
              </ListItem>
            </Card>
          </motion.div>
        ))}
      </List>

      {/* Export Dialog */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Експорт налаштувань</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Налаштування будуть скопійовані до буферу обміну у форматі JSON.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={JSON.stringify(settings, null, 2)}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Скасувати
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleExportSettings}
          >
            Копіювати
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Імпорт налаштувань</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Вставте JSON з налаштуваннями для імпорту.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            placeholder="Вставте JSON тут..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>
            Скасувати
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={handleImportSettings}
            disabled={!importData.trim()}
          >
            Імпортувати
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsaved Changes Warning */}
      <AnimatePresence>
        {unsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000
            }}
          >
            <Paper
              sx={{
                p: 2,
                background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 2
              }}
            >
              <Typography variant="body2">
                У вас є незбережені зміни
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveSettings}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Зберегти
              </Button>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SystemControlPanel;
