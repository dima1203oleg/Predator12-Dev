// @ts-nocheck
/**
 * 🎯 MODEL & PROVIDER MANAGEMENT COMPONENT
 *
 * Функціонал:
 * 1. ✅ Перемикання між категоріями моделей та агентів
 * 2. ✅ Додавання моделей від різних провайдерів
 * 3. ✅ Множинні акаунти від одного провайдера
 * 4. ✅ Управління API ключами та конфігураціями
 */

import React, { useState, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Stack,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as CloudUploadIcon,
  Key as KeyIcon,
  AccountCircle as AccountIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  VpnKey as VpnKeyIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';
import ModelConfigDialog from './ModelConfigDialog';
import ProviderStatsDashboard from './ProviderStatsDashboard';
import { useProviders } from '../../hooks/useProviders';
import { useWebSocket } from '../../services/websocket';

// ============= ТИПИ ТА ІНТЕРФЕЙСИ =============

interface ProviderAccount {
  id: string;
  providerName: string;
  accountName: string;
  apiKey: string;
  apiEndpoint?: string;
  isActive: boolean;
  addedAt: string;
  lastUsed?: string;
  requestCount?: number;
  models?: string[];
}

interface ModelCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  modelCount: number;
}

interface Provider {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresApiKey: boolean;
  defaultEndpoint?: string;
  supportedModels: string[];
}

// ============= КОНСТАНТИ =============

const MODEL_CATEGORIES: ModelCategory[] = [
  { id: 'reasoning', name: 'Reasoning', icon: '🧠', description: 'Складне міркування та аналіз', modelCount: 12 },
  { id: 'code', name: 'Code Generation', icon: '💻', description: 'Генерація та аналіз коду', modelCount: 10 },
  { id: 'vision', name: 'Vision', icon: '👁️', description: 'Розпізнавання зображень', modelCount: 8 },
  { id: 'embed', name: 'Embeddings', icon: '🔗', description: 'Векторні представлення', modelCount: 6 },
  { id: 'quick', name: 'Quick/Fast', icon: '⚡', description: 'Швидкі відповіді', modelCount: 8 },
  { id: 'gen', name: 'Generation', icon: '🎨', description: 'Генерація контенту', modelCount: 4 }
];

const AGENT_CATEGORIES: ModelCategory[] = [
  { id: 'core', name: 'Core Agents', icon: '⚙️', description: 'Основні системні агенти', modelCount: 5 },
  { id: 'specialized', name: 'Specialized', icon: '🎯', description: 'Спеціалізовані агенти', modelCount: 10 },
  { id: 'data', name: 'Data Processing', icon: '📊', description: 'Обробка даних', modelCount: 8 },
  { id: 'security', name: 'Security', icon: '🔒', description: 'Безпека та моніторинг', modelCount: 4 }
];

const AVAILABLE_PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    description: 'GPT-4, GPT-3.5, DALL-E',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.openai.com/v1',
    supportedModels: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧬',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.anthropic.com/v1',
    supportedModels: ['claude-3.5-sonnet', 'claude-3-opus']
  },
  {
    id: 'google',
    name: 'Google',
    icon: '🌐',
    description: 'Gemini Pro, Gemma',
    requiresApiKey: true,
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1',
    supportedModels: ['gemini-pro', 'gemini-2.0-flash']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🌀',
    description: 'Mixtral, Mistral Large',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.mistral.ai/v1',
    supportedModels: ['mixtral-8x7b', 'mistral-large']
  },
  {
    id: 'meta',
    name: 'Meta',
    icon: '🦙',
    description: 'Llama 3, Llama 4',
    requiresApiKey: false,
    supportedModels: ['llama-3.1-70b', 'llama-4-70b']
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: '🔷',
    description: 'Phi-4, Azure OpenAI',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.azure.com/v1',
    supportedModels: ['phi-4', 'phi-4-reasoning']
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: '🎯',
    description: 'Command R+, Embed',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.cohere.ai/v1',
    supportedModels: ['command-r-plus', 'cohere-embed-v3']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🧠',
    description: 'DeepSeek R1, DeepSeek V3',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.deepseek.com/v1',
    supportedModels: ['deepseek-r1', 'deepseek-v3']
  }
];

// ============= ГОЛОВНИЙ КОМПОНЕНТ =============

