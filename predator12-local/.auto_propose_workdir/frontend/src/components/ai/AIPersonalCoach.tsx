// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface AITrainingData {
  epoch: number;
  accuracy: number;
  loss: number;
  learningRate: number;
  trainingTime: number;
}

interface AICoachProps {
  onXPGain: (xp: number) => void;
}

const AIPersonalCoach: React.FC<AICoachProps> = ({ onXPGain }) => {
  const [coachOpen, setCoachOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingData, setTrainingData] = useState<AITrainingData[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userProgress, setUserProgress] = useState({
    tasksCompleted: 0,
    skillPoints: 0,
    accuracy: 0,
    speed: 0,
    consistency: 0
  });

  // AI поради та тренінги
  const aiAdvices = [
    {
      id: 1,
      title: '🧠 Покращення Концентрації',
      description: 'Спробуйте техніку помодоро: 25 хвилин роботи, 5 хвилин відпочинку',
      difficulty: 'easy',
      xp: 50,
      completed: false
    },
    {
      id: 2,
      title: '⚡ Швидкість Мислення',
      description: 'Виконайте 10 швидких рішень за 60 секунд',
      difficulty: 'medium',
      xp: 100,
      completed: false
    },
    {
      id: 3,
      title: '🎯 Точність Дій',
      description: 'Досягніть 95% точності в нейронній мінігрі',
      difficulty: 'hard',
      xp: 200,
      completed: false
    },
    {
      id: 4,
      title: '🚀 Продуктивність',
      description: 'Використовуйте всі клавіатурні скорочення протягом 10 хвилин',
      difficulty: 'expert',
      xp: 300,
      completed: false
    }
  ];

  const [advices, setAdvices] = useState(aiAdvices);

  // Симуляція AI тренування
  const startAITraining = useCallback(() => {
    setIsTraining(true);
    setTrainingData([]);

    const trainingInterval = setInterval(() => {
      setTrainingData(prev => {
        const epoch = prev.length + 1;
        const accuracy = Math.min(0.95, 0.3 + (epoch * 0.05) + (Math.random() - 0.5) * 0.1);
        const loss = Math.max(0.05, 2.0 - (epoch * 0.15) + (Math.random() - 0.5) * 0.2);

        const newData = {
          epoch,
          accuracy,
          loss,
          learningRate: 0.001 * Math.pow(0.95, epoch),
          trainingTime: epoch * 0.5
        };

        if (epoch >= 20) {
          clearInterval(trainingInterval);
          setIsTraining(false);
          onXPGain(150);

          // Покращення користувацького прогресу
          setUserProgress(prevProgress => ({
            ...prevProgress,
            tasksCompleted: prevProgress.tasksCompleted + 1,
            skillPoints: prevProgress.skillPoints + 15,
            accuracy: Math.min(100, prevProgress.accuracy + 5),
            speed: Math.min(100, prevProgress.speed + 3),
            consistency: Math.min(100, prevProgress.consistency + 4)
          }));
        }

        return [...prev, newData];
      });
    }, 200);
  }, [onXPGain]);

  // Виконання AI поради
  const completeAdvice = useCallback((adviceId: number) => {
    setAdvices(prev => prev.map(advice => {
      if (advice.id === adviceId && !advice.completed) {
        onXPGain(advice.xp);
        setUserProgress(prevProgress => ({
          ...prevProgress,
          tasksCompleted: prevProgress.tasksCompleted + 1,
          skillPoints: prevProgress.skillPoints + Math.floor(advice.xp / 10)
        }));
        return { ...advice, completed: true };
      }
      return advice;
    }));
  }, [onXPGain]);

  // Генерація персоналізованих рекомендацій
  const generatePersonalizedRecommendation = useCallback(() => {
    const recommendations = [
      '🎯 Сфокусуйтесь на покращенні точності - ваш найслабший навик',
      '⚡ Ваша швидкість чудова! Спробуйте складніші завдання',
      '🧠 Регулярність - ключ до успіху. Тренуйтесь щодня',
      '🏆 Ви близькі до наступного рівня! Ще трохи зусиль',
      '🎮 Спробуйте новий ігровий режим для різноманітності'
    ];

    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return nexusColors.success.main;
      case 'medium': return nexusColors.warning.main;
      case 'hard': return nexusColors.error.main;
      case 'expert': return nexusColors.secondary.main;
      default: return nexusColors.grey[500];
    }
  };

  const completedAdvices = advices.filter(a => a.completed).length;
  const totalXPFromAdvices = advices.filter(a => a.completed).reduce((sum, a) => sum + a.xp, 0);

  return (
    <>
      {/* AI Coach FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Fab
          color="primary"
          onClick={() => setCoachOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 400,
            right: 24,
            background: 'linear-gradient(45deg, #673ab7, #3f51b5)',
            '&:hover': {
              background: 'linear-gradient(45deg, #512da8, #303f9f)',
              transform: 'scale(1.1)',
            }
          }}
          aria-label="Відкрити AI персонального тренера"
        >
          <AutoAwesomeIcon />
        </Fab>
      </motion.div>

      {/* AI Coach Dialog */}
      <Dialog
        open={coachOpen}
        onClose={() => setCoachOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusColors.primary.main}`,
            borderRadius: 3,
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <AutoAwesomeIcon sx={{ color: nexusColors.secondary.main, fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                🤖 AI Персональний Тренер
              </Typography>
            </Box>
            <IconButton onClick={() => setCoachOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Особистий прогрес */}
          <Card sx={{ mb: 3, background: 'rgba(103,58,183,0.1)', border: '1px solid #673ab7' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#673ab7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon /> Ваш Прогрес
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Завдань виконано: {userProgress.tasksCompleted}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(userProgress.tasksCompleted / 10) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(103,58,183,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#673ab7'
                        }
                      }}
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Точність: {userProgress.accuracy}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={userProgress.accuracy}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(76,175,80,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: nexusColors.success.main
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Швидкість: {userProgress.speed}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={userProgress.speed}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,152,0,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: nexusColors.warning.main
                        }
                      }}
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Консистентність: {userProgress.consistency}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={userProgress.consistency}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(33,150,243,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: nexusColors.info.main
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box display="flex" gap={2} mt={2}>
                <Chip
                  label={`Рівень ${currentLevel}`}
                  sx={{ background: nexusColors.secondary.main, color: 'white' }}
                />
                <Chip
                  label={`${userProgress.skillPoints} Skill Points`}
                  sx={{ background: nexusColors.warning.main, color: 'white' }}
                />
                <Chip
                  label={`${totalXPFromAdvices} XP від порад`}
                  sx={{ background: nexusColors.success.main, color: 'white' }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* AI Тренування */}
          <Card sx={{ mb: 3, background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#2196f3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon /> AI Тренування
              </Typography>

              <Box display="flex" gap={2} mb={2}>
                <Button
                  variant="contained"
                  startIcon={isTraining ? <PauseIcon /> : <PlayIcon />}
                  onClick={startAITraining}
                  disabled={isTraining}
                  sx={{
                    background: 'linear-gradient(45deg, #2196f3, #03dac6)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976d2, #0097a7)'
                    }
                  }}
                >
                  {isTraining ? 'Тренування...' : 'Почати AI Тренування'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => setTrainingData([])}
                  sx={{ borderColor: '#2196f3', color: '#2196f3' }}
                >
                  Очистити
                </Button>
              </Box>

              {trainingData.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Епоха: {trainingData[trainingData.length - 1]?.epoch || 0}/20
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Точність: {((trainingData[trainingData.length - 1]?.accuracy || 0) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Втрати: {(trainingData[trainingData.length - 1]?.loss || 0).toFixed(4)}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={(trainingData.length / 20) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(33,150,243,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#2196f3'
                      }
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Персоналізовані поради */}
          <Card sx={{ mb: 3, background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#4caf50', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon /> Персоналізовані Поради
              </Typography>

              <List>
                {advices.map((advice, index) => (
                  <React.Fragment key={advice.id}>
                    <ListItem
                      sx={{
                        background: advice.completed ? 'rgba(76,175,80,0.1)' : 'transparent',
                        borderRadius: 2,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            background: getDifficultyColor(advice.difficulty),
                            width: 40,
                            height: 40
                          }}
                        >
                          {advice.completed ? '✓' : index + 1}
                        </Avatar>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                color: advice.completed ? nexusColors.success.main : 'white',
                                textDecoration: advice.completed ? 'line-through' : 'none'
                              }}
                            >
                              {advice.title}
                            </Typography>
                            <Chip
                              label={`+${advice.xp} XP`}
                              size="small"
                              sx={{
                                background: getDifficultyColor(advice.difficulty),
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {advice.description}
                          </Typography>
                        }
                      />

                      {!advice.completed && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => completeAdvice(advice.id)}
                          sx={{
                            background: getDifficultyColor(advice.difficulty),
                            '&:hover': {
                              background: getDifficultyColor(advice.difficulty),
                              opacity: 0.8
                            }
                          }}
                        >
                          Виконати
                        </Button>
                      )}
                    </ListItem>
                    {index < advices.length - 1 && <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />}
                  </React.Fragment>
                ))}
              </List>

              <Box mt={2}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Виконано: {completedAdvices}/{advices.length} порад
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* AI Рекомендація */}
          <Card sx={{ background: 'rgba(156,39,176,0.1)', border: '1px solid #9c27b0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2 }}>
                💡 AI Рекомендація Дня
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                {generatePersonalizedRecommendation()}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  '&:hover': {
                    borderColor: '#7b1fa2',
                    backgroundColor: 'rgba(156,39,176,0.1)'
                  }
                }}
              >
                Нова Рекомендація
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIPersonalCoach;
