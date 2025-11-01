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
const ResearchLab = () => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const [projectDialogOpen, setProjectDialogOpen] = (0, react_1.useState)(false);
    const [selectedProject, setSelectedProject] = (0, react_1.useState)(null);
    const [experiments, setExperiments] = (0, react_1.useState)([]);
    const [runningExperiments, setRunningExperiments] = (0, react_1.useState)(0);
    // Дослідницькі проекти
    const researchProjects = [
        {
            id: '1',
            title: 'Квантовий ШІ Алгоритм',
            description: 'Розробка квантових алгоритмів для оптимізації нейронних мереж',
            category: 'Квантові Обчислення',
            status: 'active',
            progress: 65,
            priority: 'critical',
            startDate: new Date('2024-01-15'),
            estimatedCompletion: new Date('2024-12-31'),
            team: ['Dr. Quantum', 'AI Researcher', 'Math Specialist'],
            budget: 250000,
            tags: ['quantum', 'AI', 'optimization'],
            icon: icons_material_1.Psychology,
            color: nexusTheme_1.nexusColors.primary.main
        },
        {
            id: '2',
            title: 'Біологічні Нейронні Мережі',
            description: 'Імітація біологічних нейронних структур для покращення ШІ',
            category: 'Біоінженерія',
            status: 'testing',
            progress: 80,
            priority: 'high',
            startDate: new Date('2024-02-01'),
            estimatedCompletion: new Date('2024-11-15'),
            team: ['Bio Engineer', 'Neural Scientist', 'Data Analyst'],
            budget: 180000,
            tags: ['biology', 'neural', 'biomimicry'],
            icon: icons_material_1.Biotech,
            color: nexusTheme_1.nexusColors.success.main
        },
        {
            id: '3',
            title: 'Автономні Системи',
            description: 'Розробка повністю автономних ШІ систем для критичних завдань',
            category: 'Автономія',
            status: 'active',
            progress: 45,
            priority: 'high',
            startDate: new Date('2024-03-10'),
            estimatedCompletion: new Date('2025-01-20'),
            team: ['Robotics Engineer', 'AI Architect', 'Safety Specialist'],
            budget: 320000,
            tags: ['autonomy', 'robotics', 'safety'],
            icon: icons_material_1.Rocket,
            color: nexusTheme_1.nexusColors.accent.main
        },
        {
            id: '4',
            title: 'Емоційний ШІ',
            description: 'Створення ШІ з розумінням та симуляцією емоцій',
            category: 'Емоційний ШІ',
            status: 'planning',
            progress: 15,
            priority: 'medium',
            startDate: new Date('2024-04-01'),
            estimatedCompletion: new Date('2025-03-01'),
            team: ['Psychology AI', 'Emotion Specialist', 'UX Researcher'],
            budget: 150000,
            tags: ['emotions', 'psychology', 'interaction'],
            icon: icons_material_1.AutoAwesome,
            color: nexusTheme_1.nexusColors.warning.main
        },
        {
            id: '5',
            title: 'Квантова Криптографія',
            description: 'Захист даних за допомогою квантових принципів',
            category: 'Безпека',
            status: 'completed',
            progress: 100,
            priority: 'critical',
            startDate: new Date('2023-12-01'),
            estimatedCompletion: new Date('2024-08-15'),
            team: ['Crypto Engineer', 'Quantum Physicist', 'Security Analyst'],
            budget: 200000,
            tags: ['quantum', 'cryptography', 'security'],
            icon: icons_material_1.Memory,
            color: nexusTheme_1.nexusColors.info.main
        },
        {
            id: '6',
            title: 'Голографічні Інтерфейси',
            description: 'Розробка голографічних UI для взаємодії з ШІ',
            category: 'Інтерфейси',
            status: 'active',
            progress: 30,
            priority: 'medium',
            startDate: new Date('2024-05-01'),
            estimatedCompletion: new Date('2024-12-01'),
            team: ['UI/UX Designer', '3D Specialist', 'AR Developer'],
            budget: 120000,
            tags: ['holography', 'UI', 'AR'],
            icon: icons_material_1.Lightbulb,
            color: nexusTheme_1.nexusColors.error.main
        }
    ];
    // Генерація експериментів
    (0, react_1.useEffect)(() => {
        const generateExperiments = () => {
            const experimentTypes = ['Neural Training', 'Data Analysis', 'Algorithm Testing', 'Performance Benchmark'];
            const newExperiments = Array.from({ length: 8 }, (_, i) => ({
                id: `exp-${i + 1}`,
                name: `${experimentTypes[i % experimentTypes.length]} #${i + 1}`,
                type: experimentTypes[i % experimentTypes.length],
                status: ['running', 'completed', 'queued'][Math.floor(Math.random() * 3)],
                progress: Math.floor(Math.random() * 100),
                duration: Math.floor(Math.random() * 120 + 30),
                results: Math.random() > 0.5 ? { accuracy: Math.random() * 0.3 + 0.7, loss: Math.random() * 0.5 } : null,
                parameters: {
                    learningRate: Math.random() * 0.01,
                    batchSize: Math.floor(Math.random() * 128 + 32),
                    epochs: Math.floor(Math.random() * 100 + 50)
                }
            }));
            setExperiments(newExperiments);
            setRunningExperiments(newExperiments.filter(exp => exp.status === 'running').length);
        };
        generateExperiments();
        const interval = setInterval(() => {
            setExperiments(prev => prev.map(exp => (Object.assign(Object.assign({}, exp), { progress: exp.status === 'running' ? Math.min(100, exp.progress + Math.random() * 5) : exp.progress, status: exp.status === 'running' && exp.progress >= 95 ? 'completed' : exp.status }))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'running':
                return nexusTheme_1.nexusColors.success.main;
            case 'testing':
                return nexusTheme_1.nexusColors.warning.main;
            case 'planning':
            case 'queued':
                return nexusTheme_1.nexusColors.info.main;
            case 'completed':
                return nexusTheme_1.nexusColors.primary.main;
            case 'paused':
            case 'failed':
                return nexusTheme_1.nexusColors.error.main;
            default:
                return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
                return nexusTheme_1.nexusColors.error.main;
            case 'high':
                return nexusTheme_1.nexusColors.warning.main;
            case 'medium':
                return nexusTheme_1.nexusColors.info.main;
            case 'low':
                return nexusTheme_1.nexusColors.success.main;
            default:
                return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const renderProjectCard = (project) => (<material_1.Grid item xs={12} md={6} lg={4} key={project.id}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.random() * 0.3 }} whileHover={{ scale: 1.05, y: -5 }}>
        <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${project.color}30`,
            borderRadius: 3,
            height: '100%',
            cursor: 'pointer',
            '&:hover': {
                boxShadow: `0 10px 30px ${project.color}40`,
                border: `1px solid ${project.color}60`
            },
            transition: 'all 0.3s ease'
        }} onClick={() => {
            setSelectedProject(project);
            setProjectDialogOpen(true);
        }}>
          <material_1.CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${project.color}40, ${project.color}60)`,
            width: 50,
            height: 50
        }}>
                <project.icon sx={{ color: project.color }}/>
              </material_1.Avatar>

              <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                <material_1.Chip label={project.status} size="small" sx={{
            background: `${getStatusColor(project.status)}20`,
            color: getStatusColor(project.status),
            fontWeight: 'bold'
        }}/>
                <material_1.Chip label={project.priority} size="small" sx={{
            background: `${getPriorityColor(project.priority)}20`,
            color: getPriorityColor(project.priority),
            fontWeight: 'bold'
        }}/>
              </material_1.Box>
            </material_1.Box>

            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 1, fontWeight: 'bold' }}>
              {project.title}
            </material_1.Typography>

            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 2, flexGrow: 1 }}>
              {project.description}
            </material_1.Typography>

            <material_1.Box sx={{ mb: 2 }}>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  Прогрес
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: project.color, fontWeight: 'bold' }}>
                  {project.progress}%
                </material_1.Typography>
              </material_1.Box>
              <material_1.LinearProgress variant="determinate" value={project.progress} sx={{
            height: 6,
            borderRadius: 3,
            background: `${nexusTheme_1.nexusColors.primary.dark}30`,
            '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${project.color}60, ${project.color})`
            }
        }}/>
            </material_1.Box>

            <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                Бюджет: ${project.budget.toLocaleString()}
              </material_1.Typography>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                Команда: {project.team.length}
              </material_1.Typography>
            </material_1.Box>

            <material_1.Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {project.tags.slice(0, 3).map((tag) => (<material_1.Chip key={tag} label={tag} size="small" sx={{
                background: `${nexusTheme_1.nexusColors.accent.main}20`,
                color: nexusTheme_1.nexusColors.accent.main,
                fontSize: '0.7rem'
            }}/>))}
              {project.tags.length > 3 && (<material_1.Chip label={`+${project.tags.length - 3}`} size="small" sx={{
                background: `${nexusTheme_1.nexusColors.text.secondary}20`,
                color: nexusTheme_1.nexusColors.text.secondary,
                fontSize: '0.7rem'
            }}/>)}
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Grid>);
    const renderExperimentsList = () => (<material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
            borderRadius: 3
        }}>
      <material_1.CardContent sx={{ p: 3 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
            🧪 Активні Експерименти
          </material_1.Typography>
          <material_1.Badge badgeContent={runningExperiments} color="primary">
            <material_1.Chip label="Запущено" sx={{
            background: `${nexusTheme_1.nexusColors.success.main}20`,
            color: nexusTheme_1.nexusColors.success.main,
            fontWeight: 'bold'
        }}/>
          </material_1.Badge>
        </material_1.Box>

        <material_1.Grid container spacing={2}>
          {experiments.map((experiment, index) => (<material_1.Grid item xs={12} sm={6} md={4} key={experiment.id}>
              <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <material_1.Paper sx={{
                p: 2,
                background: `${nexusTheme_1.nexusColors.secondary.dark}30`,
                border: `1px solid ${getStatusColor(experiment.status)}30`,
                borderRadius: 2,
                '&:hover': {
                    background: `${nexusTheme_1.nexusColors.secondary.dark}50`,
                    border: `1px solid ${getStatusColor(experiment.status)}60`,
                    transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
            }}>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                      {experiment.name}
                    </material_1.Typography>
                    <material_1.Chip label={experiment.status} size="small" sx={{
                background: `${getStatusColor(experiment.status)}20`,
                color: getStatusColor(experiment.status),
                fontSize: '0.7rem'
            }}/>
                  </material_1.Box>

                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 2 }}>
                    Тип: {experiment.type}
                  </material_1.Typography>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Прогрес
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: getStatusColor(experiment.status), fontWeight: 'bold' }}>
                        {experiment.progress.toFixed(1)}%
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.LinearProgress variant="determinate" value={experiment.progress} sx={{
                height: 4,
                borderRadius: 2,
                background: `${nexusTheme_1.nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getStatusColor(experiment.status)}60, ${getStatusColor(experiment.status)})`
                }
            }}/>
                  </material_1.Box>

                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                    Тривалість: {experiment.duration} хв
                  </material_1.Typography>

                  {experiment.results && (<material_1.Box sx={{ mt: 1 }}>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.success.main }}>
                        Точність: {(experiment.results.accuracy * 100).toFixed(1)}% |
                        Втрати: {experiment.results.loss.toFixed(3)}
                      </material_1.Typography>
                    </material_1.Box>)}
                </material_1.Paper>
              </framer_motion_1.motion.div>
            </material_1.Grid>))}
        </material_1.Grid>
      </material_1.CardContent>
    </material_1.Card>);
    const renderResearchStats = () => (<material_1.Grid container spacing={3} sx={{ mb: 3 }}>
      {[
            { label: 'Активні проекти', value: researchProjects.filter(p => p.status === 'active').length, icon: icons_material_1.Rocket, color: nexusTheme_1.nexusColors.success.main },
            { label: 'Завершені проекти', value: researchProjects.filter(p => p.status === 'completed').length, icon: icons_material_1.EmojiEvents, color: nexusTheme_1.nexusColors.primary.main },
            { label: 'Загальний бюджет', value: `$${researchProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`, icon: icons_material_1.Analytics, color: nexusTheme_1.nexusColors.warning.main },
            { label: 'Дослідники', value: new Set(researchProjects.flatMap(p => p.team)).size, icon: icons_material_1.School, color: nexusTheme_1.nexusColors.info.main }
        ].map((stat, index) => (<material_1.Grid item xs={6} md={3} key={stat.label}>
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${stat.color}30`,
                borderRadius: 3,
                p: 2,
                textAlign: 'center'
            }}>
              <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${stat.color}40, ${stat.color}60)`,
                margin: '0 auto',
                mb: 1,
                width: 40,
                height: 40
            }}>
                <stat.icon sx={{ color: stat.color }}/>
              </material_1.Avatar>
              <material_1.Typography variant="h5" sx={{
                color: nexusTheme_1.nexusColors.text.primary,
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${stat.color}, ${nexusTheme_1.nexusColors.accent.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                {stat.value}
              </material_1.Typography>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                {stat.label}
              </material_1.Typography>
            </material_1.Card>
          </framer_motion_1.motion.div>
        </material_1.Grid>))}
    </material_1.Grid>);
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`,
            width: 60,
            height: 60
        }}>
            <icons_material_1.Science sx={{ fontSize: '2rem' }}/>
          </material_1.Avatar>
          <material_1.Box>
            <material_1.Typography variant="h3" sx={{
            color: nexusTheme_1.nexusColors.text.primary,
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
              🧬 Дослідницька Лабораторія
            </material_1.Typography>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
              Передові дослідження та експерименти ШІ
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* Статистика */}
      {renderResearchStats()}

      {/* Вкладки */}
      <material_1.Paper sx={{
            background: `${nexusTheme_1.nexusColors.primary.dark}60`,
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            mb: 3
        }}>
        <material_1.Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{
            '& .MuiTab-root': {
                color: nexusTheme_1.nexusColors.text.secondary,
                fontWeight: 'bold',
                '&.Mui-selected': {
                    color: nexusTheme_1.nexusColors.primary.main
                }
            },
            '& .MuiTabs-indicator': {
                background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`
            }
        }}>
          <material_1.Tab label="🚀 Проекти"/>
          <material_1.Tab label="🧪 Експерименти"/>
          <material_1.Tab label="📊 Аналітика"/>
          <material_1.Tab label="💡 Інновації"/>
        </material_1.Tabs>
      </material_1.Paper>

      {/* Контент вкладок */}
      <framer_motion_1.AnimatePresence mode="wait">
        {currentTab === 0 && (<framer_motion_1.motion.div key="projects" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            <material_1.Grid container spacing={3}>
              {researchProjects.map(renderProjectCard)}
            </material_1.Grid>
          </framer_motion_1.motion.div>)}

        {currentTab === 1 && (<framer_motion_1.motion.div key="experiments" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            {renderExperimentsList()}
          </framer_motion_1.motion.div>)}

        {currentTab === 2 && (<framer_motion_1.motion.div key="analytics" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3,
                p: 4,
                textAlign: 'center'
            }}>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                📊 Аналітика Досліджень
              </material_1.Typography>
              <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 3 }}>
                Детальна аналітика прогресу досліджень та експериментів
              </material_1.Typography>
              <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`,
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5
            }}>
                Генерувати звіт
              </material_1.Button>
            </material_1.Card>
          </framer_motion_1.motion.div>)}

        {currentTab === 3 && (<framer_motion_1.motion.div key="innovations" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.accent.main}40, ${nexusTheme_1.nexusColors.primary.main}20)`,
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}50`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
            }}>
                  <icons_material_1.Lightbulb sx={{ fontSize: '3rem', color: nexusTheme_1.nexusColors.accent.main, mb: 2 }}/>
                  <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    💡 Нові Ідеї
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 3 }}>
                    Інноваційні концепції та прориви в дослідженнях
                  </material_1.Typography>
                  <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white'
            }}>
                    Додати ідею
                  </material_1.Button>
                </material_1.Card>
              </material_1.Grid>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.success.main}40, ${nexusTheme_1.nexusColors.primary.main}20)`,
                border: `1px solid ${nexusTheme_1.nexusColors.success.main}50`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
            }}>
                  <icons_material_1.Engineering sx={{ fontSize: '3rem', color: nexusTheme_1.nexusColors.success.main, mb: 2 }}/>
                  <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    🔧 Прототипи
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 3 }}>
                    Робочі прототипи та MVP проектів
                  </material_1.Typography>
                  <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.success.main}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white'
            }}>
                    Переглянути
                  </material_1.Button>
                </material_1.Card>
              </material_1.Grid>
            </material_1.Grid>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Діалог деталей проекту */}
      <material_1.Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}95, ${nexusTheme_1.nexusColors.secondary.dark}90)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3
            }
        }}>
        {selectedProject && (<>
            <material_1.DialogTitle sx={{
                color: nexusTheme_1.nexusColors.text.primary,
                borderBottom: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
              <selectedProject.icon sx={{ color: selectedProject.color }}/>
              {selectedProject.title}
            </material_1.DialogTitle>
            <material_1.DialogContent sx={{ pt: 3 }}>
              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={8}>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    {selectedProject.description}
                  </material_1.Typography>

                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 1 }}>
                    Команда проекту:
                  </material_1.Typography>
                  <material_1.List dense>
                    {selectedProject.team.map((member, index) => (<material_1.ListItem key={index} sx={{ px: 0 }}>
                        <material_1.ListItemIcon sx={{ minWidth: 30 }}>
                          <material_1.Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {member.charAt(0)}
                          </material_1.Avatar>
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary={member} sx={{ '& .MuiListItemText-primary': { color: nexusTheme_1.nexusColors.text.primary } }}/>
                      </material_1.ListItem>))}
                  </material_1.List>

                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 1, mt: 2 }}>
                    Теги:
                  </material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedProject.tags.map((tag) => (<material_1.Chip key={tag} label={tag} size="small" sx={{
                    background: `${nexusTheme_1.nexusColors.accent.main}20`,
                    color: nexusTheme_1.nexusColors.accent.main
                }}/>))}
                  </material_1.Box>
                </material_1.Grid>

                <material_1.Grid item xs={12} md={4}>
                  <material_1.Paper sx={{ p: 2, background: `${nexusTheme_1.nexusColors.secondary.dark}30`, borderRadius: 2 }}>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                      Деталі проекту
                    </material_1.Typography>

                    <material_1.Box sx={{ mb: 2 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Статус: <material_1.Chip label={selectedProject.status} size="small" sx={{
                background: `${getStatusColor(selectedProject.status)}20`,
                color: getStatusColor(selectedProject.status)
            }}/>
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Box sx={{ mb: 2 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Пріоритет: <material_1.Chip label={selectedProject.priority} size="small" sx={{
                background: `${getPriorityColor(selectedProject.priority)}20`,
                color: getPriorityColor(selectedProject.priority)
            }}/>
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                      Бюджет: ${selectedProject.budget.toLocaleString()}
                    </material_1.Typography>

                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                      Початок: {selectedProject.startDate.toLocaleDateString()}
                    </material_1.Typography>

                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 2 }}>
                      Завершення: {selectedProject.estimatedCompletion.toLocaleDateString()}
                    </material_1.Typography>

                    <material_1.Box>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                        Прогрес: {selectedProject.progress}%
                      </material_1.Typography>
                      <material_1.LinearProgress variant="determinate" value={selectedProject.progress} sx={{
                height: 8,
                borderRadius: 4,
                background: `${nexusTheme_1.nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${selectedProject.color}60, ${selectedProject.color})`
                }
            }}/>
                    </material_1.Box>
                  </material_1.Paper>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.DialogContent>
            <material_1.DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
              <material_1.Button onClick={() => setProjectDialogOpen(false)} sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                Закрити
              </material_1.Button>
              <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${selectedProject.color}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white'
            }}>
                Редагувати проект
              </material_1.Button>
            </material_1.DialogActions>
          </>)}
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = ResearchLab;
