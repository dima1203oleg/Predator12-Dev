import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, LinearProgress, Avatar, Grid } from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon, Refresh as RefreshIcon, Timer as TimerIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import { COMPETITION_SCENARIOS, formatModelName } from '../../services/modelRegistry';
const CompetitionArena = ({ onScenarioChange, currentScenario = 0, isActive = false, results = {} }) => {
    const { t } = useI18n();
    const [selectedScenario, setSelectedScenario] = useState(currentScenario);
    const [competitionTimer, setCompetitionTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(isActive);
    const [liveResults, setLiveResults] = useState({});
    // Timer for competition
    useEffect(() => {
        let interval;
        if (isRunning && competitionTimer < 100) {
            interval = setInterval(() => {
                setCompetitionTimer(prev => {
                    if (prev >= 100) {
                        setIsRunning(false);
                        return 100;
                    }
                    return prev + 2; // 2% per interval for 50 intervals = 5 seconds
                });
            }, 100);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [isRunning, competitionTimer]);
    // Simulate live results during competition
    useEffect(() => {
        if (isRunning) {
            const scenario = COMPETITION_SCENARIOS[selectedScenario];
            const interval = setInterval(() => {
                const newResults = {};
                scenario.models.forEach(model => {
                    const progress = (competitionTimer / 100);
                    const variance = (Math.random() - 0.5) * 30 * progress; // Increase variance as time goes on
                    const baseScore = 50 + (Math.random() * 50); // Base range 50-100
                    newResults[model] = Math.max(0, Math.min(100, baseScore + variance));
                });
                setLiveResults(newResults);
            }, 200);
            return () => clearInterval(interval);
        }
    }, [isRunning, competitionTimer, selectedScenario]);
    const handleStartCompetition = () => {
        setCompetitionTimer(0);
        setIsRunning(true);
        setLiveResults({});
    };
    const handlePauseCompetition = () => {
        setIsRunning(false);
    };
    const handleScenarioSelect = (index) => {
        setSelectedScenario(index);
        setCompetitionTimer(0);
        setIsRunning(false);
        setLiveResults({});
        onScenarioChange?.(COMPETITION_SCENARIOS[index]);
    };
    const scenario = COMPETITION_SCENARIOS[selectedScenario];
    const displayResults = competitionTimer === 100 ? results : liveResults;
    const sortedResults = Object.entries(displayResults).sort((a, b) => b[1] - a[1]);
    const getScenarioIcon = (scenarioName) => {
        switch (scenarioName) {
            case 'reasoning_premium': return '🧠';
            case 'coding_showdown': return '💻';
            case 'speed_test': return '⚡';
            case 'language_masters': return '🌍';
            case 'embedding_battle': return '🔗';
            case 'vision_clash': return '👁️';
            default: return '🏆';
        }
    };
    const getMedalEmoji = (position) => {
        switch (position) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return '🏅';
        }
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { mb: 3 }, children: [_jsx(Typography, { variant: "h5", sx: {
                            color: nexusColors.frost,
                            fontFamily: 'Orbitron',
                            background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }, children: "\uD83C\uDFC6 \u0410\u0440\u0435\u043D\u0430 \u0437\u043C\u0430\u0433\u0430\u043D\u044C \u0428\u0406" }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: isRunning ? "outlined" : "contained", startIcon: isRunning ? _jsx(PauseIcon, {}) : _jsx(PlayIcon, {}), onClick: isRunning ? handlePauseCompetition : handleStartCompetition, disabled: competitionTimer === 100, sx: {
                                    backgroundColor: isRunning ? 'transparent' : nexusColors.emerald,
                                    borderColor: nexusColors.emerald,
                                    color: isRunning ? nexusColors.emerald : nexusColors.obsidian,
                                    '&:hover': {
                                        backgroundColor: isRunning ? `${nexusColors.emerald}20` : nexusColors.emerald
                                    }
                                }, children: isRunning ? 'Призупинити' : 'Запустити' }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: () => {
                                    setCompetitionTimer(0);
                                    setIsRunning(false);
                                    setLiveResults({});
                                }, sx: {
                                    borderColor: nexusColors.quantum,
                                    color: nexusColors.quantum
                                }, children: "\u0421\u043A\u0438\u043D\u0443\u0442\u0438" })] })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                                border: `1px solid ${nexusColors.sapphire}60`,
                                borderRadius: 2
                            }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: {
                                            color: nexusColors.frost,
                                            mb: 2,
                                            fontFamily: 'Orbitron'
                                        }, children: "\u0421\u0446\u0435\u043D\u0430\u0440\u0456\u0457 \u0437\u043C\u0430\u0433\u0430\u043D\u044C" }), _jsx(Stack, { spacing: 1, children: COMPETITION_SCENARIOS.map((s, index) => (_jsx(motion.div, { whileHover: { scale: 1.02 }, children: _jsx(Card, { sx: {
                                                    background: selectedScenario === index
                                                        ? `linear-gradient(135deg, ${nexusColors.sapphire}40, ${nexusColors.sapphire}20)`
                                                        : `${nexusColors.darkMatter}80`,
                                                    border: selectedScenario === index
                                                        ? `1px solid ${nexusColors.sapphire}`
                                                        : `1px solid ${nexusColors.quantum}40`,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        borderColor: nexusColors.sapphire
                                                    }
                                                }, onClick: () => handleScenarioSelect(index), children: _jsx(CardContent, { sx: { p: 2, '&:last-child': { pb: 2 } }, children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Typography, { variant: "h6", sx: { fontSize: '1.2rem' }, children: getScenarioIcon(s.name) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost }, children: s.title }), _jsxs(Typography, { variant: "caption", sx: {
                                                                            color: nexusColors.nebula,
                                                                            display: 'block'
                                                                        }, children: [s.models.length, " \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \u2022 ", s.tasks.length, " \u0437\u0430\u0432\u0434\u0430\u043D\u044C"] })] })] }) }) }) }, index))) })] }) }) }), _jsxs(Grid, { item: true, xs: 12, md: 8, children: [_jsx(Card, { sx: {
                                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                                    border: `1px solid ${nexusColors.quantum}60`,
                                    borderRadius: 2,
                                    mb: 2
                                }, children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: {
                                                        color: nexusColors.frost,
                                                        fontFamily: 'Orbitron'
                                                    }, children: scenario.title }), (isRunning || competitionTimer > 0) && (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(TimerIcon, { sx: { color: nexusColors.nebula, fontSize: '1rem' } }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: isRunning ? 'В процесі...' : competitionTimer === 100 ? 'Завершено' : 'Призупинено' })] }))] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(LinearProgress, { variant: "determinate", value: competitionTimer, sx: {
                                                        height: 8,
                                                        backgroundColor: nexusColors.darkMatter,
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: isRunning ? nexusColors.emerald : nexusColors.quantum
                                                        }
                                                    } }), _jsxs(Typography, { variant: "caption", sx: {
                                                        color: nexusColors.nebula,
                                                        mt: 0.5,
                                                        display: 'block'
                                                    }, children: ["\u041F\u0440\u043E\u0433\u0440\u0435\u0441: ", competitionTimer.toFixed(0), "%"] })] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0417\u0430\u0432\u0434\u0430\u043D\u043D\u044F: ", scenario.tasks.join(', ')] })] }) }), _jsx(Card, { sx: {
                                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                                    border: `1px solid ${nexusColors.emerald}60`,
                                    borderRadius: 2
                                }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: {
                                                color: nexusColors.frost,
                                                mb: 2,
                                                fontFamily: 'Orbitron'
                                            }, children: Object.keys(displayResults).length > 0 ? 'Результати змагання' : 'Учасники' }), _jsx(Stack, { spacing: 2, children: Object.keys(displayResults).length > 0 ? (
                                            // Show results
                                            sortedResults.map(([modelId, score], index) => (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(Typography, { variant: "h6", sx: { minWidth: 30 }, children: getMedalEmoji(index) }), _jsx(Avatar, { sx: {
                                                                backgroundColor: `${nexusColors.quantum}20`,
                                                                border: `1px solid ${nexusColors.quantum}`
                                                            }, children: _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.quantum }, children: ["#", index + 1] }) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                                                        color: nexusColors.frost,
                                                                        fontWeight: 'bold'
                                                                    }, children: formatModelName(modelId) }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: modelId })] }), _jsxs(Box, { sx: { minWidth: 100 }, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsxs(Typography, { variant: "h6", sx: {
                                                                                color: index === 0 ? nexusColors.emerald : nexusColors.frost
                                                                            }, children: [score.toFixed(1), "%"] }), index === 0 && (_jsx(TrendingUpIcon, { sx: { color: nexusColors.emerald, fontSize: '1rem' } }))] }), _jsx(LinearProgress, { variant: "determinate", value: score, sx: {
                                                                        width: 80,
                                                                        height: 4,
                                                                        backgroundColor: nexusColors.darkMatter,
                                                                        '& .MuiLinearProgress-bar': {
                                                                            backgroundColor: index === 0 ? nexusColors.emerald : nexusColors.quantum
                                                                        }
                                                                    } })] })] }) }, modelId)))) : (
                                            // Show participants
                                            scenario.models.map((modelId, index) => (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(Avatar, { sx: {
                                                            backgroundColor: `${nexusColors.nebula}20`,
                                                            border: `1px solid ${nexusColors.nebula}`
                                                        }, children: _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: index + 1 }) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", sx: { color: nexusColors.frost }, children: formatModelName(modelId) }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: modelId })] })] }, modelId)))) })] }) })] })] })] }));
};
export default CompetitionArena;
