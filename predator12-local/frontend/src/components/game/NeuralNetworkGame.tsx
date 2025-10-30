// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Games as GamesIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface GameStats {
  score: number;
  level: number;
  lives: number;
  combo: number;
  time: number;
  accuracy: number;
}

interface MiniGameProps {
  onXPGain: (xp: number) => void;
  onScoreUpdate: (score: number) => void;
}

const NeuralNetworkGame: React.FC<MiniGameProps> = ({ onXPGain, onScoreUpdate }) => {
  const [gameOpen, setGameOpen] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    combo: 0,
    time: 60,
    accuracy: 100
  });

  // Ігрове поле - нейронна мережа
  const [neurons, setNeurons] = useState<Array<{
    id: number;
    x: number;
    y: number;
    active: boolean;
    type: 'input' | 'hidden' | 'output';
    connections: number[];
    energy: number;
  }>>([]);

  const [gameTarget, setGameTarget] = useState<{
    pattern: number[];
    description: string;
    points: number;
  } | null>(null);

  const gameInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();

  // Ініціалізація нейронної мережі
  const initializeNeuralNetwork = useCallback(() => {
    const newNeurons = [];
    let id = 0;

    // Вхідний шар (4 нейрони)
    for (let i = 0; i < 4; i++) {
      newNeurons.push({
        id: id++,
        x: 50,
        y: 100 + i * 100,
        active: false,
        type: 'input' as const,
        connections: [4, 5, 6, 7], // Підключені до прихованого шару
        energy: 0
      });
    }

    // Прихований шар (4 нейрони)
    for (let i = 0; i < 4; i++) {
      newNeurons.push({
        id: id++,
        x: 250,
        y: 100 + i * 100,
        active: false,
        type: 'hidden' as const,
        connections: [8, 9], // Підключені до вихідного шару
        energy: 0
      });
    }

    // Вихідний шар (2 нейрони)
    for (let i = 0; i < 2; i++) {
      newNeurons.push({
        id: id++,
        x: 450,
        y: 150 + i * 100,
        active: false,
        type: 'output' as const,
        connections: [],
        energy: 0
      });
    }

    setNeurons(newNeurons);
  }, []);

  // Генерація нового завдання
  const generateTarget = useCallback(() => {
    const patterns = [
      {
        pattern: [0, 1, 0, 1],
        description: 'Активувати парні входи',
        points: 100
      },
      {
        pattern: [1, 1, 0, 0],
        description: 'Активувати верхні входи',
        points: 120
      },
      {
        pattern: [1, 0, 1, 0],
        description: 'Активувати непарні входи',
        points: 110
      },
      {
        pattern: [1, 1, 1, 1],
        description: 'Активувати всі входи',
        points: 150
      }
    ];

    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setGameTarget(randomPattern);
  }, []);

  // Обробка кліку по нейрону
  const handleNeuronClick = useCallback((neuronId: number) => {
    if (!gameActive || gamePaused) return;

    setNeurons(prev => prev.map(neuron => {
      if (neuron.id === neuronId && neuron.type === 'input') {
        return { ...neuron, active: !neuron.active, energy: 100 };
      }
      return neuron;
    }));

    // Перевірка правильності паттерну
    setTimeout(() => {
      setNeurons(current => {
        const inputNeurons = current.filter(n => n.type === 'input');
        const currentPattern = inputNeurons.map(n => n.active ? 1 : 0);

        if (gameTarget && JSON.stringify(currentPattern) === JSON.stringify(gameTarget.pattern)) {
          // Правильний паттерн!
          setGameStats(prevStats => {
            const newScore = prevStats.score + gameTarget.points * (prevStats.combo + 1);
            const newCombo = prevStats.combo + 1;
            const accuracy = Math.min(100, prevStats.accuracy + 2);

            onScoreUpdate(newScore);
            onXPGain(gameTarget.points);

            return {
              ...prevStats,
              score: newScore,
              combo: newCombo,
              accuracy
            };
          });

          generateTarget();

          // Анімація успіху
          return current.map(neuron => ({
            ...neuron,
            energy: neuron.type === 'output' ? 100 : neuron.energy
          }));
        } else {
          // Неправильний паттерн
          setGameStats(prevStats => ({
            ...prevStats,
            combo: 0,
            accuracy: Math.max(0, prevStats.accuracy - 5)
          }));
        }

        return current;
      });
    }, 500);
  }, [gameActive, gamePaused, gameTarget, onXPGain, onScoreUpdate, generateTarget]);

  // Анімація поширення сигналу
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setNeurons(prev => prev.map(neuron => ({
        ...neuron,
        energy: Math.max(0, neuron.energy - 10)
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [gameActive]);

  // Запуск гри
  const startGame = useCallback(() => {
    setGameActive(true);
    setGamePaused(false);
    setGameStats({
      score: 0,
      level: 1,
      lives: 3,
      combo: 0,
      time: 60,
      accuracy: 100
    });

    initializeNeuralNetwork();
    generateTarget();

    // Таймер гри
    timeInterval.current = setInterval(() => {
      setGameStats(prev => {
        if (prev.time <= 1) {
          setGameActive(false);
          return prev;
        }
        return { ...prev, time: prev.time - 1 };
      });
    }, 1000);
  }, [initializeNeuralNetwork, generateTarget]);

  // Зупинка гри
  const stopGame = useCallback(() => {
    setGameActive(false);
    setGamePaused(false);
    if (timeInterval.current) clearInterval(timeInterval.current);
  }, []);

  // Пауза гри
  const togglePause = useCallback(() => {
    setGamePaused(prev => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (timeInterval.current) clearInterval(timeInterval.current);
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, []);

  return (
    <>
      {/* Кнопка відкриття мінігри */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Fab
          color="secondary"
          onClick={() => setGameOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 240,
            right: 24,
            background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
            '&:hover': {
              background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
              transform: 'scale(1.1)',
            }
          }}
        >
          <GamesIcon />
        </Fab>
      </motion.div>

      {/* Діалог мінігри */}
      <Dialog
        open={gameOpen}
        onClose={() => setGameOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusColors.primary.main}`,
            borderRadius: 3,
            minHeight: '70vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <PsychologyIcon sx={{ color: nexusColors.secondary.main, fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                🧠 Нейронна Мережа
              </Typography>
            </Box>
            <IconButton onClick={() => setGameOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Статистика гри */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} md={2}>
              <Card sx={{ background: 'rgba(0,255,198,0.1)', border: '1px solid #00ffc6' }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h6" color="#00ffc6">
                    {gameStats.score}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Очки
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ background: 'rgba(255,193,7,0.1)', border: '1px solid #ffc107' }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h6" color="#ffc107">
                    {gameStats.combo}x
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Комбо
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h6" color="#4caf50">
                    {gameStats.accuracy}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Точність
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card sx={{ background: 'rgba(244,67,54,0.1)', border: '1px solid #f44336' }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h6" color="#f44336">
                    {gameStats.lives}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Життя
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'rgba(156,39,176,0.1)', border: '1px solid #9c27b0' }}>
                <CardContent sx={{ py: 1 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TimerIcon sx={{ color: '#9c27b0' }} />
                    <Typography variant="h6" color="#9c27b0">
                      {gameStats.time}s
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(gameStats.time / 60) * 100}
                    sx={{
                      mt: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(156,39,176,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#9c27b0'
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Поточне завдання */}
          {gameTarget && (
            <Card sx={{ mb: 3, background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2196f3', mb: 1 }}>
                  🎯 Завдання:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {gameTarget.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Нагорода: {gameTarget.points} очок
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Ігрове поле - Нейронна мережа */}
          <Card sx={{ mb: 3, minHeight: 400, position: 'relative', overflow: 'hidden' }}>
            <CardContent>
              <Box position="relative" width="100%" height={400}>
                {/* Рендер нейронів */}
                {neurons.map((neuron) => (
                  <motion.div
                    key={neuron.id}
                    style={{
                      position: 'absolute',
                      left: neuron.x,
                      top: neuron.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: neuron.active ? 1.2 : 1,
                      opacity: neuron.energy > 0 ? 1 : 0.7
                    }}
                  >
                    <IconButton
                      onClick={() => handleNeuronClick(neuron.id)}
                      disabled={neuron.type !== 'input' || !gameActive || gamePaused}
                      sx={{
                        width: 60,
                        height: 60,
                        background: neuron.active
                          ? `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.secondary.main})`
                          : 'rgba(255,255,255,0.1)',
                        border: `2px solid ${
                          neuron.type === 'input' ? nexusColors.primary.main :
                          neuron.type === 'hidden' ? nexusColors.secondary.main :
                          nexusColors.warning.main
                        }`,
                        boxShadow: neuron.energy > 0
                          ? `0 0 20px ${nexusColors.primary.main}`
                          : 'none',
                        '&:hover': {
                          background: neuron.type === 'input'
                            ? `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.secondary.main})`
                            : undefined
                        }
                      }}
                    >
                      <PsychologyIcon
                        sx={{
                          color: neuron.active ? 'white' : nexusColors.grey[400],
                          fontSize: 24
                        }}
                      />
                    </IconButton>
                  </motion.div>
                ))}

                {/* Лейбли шарів */}
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    left: 50,
                    top: 20,
                    color: nexusColors.primary.main,
                    fontWeight: 'bold'
                  }}
                >
                  Вхідний шар
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    left: 250,
                    top: 20,
                    color: nexusColors.secondary.main,
                    fontWeight: 'bold'
                  }}
                >
                  Прихований шар
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    left: 450,
                    top: 20,
                    color: nexusColors.warning.main,
                    fontWeight: 'bold'
                  }}
                >
                  Вихідний шар
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Кнопки управління */}
          <Box display="flex" gap={2} justifyContent="center">
            {!gameActive ? (
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={startGame}
                sx={{
                  background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #45a049, #7cb342)'
                  }
                }}
              >
                Почати Гру
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={gamePaused ? <PlayIcon /> : <PauseIcon />}
                  onClick={togglePause}
                  sx={{
                    background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #f57c00, #ffb300)'
                    }
                  }}
                >
                  {gamePaused ? 'Продовжити' : 'Пауза'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={stopGame}
                  sx={{
                    background: 'linear-gradient(45deg, #f44336, #e57373)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #d32f2f, #ef5350)'
                    }
                  }}
                >
                  Завершити
                </Button>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NeuralNetworkGame;
