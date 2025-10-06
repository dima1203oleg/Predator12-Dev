import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid, Stack, Accordion, AccordionSummary, AccordionDetails, LinearProgress, Badge } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Psychology as ReasoningIcon, Code as CodeIcon, Speed as QuickIcon, Psychology as EmbedIcon, Visibility as VisionIcon, DataArray as GenIcon, Star as StarIcon, TrendingUp as PerformanceIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import { FREE_MODELS_CATALOG, getAllFreeModels, getModelsByCategory, formatModelName } from '../../services/modelRegistry';
const ModelCatalog = ({ onModelSelect, selectedModel, filterCategory, showPerformance = true }) => {
    const { t } = useI18n();
    const [expandedCategories, setExpandedCategories] = useState(['reasoning', 'code']);
    const categoryIcons = useMemo(() => ({
        reasoning: ReasoningIcon,
        code: CodeIcon,
        quick: QuickIcon,
        embed: EmbedIcon,
        vision: VisionIcon,
        gen: GenIcon
    }), []);
    const categoryColors = useMemo(() => ({
        reasoning: nexusColors.sapphire,
        code: nexusColors.quantum,
        quick: nexusColors.emerald,
        embed: nexusColors.crimson,
        vision: nexusColors.nebula,
        gen: nexusColors.frost
    }), []);
    const getCategoryStats = (category) => {
        const models = getModelsByCategory(category);
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
        onModelSelect?.(modelId);
    };
    const getPerformanceColor = (performance) => {
        if (performance >= 90)
            return nexusColors.emerald;
        if (performance >= 80)
            return nexusColors.quantum;
        if (performance >= 70)
            return '#FFA726';
        return nexusColors.crimson;
    };
    const filteredCategories = filterCategory
        ? [filterCategory]
        : Object.keys(FREE_MODELS_CATALOG);
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "h5", sx: {
                            color: nexusColors.frost,
                            fontFamily: 'Orbitron',
                            mb: 1,
                            background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }, children: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0428\u0406 \u041C\u043E\u0434\u0435\u043B\u0435\u0439" }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Chip, { icon: _jsx(StarIcon, {}), label: `${getAllFreeModels().length} безплатних моделей`, sx: {
                                    backgroundColor: `${nexusColors.emerald}20`,
                                    color: nexusColors.emerald,
                                    border: `1px solid ${nexusColors.emerald}60`
                                } }), showPerformance && (_jsx(Chip, { icon: _jsx(PerformanceIcon, {}), label: "\u0421\u043E\u0440\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044E", variant: "outlined", sx: { borderColor: nexusColors.nebula, color: nexusColors.nebula } }))] })] }), _jsx(Grid, { container: true, spacing: 2, children: filteredCategories.map(category => {
                    const stats = getCategoryStats(category);
                    const IconComponent = categoryIcons[category];
                    const isExpanded = expandedCategories.includes(category);
                    return (_jsx(Grid, { item: true, xs: 12, children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: Object.keys(FREE_MODELS_CATALOG).indexOf(category) * 0.1 }, children: _jsxs(Accordion, { expanded: isExpanded, onChange: () => handleCategoryToggle(category), sx: {
                                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                                    border: `1px solid ${categoryColors[category]}60`,
                                    borderRadius: 2,
                                    '&:before': { display: 'none' },
                                    '& .MuiAccordionSummary-root': {
                                        borderBottom: isExpanded ? `1px solid ${categoryColors[category]}60` : 'none'
                                    }
                                }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, { sx: { color: nexusColors.frost } }), children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, sx: { width: '100%', pr: 2 }, children: [_jsx(Badge, { badgeContent: stats.count, color: "primary", children: _jsx(IconComponent, { sx: {
                                                            color: categoryColors[category],
                                                            fontSize: '2rem'
                                                        } }) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Typography, { variant: "h6", sx: {
                                                                color: nexusColors.frost,
                                                                fontFamily: 'Orbitron',
                                                                textTransform: 'capitalize'
                                                            }, children: category === 'reasoning' ? 'Розумування' :
                                                                category === 'code' ? 'Програмування' :
                                                                    category === 'quick' ? 'Швидкі відповіді' :
                                                                        category === 'embed' ? 'Вбудовування' :
                                                                            category === 'vision' ? 'Комп\'ютерний зір' :
                                                                                'Генерація' }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: ["\u0421\u0435\u0440\u0435\u0434\u043D\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", stats.avgPerformance.toFixed(1), "%"] }), _jsx(Chip, { size: "small", label: `Топ: ${formatModelName(stats.topModel.id)}`, sx: {
                                                                        backgroundColor: `${getPerformanceColor(stats.topModel.performance)}20`,
                                                                        color: getPerformanceColor(stats.topModel.performance),
                                                                        fontSize: '0.7rem'
                                                                    } })] })] })] }) }), _jsx(AccordionDetails, { children: _jsx(Grid, { container: true, spacing: 1, children: getModelsByCategory(category)
                                                .sort((a, b) => b.performance - a.performance) // Sort by performance desc
                                                .map((model, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsx(Card, { sx: {
                                                            background: selectedModel === model.id
                                                                ? `linear-gradient(135deg, ${categoryColors[category]}40, ${categoryColors[category]}20)`
                                                                : `linear-gradient(135deg, ${nexusColors.darkMatter}80, ${nexusColors.obsidian}60)`,
                                                            border: selectedModel === model.id
                                                                ? `2px solid ${categoryColors[category]}`
                                                                : `1px solid ${nexusColors.quantum}40`,
                                                            borderRadius: 1,
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                borderColor: categoryColors[category],
                                                                boxShadow: `0 2px 8px ${categoryColors[category]}40`
                                                            }
                                                        }, onClick: () => handleModelClick(model.id), children: _jsxs(CardContent, { sx: { p: 2, '&:last-child': { pb: 2 } }, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", sx: {
                                                                                color: nexusColors.frost,
                                                                                fontWeight: 'bold',
                                                                                fontSize: '0.85rem'
                                                                            }, children: formatModelName(model.id) }), index === 0 && (_jsx(Chip, { size: "small", icon: _jsx(StarIcon, { sx: { fontSize: '0.8rem' } }), label: "TOP", sx: {
                                                                                backgroundColor: nexusColors.quantum,
                                                                                color: nexusColors.obsidian,
                                                                                fontSize: '0.6rem',
                                                                                height: 18
                                                                            } }))] }), _jsx(Typography, { variant: "caption", sx: {
                                                                        color: nexusColors.shadow,
                                                                        display: 'block',
                                                                        mb: 1,
                                                                        fontSize: '0.7rem'
                                                                    }, children: model.id }), showPerformance && (_jsxs(Box, { children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", sx: { mb: 0.5 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C" }), _jsxs(Typography, { variant: "caption", sx: {
                                                                                        color: getPerformanceColor(model.performance),
                                                                                        fontWeight: 'bold'
                                                                                    }, children: [model.performance, "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: model.performance, sx: {
                                                                                height: 4,
                                                                                backgroundColor: nexusColors.darkMatter,
                                                                                '& .MuiLinearProgress-bar': {
                                                                                    backgroundColor: getPerformanceColor(model.performance)
                                                                                }
                                                                            } })] }))] }) }) }) }, model.id))) }) })] }) }) }, category));
                }) })] }));
};
export default ModelCatalog;
