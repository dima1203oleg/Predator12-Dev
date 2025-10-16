// @ts-nocheck
/**
 * 🎯 MODEL SELECTION & CONFIGURATION COMPONENT
 *
 * Розширений функціонал:
 * - Вибір моделей для кожного акаунту
 * - Конфігурація параметрів моделей
 * - Тестування підключення
 * - Моніторинг використання
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

// ============= ТИПИ =============

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enabled: boolean;
}

interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  error?: string;
  timestamp: string;
}

// ============= КОНСТАНТИ =============

const DEFAULT_MODEL_CONFIGS: Record<string, Partial<ModelConfig>> = {
  'reasoning': {
    maxTokens: 4096,
    temperature: 0.1,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  'code': {
    maxTokens: 8192,
    temperature: 0.2,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  'vision': {
    maxTokens: 2048,
    temperature: 0.3,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  'quick': {
    maxTokens: 1024,
    temperature: 0.5,
    topP: 0.9,
    frequencyPenalty: 0.2,
    presencePenalty: 0.2
  }
};

// ============= КОМПОНЕНТ =============

interface ModelConfigDialogProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
  accountName: string;
  providerName: string;
  models: string[];
}

export const ModelConfigDialog: React.FC<ModelConfigDialogProps> = ({
  open,
  onClose,
  accountId,
  accountName,
  providerName,
  models
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(models[0] || '');
  const [config, setConfig] = useState<ModelConfig>({
    id: '',
    name: selectedModel,
    provider: providerName,
    maxTokens: 4096,
    temperature: 0.3,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    enabled: true
  });
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Симуляція тестування підключення
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = Math.random() > 0.2; // 80% success rate
      const latency = Math.floor(Math.random() * 500) + 100;

      setTestResult({
        success,
        latency: success ? latency : undefined,
        error: success ? undefined : 'Failed to connect to API endpoint',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    // Зберегти конфігурацію
    console.log('Saving model config:', config);
    onClose();
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);

    // Застосувати дефолтні налаштування залежно від типу моделі
    const modelType = getModelType(modelName);
    const defaults = DEFAULT_MODEL_CONFIGS[modelType] || DEFAULT_MODEL_CONFIGS['reasoning'];

    setConfig({
      ...config,
      name: modelName,
      ...defaults
    });
  };

  const getModelType = (modelName: string): string => {
    if (modelName.includes('gpt-4') || modelName.includes('claude')) return 'reasoning';
    if (modelName.includes('code') || modelName.includes('deepseek')) return 'code';
    if (modelName.includes('vision') || modelName.includes('llava')) return 'vision';
    return 'quick';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(0,10,20,0.98) 0%, rgba(10,5,20,0.98) 100%)',
          border: `2px solid ${nexusColors.sapphire}60`,
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
        ⚙️ Model Configuration: {accountName}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Model Selection */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: nexusColors.frost }}>Model</InputLabel>
            <Select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              sx={{
                color: nexusColors.frost,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: `${nexusColors.shadow}60`
                }
              }}
            >
              {models.map(model => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ borderColor: `${nexusColors.shadow}30` }} />

          {/* Configuration Parameters */}
          <Typography variant="h6" sx={{ color: nexusColors.frost }}>
            Parameters
          </Typography>

          {/* Max Tokens */}
          <Box>
            <Typography variant="body2" sx={{ color: nexusColors.shadow, mb: 1 }}>
              Max Tokens: {config.maxTokens}
            </Typography>
            <Slider
              value={config.maxTokens}
              onChange={(_, value) => setConfig({ ...config, maxTokens: value as number })}
              min={256}
              max={16384}
              step={256}
              marks={[
                { value: 256, label: '256' },
                { value: 4096, label: '4K' },
                { value: 8192, label: '8K' },
                { value: 16384, label: '16K' }
              ]}
              sx={{
                color: nexusColors.quantum,
                '& .MuiSlider-mark': {
                  backgroundColor: nexusColors.shadow
                }
              }}
            />
          </Box>

          {/* Temperature */}
          <Box>
            <Typography variant="body2" sx={{ color: nexusColors.shadow, mb: 1 }}>
              Temperature: {config.temperature.toFixed(2)}
            </Typography>
            <Slider
              value={config.temperature}
              onChange={(_, value) => setConfig({ ...config, temperature: value as number })}
              min={0}
              max={2}
              step={0.1}
              marks={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' }
              ]}
              sx={{ color: nexusColors.quantum }}
            />
          </Box>

          {/* Top P */}
          <Box>
            <Typography variant="body2" sx={{ color: nexusColors.shadow, mb: 1 }}>
              Top P: {config.topP.toFixed(2)}
            </Typography>
            <Slider
              value={config.topP}
              onChange={(_, value) => setConfig({ ...config, topP: value as number })}
              min={0}
              max={1}
              step={0.05}
              sx={{ color: nexusColors.quantum }}
            />
          </Box>

          {/* Frequency Penalty */}
          <Box>
            <Typography variant="body2" sx={{ color: nexusColors.shadow, mb: 1 }}>
              Frequency Penalty: {config.frequencyPenalty.toFixed(2)}
            </Typography>
            <Slider
              value={config.frequencyPenalty}
              onChange={(_, value) => setConfig({ ...config, frequencyPenalty: value as number })}
              min={-2}
              max={2}
              step={0.1}
              sx={{ color: nexusColors.quantum }}
            />
          </Box>

          {/* Presence Penalty */}
          <Box>
            <Typography variant="body2" sx={{ color: nexusColors.shadow, mb: 1 }}>
              Presence Penalty: {config.presencePenalty.toFixed(2)}
            </Typography>
            <Slider
              value={config.presencePenalty}
              onChange={(_, value) => setConfig({ ...config, presencePenalty: value as number })}
              min={-2}
              max={2}
              step={0.1}
              sx={{ color: nexusColors.quantum }}
            />
          </Box>

          {/* Enable/Disable */}
          <FormControlLabel
            control={
              <Switch
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                color="success"
              />
            }
            label="Enable this model"
            sx={{ color: nexusColors.frost }}
          />

          <Divider sx={{ borderColor: `${nexusColors.shadow}30` }} />

          {/* Connection Test */}
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                Connection Test
              </Typography>
              <Button
                variant="outlined"
                startIcon={testing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                onClick={handleTestConnection}
                disabled={testing}
                sx={{
                  borderColor: nexusColors.quantum,
                  color: nexusColors.quantum,
                  '&:hover': {
                    borderColor: nexusColors.sapphire,
                    backgroundColor: `${nexusColors.sapphire}10`
                  }
                }}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </Stack>

            {testResult && (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                icon={testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{
                  backgroundColor: testResult.success
                    ? `${nexusColors.emerald}20`
                    : `${nexusColors.crimson}20`,
                  border: `1px solid ${testResult.success ? nexusColors.emerald : nexusColors.crimson}60`
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2">
                    {testResult.success
                      ? `✅ Connection successful! Latency: ${testResult.latency}ms`
                      : `❌ Connection failed: ${testResult.error}`
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Tested at: {new Date(testResult.timestamp).toLocaleString()}
                  </Typography>
                </Stack>
              </Alert>
            )}
          </Box>

          {/* Info */}
          <Alert severity="info" sx={{ backgroundColor: `${nexusColors.sapphire}20` }}>
            <Typography variant="caption">
              💡 These settings control how the model generates responses. Lower temperature = more deterministic, higher = more creative.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: nexusColors.shadow }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!testResult?.success}
          sx={{
            background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
            color: '#fff',
            '&:disabled': {
              background: nexusColors.shadow,
              color: '#999'
            }
          }}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelConfigDialog;
