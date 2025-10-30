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
const AIPersonalCoach = ({ onXPGain }) => {
    var _a, _b, _c;
    const [coachOpen, setCoachOpen] = (0, react_1.useState)(false);
    const [isTraining, setIsTraining] = (0, react_1.useState)(false);
    const [trainingData, setTrainingData] = (0, react_1.useState)([]);
    const [currentLevel, setCurrentLevel] = (0, react_1.useState)(1);
    const [userProgress, setUserProgress] = (0, react_1.useState)({
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
    const [advices, setAdvices] = (0, react_1.useState)(aiAdvices);
    // Симуляція AI тренування
    const startAITraining = (0, react_1.useCallback)(() => {
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
                    setUserProgress(prevProgress => (Object.assign(Object.assign({}, prevProgress), { tasksCompleted: prevProgress.tasksCompleted + 1, skillPoints: prevProgress.skillPoints + 15, accuracy: Math.min(100, prevProgress.accuracy + 5), speed: Math.min(100, prevProgress.speed + 3), consistency: Math.min(100, prevProgress.consistency + 4) })));
                }
                return [...prev, newData];
            });
        }, 200);
    }, [onXPGain]);
    // Виконання AI поради
    const completeAdvice = (0, react_1.useCallback)((adviceId) => {
        setAdvices(prev => prev.map(advice => {
            if (advice.id === adviceId && !advice.completed) {
                onXPGain(advice.xp);
                setUserProgress(prevProgress => (Object.assign(Object.assign({}, prevProgress), { tasksCompleted: prevProgress.tasksCompleted + 1, skillPoints: prevProgress.skillPoints + Math.floor(advice.xp / 10) })));
                return Object.assign(Object.assign({}, advice), { completed: true });
            }
            return advice;
        }));
    }, [onXPGain]);
    // Генерація персоналізованих рекомендацій
    const generatePersonalizedRecommendation = (0, react_1.useCallback)(() => {
        const recommendations = [
            '🎯 Сфокусуйтесь на покращенні точності - ваш найслабший навик',
            '⚡ Ваша швидкість чудова! Спробуйте складніші завдання',
            '🧠 Регулярність - ключ до успіху. Тренуйтесь щодня',
            '🏆 Ви близькі до наступного рівня! Ще трохи зусиль',
            '🎮 Спробуйте новий ігровий режим для різноманітності'
        ];
        return recommendations[Math.floor(Math.random() * recommendations.length)];
    }, []);
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return nexusTheme_1.nexusColors.success.main;
            case 'medium': return nexusTheme_1.nexusColors.warning.main;
            case 'hard': return nexusTheme_1.nexusColors.error.main;
            case 'expert': return nexusTheme_1.nexusColors.secondary.main;
            default: return nexusTheme_1.nexusColors.grey[500];
        }
    };
    const completedAdvices = advices.filter(a => a.completed).length;
    const totalXPFromAdvices = advices.filter(a => a.completed).reduce((sum, a) => sum + a.xp, 0);
    return (<>
      {/* AI Coach FAB */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <material_1.Fab color="primary" onClick={() => setCoachOpen(true)} sx={{
            position: 'fixed',
            bottom: 400,
            right: 24,
            background: 'linear-gradient(45deg, #673ab7, #3f51b5)',
            '&:hover': {
                background: 'linear-gradient(45deg, #512da8, #303f9f)',
                transform: 'scale(1.1)',
            }
        }} aria-label="Відкрити AI персонального тренера">
          <icons_material_1.AutoAwesome />
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* AI Coach Dialog */}
      <material_1.Dialog open={coachOpen} onClose={() => setCoachOpen(false)} maxWidth="lg" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                borderRadius: 3,
                minHeight: '80vh'
            }
        }}>
        <material_1.DialogTitle>
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
            <material_1.Box display="flex" alignItems="center" gap={2}>
              <icons_material_1.AutoAwesome sx={{ color: nexusTheme_1.nexusColors.secondary.main, fontSize: 32 }}/>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                🤖 AI Персональний Тренер
              </material_1.Typography>
            </material_1.Box>
            <material_1.IconButton onClick={() => setCoachOpen(false)} sx={{ color: 'white' }}>
              <icons_material_1.Close />
            </material_1.IconButton>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent>
          {/* Особистий прогрес */}
          <material_1.Card sx={{ mb: 3, background: 'rgba(103,58,183,0.1)', border: '1px solid #673ab7' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" sx={{ color: '#673ab7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <icons_material_1.EmojiEvents /> Ваш Прогрес
              </material_1.Typography>

              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Box mb={2}>
                    <material_1.Typography variant="body2" sx={{ mb: 1 }}>
                      Завдань виконано: {userProgress.tasksCompleted}
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={(userProgress.tasksCompleted / 10) * 100} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(103,58,183,0.3)',
            '& .MuiLinearProgress-bar': {
                backgroundColor: '#673ab7'
            }
        }}/>
                  </material_1.Box>

                  <material_1.Box mb={2}>
                    <material_1.Typography variant="body2" sx={{ mb: 1 }}>
                      Точність: {userProgress.accuracy}%
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={userProgress.accuracy} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(76,175,80,0.3)',
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.success.main
            }
        }}/>
                  </material_1.Box>
                </material_1.Grid>

                <material_1.Grid item xs={12} md={6}>
                  <material_1.Box mb={2}>
                    <material_1.Typography variant="body2" sx={{ mb: 1 }}>
                      Швидкість: {userProgress.speed}%
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={userProgress.speed} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,152,0,0.3)',
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.warning.main
            }
        }}/>
                  </material_1.Box>

                  <material_1.Box mb={2}>
                    <material_1.Typography variant="body2" sx={{ mb: 1 }}>
                      Консистентність: {userProgress.consistency}%
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={userProgress.consistency} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(33,150,243,0.3)',
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.info.main
            }
        }}/>
                  </material_1.Box>
                </material_1.Grid>
              </material_1.Grid>

              <material_1.Box display="flex" gap={2} mt={2}>
                <material_1.Chip label={`Рівень ${currentLevel}`} sx={{ background: nexusTheme_1.nexusColors.secondary.main, color: 'white' }}/>
                <material_1.Chip label={`${userProgress.skillPoints} Skill Points`} sx={{ background: nexusTheme_1.nexusColors.warning.main, color: 'white' }}/>
                <material_1.Chip label={`${totalXPFromAdvices} XP від порад`} sx={{ background: nexusTheme_1.nexusColors.success.main, color: 'white' }}/>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>

          {/* AI Тренування */}
          <material_1.Card sx={{ mb: 3, background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" sx={{ color: '#2196f3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <icons_material_1.Psychology /> AI Тренування
              </material_1.Typography>

              <material_1.Box display="flex" gap={2} mb={2}>
                <material_1.Button variant="contained" startIcon={isTraining ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />} onClick={startAITraining} disabled={isTraining} sx={{
            background: 'linear-gradient(45deg, #2196f3, #03dac6)',
            '&:hover': {
                background: 'linear-gradient(45deg, #1976d2, #0097a7)'
            }
        }}>
                  {isTraining ? 'Тренування...' : 'Почати AI Тренування'}
                </material_1.Button>

                <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={() => setTrainingData([])} sx={{ borderColor: '#2196f3', color: '#2196f3' }}>
                  Очистити
                </material_1.Button>
              </material_1.Box>

              {trainingData.length > 0 && (<material_1.Box>
                  <material_1.Typography variant="body2" sx={{ mb: 1 }}>
                    Епоха: {((_a = trainingData[trainingData.length - 1]) === null || _a === void 0 ? void 0 : _a.epoch) || 0}/20
                  </material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ mb: 1 }}>
                    Точність: {((((_b = trainingData[trainingData.length - 1]) === null || _b === void 0 ? void 0 : _b.accuracy) || 0) * 100).toFixed(1)}%
                  </material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ mb: 2 }}>
                    Втрати: {(((_c = trainingData[trainingData.length - 1]) === null || _c === void 0 ? void 0 : _c.loss) || 0).toFixed(4)}
                  </material_1.Typography>

                  <material_1.LinearProgress variant="determinate" value={(trainingData.length / 20) * 100} sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(33,150,243,0.3)',
                '& .MuiLinearProgress-bar': {
                    backgroundColor: '#2196f3'
                }
            }}/>
                </material_1.Box>)}
            </material_1.CardContent>
          </material_1.Card>

          {/* Персоналізовані поради */}
          <material_1.Card sx={{ mb: 3, background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" sx={{ color: '#4caf50', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <icons_material_1.Star /> Персоналізовані Поради
              </material_1.Typography>

              <material_1.List>
                {advices.map((advice, index) => (<react_1.default.Fragment key={advice.id}>
                    <material_1.ListItem sx={{
                background: advice.completed ? 'rgba(76,175,80,0.1)' : 'transparent',
                borderRadius: 2,
                mb: 1
            }}>
                      <material_1.ListItemIcon>
                        <material_1.Avatar sx={{
                background: getDifficultyColor(advice.difficulty),
                width: 40,
                height: 40
            }}>
                          {advice.completed ? '✓' : index + 1}
                        </material_1.Avatar>
                      </material_1.ListItemIcon>

                      <material_1.ListItemText primary={<material_1.Box display="flex" alignItems="center" gap={2}>
                            <material_1.Typography variant="subtitle1" sx={{
                    color: advice.completed ? nexusTheme_1.nexusColors.success.main : 'white',
                    textDecoration: advice.completed ? 'line-through' : 'none'
                }}>
                              {advice.title}
                            </material_1.Typography>
                            <material_1.Chip label={`+${advice.xp} XP`} size="small" sx={{
                    background: getDifficultyColor(advice.difficulty),
                    color: 'white',
                    fontSize: '0.7rem'
                }}/>
                          </material_1.Box>} secondary={<material_1.Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {advice.description}
                          </material_1.Typography>}/>

                      {!advice.completed && (<material_1.Button variant="contained" size="small" onClick={() => completeAdvice(advice.id)} sx={{
                    background: getDifficultyColor(advice.difficulty),
                    '&:hover': {
                        background: getDifficultyColor(advice.difficulty),
                        opacity: 0.8
                    }
                }}>
                          Виконати
                        </material_1.Button>)}
                    </material_1.ListItem>
                    {index < advices.length - 1 && <material_1.Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}/>}
                  </react_1.default.Fragment>))}
              </material_1.List>

              <material_1.Box mt={2}>
                <material_1.Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Виконано: {completedAdvices}/{advices.length} порад
                </material_1.Typography>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>

          {/* AI Рекомендація */}
          <material_1.Card sx={{ background: 'rgba(156,39,176,0.1)', border: '1px solid #9c27b0' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" sx={{ color: '#9c27b0', mb: 2 }}>
                💡 AI Рекомендація Дня
              </material_1.Typography>
              <material_1.Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                {generatePersonalizedRecommendation()}
              </material_1.Typography>
              <material_1.Button variant="outlined" onClick={() => window.location.reload()} sx={{
            borderColor: '#9c27b0',
            color: '#9c27b0',
            '&:hover': {
                borderColor: '#7b1fa2',
                backgroundColor: 'rgba(156,39,176,0.1)'
            }
        }}>
                Нова Рекомендація
              </material_1.Button>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.DialogContent>
      </material_1.Dialog>
    </>);
};
exports.default = AIPersonalCoach;
