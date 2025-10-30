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
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const I18nProvider_1 = require("../../i18n/I18nProvider");
const modelRegistry_1 = require("../../services/modelRegistry");
const ModelCatalog = ({ onModelSelect, selectedModel, filterCategory, showPerformance = true }) => {
    const { t } = (0, I18nProvider_1.useI18n)();
    const [expandedCategories, setExpandedCategories] = (0, react_1.useState)(['reasoning', 'code']);
    const categoryIcons = (0, react_1.useMemo)(() => ({
        reasoning: icons_material_1.Psychology,
        code: icons_material_1.Code,
        quick: icons_material_1.Speed,
        embed: icons_material_1.Psychology,
        vision: icons_material_1.Visibility,
        gen: icons_material_1.DataArray
    }), []);
    const categoryColors = (0, react_1.useMemo)(() => ({
        reasoning: nexusTheme_1.nexusColors.sapphire,
        code: nexusTheme_1.nexusColors.quantum,
        quick: nexusTheme_1.nexusColors.emerald,
        embed: nexusTheme_1.nexusColors.crimson,
        vision: nexusTheme_1.nexusColors.nebula,
        gen: nexusTheme_1.nexusColors.frost
    }), []);
    const getCategoryStats = (category) => {
        const models = (0, modelRegistry_1.getModelsByCategory)(category);
        const avgPerformance = models.reduce((sum, m) => sum + m.performance, 0) / models.length;
        const topModel = models.reduce((best, current) => current.performance > best.performance ? current : best);
        return { count: models.length, avgPerformance, topModel };
    };
    const handleCategoryToggle = (category) => {
        setExpandedCategories(prev => prev.includes(category)
            ? prev.filter(c => c !== category)
            : [...prev, category]);
    };
    const handleModelClick = (modelId) => {
        onModelSelect === null || onModelSelect === void 0 ? void 0 : onModelSelect(modelId);
    };
    const getPerformanceColor = (performance) => {
        if (performance >= 90)
            return nexusTheme_1.nexusColors.emerald;
        if (performance >= 80)
            return nexusTheme_1.nexusColors.quantum;
        if (performance >= 70)
            return '#FFA726';
        return nexusTheme_1.nexusColors.crimson;
    };
    const filteredCategories = filterCategory
        ? [filterCategory]
        : Object.keys(modelRegistry_1.FREE_MODELS_CATALOG);
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Header */}
      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Typography variant="h5" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron',
            mb: 1,
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
          Каталог ШІ Моделей
        </material_1.Typography>

        <material_1.Stack direction="row" spacing={2} alignItems="center">
          <material_1.Chip icon={<icons_material_1.Star />} label={`${(0, modelRegistry_1.getAllFreeModels)().length} безплатних моделей`} sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
            color: nexusTheme_1.nexusColors.emerald,
            border: `1px solid ${nexusTheme_1.nexusColors.emerald}60`
        }}/>
          {showPerformance && (<material_1.Chip icon={<icons_material_1.TrendingUp />} label="Сортування за продуктивністю" variant="outlined" sx={{ borderColor: nexusTheme_1.nexusColors.nebula, color: nexusTheme_1.nexusColors.nebula }}/>)}
        </material_1.Stack>
      </material_1.Box>

      {/* Model Categories */}
      <material_1.Grid container spacing={2}>
        {filteredCategories.map(category => {
            const stats = getCategoryStats(category);
            const IconComponent = categoryIcons[category];
            const isExpanded = expandedCategories.includes(category);
            return (<material_1.Grid item xs={12} key={category}>
              <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Object.keys(modelRegistry_1.FREE_MODELS_CATALOG).indexOf(category) * 0.1 }}>
                <material_1.Accordion expanded={isExpanded} onChange={() => handleCategoryToggle(category)} sx={{
                    background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
                    border: `1px solid ${categoryColors[category]}60`,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    '& .MuiAccordionSummary-root': {
                        borderBottom: isExpanded ? `1px solid ${categoryColors[category]}60` : 'none'
                    }
                }}>
                  <material_1.AccordionSummary expandIcon={<icons_material_1.ExpandMore sx={{ color: nexusTheme_1.nexusColors.frost }}/>}>
                    <material_1.Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                      <material_1.Badge badgeContent={stats.count} color="primary">
                        <IconComponent sx={{
                    color: categoryColors[category],
                    fontSize: '2rem'
                }}/>
                      </material_1.Badge>

                      <material_1.Box sx={{ flex: 1 }}>
                        <material_1.Typography variant="h6" sx={{
                    color: nexusTheme_1.nexusColors.frost,
                    fontFamily: 'Orbitron',
                    textTransform: 'capitalize'
                }}>
                          {category === 'reasoning' ? 'Розумування' :
                    category === 'code' ? 'Програмування' :
                        category === 'quick' ? 'Швидкі відповіді' :
                            category === 'embed' ? 'Вбудовування' :
                                category === 'vision' ? 'Комп\'ютерний зір' :
                                    'Генерація'}
                        </material_1.Typography>

                        <material_1.Stack direction="row" spacing={2} alignItems="center">
                          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                            Середня продуктивність: {stats.avgPerformance.toFixed(1)}%
                          </material_1.Typography>
                          <material_1.Chip size="small" label={`Топ: ${(0, modelRegistry_1.formatModelName)(stats.topModel.id)}`} sx={{
                    backgroundColor: `${getPerformanceColor(stats.topModel.performance)}20`,
                    color: getPerformanceColor(stats.topModel.performance),
                    fontSize: '0.7rem'
                }}/>
                        </material_1.Stack>
                      </material_1.Box>
                    </material_1.Stack>
                  </material_1.AccordionSummary>

                  <material_1.AccordionDetails>
                    <material_1.Grid container spacing={1}>
                      {(0, modelRegistry_1.getModelsByCategory)(category)
                    .sort((a, b) => b.performance - a.performance) // Sort by performance desc
                    .map((model, index) => (<material_1.Grid item xs={12} sm={6} md={4} key={model.id}>
                          <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <material_1.Card sx={{
                        background: selectedModel === model.id
                            ? `linear-gradient(135deg, ${categoryColors[category]}40, ${categoryColors[category]}20)`
                            : `linear-gradient(135deg, ${nexusTheme_1.nexusColors.darkMatter}80, ${nexusTheme_1.nexusColors.obsidian}60)`,
                        border: selectedModel === model.id
                            ? `2px solid ${categoryColors[category]}`
                            : `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: categoryColors[category],
                            boxShadow: `0 2px 8px ${categoryColors[category]}40`
                        }
                    }} onClick={() => handleModelClick(model.id)}>
                              <material_1.CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <material_1.Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <material_1.Typography variant="subtitle2" sx={{
                        color: nexusTheme_1.nexusColors.frost,
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                    }}>
                                    {(0, modelRegistry_1.formatModelName)(model.id)}
                                  </material_1.Typography>

                                  {index === 0 && (<material_1.Chip size="small" icon={<icons_material_1.Star sx={{ fontSize: '0.8rem' }}/>} label="TOP" sx={{
                            backgroundColor: nexusTheme_1.nexusColors.quantum,
                            color: nexusTheme_1.nexusColors.obsidian,
                            fontSize: '0.6rem',
                            height: 18
                        }}/>)}
                                </material_1.Stack>

                                <material_1.Typography variant="caption" sx={{
                        color: nexusTheme_1.nexusColors.shadow,
                        display: 'block',
                        mb: 1,
                        fontSize: '0.7rem'
                    }}>
                                  {model.id}
                                </material_1.Typography>

                                {showPerformance && (<material_1.Box>
                                    <material_1.Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                                        Продуктивність
                                      </material_1.Typography>
                                      <material_1.Typography variant="caption" sx={{
                            color: getPerformanceColor(model.performance),
                            fontWeight: 'bold'
                        }}>
                                        {model.performance}%
                                      </material_1.Typography>
                                    </material_1.Stack>
                                    <material_1.LinearProgress variant="determinate" value={model.performance} sx={{
                            height: 4,
                            backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: getPerformanceColor(model.performance)
                            }
                        }}/>
                                  </material_1.Box>)}
                              </material_1.CardContent>
                            </material_1.Card>
                          </framer_motion_1.motion.div>
                        </material_1.Grid>))}
                    </material_1.Grid>
                  </material_1.AccordionDetails>
                </material_1.Accordion>
              </framer_motion_1.motion.div>
            </material_1.Grid>);
        })}
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = ModelCatalog;
