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
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const ACHIEVEMENT_DATA = [
    {
        id: 'first-login',
        title: '🎮 Перший Вхід',
        description: 'Вітаємо в Nexus Core V3!',
        icon: icons_material_1.Rocket,
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
        icon: icons_material_1.Psychology,
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
        icon: icons_material_1.Security,
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
        icon: icons_material_1.Science,
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
        icon: icons_material_1.Speed,
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
        icon: icons_material_1.AutoAwesome,
        progress: 5,
        maxProgress: 8,
        unlocked: false,
        rarity: 'rare',
        reward: { xp: 400, badge: 'Explorer' }
    }
];
const AchievementSystem = ({ userXP, onXPGain }) => {
    const [achievements, setAchievements] = (0, react_1.useState)(ACHIEVEMENT_DATA);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [newUnlock, setNewUnlock] = (0, react_1.useState)(null);
    const [showNotification, setShowNotification] = (0, react_1.useState)(false);
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common': return nexusTheme_1.nexusColors.secondary.main;
            case 'rare': return nexusTheme_1.nexusColors.primary.main;
            case 'epic': return nexusTheme_1.nexusColors.warning.main;
            case 'legendary': return nexusTheme_1.nexusColors.error.main;
            default: return nexusTheme_1.nexusColors.grey[500];
        }
    };
    const getRarityGradient = (rarity) => {
        switch (rarity) {
            case 'common': return 'linear-gradient(45deg, #4caf50, #8bc34a)';
            case 'rare': return 'linear-gradient(45deg, #2196f3, #03dac6)';
            case 'epic': return 'linear-gradient(45deg, #ff9800, #ffc107)';
            case 'legendary': return 'linear-gradient(45deg, #9c27b0, #e91e63)';
            default: return 'linear-gradient(45deg, #607d8b, #90a4ae)';
        }
    };
    // Симуляція прогресу досягнень
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            setAchievements(prev => prev.map(achievement => {
                if (!achievement.unlocked && achievement.progress < achievement.maxProgress) {
                    const newProgress = Math.min(achievement.progress + Math.random() * 2, achievement.maxProgress);
                    if (newProgress >= achievement.maxProgress && !achievement.unlocked) {
                        // Розблокування досягнення
                        setTimeout(() => {
                            setNewUnlock(achievement);
                            setShowNotification(true);
                            onXPGain(achievement.reward.xp);
                            // Автоматично приховати нотифікацію через 5 секунд
                            setTimeout(() => setShowNotification(false), 5000);
                        }, 500);
                        return Object.assign(Object.assign({}, achievement), { progress: newProgress, unlocked: true, unlockDate: new Date() });
                    }
                    return Object.assign(Object.assign({}, achievement), { progress: newProgress });
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
    return (<>
      {/* Кнопка відкриття досягнень */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <material_1.Fab color="primary" onClick={() => setDialogOpen(true)} sx={{
            position: 'fixed',
            bottom: 160,
            right: 24,
            background: getRarityGradient('epic'),
            '&:hover': {
                background: getRarityGradient('legendary'),
                transform: 'scale(1.1)',
            }
        }}>
          <material_1.Badge badgeContent={unlockedCount} color="secondary">
            <icons_material_1.EmojiEvents />
          </material_1.Badge>
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* Нотифікація про нове досягнення */}
      <framer_motion_1.AnimatePresence>
        {showNotification && newUnlock && (<framer_motion_1.motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 2000
            }}>
            <material_1.Card sx={{
                background: getRarityGradient(newUnlock.rarity),
                border: `2px solid ${getRarityColor(newUnlock.rarity)}`,
                boxShadow: `0 0 20px ${getRarityColor(newUnlock.rarity)}`,
                minWidth: 300
            }}>
              <material_1.CardContent>
                <material_1.Box display="flex" alignItems="center" gap={2}>
                  <material_1.Avatar sx={{
                background: getRarityGradient(newUnlock.rarity),
                width: 56,
                height: 56
            }}>
                    <newUnlock.icon sx={{ fontSize: 32 }}/>
                  </material_1.Avatar>
                  <material_1.Box flex={1}>
                    <material_1.Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      🎉 Досягнення Розблоковано!
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {newUnlock.title}
                    </material_1.Typography>
                    <material_1.Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      +{newUnlock.reward.xp} XP
                    </material_1.Typography>
                  </material_1.Box>
                  <material_1.IconButton size="small" onClick={() => setShowNotification(false)} sx={{ color: 'white' }}>
                    <icons_material_1.Close />
                  </material_1.IconButton>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Діалог досягнень */}
      <material_1.Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                borderRadius: 3
            }
        }}>
        <material_1.DialogTitle>
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
            <material_1.Box display="flex" alignItems="center" gap={2}>
              <icons_material_1.EmojiEvents sx={{ color: nexusTheme_1.nexusColors.warning.main, fontSize: 32 }}/>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                🏆 Досягнення
              </material_1.Typography>
            </material_1.Box>
            <material_1.Box textAlign="right">
              <material_1.Typography variant="body2" color="textSecondary">
                Розблоковано: {unlockedCount}/{achievements.length}
              </material_1.Typography>
              <material_1.Typography variant="body2" color="textSecondary">
                Загальний XP: {totalXPFromAchievements}
              </material_1.Typography>
            </material_1.Box>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent>
          <material_1.Grid container spacing={3}>
            {achievements.map((achievement) => {
            var _a;
            return (<material_1.Grid item xs={12} md={6} key={achievement.id}>
                <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <material_1.Card sx={{
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
                }}>
                    <material_1.CardContent>
                      <material_1.Box display="flex" alignItems="center" gap={2} mb={2}>
                        <material_1.Avatar sx={{
                    background: achievement.unlocked
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(255,255,255,0.1)',
                    width: 48,
                    height: 48
                }}>
                          <achievement.icon sx={{ fontSize: 24 }}/>
                        </material_1.Avatar>
                        <material_1.Box flex={1}>
                          <material_1.Typography variant="h6" sx={{
                    color: achievement.unlocked ? 'white' : nexusTheme_1.nexusColors.grey[400],
                    fontWeight: 'bold'
                }}>
                            {achievement.title}
                          </material_1.Typography>
                          <material_1.Chip label={achievement.rarity.toUpperCase()} size="small" sx={{
                    background: getRarityColor(achievement.rarity),
                    color: 'white',
                    fontSize: '0.7rem'
                }}/>
                        </material_1.Box>
                        {achievement.unlocked && (<material_1.Tooltip title={`Розблоковано: ${(_a = achievement.unlockDate) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()}`}>
                            <icons_material_1.Star sx={{ color: nexusTheme_1.nexusColors.warning.main }}/>
                          </material_1.Tooltip>)}
                      </material_1.Box>

                      <material_1.Typography variant="body2" sx={{
                    color: achievement.unlocked ? 'rgba(255,255,255,0.9)' : nexusTheme_1.nexusColors.grey[500],
                    mb: 2
                }}>
                        {achievement.description}
                      </material_1.Typography>

                      <material_1.Box mb={2}>
                        <material_1.Box display="flex" justifyContent="space-between" mb={1}>
                          <material_1.Typography variant="caption" color="textSecondary">
                            Прогрес
                          </material_1.Typography>
                          <material_1.Typography variant="caption" color="textSecondary">
                            {Math.round(achievement.progress)}/{achievement.maxProgress}
                          </material_1.Typography>
                        </material_1.Box>
                        <material_1.LinearProgress variant="determinate" value={(achievement.progress / achievement.maxProgress) * 100} sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                        background: getRarityGradient(achievement.rarity),
                        borderRadius: 3
                    }
                }}/>
                      </material_1.Box>

                      <material_1.Box display="flex" justifyContent="space-between" alignItems="center">
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.warning.main }}>
                          🏅 +{achievement.reward.xp} XP
                        </material_1.Typography>
                        {achievement.reward.badge && (<material_1.Chip label={achievement.reward.badge} size="small" variant="outlined" sx={{ borderColor: nexusTheme_1.nexusColors.primary.main }}/>)}
                      </material_1.Box>
                    </material_1.CardContent>
                  </material_1.Card>
                </framer_motion_1.motion.div>
              </material_1.Grid>);
        })}
          </material_1.Grid>
        </material_1.DialogContent>
      </material_1.Dialog>
    </>);
};
exports.default = AchievementSystem;
