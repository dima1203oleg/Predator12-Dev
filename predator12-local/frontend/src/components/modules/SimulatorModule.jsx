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
const SimulatorModule = () => {
    const [scenarios] = (0, react_1.useState)([
        {
            id: 'tariff-impact',
            name: 'Вплив тарифів на торгівлю',
            description: 'Моделювання впливу зміни тарифних ставок на обсяги торгівлі',
            status: 'ready',
            parameters: {
                tariffIncrease: 15,
                affectedCategories: ['Електроніка', 'Текстиль'],
                timeHorizon: 12
            }
        },
        {
            id: 'customs-efficiency',
            name: 'Оптимізація митних процедур',
            description: 'What-if аналіз впливу автоматизації на швидкість оформлення',
            status: 'running',
            parameters: {
                automationLevel: 80,
                staffReduction: 25,
                digitalDocs: true
            },
            lastRun: '15 хв тому'
        },
        {
            id: 'fraud-detection',
            name: 'Покращення виявлення шахрайства',
            description: 'Моделювання ефективності нових алгоритмів детекції',
            status: 'completed',
            parameters: {
                algorithmSensitivity: 75,
                falsePositiveRate: 5,
                trainingData: 'extended'
            },
            lastRun: '2 години тому',
            results: {
                detectionRate: '+23%',
                falsePositives: '-12%',
                processingTime: '-8%'
            }
        }
    ]);
    const [activeScenario, setActiveScenario] = (0, react_1.useState)(null);
    const [parameters, setParameters] = (0, react_1.useState)({
        economicGrowth: 2.5,
        inflationRate: 8.5,
        currencyVolatility: 15,
        regulatoryChanges: 'moderate',
        timeHorizon: 6
    });
    const getStatusColor = (status) => {
        switch (status) {
            case 'ready': return nexusTheme_1.nexusColors.emerald;
            case 'running': return nexusTheme_1.nexusColors.warning;
            case 'completed': return nexusTheme_1.nexusColors.success;
            case 'failed': return nexusTheme_1.nexusColors.error;
            default: return nexusTheme_1.nexusColors.frost;
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'ready': return '⚡';
            case 'running': return '🔄';
            case 'completed': return '✅';
            case 'failed': return '❌';
            default: return '❔';
        }
    };
    const handleRunScenario = (scenarioId) => {
        setActiveScenario(scenarioId);
        // Тут буде логіка запуску симуляції
        console.log(`Running scenario: ${scenarioId}`);
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.frost,
            textAlign: 'center',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.amethyst}, ${nexusTheme_1.nexusColors.emerald})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
        🌌 Симулятор Реальностей
      </material_1.Typography>

      <material_1.Grid container spacing={3}>
        {/* Список сценаріїв */}
        <material_1.Grid item xs={12} lg={8}>
          <material_1.Grid container spacing={2}>
            {scenarios.map((scenario) => (<material_1.Grid item xs={12} md={6} key={scenario.id}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
                border: `1px solid ${getStatusColor(scenario.status)}40`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${getStatusColor(scenario.status)}30`
                }
            }}>
                  <material_1.CardContent>
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, flexGrow: 1 }}>
                        {scenario.name}
                      </material_1.Typography>
                      <material_1.Typography sx={{ fontSize: '1.2rem' }}>
                        {getStatusEmoji(scenario.status)}
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 2 }}>
                      {scenario.description}
                    </material_1.Typography>

                    <material_1.Chip size="small" label={scenario.status} sx={{
                backgroundColor: `${getStatusColor(scenario.status)}20`,
                color: getStatusColor(scenario.status),
                mb: 2
            }}/>

                    {scenario.lastRun && (<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow, display: 'block', mb: 2 }}>
                        Останній запуск: {scenario.lastRun}
                      </material_1.Typography>)}

                    {scenario.results && (<material_1.Box sx={{ mb: 2 }}>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.success, fontWeight: 600 }}>
                          Результати:
                        </material_1.Typography>
                        {Object.entries(scenario.results).map(([key, value]) => (<material_1.Typography key={key} variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block', ml: 1 }}>
                            • {key}: {String(value)}
                          </material_1.Typography>))}
                      </material_1.Box>)}

                    <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                      <material_1.Button size="small" variant="contained" startIcon={scenario.status === 'running' ? <icons_material_1.Stop /> : <icons_material_1.PlayArrow />} onClick={() => handleRunScenario(scenario.id)} disabled={scenario.status === 'running'} sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.amethyst}, ${nexusTheme_1.nexusColors.sapphire})`,
                '&:hover': {
                    background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.emerald})`
                }
            }}>
                        {scenario.status === 'running' ? 'Зупинити' : 'Запустити'}
                      </material_1.Button>

                      <material_1.Button size="small" variant="outlined" startIcon={<icons_material_1.Settings />} sx={{
                borderColor: nexusTheme_1.nexusColors.emerald,
                color: nexusTheme_1.nexusColors.emerald,
                '&:hover': {
                    borderColor: nexusTheme_1.nexusColors.sapphire,
                    color: nexusTheme_1.nexusColors.sapphire
                }
            }}>
                        Параметри
                      </material_1.Button>
                    </material_1.Box>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>))}
          </material_1.Grid>
        </material_1.Grid>

        {/* Панель параметрів */}
        <material_1.Grid item xs={12} lg={4}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
            border: `1px solid ${nexusTheme_1.nexusColors.amethyst}40`,
            borderRadius: 2,
            p: 2
        }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 3 }}>
              ⚙️ Глобальні параметри
            </material_1.Typography>

            <material_1.Box sx={{ mb: 3 }}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                Економічне зростання (%): {parameters.economicGrowth}
              </material_1.Typography>
              <material_1.Slider value={parameters.economicGrowth} onChange={(_, value) => setParameters(prev => (Object.assign(Object.assign({}, prev), { economicGrowth: value })))} min={-5} max={10} step={0.1} sx={{
            color: nexusTheme_1.nexusColors.emerald,
            '& .MuiSlider-thumb': {
                backgroundColor: nexusTheme_1.nexusColors.emerald
            },
            '& .MuiSlider-track': {
                backgroundColor: nexusTheme_1.nexusColors.emerald
            }
        }}/>
            </material_1.Box>

            <material_1.Box sx={{ mb: 3 }}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                Рівень інфляції (%): {parameters.inflationRate}
              </material_1.Typography>
              <material_1.Slider value={parameters.inflationRate} onChange={(_, value) => setParameters(prev => (Object.assign(Object.assign({}, prev), { inflationRate: value })))} min={0} max={20} step={0.1} sx={{
            color: nexusTheme_1.nexusColors.warning,
            '& .MuiSlider-thumb': {
                backgroundColor: nexusTheme_1.nexusColors.warning
            },
            '& .MuiSlider-track': {
                backgroundColor: nexusTheme_1.nexusColors.warning
            }
        }}/>
            </material_1.Box>

            <material_1.Box sx={{ mb: 3 }}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                Волатильність валюти (%): {parameters.currencyVolatility}
              </material_1.Typography>
              <material_1.Slider value={parameters.currencyVolatility} onChange={(_, value) => setParameters(prev => (Object.assign(Object.assign({}, prev), { currencyVolatility: value })))} min={0} max={50} step={1} sx={{
            color: nexusTheme_1.nexusColors.error,
            '& .MuiSlider-thumb': {
                backgroundColor: nexusTheme_1.nexusColors.error
            },
            '& .MuiSlider-track': {
                backgroundColor: nexusTheme_1.nexusColors.error
            }
        }}/>
            </material_1.Box>

            <material_1.FormControl fullWidth sx={{ mb: 2 }}>
              <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Регуляторні зміни</material_1.InputLabel>
              <material_1.Select value={parameters.regulatoryChanges} onChange={(e) => setParameters(prev => (Object.assign(Object.assign({}, prev), { regulatoryChanges: e.target.value })))} sx={{
            color: nexusTheme_1.nexusColors.frost,
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: nexusTheme_1.nexusColors.sapphire
            }
        }}>
                <material_1.MenuItem value="minimal">Мінімальні</material_1.MenuItem>
                <material_1.MenuItem value="moderate">Помірні</material_1.MenuItem>
                <material_1.MenuItem value="significant">Значні</material_1.MenuItem>
              </material_1.Select>
            </material_1.FormControl>

            <material_1.TextField fullWidth type="number" label="Часовий горизонт (місяці)" value={parameters.timeHorizon} onChange={(e) => setParameters(prev => (Object.assign(Object.assign({}, prev), { timeHorizon: parseInt(e.target.value) })))} sx={{
            mb: 3,
            '& .MuiInputLabel-root': { color: nexusTheme_1.nexusColors.nebula },
            '& .MuiInputBase-input': { color: nexusTheme_1.nexusColors.frost },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.sapphire }
        }}/>

            <material_1.Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <material_1.Button variant="contained" startIcon={<icons_material_1.Save />} fullWidth sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.emerald})`
            }
        }}>
                Зберегти
              </material_1.Button>

              <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} sx={{
            borderColor: nexusTheme_1.nexusColors.amethyst,
            color: nexusTheme_1.nexusColors.amethyst
        }}>
                Скинути
              </material_1.Button>
            </material_1.Box>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = SimulatorModule;
