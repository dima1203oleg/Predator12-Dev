// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  Divider,
  Grid,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import {
  COMPETITION_SCENARIOS,
  simulateCompetitionResults,
  formatModelName,
  CompetitionScenario
} from '../../services/modelRegistry';

interface CompetitionArenaProps {
  onScenarioChange?: (scenario: CompetitionScenario) => void;
  currentScenario?: number;
  isActive?: boolean;
  results?: Record<string, number>;
}

const CompetitionArena: React.FC<CompetitionArenaProps> = ({
  onScenarioChange,
  currentScenario = 0,
  isActive = false,
  results = {}
}) => {
  const { t } = useI18n();
  const [selectedScenario, setSelectedScenario] = useState(currentScenario);
  const [competitionTimer, setCompetitionTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(isActive);
  const [liveResults, setLiveResults] = useState<Record<string, number>>({});

  // Timer for competition
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
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
      if (interval) clearInterval(interval);
    };
  }, [isRunning, competitionTimer]);

  // Simulate live results during competition
  useEffect(() => {
    if (isRunning) {
      const scenario = COMPETITION_SCENARIOS[selectedScenario];
      const interval = setInterval(() => {
        const newResults: Record<string, number> = {};
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

  const handleScenarioSelect = (index: number) => {
    setSelectedScenario(index);
    setCompetitionTimer(0);
    setIsRunning(false);
    setLiveResults({});
    onScenarioChange?.(COMPETITION_SCENARIOS[index]);
  };

  const scenario = COMPETITION_SCENARIOS[selectedScenario];
  const displayResults = competitionTimer === 100 ? results : liveResults;
  const sortedResults = Object.entries(displayResults).sort((a, b) => b[1] - a[1]);

  const getScenarioIcon = (scenarioName: string) => {
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

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{
          color: nexusColors.frost,
          fontFamily: 'Orbitron',
          background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🏆 Арена змагань ШІ
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant={isRunning ? "outlined" : "contained"}
            startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
            onClick={isRunning ? handlePauseCompetition : handleStartCompetition}
            disabled={competitionTimer === 100}
            sx={{
              backgroundColor: isRunning ? 'transparent' : nexusColors.emerald,
              borderColor: nexusColors.emerald,
              color: isRunning ? nexusColors.emerald : nexusColors.obsidian,
              '&:hover': {
                backgroundColor: isRunning ? `${nexusColors.emerald}20` : nexusColors.emerald
              }
            }}
          >
            {isRunning ? 'Призупинити' : 'Запустити'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setCompetitionTimer(0);
              setIsRunning(false);
              setLiveResults({});
            }}
            sx={{
              borderColor: nexusColors.quantum,
              color: nexusColors.quantum
            }}
          >
            Скинути
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Scenario Selection */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusColors.sapphire}60`,
            borderRadius: 2
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                color: nexusColors.frost, 
                mb: 2,
                fontFamily: 'Orbitron'
              }}>
                Сценарії змагань
              </Typography>
              
              <Stack spacing={1}>
                {COMPETITION_SCENARIOS.map((s, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.02 }}>
                    <Card
                      sx={{
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
                      }}
                      onClick={() => handleScenarioSelect(index)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                            {getScenarioIcon(s.name)}
                          </Typography>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
                              {s.title}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: nexusColors.nebula,
                              display: 'block'
                            }}>
                              {s.models.length} моделей • {s.tasks.length} завдань
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Competition Status */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusColors.quantum}60`,
            borderRadius: 2,
            mb: 2
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  color: nexusColors.frost,
                  fontFamily: 'Orbitron'
                }}>
                  {scenario.title}
                </Typography>
                
                {(isRunning || competitionTimer > 0) && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TimerIcon sx={{ color: nexusColors.nebula, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                      {isRunning ? 'В процесі...' : competitionTimer === 100 ? 'Завершено' : 'Призупинено'}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              
              {/* Progress bar */}
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={competitionTimer}
                  sx={{
                    height: 8,
                    backgroundColor: nexusColors.darkMatter,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: isRunning ? nexusColors.emerald : nexusColors.quantum
                    }
                  }}
                />
                <Typography variant="caption" sx={{ 
                  color: nexusColors.nebula,
                  mt: 0.5,
                  display: 'block'
                }}>
                  Прогрес: {competitionTimer.toFixed(0)}%
                </Typography>
              </Box>
              
              {/* Tasks */}
              <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                Завдання: {scenario.tasks.join(', ')}
              </Typography>
            </CardContent>
          </Card>

          {/* Live Results */}
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusColors.emerald}60`,
            borderRadius: 2
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                color: nexusColors.frost, 
                mb: 2,
                fontFamily: 'Orbitron'
              }}>
                {Object.keys(displayResults).length > 0 ? 'Результати змагання' : 'Учасники'}
              </Typography>
              
              <Stack spacing={2}>
                {Object.keys(displayResults).length > 0 ? (
                  // Show results
                  sortedResults.map(([modelId, score], index) => (
                    <motion.div
                      key={modelId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6" sx={{ minWidth: 30 }}>
                          {getMedalEmoji(index)}
                        </Typography>
                        
                        <Avatar sx={{
                          backgroundColor: `${nexusColors.quantum}20`,
                          border: `1px solid ${nexusColors.quantum}`
                        }}>
                          <Typography variant="caption" sx={{ color: nexusColors.quantum }}>
                            #{index + 1}
                          </Typography>
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ 
                            color: nexusColors.frost,
                            fontWeight: 'bold'
                          }}>
                            {formatModelName(modelId)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                            {modelId}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ minWidth: 100 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" sx={{ 
                              color: index === 0 ? nexusColors.emerald : nexusColors.frost
                            }}>
                              {score.toFixed(1)}%
                            </Typography>
                            {index === 0 && (
                              <TrendingUpIcon sx={{ color: nexusColors.emerald, fontSize: '1rem' }} />
                            )}
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={score}
                            sx={{
                              width: 80,
                              height: 4,
                              backgroundColor: nexusColors.darkMatter,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: index === 0 ? nexusColors.emerald : nexusColors.quantum
                              }
                            }}
                          />
                        </Box>
                      </Stack>
                    </motion.div>
                  ))
                ) : (
                  // Show participants
                  scenario.models.map((modelId, index) => (
                    <Stack key={modelId} direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{
                        backgroundColor: `${nexusColors.nebula}20`,
                        border: `1px solid ${nexusColors.nebula}`
                      }}>
                        <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                          {index + 1}
                        </Typography>
                      </Avatar>
                      
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: nexusColors.frost }}>
                          {formatModelName(modelId)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                          {modelId}
                        </Typography>
                      </Box>
                    </Stack>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompetitionArena;
