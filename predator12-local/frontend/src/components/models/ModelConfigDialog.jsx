"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConfigDialog = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
// ============= КОНСТАНТИ =============
const DEFAULT_MODEL_CONFIGS = {
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
const ModelConfigDialog = ({ open, onClose, accountId, accountName, providerName, models }) => {
    const [selectedModel, setSelectedModel] = (0, react_1.useState)(models[0] || '');
    const [config, setConfig] = (0, react_1.useState)({
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
    const [testResult, setTestResult] = (0, react_1.useState)(null);
    const [testing, setTesting] = (0, react_1.useState)(false);
    const handleTestConnection = () => __awaiter(void 0, void 0, void 0, function* () {
        setTesting(true);
        setTestResult(null);
        try {
            // Симуляція тестування підключення
            yield new Promise(resolve => setTimeout(resolve, 2000));
            const success = Math.random() > 0.2; // 80% success rate
            const latency = Math.floor(Math.random() * 500) + 100;
            setTestResult({
                success,
                latency: success ? latency : undefined,
                error: success ? undefined : 'Failed to connect to API endpoint',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            setTestResult({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        finally {
            setTesting(false);
        }
    });
    const handleSave = () => {
        // Зберегти конфігурацію
        console.log('Saving model config:', config);
        onClose();
    };
    const handleModelChange = (modelName) => {
        setSelectedModel(modelName);
        // Застосувати дефолтні налаштування залежно від типу моделі
        const modelType = getModelType(modelName);
        const defaults = DEFAULT_MODEL_CONFIGS[modelType] || DEFAULT_MODEL_CONFIGS['reasoning'];
        setConfig(Object.assign(Object.assign(Object.assign({}, config), { name: modelName }), defaults));
    };
    const getModelType = (modelName) => {
        if (modelName.includes('gpt-4') || modelName.includes('claude'))
            return 'reasoning';
        if (modelName.includes('code') || modelName.includes('deepseek'))
            return 'code';
        if (modelName.includes('vision') || modelName.includes('llava'))
            return 'vision';
        return 'quick';
    };
    return (<material_1.Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(0,10,20,0.98) 0%, rgba(10,5,20,0.98) 100%)',
                border: `2px solid ${nexusTheme_1.nexusColors.sapphire}60`,
                borderRadius: '16px'
            }
        }}>
      <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
        ⚙️ Model Configuration: {accountName}
      </material_1.DialogTitle>

      <material_1.DialogContent>
        <material_1.Stack spacing={3} sx={{ mt: 2 }}>
          {/* Model Selection */}
          <material_1.FormControl fullWidth>
            <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.frost }}>Model</material_1.InputLabel>
            <material_1.Select value={selectedModel} onChange={(e) => handleModelChange(e.target.value)} sx={{
            color: nexusTheme_1.nexusColors.frost,
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: `${nexusTheme_1.nexusColors.shadow}60`
            }
        }}>
              {models.map(model => (<material_1.MenuItem key={model} value={model}>
                  {model}
                </material_1.MenuItem>))}
            </material_1.Select>
          </material_1.FormControl>

          <material_1.Divider sx={{ borderColor: `${nexusTheme_1.nexusColors.shadow}30` }}/>

          {/* Configuration Parameters */}
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
            Parameters
          </material_1.Typography>

          {/* Max Tokens */}
          <material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow, mb: 1 }}>
              Max Tokens: {config.maxTokens}
            </material_1.Typography>
            <material_1.Slider value={config.maxTokens} onChange={(_, value) => setConfig(Object.assign(Object.assign({}, config), { maxTokens: value }))} min={256} max={16384} step={256} marks={[
            { value: 256, label: '256' },
            { value: 4096, label: '4K' },
            { value: 8192, label: '8K' },
            { value: 16384, label: '16K' }
        ]} sx={{
            color: nexusTheme_1.nexusColors.quantum,
            '& .MuiSlider-mark': {
                backgroundColor: nexusTheme_1.nexusColors.shadow
            }
        }}/>
          </material_1.Box>

          {/* Temperature */}
          <material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow, mb: 1 }}>
              Temperature: {config.temperature.toFixed(2)}
            </material_1.Typography>
            <material_1.Slider value={config.temperature} onChange={(_, value) => setConfig(Object.assign(Object.assign({}, config), { temperature: value }))} min={0} max={2} step={0.1} marks={[
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' }
        ]} sx={{ color: nexusTheme_1.nexusColors.quantum }}/>
          </material_1.Box>

          {/* Top P */}
          <material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow, mb: 1 }}>
              Top P: {config.topP.toFixed(2)}
            </material_1.Typography>
            <material_1.Slider value={config.topP} onChange={(_, value) => setConfig(Object.assign(Object.assign({}, config), { topP: value }))} min={0} max={1} step={0.05} sx={{ color: nexusTheme_1.nexusColors.quantum }}/>
          </material_1.Box>

          {/* Frequency Penalty */}
          <material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow, mb: 1 }}>
              Frequency Penalty: {config.frequencyPenalty.toFixed(2)}
            </material_1.Typography>
            <material_1.Slider value={config.frequencyPenalty} onChange={(_, value) => setConfig(Object.assign(Object.assign({}, config), { frequencyPenalty: value }))} min={-2} max={2} step={0.1} sx={{ color: nexusTheme_1.nexusColors.quantum }}/>
          </material_1.Box>

          {/* Presence Penalty */}
          <material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow, mb: 1 }}>
              Presence Penalty: {config.presencePenalty.toFixed(2)}
            </material_1.Typography>
            <material_1.Slider value={config.presencePenalty} onChange={(_, value) => setConfig(Object.assign(Object.assign({}, config), { presencePenalty: value }))} min={-2} max={2} step={0.1} sx={{ color: nexusTheme_1.nexusColors.quantum }}/>
          </material_1.Box>

          {/* Enable/Disable */}
          <material_1.FormControlLabel control={<material_1.Switch checked={config.enabled} onChange={(e) => setConfig(Object.assign(Object.assign({}, config), { enabled: e.target.checked }))} color="success"/>} label="Enable this model" sx={{ color: nexusTheme_1.nexusColors.frost }}/>

          <material_1.Divider sx={{ borderColor: `${nexusTheme_1.nexusColors.shadow}30` }}/>

          {/* Connection Test */}
          <material_1.Box>
            <material_1.Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                Connection Test
              </material_1.Typography>
              <material_1.Button variant="outlined" startIcon={testing ? <material_1.CircularProgress size={20}/> : <icons_material_1.PlayArrow />} onClick={handleTestConnection} disabled={testing} sx={{
            borderColor: nexusTheme_1.nexusColors.quantum,
            color: nexusTheme_1.nexusColors.quantum,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.sapphire,
                backgroundColor: `${nexusTheme_1.nexusColors.sapphire}10`
            }
        }}>
                {testing ? 'Testing...' : 'Test Connection'}
              </material_1.Button>
            </material_1.Stack>

            {testResult && (<material_1.Alert severity={testResult.success ? 'success' : 'error'} icon={testResult.success ? <icons_material_1.CheckCircle /> : <icons_material_1.Error />} sx={{
                backgroundColor: testResult.success
                    ? `${nexusTheme_1.nexusColors.emerald}20`
                    : `${nexusTheme_1.nexusColors.crimson}20`,
                border: `1px solid ${testResult.success ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.crimson}60`
            }}>
                <material_1.Stack spacing={1}>
                  <material_1.Typography variant="body2">
                    {testResult.success
                ? `✅ Connection successful! Latency: ${testResult.latency}ms`
                : `❌ Connection failed: ${testResult.error}`}
                  </material_1.Typography>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Tested at: {new Date(testResult.timestamp).toLocaleString()}
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Alert>)}
          </material_1.Box>

          {/* Info */}
          <material_1.Alert severity="info" sx={{ backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20` }}>
            <material_1.Typography variant="caption">
              💡 These settings control how the model generates responses. Lower temperature = more deterministic, higher = more creative.
            </material_1.Typography>
          </material_1.Alert>
        </material_1.Stack>
      </material_1.DialogContent>

      <material_1.DialogActions sx={{ p: 3 }}>
        <material_1.Button onClick={onClose} sx={{ color: nexusTheme_1.nexusColors.shadow }}>
          Cancel
        </material_1.Button>
        <material_1.Button onClick={handleSave} variant="contained" disabled={!(testResult === null || testResult === void 0 ? void 0 : testResult.success)} sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            color: '#fff',
            '&:disabled': {
                background: nexusTheme_1.nexusColors.shadow,
                color: '#999'
            }
        }}>
          Save Configuration
        </material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>);
};
exports.ModelConfigDialog = ModelConfigDialog;
exports.default = exports.ModelConfigDialog;
