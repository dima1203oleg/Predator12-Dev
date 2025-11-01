// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  SkipNext,
  SkipPrevious,
  CheckCircle,
  School,
  EmojiEvents,
  Star,
  Close,
  Lightbulb,
  Rocket,
  Psychology
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  action?: () => void;
  completed?: boolean;
  category: 'basic' | 'advanced' | 'expert';
  xp: number;
  tips?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-overview',
    title: 'Огляд Dashboard',
    description: 'Знайомтеся з головним інтерфейсом системи Nexus Core',
    target: '#main-dashboard',
    category: 'basic',
    xp: 10,
    tips: ['Використовуйте вкладки для навігації', 'Перевірте статус системи у правому куті']
  },
  {
    id: 'agents-management',
    title: 'Управління AI Агентами',
    description: 'Навчіться керувати штучними інтелектами',
    target: '#ai-agents-tab',
    category: 'basic',
    xp: 20,
    tips: ['Кожен агент має свою спеціалізацію', 'Моніторьте продуктивність агентів']
  },
  {
    id: 'models-hub',
    title: 'AI Models Hub',
    description: 'Вивчіть доступні моделі машинного навчання',
    target: '#ai-models-hub',
    category: 'advanced',
    xp: 30,
    tips: ['Різні моделі для різних завдань', 'Перевіряйте точність моделей']
  },
  {
    id: 'voice-commands',
    title: 'Голосове управління',
    description: 'Керуйте системою за допомогою голосу',
    target: '#voice-interface',
    category: 'advanced',
    xp: 40,
    tips: ['Скажіть "Hey Nexus" для активації', 'Говоріть чітко та повільно']
  },
  {
    id: 'security-center',
    title: 'Центр кібербезпеки',
    description: 'Моніторинг безпеки та загроз',
    target: '#security-dashboard',
    category: 'expert',
    xp: 50,
    tips: ['Регулярно перевіряйте звіти безпеки', 'Налаштуйте алерти']
  }
];

interface InteractiveTutorialProps {
  onComplete?: (totalXP: number) => void;
  onClose?: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onComplete,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const currentStep = tutorialSteps[activeStep];
  const progress = (completedSteps.size / tutorialSteps.length) * 100;

  useEffect(() => {
    const xp = Array.from(completedSteps).reduce((sum, stepId) => {
      const step = tutorialSteps.find(s => s.id === stepId);
      return sum + (step?.xp || 0);
    }, 0);
    setTotalXP(xp);
  }, [completedSteps]);

  const handleStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep.id]));

    // Анімація завершення кроку
    const target = document.querySelector(currentStep.target || '');
    if (target) {
      target.classList.add('tutorial-highlight');
      setTimeout(() => target.classList.remove('tutorial-highlight'), 2000);
    }

    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      // Завершення туторіалу
      onComplete?.(totalXP + currentStep.xp);
    }
  };

  const handleNext = () => {
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return '#4CAF50';
      case 'advanced': return '#FF9800';
      case 'expert': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return <School />;
      case 'advanced': return <Psychology />;
      case 'expert': return <Rocket />;
      default: return <Lightbulb />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '600px' },
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 2000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40
                }}
              >
                <School />
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  Інтерактивний Туторіал
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  Крок {activeStep + 1} з {tutorialSteps.length}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={<Star />}
                label={`${totalXP} XP`}
                sx={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA000)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                  borderRadius: 4
                }
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}
            >
              Прогрес: {Math.round(progress)}%
            </Typography>
          </Box>
        </Box>

        {/* Current Step Content */}
        <CardContent sx={{ p: 3 }}>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                sx={{
                  bgcolor: getCategoryColor(currentStep.category),
                  width: 50,
                  height: 50
                }}
              >
                {getCategoryIcon(currentStep.category)}
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  {currentStep.title}
                </Typography>
                <Chip
                  label={currentStep.category.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: getCategoryColor(currentStep.category),
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 2,
                lineHeight: 1.6
              }}
            >
              {currentStep.description}
            </Typography>

            {/* XP Reward */}
            <Box
              sx={{
                p: 2,
                background: 'rgba(255,215,0,0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(255,215,0,0.3)',
                mb: 2
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <EmojiEvents sx={{ color: '#FFD700' }} />
                <Typography sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                  Нагорода: +{currentStep.xp} XP
                </Typography>
              </Box>
            </Box>

            {/* Tips */}
            {currentStep.tips && (
              <Card
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  mb: 2
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Lightbulb sx={{ color: '#FFD700' }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'white', fontWeight: 'bold' }}
                    >
                      Корисні поради:
                    </Typography>
                  </Box>
                  {currentStep.tips.map((tip, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        mb: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#FFD700'
                        }}
                      />
                      {tip}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </CardContent>

        {/* Controls */}
        <Box
          sx={{
            p: 3,
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button
            startIcon={<SkipPrevious />}
            onClick={handlePrevious}
            disabled={activeStep === 0}
            sx={{
              color: 'white',
              '&:disabled': { color: 'rgba(255,255,255,0.3)' }
            }}
          >
            Назад
          </Button>

          <Box display="flex" gap={1}>
            {!completedSteps.has(currentStep.id) ? (
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={handleStepComplete}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                  px: 3
                }}
              >
                Завершити крок
              </Button>
            ) : (
              <Chip
                icon={<CheckCircle />}
                label="Завершено"
                sx={{
                  bgcolor: '#4CAF50',
                  color: 'white'
                }}
              />
            )}
          </Box>

          <Button
            endIcon={<SkipNext />}
            onClick={handleNext}
            disabled={activeStep === tutorialSteps.length - 1}
            sx={{
              color: 'white',
              '&:disabled': { color: 'rgba(255,255,255,0.3)' }
            }}
          >
            Далі
          </Button>
        </Box>

        {/* Completion Dialog */}
        <AnimatePresence>
          {completedSteps.size === tutorialSteps.length && (
            <Dialog
              open={true}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }
              }}
            >
              <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <EmojiEvents sx={{ fontSize: 60, color: '#FFD700', mb: 2 }} />
                </motion.div>
                <Typography variant="h4" fontWeight="bold">
                  Вітаємо!
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                  Ви завершили туторіал
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
                <Chip
                  icon={<Star />}
                  label={`Отримано ${totalXP} XP`}
                  sx={{
                    background: 'linear-gradient(45deg, #FFD700, #FFA000)',
                    color: 'white',
                    fontSize: '1.1rem',
                    px: 2,
                    py: 1
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => onComplete?.(totalXP)}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                    px: 4
                  }}
                >
                  Продовжити
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </AnimatePresence>
      </Paper>

      {/* Tutorial Highlight Overlay */}
      <style jsx global>{`
        .tutorial-highlight {
          animation: tutorialPulse 2s ease-in-out;
          position: relative;
          z-index: 1001;
        }

        @keyframes tutorialPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
            transform: scale(1.02);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default InteractiveTutorial;
