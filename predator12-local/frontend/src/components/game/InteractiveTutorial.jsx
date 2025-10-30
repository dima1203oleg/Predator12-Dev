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
exports.InteractiveTutorial = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const tutorialSteps = [
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
const InteractiveTutorial = ({ onComplete, onClose }) => {
    const [activeStep, setActiveStep] = (0, react_1.useState)(0);
    const [completedSteps, setCompletedSteps] = (0, react_1.useState)(new Set());
    const [isPlaying, setIsPlaying] = (0, react_1.useState)(false);
    const [totalXP, setTotalXP] = (0, react_1.useState)(0);
    const [showTips, setShowTips] = (0, react_1.useState)(false);
    const [currentTip, setCurrentTip] = (0, react_1.useState)(0);
    const currentStep = tutorialSteps[activeStep];
    const progress = (completedSteps.size / tutorialSteps.length) * 100;
    (0, react_1.useEffect)(() => {
        const xp = Array.from(completedSteps).reduce((sum, stepId) => {
            const step = tutorialSteps.find(s => s.id === stepId);
            return sum + ((step === null || step === void 0 ? void 0 : step.xp) || 0);
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
        }
        else {
            // Завершення туторіалу
            onComplete === null || onComplete === void 0 ? void 0 : onComplete(totalXP + currentStep.xp);
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
    const getCategoryColor = (category) => {
        switch (category) {
            case 'basic': return '#4CAF50';
            case 'advanced': return '#FF9800';
            case 'expert': return '#F44336';
            default: return '#2196F3';
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'basic': return <icons_material_1.School />;
            case 'advanced': return <icons_material_1.Psychology />;
            case 'expert': return <icons_material_1.Rocket />;
            default: return <icons_material_1.Lightbulb />;
        }
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
      <material_1.Paper elevation={24} sx={{
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
        }}>
        {/* Header */}
        <material_1.Box sx={{
            p: 3,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <material_1.Box display="flex" justifyContent="space-between" alignItems="center">
            <material_1.Box display="flex" alignItems="center" gap={2}>
              <material_1.Avatar sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40
        }}>
                <icons_material_1.School />
              </material_1.Avatar>
              <material_1.Box>
                <material_1.Typography variant="h5" sx={{
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
                  Інтерактивний Туторіал
                </material_1.Typography>
                <material_1.Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Крок {activeStep + 1} з {tutorialSteps.length}
                </material_1.Typography>
              </material_1.Box>
            </material_1.Box>
            <material_1.Box display="flex" alignItems="center" gap={1}>
              <material_1.Chip icon={<icons_material_1.Star />} label={`${totalXP} XP`} sx={{
            background: 'linear-gradient(45deg, #FFD700, #FFA000)',
            color: 'white',
            fontWeight: 'bold'
        }}/>
              <material_1.IconButton onClick={onClose} sx={{ color: 'white' }}>
                <icons_material_1.Close />
              </material_1.IconButton>
            </material_1.Box>
          </material_1.Box>

          {/* Progress Bar */}
          <material_1.Box mt={2}>
            <material_1.LinearProgress variant="determinate" value={progress} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                borderRadius: 4
            }
        }}/>
            <material_1.Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
              Прогрес: {Math.round(progress)}%
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>

        {/* Current Step Content */}
        <material_1.CardContent sx={{ p: 3 }}>
          <framer_motion_1.motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <material_1.Box display="flex" alignItems="center" gap={2} mb={2}>
              <material_1.Avatar sx={{
            bgcolor: getCategoryColor(currentStep.category),
            width: 50,
            height: 50
        }}>
                {getCategoryIcon(currentStep.category)}
              </material_1.Avatar>
              <material_1.Box>
                <material_1.Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {currentStep.title}
                </material_1.Typography>
                <material_1.Chip label={currentStep.category.toUpperCase()} size="small" sx={{
            bgcolor: getCategoryColor(currentStep.category),
            color: 'white',
            fontSize: '0.7rem'
        }}/>
              </material_1.Box>
            </material_1.Box>

            <material_1.Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.9)',
            mb: 2,
            lineHeight: 1.6
        }}>
              {currentStep.description}
            </material_1.Typography>

            {/* XP Reward */}
            <material_1.Box sx={{
            p: 2,
            background: 'rgba(255,215,0,0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(255,215,0,0.3)',
            mb: 2
        }}>
              <material_1.Box display="flex" alignItems="center" gap={1}>
                <icons_material_1.EmojiEvents sx={{ color: '#FFD700' }}/>
                <material_1.Typography sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                  Нагорода: +{currentStep.xp} XP
                </material_1.Typography>
              </material_1.Box>
            </material_1.Box>

            {/* Tips */}
            {currentStep.tips && (<material_1.Card sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                mb: 2
            }}>
                <material_1.CardContent sx={{ p: 2 }}>
                  <material_1.Box display="flex" alignItems="center" gap={1} mb={1}>
                    <icons_material_1.Lightbulb sx={{ color: '#FFD700' }}/>
                    <material_1.Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Корисні поради:
                    </material_1.Typography>
                  </material_1.Box>
                  {currentStep.tips.map((tip, index) => (<material_1.Typography key={index} variant="body2" sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                      <material_1.Box sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#FFD700'
                }}/>
                      {tip}
                    </material_1.Typography>))}
                </material_1.CardContent>
              </material_1.Card>)}
          </framer_motion_1.motion.div>
        </material_1.CardContent>

        {/* Controls */}
        <material_1.Box sx={{
            p: 3,
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
          <material_1.Button startIcon={<icons_material_1.SkipPrevious />} onClick={handlePrevious} disabled={activeStep === 0} sx={{
            color: 'white',
            '&:disabled': { color: 'rgba(255,255,255,0.3)' }
        }}>
            Назад
          </material_1.Button>

          <material_1.Box display="flex" gap={1}>
            {!completedSteps.has(currentStep.id) ? (<material_1.Button variant="contained" startIcon={<icons_material_1.CheckCircle />} onClick={handleStepComplete} sx={{
                background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                px: 3
            }}>
                Завершити крок
              </material_1.Button>) : (<material_1.Chip icon={<icons_material_1.CheckCircle />} label="Завершено" sx={{
                bgcolor: '#4CAF50',
                color: 'white'
            }}/>)}
          </material_1.Box>

          <material_1.Button endIcon={<icons_material_1.SkipNext />} onClick={handleNext} disabled={activeStep === tutorialSteps.length - 1} sx={{
            color: 'white',
            '&:disabled': { color: 'rgba(255,255,255,0.3)' }
        }}>
            Далі
          </material_1.Button>
        </material_1.Box>

        {/* Completion Dialog */}
        <framer_motion_1.AnimatePresence>
          {completedSteps.size === tutorialSteps.length && (<material_1.Dialog open={true} maxWidth="sm" fullWidth PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }
            }}>
              <material_1.DialogTitle sx={{ textAlign: 'center', py: 3 }}>
                <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <icons_material_1.EmojiEvents sx={{ fontSize: 60, color: '#FFD700', mb: 2 }}/>
                </framer_motion_1.motion.div>
                <material_1.Typography variant="h4" fontWeight="bold">
                  Вітаємо!
                </material_1.Typography>
                <material_1.Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                  Ви завершили туторіал
                </material_1.Typography>
              </material_1.DialogTitle>
              <material_1.DialogContent sx={{ textAlign: 'center', pb: 3 }}>
                <material_1.Chip icon={<icons_material_1.Star />} label={`Отримано ${totalXP} XP`} sx={{
                background: 'linear-gradient(45deg, #FFD700, #FFA000)',
                color: 'white',
                fontSize: '1.1rem',
                px: 2,
                py: 1
            }}/>
              </material_1.DialogContent>
              <material_1.DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <material_1.Button variant="contained" onClick={() => onComplete === null || onComplete === void 0 ? void 0 : onComplete(totalXP)} sx={{
                background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                px: 4
            }}>
                  Продовжити
                </material_1.Button>
              </material_1.DialogActions>
            </material_1.Dialog>)}
        </framer_motion_1.AnimatePresence>
      </material_1.Paper>

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
    </framer_motion_1.motion.div>);
};
exports.InteractiveTutorial = InteractiveTutorial;
exports.default = exports.InteractiveTutorial;
