"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
const ModelConfigDialog_1 = __importDefault(require("./ModelConfigDialog"));
const ProviderStatsDashboard_1 = __importDefault(require("./ProviderStatsDashboard"));
const useProviders_1 = require("../../hooks/useProviders");
const websocket_1 = require("../../services/websocket");
// ============= КОНСТАНТИ =============
const MODEL_CATEGORIES = [
    { id: 'reasoning', name: 'Reasoning', icon: '🧠', description: 'Складне міркування та аналіз', modelCount: 12 },
    { id: 'code', name: 'Code Generation', icon: '💻', description: 'Генерація та аналіз коду', modelCount: 10 },
    { id: 'vision', name: 'Vision', icon: '👁️', description: 'Розпізнавання зображень', modelCount: 8 },
    { id: 'embed', name: 'Embeddings', icon: '🔗', description: 'Векторні представлення', modelCount: 6 },
    { id: 'quick', name: 'Quick/Fast', icon: '⚡', description: 'Швидкі відповіді', modelCount: 8 },
    { id: 'gen', name: 'Generation', icon: '🎨', description: 'Генерація контенту', modelCount: 4 }
];
const AGENT_CATEGORIES = [
    { id: 'core', name: 'Core Agents', icon: '⚙️', description: 'Основні системні агенти', modelCount: 5 },
    { id: 'specialized', name: 'Specialized', icon: '🎯', description: 'Спеціалізовані агенти', modelCount: 10 },
    { id: 'data', name: 'Data Processing', icon: '📊', description: 'Обробка даних', modelCount: 8 },
    { id: 'security', name: 'Security', icon: '🔒', description: 'Безпека та моніторинг', modelCount: 4 }
];
const AVAILABLE_PROVIDERS = [
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
const ModelProviderManager = () => {
    // Стан для перемикання між Models та Agents
    const [viewMode, setViewMode] = (0, react_1.useState)('models');
    // Стан для вибраної категорії
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    // Custom hook для управління провайдерами
    const { providers: providerAccounts, loading, error, addProvider: apiAddProvider, updateProvider: apiUpdateProvider, deleteProvider: apiDeleteProvider, toggleProviderStatus, subscribeToUpdates, unsubscribeFromUpdates } = (0, useProviders_1.useProviders)();
    // WebSocket для real-time updates
    const { connect, disconnect } = (0, websocket_1.useWebSocket)();
    // ============= EFFECTS =============
    // Підключення до WebSocket та підписка на оновлення
    react_1.default.useEffect(() => {
        connect();
        subscribeToUpdates();
        return () => {
            unsubscribeFromUpdates();
            disconnect();
        };
    }, [connect, disconnect, subscribeToUpdates, unsubscribeFromUpdates]);
    // Стан для діалогів
    const [addProviderDialogOpen, setAddProviderDialogOpen] = (0, react_1.useState)(false);
    const [addModelDialogOpen, setAddModelDialogOpen] = (0, react_1.useState)(false);
    const [editAccountDialogOpen, setEditAccountDialogOpen] = (0, react_1.useState)(false);
    const [selectedAccount, setSelectedAccount] = (0, react_1.useState)(null);
    const [configDialogOpen, setConfigDialogOpen] = (0, react_1.useState)(false);
    const [statsDialogOpen, setStatsDialogOpen] = (0, react_1.useState)(false);
    // Форма для нового провайдера
    const [newProviderForm, setNewProviderForm] = (0, react_1.useState)({
        providerId: '',
        accountName: '',
        apiKey: '',
        apiEndpoint: '',
        models: []
    });
    const [showApiKey, setShowApiKey] = (0, react_1.useState)(false);
    // ============= ОБЧИСЛЮВАНІ ЗНАЧЕННЯ =============
    const currentCategories = viewMode === 'models' ? MODEL_CATEGORIES : AGENT_CATEGORIES;
    const filteredCategories = selectedCategory === 'all'
        ? currentCategories
        : currentCategories.filter(cat => cat.id === selectedCategory);
    const providerStats = (0, react_1.useMemo)(() => {
        const stats = new Map();
        providerAccounts.forEach(account => {
            const current = stats.get(account.providerName) || { accounts: 0, active: 0, requests: 0 };
            current.accounts++;
            if (account.isActive)
                current.active++;
            current.requests += account.requestCount || 0;
            stats.set(account.providerName, current);
        });
        return stats;
    }, [providerAccounts]);
    // ============= ОБРОБНИКИ ПОДІЙ =============
    const handleAddProvider = () => __awaiter(void 0, void 0, void 0, function* () {
        const selectedProvider = AVAILABLE_PROVIDERS.find(p => p.id === newProviderForm.providerId);
        if (!selectedProvider)
            return;
        try {
            yield apiAddProvider({
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
        }
        catch (err) {
            console.error('Error adding provider:', err);
            // TODO: Show error notification
        }
    });
    const handleToggleAccount = (accountId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield toggleProviderStatus(accountId);
        }
        catch (err) {
            console.error('Error toggling provider status:', err);
            // TODO: Show error notification
        }
    });
    const handleDeleteAccount = (accountId) => __awaiter(void 0, void 0, void 0, function* () {
        if (!window.confirm('Are you sure you want to delete this provider account?')) {
            return;
        }
        try {
            yield apiDeleteProvider(accountId);
        }
        catch (err) {
            console.error('Error deleting provider:', err);
            // TODO: Show error notification
        }
    });
    const handleEditAccount = (account) => {
        setSelectedAccount(account);
        setEditAccountDialogOpen(true);
    };
    // ============= РЕНДЕР =============
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Error Alert */}
      {error && (<material_1.Alert severity="error" sx={{ mb: 3 }} onClose={() => { }}>
          {error}
        </material_1.Alert>)}

      {/* Loading State */}
      {loading && (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <material_1.CircularProgress sx={{ color: nexusThemeV2_1.nexusColorsDark.quantum }}/>
        </material_1.Box>)}

      {/* Header з перемикачем */}
      <material_1.Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <material_1.Typography variant="h4" sx={{
            color: nexusThemeV2_1.nexusColorsDark.text.primary,
            fontFamily: 'Orbitron',
            background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 30px ${nexusThemeV2_1.nexusColorsDark.primary.glow}`
        }}>
          🎛️ Model & Provider Manager
        </material_1.Typography>

        <material_1.Tabs value={viewMode} onChange={(_, value) => {
            setViewMode(value);
            setSelectedCategory('all');
        }} sx={{
            '& .MuiTab-root': {
                color: nexusThemeV2_1.nexusColorsDark.shadow,
                fontFamily: 'Orbitron',
                '&.Mui-selected': {
                    color: nexusThemeV2_1.nexusColorsDark.quantum
                }
            }
        }}>
          <material_1.Tab value="models" label="🤖 Models"/>
          <material_1.Tab value="agents" label="👥 Agents"/>
        </material_1.Tabs>

        <material_1.Box sx={{ flex: 1 }}/>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.Settings />} onClick={() => setConfigDialogOpen(true)} sx={{
            borderColor: nexusThemeV2_1.nexusColorsDark.quantum,
            color: nexusThemeV2_1.nexusColorsDark.quantum,
            fontFamily: 'Orbitron',
            '&:hover': {
                borderColor: nexusThemeV2_1.nexusColorsDark.nebula,
                color: nexusThemeV2_1.nexusColorsDark.nebula,
                background: `${nexusThemeV2_1.nexusColorsDark.quantum}10`
            }
        }}>
          Model Config
        </material_1.Button>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.Timeline />} onClick={() => setStatsDialogOpen(true)} sx={{
            borderColor: nexusThemeV2_1.nexusColorsDark.emerald,
            color: nexusThemeV2_1.nexusColorsDark.emerald,
            fontFamily: 'Orbitron',
            '&:hover': {
                borderColor: nexusThemeV2_1.nexusColorsDark.emerald,
                background: `${nexusThemeV2_1.nexusColorsDark.emerald}10`
            }
        }}>
          Statistics
        </material_1.Button>

        <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={() => setAddProviderDialogOpen(true)} sx={{
            background: `linear-gradient(45deg, ${nexusThemeV2_1.nexusColorsDark.sapphire}, ${nexusThemeV2_1.nexusColorsDark.quantum})`,
            color: '#fff',
            fontFamily: 'Orbitron',
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusThemeV2_1.nexusColorsDark.quantum}, ${nexusThemeV2_1.nexusColorsDark.nebula})`
            }
        }}>
          Add Provider Account
        </material_1.Button>
      </material_1.Stack>

      {/* Фільтр категорій */}
      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Stack direction="row" spacing={2} flexWrap="wrap">
          <material_1.Chip label="All Categories" icon={<icons_material_1.Category />} onClick={() => setSelectedCategory('all')} color={selectedCategory === 'all' ? 'primary' : 'default'} sx={{
            backgroundColor: selectedCategory === 'all'
                ? `${nexusThemeV2_1.nexusColorsDark.sapphire}30`
                : 'transparent',
            border: `1px solid ${selectedCategory === 'all' ? nexusThemeV2_1.nexusColorsDark.sapphire : nexusThemeV2_1.nexusColorsDark.shadow}60`,
            color: selectedCategory === 'all' ? nexusThemeV2_1.nexusColorsDark.sapphire : nexusThemeV2_1.nexusColorsDark.shadow
        }}/>
          {currentCategories.map(category => (<material_1.Chip key={category.id} label={`${category.icon} ${category.name} (${category.modelCount})`} onClick={() => setSelectedCategory(category.id)} color={selectedCategory === category.id ? 'primary' : 'default'} sx={{
                backgroundColor: selectedCategory === category.id
                    ? `${nexusThemeV2_1.nexusColorsDark.quantum}30`
                    : 'transparent',
                border: `1px solid ${selectedCategory === category.id ? nexusThemeV2_1.nexusColorsDark.quantum : nexusThemeV2_1.nexusColorsDark.shadow}60`,
                color: selectedCategory === category.id ? nexusThemeV2_1.nexusColorsDark.quantum : nexusThemeV2_1.nexusColorsDark.shadow
            }}/>))}
        </material_1.Stack>
      </material_1.Box>

      {/* Grid з категоріями */}
      <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredCategories.map(category => (<material_1.Grid item xs={12} md={6} lg={4} key={category.id}>
            <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <material_1.Card sx={{
                background: 'linear-gradient(135deg, rgba(0,242,255,0.05) 0%, rgba(138,43,226,0.05) 100%)',
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.shadow}40`,
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                <material_1.CardContent>
                  <material_1.Stack spacing={2}>
                    <material_1.Stack direction="row" alignItems="center" spacing={2}>
                      <material_1.Typography variant="h2">{category.icon}</material_1.Typography>
                      <material_1.Box>
                        <material_1.Typography variant="h6" sx={{ color: nexusThemeV2_1.nexusColorsDark.frost }}>
                          {category.name}
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusThemeV2_1.nexusColorsDark.shadow }}>
                          {category.description}
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Stack>

                    <material_1.Divider sx={{ borderColor: `${nexusThemeV2_1.nexusColorsDark.shadow}20` }}/>

                    <material_1.Stack direction="row" justifyContent="space-between" alignItems="center">
                      <material_1.Chip label={`${category.modelCount} ${viewMode}`} size="small" sx={{
                backgroundColor: `${nexusThemeV2_1.nexusColorsDark.emerald}20`,
                color: nexusThemeV2_1.nexusColorsDark.emerald
            }}/>
                      <material_1.Button size="small" endIcon={<icons_material_1.Add />} sx={{ color: nexusThemeV2_1.nexusColorsDark.quantum }}>
                        Add {viewMode === 'models' ? 'Model' : 'Agent'}
                      </material_1.Button>
                    </material_1.Stack>
                  </material_1.Stack>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Список акаунтів провайдерів */}
      <material_1.Card sx={{
            background: 'linear-gradient(135deg, rgba(0,242,255,0.03) 0%, rgba(138,43,226,0.03) 100%)',
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.shadow}40`,
            borderRadius: '12px'
        }}>
        <material_1.CardContent>
          <material_1.Typography variant="h5" sx={{
            color: nexusThemeV2_1.nexusColorsDark.frost,
            mb: 3,
            fontFamily: 'Orbitron'
        }}>
            🔑 Provider Accounts ({providerAccounts.length})
          </material_1.Typography>

          {Array.from(providerStats.entries()).map(([providerName, stats]) => {
            const providerAccs = providerAccounts.filter(acc => acc.providerName === providerName);
            const provider = AVAILABLE_PROVIDERS.find(p => p.name === providerName);
            return (<material_1.Accordion key={providerName} sx={{
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${nexusThemeV2_1.nexusColorsDark.shadow}30`,
                    mb: 2,
                    '&:before': { display: 'none' }
                }}>
                <material_1.AccordionSummary expandIcon={<icons_material_1.ExpandMore sx={{ color: nexusThemeV2_1.nexusColorsDark.frost }}/>}>
                  <material_1.Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <material_1.Typography variant="h6">{provider === null || provider === void 0 ? void 0 : provider.icon}</material_1.Typography>
                    <material_1.Typography variant="h6" sx={{ color: nexusThemeV2_1.nexusColorsDark.frost }}>
                      {providerName}
                    </material_1.Typography>
                    <material_1.Badge badgeContent={stats.accounts} color="primary"/>
                    <material_1.Chip label={`${stats.active} active`} size="small" color="success" sx={{ ml: 'auto' }}/>
                    <material_1.Chip label={`${stats.requests} requests`} size="small" sx={{ color: nexusThemeV2_1.nexusColorsDark.nebula }}/>
                  </material_1.Stack>
                </material_1.AccordionSummary>
                <material_1.AccordionDetails>
                  <material_1.List>
                    {providerAccs.map(account => (<material_1.ListItem key={account.id} sx={{
                        border: `1px solid ${nexusThemeV2_1.nexusColorsDark.shadow}20`,
                        borderRadius: '8px',
                        mb: 1,
                        backgroundColor: account.isActive
                            ? `${nexusThemeV2_1.nexusColorsDark.emerald}10`
                            : 'rgba(0,0,0,0.1)'
                    }}>
                        <material_1.ListItemIcon>
                          <icons_material_1.AccountCircle sx={{ color: account.isActive ? nexusThemeV2_1.nexusColorsDark.emerald : nexusThemeV2_1.nexusColorsDark.shadow }}/>
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary={account.accountName} secondary={<material_1.Stack spacing={0.5}>
                              <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.shadow }}>
                                🔑 API Key: {showApiKey ? account.apiKey : '••••••••••••••••••••••••••'}
                              </material_1.Typography>
                              <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.shadow }}>
                                📊 Requests: {account.requestCount || 0}
                              </material_1.Typography>
                              {account.models && account.models.length > 0 && (<material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.shadow }}>
                                  🤖 Models: {account.models.join(', ')}
                                </material_1.Typography>)}
                            </material_1.Stack>}/>
                        <material_1.ListItemSecondaryAction>
                          <material_1.Stack direction="row" spacing={1}>
                            <material_1.Tooltip title={account.isActive ? 'Deactivate' : 'Activate'}>
                              <material_1.Switch checked={account.isActive} onChange={() => handleToggleAccount(account.id)} color="success"/>
                            </material_1.Tooltip>
                            <material_1.Tooltip title="Configure Models">
                              <material_1.IconButton onClick={() => {
                        setSelectedAccount(account);
                        setConfigDialogOpen(true);
                    }} size="small">
                                <icons_material_1.Settings sx={{ color: nexusThemeV2_1.nexusColorsDark.sapphire }}/>
                              </material_1.IconButton>
                            </material_1.Tooltip>
                            <material_1.Tooltip title="Edit">
                              <material_1.IconButton onClick={() => handleEditAccount(account)} size="small">
                                <icons_material_1.Edit sx={{ color: nexusThemeV2_1.nexusColorsDark.quantum }}/>
                              </material_1.IconButton>
                            </material_1.Tooltip>
                            <material_1.Tooltip title="Delete">
                              <material_1.IconButton onClick={() => handleDeleteAccount(account.id)} size="small">
                                <icons_material_1.Delete sx={{ color: nexusThemeV2_1.nexusColorsDark.crimson }}/>
                              </material_1.IconButton>
                            </material_1.Tooltip>
                          </material_1.Stack>
                        </material_1.ListItemSecondaryAction>
                      </material_1.ListItem>))}
                  </material_1.List>
                </material_1.AccordionDetails>
              </material_1.Accordion>);
        })}
        </material_1.CardContent>
      </material_1.Card>

      {/* Dialog для додавання провайдера */}
      <material_1.Dialog open={addProviderDialogOpen} onClose={() => setAddProviderDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(0,10,20,0.98) 0%, rgba(10,5,20,0.98) 100%)',
                border: `2px solid ${nexusThemeV2_1.nexusColorsDark.sapphire}60`,
                borderRadius: '16px'
            }
        }}>
        <material_1.DialogTitle sx={{ color: nexusThemeV2_1.nexusColorsDark.frost, fontFamily: 'Orbitron' }}>
          ➕ Add New Provider Account
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Stack spacing={3} sx={{ mt: 2 }}>
            <material_1.FormControl fullWidth>
              <material_1.InputLabel sx={{ color: nexusThemeV2_1.nexusColorsDark.frost }}>Provider</material_1.InputLabel>
              <material_1.Select value={newProviderForm.providerId} onChange={(e) => {
            const provider = AVAILABLE_PROVIDERS.find(p => p.id === e.target.value);
            setNewProviderForm(Object.assign(Object.assign({}, newProviderForm), { providerId: e.target.value, apiEndpoint: (provider === null || provider === void 0 ? void 0 : provider.defaultEndpoint) || '' }));
        }} sx={{
            color: nexusThemeV2_1.nexusColorsDark.frost,
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: `${nexusThemeV2_1.nexusColorsDark.shadow}60`
            }
        }}>
                {AVAILABLE_PROVIDERS.map(provider => (<material_1.MenuItem key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </material_1.MenuItem>))}
              </material_1.Select>
            </material_1.FormControl>

            <material_1.TextField label="Account Name" placeholder="e.g., Production, Development" value={newProviderForm.accountName} onChange={(e) => setNewProviderForm(Object.assign(Object.assign({}, newProviderForm), { accountName: e.target.value }))} fullWidth sx={{
            '& .MuiInputLabel-root': { color: nexusThemeV2_1.nexusColorsDark.frost },
            '& .MuiInputBase-root': { color: nexusThemeV2_1.nexusColorsDark.frost }
        }}/>

            <material_1.TextField label="API Key" type={showApiKey ? 'text' : 'password'} value={newProviderForm.apiKey} onChange={(e) => setNewProviderForm(Object.assign(Object.assign({}, newProviderForm), { apiKey: e.target.value }))} fullWidth InputProps={{
            endAdornment: (<material_1.IconButton onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <icons_material_1.VisibilityOff /> : <icons_material_1.Visibility />}
                  </material_1.IconButton>)
        }} sx={{
            '& .MuiInputLabel-root': { color: nexusThemeV2_1.nexusColorsDark.frost },
            '& .MuiInputBase-root': { color: nexusThemeV2_1.nexusColorsDark.frost }
        }}/>

            <material_1.TextField label="API Endpoint (Optional)" placeholder="https://api.example.com/v1" value={newProviderForm.apiEndpoint} onChange={(e) => setNewProviderForm(Object.assign(Object.assign({}, newProviderForm), { apiEndpoint: e.target.value }))} fullWidth sx={{
            '& .MuiInputLabel-root': { color: nexusThemeV2_1.nexusColorsDark.frost },
            '& .MuiInputBase-root': { color: nexusThemeV2_1.nexusColorsDark.frost }
        }}/>

            <material_1.Alert severity="info" sx={{ backgroundColor: `${nexusThemeV2_1.nexusColorsDark.sapphire}20` }}>
              <material_1.Typography variant="caption">
                Multiple accounts from the same provider are supported. This allows you to separate production and development environments.
              </material_1.Typography>
            </material_1.Alert>
          </material_1.Stack>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setAddProviderDialogOpen(false)} sx={{ color: nexusThemeV2_1.nexusColorsDark.shadow }}>
            Cancel
          </material_1.Button>
          <material_1.Button onClick={handleAddProvider} variant="contained" disabled={!newProviderForm.providerId || !newProviderForm.accountName || !newProviderForm.apiKey} sx={{
            background: `linear-gradient(45deg, ${nexusThemeV2_1.nexusColorsDark.sapphire}, ${nexusThemeV2_1.nexusColorsDark.quantum})`,
            color: '#fff'
        }}>
            Add Account
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Model Configuration Dialog */}
      <material_1.Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="md" fullWidth>
        <ModelConfigDialog_1.default open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} account={selectedAccount}/>
      </material_1.Dialog>

      {/* Provider Statistics Dashboard */}
      <material_1.Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="lg" fullWidth>
        <material_1.DialogTitle sx={{ color: nexusThemeV2_1.nexusColorsDark.frost, fontFamily: 'Orbitron' }}>
          📊 Provider Statistics & Monitoring
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <ProviderStatsDashboard_1.default accounts={providerAccounts}/>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setStatsDialogOpen(false)} sx={{ color: nexusThemeV2_1.nexusColorsDark.frost }}>
            Close
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = ModelProviderManager;
