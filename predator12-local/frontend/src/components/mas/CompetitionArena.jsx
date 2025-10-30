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
const CompetitionArena = ({ onScenarioChange, currentScenario = 0, isActive = false, results = {} }) => {
    const { t } = (0, I18nProvider_1.useI18n)();
    const [selectedScenario, setSelectedScenario] = (0, react_1.useState)(currentScenario);
    const [competitionTimer, setCompetitionTimer] = (0, react_1.useState)(0);
    const [isRunning, setIsRunning] = (0, react_1.useState)(isActive);
    const [liveResults, setLiveResults] = (0, react_1.useState)({});
    // Timer for competition
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useEffect)(() => {
        if (isRunning) {
            const scenario = modelRegistry_1.COMPETITION_SCENARIOS[selectedScenario];
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
        onScenarioChange === null || onScenarioChange === void 0 ? void 0 : onScenarioChange(modelRegistry_1.COMPETITION_SCENARIOS[index]);
    };
    const scenario = modelRegistry_1.COMPETITION_SCENARIOS[selectedScenario];
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
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Header */}
      <material_1.Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <material_1.Typography variant="h5" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
          🏆 Арена змагань ШІ
        </material_1.Typography>

        <material_1.Stack direction="row" spacing={1}>
          <material_1.Button variant={isRunning ? "outlined" : "contained"} startIcon={isRunning ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />} onClick={isRunning ? handlePauseCompetition : handleStartCompetition} disabled={competitionTimer === 100} sx={{
            backgroundColor: isRunning ? 'transparent' : nexusTheme_1.nexusColors.emerald,
            borderColor: nexusTheme_1.nexusColors.emerald,
            color: isRunning ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.obsidian,
            '&:hover': {
                backgroundColor: isRunning ? `${nexusTheme_1.nexusColors.emerald}20` : nexusTheme_1.nexusColors.emerald
            }
        }}>
            {isRunning ? 'Призупинити' : 'Запустити'}
          </material_1.Button>

          <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={() => {
            setCompetitionTimer(0);
            setIsRunning(false);
            setLiveResults({});
        }} sx={{
            borderColor: nexusTheme_1.nexusColors.quantum,
            color: nexusTheme_1.nexusColors.quantum
        }}>
            Скинути
          </material_1.Button>
        </material_1.Stack>
      </material_1.Stack>

      <material_1.Grid container spacing={3}>
        {/* Scenario Selection */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusTheme_1.nexusColors.sapphire}60`,
            borderRadius: 2
        }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            mb: 2,
            fontFamily: 'Orbitron'
        }}>
                Сценарії змагань
              </material_1.Typography>

              <material_1.Stack spacing={1}>
                {modelRegistry_1.COMPETITION_SCENARIOS.map((s, index) => (<framer_motion_1.motion.div key={index} whileHover={{ scale: 1.02 }}>
                    <material_1.Card sx={{
                background: selectedScenario === index
                    ? `linear-gradient(135deg, ${nexusTheme_1.nexusColors.sapphire}40, ${nexusTheme_1.nexusColors.sapphire}20)`
                    : `${nexusTheme_1.nexusColors.darkMatter}80`,
                border: selectedScenario === index
                    ? `1px solid ${nexusTheme_1.nexusColors.sapphire}`
                    : `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                cursor: 'pointer',
                '&:hover': {
                    borderColor: nexusTheme_1.nexusColors.sapphire
                }
            }} onClick={() => handleScenarioSelect(index)}>
                      <material_1.CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <material_1.Stack direction="row" alignItems="center" spacing={1}>
                          <material_1.Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                            {getScenarioIcon(s.name)}
                          </material_1.Typography>
                          <material_1.Box>
                            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                              {s.title}
                            </material_1.Typography>
                            <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.nebula,
                display: 'block'
            }}>
                              {s.models.length} моделей • {s.tasks.length} завдань
                            </material_1.Typography>
                          </material_1.Box>
                        </material_1.Stack>
                      </material_1.CardContent>
                    </material_1.Card>
                  </framer_motion_1.motion.div>))}
              </material_1.Stack>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Competition Status */}
        <material_1.Grid item xs={12} md={8}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}60`,
            borderRadius: 2,
            mb: 2
        }}>
            <material_1.CardContent>
              <material_1.Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron'
        }}>
                  {scenario.title}
                </material_1.Typography>

                {(isRunning || competitionTimer > 0) && (<material_1.Stack direction="row" alignItems="center" spacing={1}>
                    <icons_material_1.Timer sx={{ color: nexusTheme_1.nexusColors.nebula, fontSize: '1rem' }}/>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      {isRunning ? 'В процесі...' : competitionTimer === 100 ? 'Завершено' : 'Призупинено'}
                    </material_1.Typography>
                  </material_1.Stack>)}
              </material_1.Stack>

              {/* Progress bar */}
              <material_1.Box sx={{ mb: 2 }}>
                <material_1.LinearProgress variant="determinate" value={competitionTimer} sx={{
            height: 8,
            backgroundColor: nexusTheme_1.nexusColors.darkMatter,
            '& .MuiLinearProgress-bar': {
                backgroundColor: isRunning ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.quantum
            }
        }}/>
                <material_1.Typography variant="caption" sx={{
            color: nexusTheme_1.nexusColors.nebula,
            mt: 0.5,
            display: 'block'
        }}>
                  Прогрес: {competitionTimer.toFixed(0)}%
                </material_1.Typography>
              </material_1.Box>

              {/* Tasks */}
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                Завдання: {scenario.tasks.join(', ')}
              </material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>

          {/* Live Results */}
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusTheme_1.nexusColors.emerald}60`,
            borderRadius: 2
        }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            mb: 2,
            fontFamily: 'Orbitron'
        }}>
                {Object.keys(displayResults).length > 0 ? 'Результати змагання' : 'Учасники'}
              </material_1.Typography>

              <material_1.Stack spacing={2}>
                {Object.keys(displayResults).length > 0 ? (
        // Show results
        sortedResults.map(([modelId, score], index) => (<framer_motion_1.motion.div key={modelId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <material_1.Stack direction="row" alignItems="center" spacing={2}>
                        <material_1.Typography variant="h6" sx={{ minWidth: 30 }}>
                          {getMedalEmoji(index)}
                        </material_1.Typography>

                        <material_1.Avatar sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`
            }}>
                          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
                            #{index + 1}
                          </material_1.Typography>
                        </material_1.Avatar>

                        <material_1.Box sx={{ flex: 1 }}>
                          <material_1.Typography variant="subtitle1" sx={{
                color: nexusTheme_1.nexusColors.frost,
                fontWeight: 'bold'
            }}>
                            {(0, modelRegistry_1.formatModelName)(modelId)}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                            {modelId}
                          </material_1.Typography>
                        </material_1.Box>

                        <material_1.Box sx={{ minWidth: 100 }}>
                          <material_1.Stack direction="row" alignItems="center" spacing={1}>
                            <material_1.Typography variant="h6" sx={{
                color: index === 0 ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.frost
            }}>
                              {score.toFixed(1)}%
                            </material_1.Typography>
                            {index === 0 && (<icons_material_1.TrendingUp sx={{ color: nexusTheme_1.nexusColors.emerald, fontSize: '1rem' }}/>)}
                          </material_1.Stack>
                          <material_1.LinearProgress variant="determinate" value={score} sx={{
                width: 80,
                height: 4,
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: index === 0 ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.quantum
                }
            }}/>
                        </material_1.Box>
                      </material_1.Stack>
                    </framer_motion_1.motion.div>))) : (
        // Show participants
        scenario.models.map((modelId, index) => (<material_1.Stack key={modelId} direction="row" alignItems="center" spacing={2}>
                      <material_1.Avatar sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.nebula}20`,
                border: `1px solid ${nexusTheme_1.nexusColors.nebula}`
            }}>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                          {index + 1}
                        </material_1.Typography>
                      </material_1.Avatar>

                      <material_1.Box>
                        <material_1.Typography variant="subtitle1" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                          {(0, modelRegistry_1.formatModelName)(modelId)}
                        </material_1.Typography>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                          {modelId}
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Stack>)))}
              </material_1.Stack>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = CompetitionArena;
