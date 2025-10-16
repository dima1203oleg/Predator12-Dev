// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  LinearProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Biotech as BiotechIcon,
  Memory as MemoryIcon,
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  Engineering as EngineeringIcon,
  Analytics as AnalyticsIcon,
  DataUsage as DataUsageIcon,
  CloudQueue as CloudIcon,
  Code as CodeIcon,
  Functions as FunctionsIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'active' | 'testing' | 'completed' | 'paused';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  estimatedCompletion: Date;
  team: string[];
  budget: number;
  tags: string[];
  icon: any;
  color: string;
}

interface Experiment {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  duration: number;
  results: any;
  parameters: Record<string, any>;
}

const ResearchLab: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [runningExperiments, setRunningExperiments] = useState(0);

  // Дослідницькі проекти
  const researchProjects: ResearchProject[] = [
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
      icon: PsychologyIcon,
      color: nexusColors.primary.main
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
      icon: BiotechIcon,
      color: nexusColors.success.main
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
      icon: RocketIcon,
      color: nexusColors.accent.main
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
      icon: AutoAwesomeIcon,
      color: nexusColors.warning.main
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
      icon: MemoryIcon,
      color: nexusColors.info.main
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
      icon: LightbulbIcon,
      color: nexusColors.error.main
    }
  ];

  // Генерація експериментів
  useEffect(() => {
    const generateExperiments = () => {
      const experimentTypes = ['Neural Training', 'Data Analysis', 'Algorithm Testing', 'Performance Benchmark'];
      const newExperiments: Experiment[] = Array.from({ length: 8 }, (_, i) => ({
        id: `exp-${i + 1}`,
        name: `${experimentTypes[i % experimentTypes.length]} #${i + 1}`,
        type: experimentTypes[i % experimentTypes.length],
        status: ['running', 'completed', 'queued'][Math.floor(Math.random() * 3)] as any,
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
      setExperiments(prev => prev.map(exp => ({
        ...exp,
        progress: exp.status === 'running' ? Math.min(100, exp.progress + Math.random() * 5) : exp.progress,
        status: exp.status === 'running' && exp.progress >= 95 ? 'completed' : exp.status
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return nexusColors.success.main;
      case 'testing':
        return nexusColors.warning.main;
      case 'planning':
      case 'queued':
        return nexusColors.info.main;
      case 'completed':
        return nexusColors.primary.main;
      case 'paused':
      case 'failed':
        return nexusColors.error.main;
      default:
        return nexusColors.text.secondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return nexusColors.error.main;
      case 'high':
        return nexusColors.warning.main;
      case 'medium':
        return nexusColors.info.main;
      case 'low':
        return nexusColors.success.main;
      default:
        return nexusColors.text.secondary;
    }
  };

  const renderProjectCard = (project: ResearchProject) => (
    <Grid item xs={12} md={6} lg={4} key={project.id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
        whileHover={{ scale: 1.05, y: -5 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
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
          }}
          onClick={() => {
            setSelectedProject(project);
            setProjectDialogOpen(true);
          }}
        >
          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Avatar
                sx={{
                  background: `linear-gradient(45deg, ${project.color}40, ${project.color}60)`,
                  width: 50,
                  height: 50
                }}
              >
                <project.icon sx={{ color: project.color }} />
              </Avatar>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={project.status}
                  size="small"
                  sx={{
                    background: `${getStatusColor(project.status)}20`,
                    color: getStatusColor(project.status),
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  label={project.priority}
                  size="small"
                  sx={{
                    background: `${getPriorityColor(project.priority)}20`,
                    color: getPriorityColor(project.priority),
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>

            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.primary, mb: 1, fontWeight: 'bold' }}
            >
              {project.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: nexusColors.text.secondary, mb: 2, flexGrow: 1 }}
            >
              {project.description}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  Прогрес
                </Typography>
                <Typography variant="body2" sx={{ color: project.color, fontWeight: 'bold' }}>
                  {project.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  background: `${nexusColors.primary.dark}30`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${project.color}60, ${project.color})`
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                Бюджет: ${project.budget.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                Команда: {project.team.length}
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {project.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    background: `${nexusColors.accent.main}20`,
                    color: nexusColors.accent.main,
                    fontSize: '0.7rem'
                  }}
                />
              ))}
              {project.tags.length > 3 && (
                <Chip
                  label={`+${project.tags.length - 3}`}
                  size="small"
                  sx={{
                    background: `${nexusColors.text.secondary}20`,
                    color: nexusColors.text.secondary,
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );

  const renderExperimentsList = () => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${nexusColors.accent.main}30`,
        borderRadius: 3
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}
          >
            🧪 Активні Експерименти
          </Typography>
          <Badge badgeContent={runningExperiments} color="primary">
            <Chip
              label="Запущено"
              sx={{
                background: `${nexusColors.success.main}20`,
                color: nexusColors.success.main,
                fontWeight: 'bold'
              }}
            />
          </Badge>
        </Box>

        <Grid container spacing={2}>
          {experiments.map((experiment, index) => (
            <Grid item xs={12} sm={6} md={4} key={experiment.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    background: `${nexusColors.secondary.dark}30`,
                    border: `1px solid ${getStatusColor(experiment.status)}30`,
                    borderRadius: 2,
                    '&:hover': {
                      background: `${nexusColors.secondary.dark}50`,
                      border: `1px solid ${getStatusColor(experiment.status)}60`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}
                    >
                      {experiment.name}
                    </Typography>
                    <Chip
                      label={experiment.status}
                      size="small"
                      sx={{
                        background: `${getStatusColor(experiment.status)}20`,
                        color: getStatusColor(experiment.status),
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ color: nexusColors.text.secondary, mb: 2 }}
                  >
                    Тип: {experiment.type}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Прогрес
                      </Typography>
                      <Typography variant="body2" sx={{ color: getStatusColor(experiment.status), fontWeight: 'bold' }}>
                        {experiment.progress.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={experiment.progress}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        background: `${nexusColors.primary.dark}30`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${getStatusColor(experiment.status)}60, ${getStatusColor(experiment.status)})`
                        }
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                    Тривалість: {experiment.duration} хв
                  </Typography>

                  {experiment.results && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: nexusColors.success.main }}>
                        Точність: {(experiment.results.accuracy * 100).toFixed(1)}% |
                        Втрати: {experiment.results.loss.toFixed(3)}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderResearchStats = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Активні проекти', value: researchProjects.filter(p => p.status === 'active').length, icon: RocketIcon, color: nexusColors.success.main },
        { label: 'Завершені проекти', value: researchProjects.filter(p => p.status === 'completed').length, icon: TrophyIcon, color: nexusColors.primary.main },
        { label: 'Загальний бюджет', value: `$${researchProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`, icon: AnalyticsIcon, color: nexusColors.warning.main },
        { label: 'Дослідники', value: new Set(researchProjects.flatMap(p => p.team)).size, icon: SchoolIcon, color: nexusColors.info.main }
      ].map((stat, index) => (
        <Grid item xs={6} md={3} key={stat.label}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${stat.color}30`,
                borderRadius: 3,
                p: 2,
                textAlign: 'center'
              }}
            >
              <Avatar
                sx={{
                  background: `linear-gradient(45deg, ${stat.color}40, ${stat.color}60)`,
                  margin: '0 auto',
                  mb: 1,
                  width: 40,
                  height: 40
                }}
              >
                <stat.icon sx={{ color: stat.color }} />
              </Avatar>
              <Typography
                variant="h5"
                sx={{
                  color: nexusColors.text.primary,
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${stat.color}, ${nexusColors.accent.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                {stat.label}
              </Typography>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Avatar
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`,
              width: 60,
              height: 60
            }}
          >
            <ScienceIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: nexusColors.text.primary,
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🧬 Дослідницька Лабораторія
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.secondary }}
            >
              Передові дослідження та експерименти ШІ
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Статистика */}
      {renderResearchStats()}

      {/* Вкладки */}
      <Paper
        sx={{
          background: `${nexusColors.primary.dark}60`,
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          mb: 3
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: nexusColors.text.secondary,
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: nexusColors.primary.main
              }
            },
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`
            }
          }}
        >
          <Tab label="🚀 Проекти" />
          <Tab label="🧪 Експерименти" />
          <Tab label="📊 Аналітика" />
          <Tab label="💡 Інновації" />
        </Tabs>
      </Paper>

      {/* Контент вкладок */}
      <AnimatePresence mode="wait">
        {currentTab === 0 && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              {researchProjects.map(renderProjectCard)}
            </Grid>
          </motion.div>
        )}

        {currentTab === 1 && (
          <motion.div
            key="experiments"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            {renderExperimentsList()}
          </motion.div>
        )}

        {currentTab === 2 && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.accent.main}30`,
                borderRadius: 3,
                p: 4,
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                📊 Аналітика Досліджень
              </Typography>
              <Typography variant="body1" sx={{ color: nexusColors.text.secondary, mb: 3 }}>
                Детальна аналітика прогресу досліджень та експериментів
              </Typography>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`,
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5
                }}
              >
                Генерувати звіт
              </Button>
            </Card>
          </motion.div>
        )}

        {currentTab === 3 && (
          <motion.div
            key="innovations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.accent.main}40, ${nexusColors.primary.main}20)`,
                    border: `1px solid ${nexusColors.accent.main}50`,
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <LightbulbIcon sx={{ fontSize: '3rem', color: nexusColors.accent.main, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    💡 Нові Ідеї
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.secondary, mb: 3 }}>
                    Інноваційні концепції та прориви в дослідженнях
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
                      color: 'white'
                    }}
                  >
                    Додати ідею
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.success.main}40, ${nexusColors.primary.main}20)`,
                    border: `1px solid ${nexusColors.success.main}50`,
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <EngineeringIcon sx={{ fontSize: '3rem', color: nexusColors.success.main, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    🔧 Прототипи
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.secondary, mb: 3 }}>
                    Робочі прототипи та MVP проектів
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${nexusColors.success.main}, ${nexusColors.primary.main})`,
                      color: 'white'
                    }}
                  >
                    Переглянути
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Діалог деталей проекту */}
      <Dialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}95, ${nexusColors.secondary.dark}90)`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3
          }
        }}
      >
        {selectedProject && (
          <>
            <DialogTitle sx={{
              color: nexusColors.text.primary,
              borderBottom: `1px solid ${nexusColors.accent.main}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <selectedProject.icon sx={{ color: selectedProject.color }} />
              {selectedProject.title}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    {selectedProject.description}
                  </Typography>

                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 1 }}>
                    Команда проекту:
                  </Typography>
                  <List dense>
                    {selectedProject.team.map((member, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {member.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={member}
                          sx={{ '& .MuiListItemText-primary': { color: nexusColors.text.primary } }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 1, mt: 2 }}>
                    Теги:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedProject.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          background: `${nexusColors.accent.main}20`,
                          color: nexusColors.accent.main
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, background: `${nexusColors.secondary.dark}30`, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                      Деталі проекту
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Статус: <Chip
                          label={selectedProject.status}
                          size="small"
                          sx={{
                            background: `${getStatusColor(selectedProject.status)}20`,
                            color: getStatusColor(selectedProject.status)
                          }}
                        />
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Пріоритет: <Chip
                          label={selectedProject.priority}
                          size="small"
                          sx={{
                            background: `${getPriorityColor(selectedProject.priority)}20`,
                            color: getPriorityColor(selectedProject.priority)
                          }}
                        />
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                      Бюджет: ${selectedProject.budget.toLocaleString()}
                    </Typography>

                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                      Початок: {selectedProject.startDate.toLocaleDateString()}
                    </Typography>

                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 2 }}>
                      Завершення: {selectedProject.estimatedCompletion.toLocaleDateString()}
                    </Typography>

                    <Box>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                        Прогрес: {selectedProject.progress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={selectedProject.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          background: `${nexusColors.primary.dark}30`,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${selectedProject.color}60, ${selectedProject.color})`
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusColors.accent.main}30` }}>
              <Button
                onClick={() => setProjectDialogOpen(false)}
                sx={{ color: nexusColors.text.secondary }}
              >
                Закрити
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${selectedProject.color}, ${nexusColors.primary.main})`,
                  color: 'white'
                }}
              >
                Редагувати проект
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ResearchLab;
