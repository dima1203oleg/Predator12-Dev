// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Tooltip,
  Fab
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Bolt as BoltIcon,
  Speed as SpeedIcon,
  Rocket as RocketIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    xp: number;
    badge?: string;
    feature?: string;
  };
  unlockDate?: Date;
}

const ACHIEVEMENT_DATA: Achievement[] = [
  {
    id: 'first-login',
    title: '🎮 Перший Вхід',
    description: 'Вітаємо в Nexus Core V3!',
    icon: RocketIcon,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    rarity: 'common',
    reward: { xp: 100, badge: 'Newcomer' },
    unlockDate: new Date()
  },
  {
    id: 'agent-master',
    title: '🤖 Майстер Агентів',
    description: 'Керування 10+ AI агентами',
    icon: PsychologyIcon,
    progress: 7,
    maxProgress: 10,
    unlocked: false,
    rarity: 'rare',
    reward: { xp: 500, badge: 'AI Master', feature: 'Advanced Agent Controls' }
  },
  {
    id: 'system-guardian',
    title: '🛡️ Охоронець Системи',
    description: 'Моніторинг системи 24 години',
    icon: SecurityIcon,
    progress: 18,
    maxProgress: 24,
    unlocked: false,
    rarity: 'epic',
    reward: { xp: 750, badge: 'Guardian', feature: 'Real-time Alerts' }
  },
  {
    id: 'data-scientist',
    title: '🔬 Дослідник Даних',
    description: 'Аналіз 1000+ метрик',
    icon: ScienceIcon,
    progress: 842,
    maxProgress: 1000,
    unlocked: false,
    rarity: 'legendary',
    reward: { xp: 1500, badge: 'Data Scientist', feature: 'Advanced Analytics' }
  },
  {
    id: 'speed-demon',
    title: '⚡ Швидкісний Демон',
    description: 'Виконання 100 дій за хвилину',
    icon: SpeedIcon,
    progress: 73,
    maxProgress: 100,
    unlocked: false,
    rarity: 'epic',
    reward: { xp: 800, badge: 'Speed Master' }
  },
  {
    id: 'explorer',
    title: '🗺️ Дослідник',
    description: 'Відвідування всіх модулів',
    icon: AutoAwesomeIcon,
    progress: 5,
    maxProgress: 8,
    unlocked: false,
    rarity: 'rare',
    reward: { xp: 400, badge: 'Explorer' }
  }
];

interface AchievementSystemProps {
  userXP: number;
  onXPGain: (xp: number) => void;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ userXP, onXPGain }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENT_DATA);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return nexusColors.secondary.main;
      case 'rare': return nexusColors.primary.main;
      case 'epic': return nexusColors.warning.main;
      case 'legendary': return nexusColors.error.main;
      default: return nexusColors.grey[500];
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'linear-gradient(45deg, #4caf50, #8bc34a)';
      case 'rare': return 'linear-gradient(45deg, #2196f3, #03dac6)';
      case 'epic': return 'linear-gradient(45deg, #ff9800, #ffc107)';
      case 'legendary': return 'linear-gradient(45deg, #9c27b0, #e91e63)';
      default: return 'linear-gradient(45deg, #607d8b, #90a4ae)';
    }
  };

  // Симуляція прогресу досягнень
  useEffect(() => {
    const interval = setInterval(() => {
      setAchievements(prev => prev.map(achievement => {
        if (!achievement.unlocked && achievement.progress < achievement.maxProgress) {
          const newProgress = Math.min(
            achievement.progress + Math.random() * 2,
            achievement.maxProgress
          );

          if (newProgress >= achievement.maxProgress && !achievement.unlocked) {
            // Розблокування досягнення
            setTimeout(() => {
              setNewUnlock(achievement);
              setShowNotification(true);
              onXPGain(achievement.reward.xp);

              // Автоматично приховати нотифікацію через 5 секунд
              setTimeout(() => setShowNotification(false), 5000);
            }, 500);

            return {
              ...achievement,
              progress: newProgress,
              unlocked: true,
              unlockDate: new Date()
            };
          }

          return { ...achievement, progress: newProgress };
        }
        return achievement;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [onXPGain]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXPFromAchievements = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.reward.xp, 0);

  return (
    <>
      {/* Кнопка відкриття досягнень */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Fab
          color="primary"
          onClick={() => setDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 160,
            right: 24,
            background: getRarityGradient('epic'),
            '&:hover': {
              background: getRarityGradient('legendary'),
              transform: 'scale(1.1)',
            }
          }}
        >
          <Badge badgeContent={unlockedCount} color="secondary">
            <TrophyIcon />
          </Badge>
        </Fab>
      </motion.div>

      {/* Нотифікація про нове досягнення */}
      <AnimatePresence>
        {showNotification && newUnlock && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 2000
            }}
          >
            <Card
              sx={{
                background: getRarityGradient(newUnlock.rarity),
                border: `2px solid ${getRarityColor(newUnlock.rarity)}`,
                boxShadow: `0 0 20px ${getRarityColor(newUnlock.rarity)}`,
                minWidth: 300
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      background: getRarityGradient(newUnlock.rarity),
                      width: 56,
                      height: 56
                    }}
                  >
                    <newUnlock.icon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      🎉 Досягнення Розблоковано!
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {newUnlock.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      +{newUnlock.reward.xp} XP
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setShowNotification(false)}
                    sx={{ color: 'white' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Діалог досягнень */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusColors.primary.main}`,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <TrophyIcon sx={{ color: nexusColors.warning.main, fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                🏆 Досягнення
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="body2" color="textSecondary">
                Розблоковано: {unlockedCount}/{achievements.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Загальний XP: {totalXPFromAchievements}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {achievements.map((achievement) => (
              <Grid item xs={12} md={6} key={achievement.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    sx={{
                      background: achievement.unlocked
                        ? getRarityGradient(achievement.rarity)
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${getRarityColor(achievement.rarity)}`,
                      opacity: achievement.unlocked ? 1 : 0.7,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 0 15px ${getRarityColor(achievement.rarity)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                          sx={{
                            background: achievement.unlocked
                              ? 'rgba(255,255,255,0.2)'
                              : 'rgba(255,255,255,0.1)',
                            width: 48,
                            height: 48
                          }}
                        >
                          <achievement.icon sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box flex={1}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: achievement.unlocked ? 'white' : nexusColors.grey[400],
                              fontWeight: 'bold'
                            }}
                          >
                            {achievement.title}
                          </Typography>
                          <Chip
                            label={achievement.rarity.toUpperCase()}
                            size="small"
                            sx={{
                              background: getRarityColor(achievement.rarity),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        {achievement.unlocked && (
                          <Tooltip title={`Розблоковано: ${achievement.unlockDate?.toLocaleDateString()}`}>
                            <StarIcon sx={{ color: nexusColors.warning.main }} />
                          </Tooltip>
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: achievement.unlocked ? 'rgba(255,255,255,0.9)' : nexusColors.grey[500],
                          mb: 2
                        }}
                      >
                        {achievement.description}
                      </Typography>

                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="textSecondary">
                            Прогрес
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {Math.round(achievement.progress)}/{achievement.maxProgress}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: getRarityGradient(achievement.rarity),
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ color: nexusColors.warning.main }}>
                          🏅 +{achievement.reward.xp} XP
                        </Typography>
                        {achievement.reward.badge && (
                          <Chip
                            label={achievement.reward.badge}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: nexusColors.primary.main }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AchievementSystem;
