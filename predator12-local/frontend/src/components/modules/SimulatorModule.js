import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Slider, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PlayArrow, Stop, Settings, Save, Refresh } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
const SimulatorModule = () => {
    const [scenarios] = useState([
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
    const [activeScenario, setActiveScenario] = useState(null);
    const [parameters, setParameters] = useState({
        economicGrowth: 2.5,
        inflationRate: 8.5,
        currencyVolatility: 15,
        regulatoryChanges: 'moderate',
        timeHorizon: 6
    });
    const getStatusColor = (status) => {
        switch (status) {
            case 'ready': return nexusColors.emerald;
            case 'running': return nexusColors.warning;
            case 'completed': return nexusColors.success;
            case 'failed': return nexusColors.error;
            default: return nexusColors.frost;
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
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h4", sx: {
                    mb: 3,
                    color: nexusColors.frost,
                    textAlign: 'center',
                    background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.emerald})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }, children: "\uD83C\uDF0C \u0421\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440 \u0420\u0435\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0435\u0439" }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(Grid, { container: true, spacing: 2, children: scenarios.map((scenario) => (_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: {
                                        background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                                        border: `1px solid ${getStatusColor(scenario.status)}40`,
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 8px 25px ${getStatusColor(scenario.status)}30`
                                        }
                                    }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, flexGrow: 1 }, children: scenario.name }), _jsx(Typography, { sx: { fontSize: '1.2rem' }, children: getStatusEmoji(scenario.status) })] }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 2 }, children: scenario.description }), _jsx(Chip, { size: "small", label: scenario.status, sx: {
                                                    backgroundColor: `${getStatusColor(scenario.status)}20`,
                                                    color: getStatusColor(scenario.status),
                                                    mb: 2
                                                } }), scenario.lastRun && (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.shadow, display: 'block', mb: 2 }, children: ["\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0437\u0430\u043F\u0443\u0441\u043A: ", scenario.lastRun] })), scenario.results && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.success, fontWeight: 600 }, children: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438:" }), Object.entries(scenario.results).map(([key, value]) => (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula, display: 'block', ml: 1 }, children: ["\u2022 ", key, ": ", value] }, key)))] })), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { size: "small", variant: "contained", startIcon: scenario.status === 'running' ? _jsx(Stop, {}) : _jsx(PlayArrow, {}), onClick: () => handleRunScenario(scenario.id), disabled: scenario.status === 'running', sx: {
                                                            background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`,
                                                            '&:hover': {
                                                                background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`
                                                            }
                                                        }, children: scenario.status === 'running' ? 'Зупинити' : 'Запустити' }), _jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(Settings, {}), sx: {
                                                            borderColor: nexusColors.emerald,
                                                            color: nexusColors.emerald,
                                                            '&:hover': {
                                                                borderColor: nexusColors.sapphire,
                                                                color: nexusColors.sapphire
                                                            }
                                                        }, children: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438" })] })] }) }) }, scenario.id))) }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsxs(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                                border: `1px solid ${nexusColors.amethyst}40`,
                                borderRadius: 2,
                                p: 2
                            }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 3 }, children: "\u2699\uFE0F \u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0456 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0438" }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0415\u043A\u043E\u043D\u043E\u043C\u0456\u0447\u043D\u0435 \u0437\u0440\u043E\u0441\u0442\u0430\u043D\u043D\u044F (%): ", parameters.economicGrowth] }), _jsx(Slider, { value: parameters.economicGrowth, onChange: (_, value) => setParameters(prev => ({ ...prev, economicGrowth: value })), min: -5, max: 10, step: 0.1, sx: {
                                                color: nexusColors.emerald,
                                                '& .MuiSlider-thumb': {
                                                    backgroundColor: nexusColors.emerald
                                                },
                                                '& .MuiSlider-track': {
                                                    backgroundColor: nexusColors.emerald
                                                }
                                            } })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0420\u0456\u0432\u0435\u043D\u044C \u0456\u043D\u0444\u043B\u044F\u0446\u0456\u0457 (%): ", parameters.inflationRate] }), _jsx(Slider, { value: parameters.inflationRate, onChange: (_, value) => setParameters(prev => ({ ...prev, inflationRate: value })), min: 0, max: 20, step: 0.1, sx: {
                                                color: nexusColors.warning,
                                                '& .MuiSlider-thumb': {
                                                    backgroundColor: nexusColors.warning
                                                },
                                                '& .MuiSlider-track': {
                                                    backgroundColor: nexusColors.warning
                                                }
                                            } })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0412\u043E\u043B\u0430\u0442\u0438\u043B\u044C\u043D\u0456\u0441\u0442\u044C \u0432\u0430\u043B\u044E\u0442\u0438 (%): ", parameters.currencyVolatility] }), _jsx(Slider, { value: parameters.currencyVolatility, onChange: (_, value) => setParameters(prev => ({ ...prev, currencyVolatility: value })), min: 0, max: 50, step: 1, sx: {
                                                color: nexusColors.error,
                                                '& .MuiSlider-thumb': {
                                                    backgroundColor: nexusColors.error
                                                },
                                                '& .MuiSlider-track': {
                                                    backgroundColor: nexusColors.error
                                                }
                                            } })] }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0420\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440\u043D\u0456 \u0437\u043C\u0456\u043D\u0438" }), _jsxs(Select, { value: parameters.regulatoryChanges, onChange: (e) => setParameters(prev => ({ ...prev, regulatoryChanges: e.target.value })), sx: {
                                                color: nexusColors.frost,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: nexusColors.sapphire
                                                }
                                            }, children: [_jsx(MenuItem, { value: "minimal", children: "\u041C\u0456\u043D\u0456\u043C\u0430\u043B\u044C\u043D\u0456" }), _jsx(MenuItem, { value: "moderate", children: "\u041F\u043E\u043C\u0456\u0440\u043D\u0456" }), _jsx(MenuItem, { value: "significant", children: "\u0417\u043D\u0430\u0447\u043D\u0456" })] })] }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0427\u0430\u0441\u043E\u0432\u0438\u0439 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442 (\u043C\u0456\u0441\u044F\u0446\u0456)", value: parameters.timeHorizon, onChange: (e) => setParameters(prev => ({ ...prev, timeHorizon: parseInt(e.target.value) })), sx: {
                                        mb: 3,
                                        '& .MuiInputLabel-root': { color: nexusColors.nebula },
                                        '& .MuiInputBase-input': { color: nexusColors.frost },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.sapphire }
                                    } }), _jsxs(Box, { sx: { display: 'flex', gap: 1, mt: 2 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Save, {}), fullWidth: true, sx: {
                                                background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                                                '&:hover': {
                                                    background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`
                                                }
                                            }, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(Refresh, {}), sx: {
                                                borderColor: nexusColors.amethyst,
                                                color: nexusColors.amethyst
                                            }, children: "\u0421\u043A\u0438\u043D\u0443\u0442\u0438" })] })] }) })] })] }));
};
export default SimulatorModule;