const ModelProviderManager: React.FC = () => {
  // Стан для перемикання між Models та Agents
  const [viewMode, setViewMode] = useState<'models' | 'agents'>('models');

  // Стан для вибраної категорії
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Custom hook для управління провайдерами
  const {
    providers: providerAccounts,
    loading,
    error,
    addProvider: apiAddProvider,
    updateProvider: apiUpdateProvider,
    deleteProvider: apiDeleteProvider,
    toggleProviderStatus,
    subscribeToUpdates,
    unsubscribeFromUpdates
  } = useProviders();

  // WebSocket для real-time updates
  const { connect, disconnect } = useWebSocket();

  // ============= EFFECTS =============

  // Підключення до WebSocket та підписка на оновлення
  React.useEffect(() => {
    connect();
    subscribeToUpdates();

    return () => {
      unsubscribeFromUpdates();
      disconnect();
    };
  }, [connect, disconnect, subscribeToUpdates, unsubscribeFromUpdates]);

  // Стан для діалогів
  const [addProviderDialogOpen, setAddProviderDialogOpen] = useState(false);
  const [addModelDialogOpen, setAddModelDialogOpen] = useState(false);
  const [editAccountDialogOpen, setEditAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ProviderAccount | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);

  // Форма для нового провайдера
  const [newProviderForm, setNewProviderForm] = useState({
    providerId: '',
    accountName: '',
    apiKey: '',
    apiEndpoint: '',
    models: [] as string[]
  });

  const [showApiKey, setShowApiKey] = useState(false);

  // ============= ОБЧИСЛЮВАНІ ЗНАЧЕННЯ =============

  const currentCategories = viewMode === 'models' ? MODEL_CATEGORIES : AGENT_CATEGORIES;

  const filteredCategories = selectedCategory === 'all'
    ? currentCategories
    : currentCategories.filter(cat => cat.id === selectedCategory);

  const providerStats = useMemo(() => {
    const stats = new Map<string, { accounts: number; active: number; requests: number }>();

    providerAccounts.forEach(account => {
      const current = stats.get(account.providerName) || { accounts: 0, active: 0, requests: 0 };
      current.accounts++;
      if (account.isActive) current.active++;
      current.requests += account.requestCount || 0;
      stats.set(account.providerName, current);
    });

    return stats;
  }, [providerAccounts]);

  // ============= ОБРОБНИКИ ПОДІЙ =============

  const handleAddProvider = async () => {
    const selectedProvider = AVAILABLE_PROVIDERS.find(p => p.id === newProviderForm.providerId);
    if (!selectedProvider) return;

    try {
      await apiAddProvider({
        providerId: selectedProvider.name,
        accountName: newProviderForm.accountName,
        apiKey: newProviderForm.apiKey,
        apiEndpoint: newProviderForm.apiEndpoint || selectedProvider.defaultEndpoint,
        models: newProviderForm.models
      });

      setAddProviderDialogOpen(false);

      // Очистити форму
      setNewProviderForm({
        providerId: '',
        accountName: '',
        apiKey: '',
        apiEndpoint: '',
        models: []
      });
    } catch (err) {
      console.error('Error adding provider:', err);
      // TODO: Show error notification
    }
  };

  const handleToggleAccount = async (accountId: string) => {
    try {
      await toggleProviderStatus(accountId);
    } catch (err) {
      console.error('Error toggling provider status:', err);
      // TODO: Show error notification
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this provider account?')) {
      return;
    }

    try {
      await apiDeleteProvider(accountId);
    } catch (err) {
      console.error('Error deleting provider:', err);
      // TODO: Show error notification
    }
  };

  const handleEditAccount = (account: ProviderAccount) => {
    setSelectedAccount(account);
    setEditAccountDialogOpen(true);
  };

  // ============= РЕНДЕР =============

  return (
    <Box sx={{ p: 3 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress sx={{ color: nexusColors.quantum }} />
        </Box>
      )}

      {/* Header з перемикачем */}
      <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{
          color: nexusColors.text.primary,
          fontFamily: 'Orbitron',
          background: nexusColors.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 0 30px ${nexusColors.primary.glow}`
        }}>
          🎛️ Model & Provider Manager
        </Typography>

        <Tabs
          value={viewMode}
          onChange={(_, value) => {
            setViewMode(value);
            setSelectedCategory('all');
          }}
          sx={{
            '& .MuiTab-root': {
              color: nexusColors.shadow,
              fontFamily: 'Orbitron',
              '&.Mui-selected': {
                color: nexusColors.quantum
              }
            }
          }}
        >
          <Tab value="models" label="🤖 Models" />
          <Tab value="agents" label="👥 Agents" />
        </Tabs>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setConfigDialogOpen(true)}
          sx={{
            borderColor: nexusColors.quantum,
            color: nexusColors.quantum,
            fontFamily: 'Orbitron',
            '&:hover': {
              borderColor: nexusColors.nebula,
              color: nexusColors.nebula,
              background: `${nexusColors.quantum}10`
            }
          }}
        >
          Model Config
        </Button>

        <Button
          variant="outlined"
          startIcon={<TimelineIcon />}
          onClick={() => setStatsDialogOpen(true)}
          sx={{
            borderColor: nexusColors.emerald,
            color: nexusColors.emerald,
            fontFamily: 'Orbitron',
            '&:hover': {
              borderColor: nexusColors.emerald,
              background: `${nexusColors.emerald}10`
            }
          }}
        >
          Statistics
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddProviderDialogOpen(true)}
          sx={{
            background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
            color: '#fff',
            fontFamily: 'Orbitron',
            '&:hover': {
              background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.nebula})`
            }
          }}
        >
          Add Provider Account
        </Button>
      </Stack>

      {/* Фільтр категорій */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip
            label="All Categories"
            icon={<CategoryIcon />}
            onClick={() => setSelectedCategory('all')}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            sx={{
              backgroundColor: selectedCategory === 'all'
                ? `${nexusColors.sapphire}30`
                : 'transparent',
              border: `1px solid ${selectedCategory === 'all' ? nexusColors.sapphire : nexusColors.shadow}60`,
              color: selectedCategory === 'all' ? nexusColors.sapphire : nexusColors.shadow
            }}
          />
          {currentCategories.map(category => (
            <Chip
              key={category.id}
              label={`${category.icon} ${category.name} (${category.modelCount})`}
              onClick={() => setSelectedCategory(category.id)}
              color={selectedCategory === category.id ? 'primary' : 'default'}
              sx={{
                backgroundColor: selectedCategory === category.id
                  ? `${nexusColors.quantum}30`
                  : 'transparent',
                border: `1px solid ${selectedCategory === category.id ? nexusColors.quantum : nexusColors.shadow}60`,
                color: selectedCategory === category.id ? nexusColors.quantum : nexusColors.shadow
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Grid з категоріями */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredCategories.map(category => (
          <Grid item xs={12} md={6} lg={4} key={category.id}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(0,242,255,0.05) 0%, rgba(138,43,226,0.05) 100%)',
                border: `1px solid ${nexusColors.shadow}40`,
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="h2">{category.icon}</Typography>
                      <Box>
                        <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.shadow }}>
                          {category.description}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ borderColor: `${nexusColors.shadow}20` }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={`${category.modelCount} ${viewMode}`}
                        size="small"
                        sx={{
                          backgroundColor: `${nexusColors.emerald}20`,
                          color: nexusColors.emerald
                        }}
                      />
                      <Button
                        size="small"
                        endIcon={<AddIcon />}
                        sx={{ color: nexusColors.quantum }}
                      >
                        Add {viewMode === 'models' ? 'Model' : 'Agent'}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Список акаунтів провайдерів */}
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(0,242,255,0.03) 0%, rgba(138,43,226,0.03) 100%)',
        border: `1px solid ${nexusColors.shadow}40`,
        borderRadius: '12px'
      }}>
        <CardContent>
          <Typography variant="h5" sx={{
            color: nexusColors.frost,
            mb: 3,
            fontFamily: 'Orbitron'
          }}>
            🔑 Provider Accounts ({providerAccounts.length})
          </Typography>

          {Array.from(providerStats.entries()).map(([providerName, stats]) => {
            const providerAccs = providerAccounts.filter(acc => acc.providerName === providerName);
            const provider = AVAILABLE_PROVIDERS.find(p => p.name === providerName);

            return (
              <Accordion
                key={providerName}
                sx={{
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${nexusColors.shadow}30`,
                  mb: 2,
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: nexusColors.frost }} />}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <Typography variant="h6">{provider?.icon}</Typography>
                    <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                      {providerName}
                    </Typography>
                    <Badge badgeContent={stats.accounts} color="primary" />
                    <Chip
                      label={`${stats.active} active`}
                      size="small"
                      color="success"
                      sx={{ ml: 'auto' }}
                    />
                    <Chip
                      label={`${stats.requests} requests`}
                      size="small"
                      sx={{ color: nexusColors.nebula }}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {providerAccs.map(account => (
                      <ListItem
                        key={account.id}
                        sx={{
                          border: `1px solid ${nexusColors.shadow}20`,
                          borderRadius: '8px',
                          mb: 1,
                          backgroundColor: account.isActive
                            ? `${nexusColors.emerald}10`
                            : 'rgba(0,0,0,0.1)'
                        }}
                      >
                        <ListItemIcon>
                          <AccountIcon sx={{ color: account.isActive ? nexusColors.emerald : nexusColors.shadow }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={account.accountName}
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                                🔑 API Key: {showApiKey ? account.apiKey : '••••••••••••••••••••••••••'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                                📊 Requests: {account.requestCount || 0}
                              </Typography>
                              {account.models && account.models.length > 0 && (
                                <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                                  🤖 Models: {account.models.join(', ')}
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title={account.isActive ? 'Deactivate' : 'Activate'}>
                              <Switch
                                checked={account.isActive}
                                onChange={() => handleToggleAccount(account.id)}
                                color="success"
                              />
                            </Tooltip>
                            <Tooltip title="Configure Models">
                              <IconButton
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setConfigDialogOpen(true);
                                }}
                                size="small"
                              >
                                <SettingsIcon sx={{ color: nexusColors.sapphire }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEditAccount(account)} size="small">
                                <EditIcon sx={{ color: nexusColors.quantum }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDeleteAccount(account.id)} size="small">
                                <DeleteIcon sx={{ color: nexusColors.crimson }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </CardContent>
      </Card>

      {/* Dialog для додавання провайдера */}
      <Dialog
        open={addProviderDialogOpen}
        onClose={() => setAddProviderDialogOpen(false)}
        maxWidth="sm"
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
          ➕ Add New Provider Account
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: nexusColors.frost }}>Provider</InputLabel>
              <Select
                value={newProviderForm.providerId}
                onChange={(e) => {
                  const provider = AVAILABLE_PROVIDERS.find(p => p.id === e.target.value);
                  setNewProviderForm({
                    ...newProviderForm,
                    providerId: e.target.value,
                    apiEndpoint: provider?.defaultEndpoint || ''
                  });
                }}
                sx={{
                  color: nexusColors.frost,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${nexusColors.shadow}60`
                  }
                }}
              >
                {AVAILABLE_PROVIDERS.map(provider => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Account Name"
              placeholder="e.g., Production, Development"
              value={newProviderForm.accountName}
              onChange={(e) => setNewProviderForm({ ...newProviderForm, accountName: e.target.value })}
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: nexusColors.frost },
                '& .MuiInputBase-root': { color: nexusColors.frost }
              }}
            />

            <TextField
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              value={newProviderForm.apiKey}
              onChange={(e) => setNewProviderForm({ ...newProviderForm, apiKey: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
              sx={{
                '& .MuiInputLabel-root': { color: nexusColors.frost },
                '& .MuiInputBase-root': { color: nexusColors.frost }
              }}
            />

            <TextField
              label="API Endpoint (Optional)"
              placeholder="https://api.example.com/v1"
              value={newProviderForm.apiEndpoint}
              onChange={(e) => setNewProviderForm({ ...newProviderForm, apiEndpoint: e.target.value })}
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: nexusColors.frost },
                '& .MuiInputBase-root': { color: nexusColors.frost }
              }}
            />

            <Alert severity="info" sx={{ backgroundColor: `${nexusColors.sapphire}20` }}>
              <Typography variant="caption">
                Multiple accounts from the same provider are supported. This allows you to separate production and development environments.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProviderDialogOpen(false)} sx={{ color: nexusColors.shadow }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddProvider}
            variant="contained"
            disabled={!newProviderForm.providerId || !newProviderForm.accountName || !newProviderForm.apiKey}
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
              color: '#fff'
            }}
          >
            Add Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <ModelConfigDialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          account={selectedAccount}
        />
      </Dialog>

      {/* Provider Statistics Dashboard */}
      <Dialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
          📊 Provider Statistics & Monitoring
        </DialogTitle>
        <DialogContent>
          <ProviderStatsDashboard accounts={providerAccounts} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)} sx={{ color: nexusColors.frost }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelProviderManager;
