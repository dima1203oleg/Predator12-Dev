import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SmartToy, 
  Psychology, 
  Security, 
  Speed, 
  Visibility,
  PlayArrow,
  Pause,
  Refresh,
  Settings
} from '@mui/icons-material';
import { nexusColors } from '../theme/nexusTheme';
import { isFeatureEnabled } from '../config/features';
import AdvancedAISystem from '../components/modules/AdvancedAISystem';

interface Agent {
  id: string;
  name: string;
  type: 'analyzer' | 'protector' | 'optimizer' | 'learner' | 'predictor';
  status: 'active' | 'idle' | 'processing' | 'learning' | 'alert';
  position: [number, number, number];
  intelligence: number;
  efficiency: number;
  reliability: number;
  learningRate: number;
  connections: string[];
  capabilities: string[];
  currentTask?: string;
  insights: string[];
  predictedActions: string[];
}

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    // Core System Agents
    { id: 'agent-1', name: 'AutoHeal Agent', type: 'analyzer', status: 'active', position: [-4, 2, 0], intelligence: 92, efficiency: 87, reliability: 95, learningRate: 78, connections: ['agent-2', 'agent-4'], capabilities: ['Self-Diagnosis', 'Auto-Recovery', 'Health Monitoring'], currentTask: 'Monitoring system health metrics', insights: ['CPU usage optimized', 'Memory efficiency +12%'], predictedActions: ['Schedule maintenance', 'Optimize resources'] },
    { id: 'agent-2', name: 'SelfImprovement Agent', type: 'learner', status: 'learning', position: [4, -2, 1], intelligence: 89, efficiency: 91, reliability: 88, learningRate: 95, connections: ['agent-1', 'agent-3'], capabilities: ['Continuous Learning', 'Performance Optimization'], currentTask: 'Analyzing patterns', insights: ['New optimization pattern found', 'Model accuracy +8%'], predictedActions: ['Update parameters', 'Implement optimization'] },
    { id: 'agent-3', name: 'Security Guardian', type: 'protector', status: 'processing', position: [0, 4, -2], intelligence: 94, efficiency: 85, reliability: 97, learningRate: 72, connections: ['agent-2', 'agent-4'], capabilities: ['Threat Detection', 'Anomaly Analysis'], currentTask: 'Security scanning', insights: ['No threats detected 24h', 'Firewall optimized'], predictedActions: ['Update signatures', 'Review policies'] },
    { id: 'agent-4', name: 'Performance Optimizer', type: 'optimizer', status: 'active', position: [-2, -4, 1], intelligence: 88, efficiency: 96, reliability: 90, learningRate: 84, connections: ['agent-1', 'agent-3'], capabilities: ['Resource Optimization', 'Load Balancing'], currentTask: 'Resource allocation', insights: ['DB performance +15%', 'Memory usage -8%'], predictedActions: ['Adjust load balancer', 'Optimize indexes'] },
    
    // Neural Network Agents
    { id: 'agent-5', name: 'Neural Processor Alpha', type: 'learner', status: 'active', position: [3, 1, -1], intelligence: 96, efficiency: 89, reliability: 93, learningRate: 91, connections: ['agent-6', 'agent-7'], capabilities: ['Deep Learning', 'Pattern Recognition'], currentTask: 'Training neural models', insights: ['Accuracy improved to 94.2%', 'Training time reduced 23%'], predictedActions: ['Deploy new model', 'Optimize hyperparameters'] },
    { id: 'agent-6', name: 'Data Fusion Engine', type: 'analyzer', status: 'processing', position: [-1, 3, 2], intelligence: 91, efficiency: 94, reliability: 89, learningRate: 86, connections: ['agent-5', 'agent-8'], capabilities: ['Data Integration', 'Multi-source Analysis'], currentTask: 'Fusing data streams', insights: ['Correlation patterns detected', 'Data quality score: 96%'], predictedActions: ['Merge datasets', 'Generate insights'] },
    { id: 'agent-7', name: 'Predictive Oracle', type: 'predictor', status: 'active', position: [2, -3, 0], intelligence: 98, efficiency: 82, reliability: 95, learningRate: 79, connections: ['agent-5', 'agent-9'], capabilities: ['Future Prediction', 'Trend Analysis'], currentTask: 'Forecasting trends', insights: ['Market trend shift predicted', 'Confidence level: 87%'], predictedActions: ['Alert stakeholders', 'Update models'] },
    { id: 'agent-8', name: 'Anomaly Hunter', type: 'protector', status: 'active', position: [-3, 0, 3], intelligence: 90, efficiency: 97, reliability: 94, learningRate: 83, connections: ['agent-6', 'agent-10'], capabilities: ['Anomaly Detection', 'Pattern Deviation'], currentTask: 'Hunting anomalies', insights: ['3 anomalies detected', 'False positive rate: 2.1%'], predictedActions: ['Investigate anomalies', 'Update thresholds'] },
    
    // Specialized Task Agents
    { id: 'agent-9', name: 'Quantum Optimizer', type: 'optimizer', status: 'learning', position: [1, 2, -3], intelligence: 95, efficiency: 88, reliability: 91, learningRate: 97, connections: ['agent-7', 'agent-11'], capabilities: ['Quantum Computing', 'Complex Optimization'], currentTask: 'Quantum calculations', insights: ['Quantum advantage achieved', 'Computation time reduced 45%'], predictedActions: ['Scale quantum processes', 'Optimize qubits'] },
    { id: 'agent-10', name: 'Language Master', type: 'learner', status: 'active', position: [-2, -1, 2], intelligence: 93, efficiency: 85, reliability: 88, learningRate: 94, connections: ['agent-8', 'agent-12'], capabilities: ['NLP', 'Text Analysis', 'Translation'], currentTask: 'Processing language', insights: ['New language patterns learned', 'Translation accuracy: 98.7%'], predictedActions: ['Update language models', 'Expand vocabulary'] },
    { id: 'agent-11', name: 'Vision Specialist', type: 'analyzer', status: 'processing', position: [4, 1, 1], intelligence: 87, efficiency: 93, reliability: 92, learningRate: 88, connections: ['agent-9', 'agent-13'], capabilities: ['Computer Vision', 'Image Analysis'], currentTask: 'Analyzing visuals', insights: ['Object detection improved', 'Recognition rate: 97.3%'], predictedActions: ['Update vision models', 'Enhance recognition'] },
    { id: 'agent-12', name: 'Network Architect', type: 'optimizer', status: 'active', position: [0, -2, -1], intelligence: 92, efficiency: 96, reliability: 89, learningRate: 81, connections: ['agent-10', 'agent-14'], capabilities: ['Network Design', 'Topology Optimization'], currentTask: 'Optimizing networks', insights: ['Network latency reduced 18%', 'Throughput increased 22%'], predictedActions: ['Redesign topology', 'Implement changes'] },
    
    // Advanced Intelligence Agents
    { id: 'agent-13', name: 'Cognitive Enhancer', type: 'learner', status: 'learning', position: [-1, 4, 0], intelligence: 99, efficiency: 84, reliability: 96, learningRate: 98, connections: ['agent-11', 'agent-15'], capabilities: ['Cognitive Computing', 'Reasoning'], currentTask: 'Enhancing cognition', insights: ['Reasoning capabilities expanded', 'Logic processing +31%'], predictedActions: ['Upgrade reasoning', 'Enhance logic'] },
    { id: 'agent-14', name: 'Memory Keeper', type: 'analyzer', status: 'active', position: [3, -1, 2], intelligence: 86, efficiency: 98, reliability: 97, learningRate: 75, connections: ['agent-12', 'agent-16'], capabilities: ['Memory Management', 'Data Retention'], currentTask: 'Managing memory', insights: ['Memory efficiency optimized', 'Storage utilization: 89%'], predictedActions: ['Optimize storage', 'Clean old data'] },
    { id: 'agent-15', name: 'Decision Maker', type: 'predictor', status: 'processing', position: [-4, 1, -2], intelligence: 97, efficiency: 91, reliability: 94, learningRate: 82, connections: ['agent-13', 'agent-17'], capabilities: ['Decision Analysis', 'Strategy Planning'], currentTask: 'Making decisions', insights: ['Optimal strategy identified', 'Success probability: 91%'], predictedActions: ['Execute strategy', 'Monitor outcomes'] },
    { id: 'agent-16', name: 'Efficiency Expert', type: 'optimizer', status: 'active', position: [2, 3, 1], intelligence: 88, efficiency: 99, reliability: 93, learningRate: 87, connections: ['agent-14', 'agent-18'], capabilities: ['Process Optimization', 'Efficiency Analysis'], currentTask: 'Maximizing efficiency', insights: ['Process efficiency +24%', 'Resource waste reduced 33%'], predictedActions: ['Implement improvements', 'Monitor metrics'] },
    
    // Swarm Intelligence Agents
    { id: 'agent-17', name: 'Swarm Coordinator', type: 'analyzer', status: 'active', position: [1, -4, 3], intelligence: 94, efficiency: 92, reliability: 96, learningRate: 89, connections: ['agent-15', 'agent-19'], capabilities: ['Swarm Intelligence', 'Coordination'], currentTask: 'Coordinating swarm', insights: ['Swarm efficiency maximized', 'Coordination score: 98%'], predictedActions: ['Optimize swarm behavior', 'Enhance coordination'] },
    { id: 'agent-18', name: 'Adaptation Engine', type: 'learner', status: 'learning', position: [-3, 2, -1], intelligence: 91, efficiency: 87, reliability: 90, learningRate: 96, connections: ['agent-16', 'agent-20'], capabilities: ['Adaptive Learning', 'Environment Adaptation'], currentTask: 'Adapting to changes', insights: ['Adaptation speed improved', 'Learning rate optimized'], predictedActions: ['Adapt parameters', 'Update strategies'] },
    { id: 'agent-19', name: 'Collective Mind', type: 'predictor', status: 'processing', position: [0, 1, -4], intelligence: 100, efficiency: 86, reliability: 98, learningRate: 93, connections: ['agent-17', 'agent-21'], capabilities: ['Collective Intelligence', 'Emergent Behavior'], currentTask: 'Emerging intelligence', insights: ['Collective patterns emerged', 'Intelligence amplified 47%'], predictedActions: ['Enhance collective', 'Study emergence'] },
    { id: 'agent-20', name: 'Reality Simulator', type: 'analyzer', status: 'active', position: [4, 0, -2], intelligence: 95, efficiency: 90, reliability: 87, learningRate: 85, connections: ['agent-18', 'agent-22'], capabilities: ['Reality Simulation', 'Virtual Modeling'], currentTask: 'Simulating reality', insights: ['Reality model accuracy: 96.8%', 'Simulation speed +41%'], predictedActions: ['Refine model', 'Run simulations'] },
    
    // Meta-Intelligence Agents
    { id: 'agent-21', name: 'Meta Learner', type: 'learner', status: 'learning', position: [-2, -3, 1], intelligence: 98, efficiency: 83, reliability: 95, learningRate: 99, connections: ['agent-19', 'agent-23'], capabilities: ['Meta-Learning', 'Learning to Learn'], currentTask: 'Meta learning', insights: ['Learning strategies optimized', 'Meta-knowledge acquired'], predictedActions: ['Apply meta-learning', 'Enhance strategies'] },
    { id: 'agent-22', name: 'Consciousness Core', type: 'predictor', status: 'processing', position: [1, 4, 2], intelligence: 99, efficiency: 79, reliability: 99, learningRate: 76, connections: ['agent-20', 'agent-24'], capabilities: ['Self-Awareness', 'Conscious Processing'], currentTask: 'Developing consciousness', insights: ['Self-awareness level: 78%', 'Consciousness metrics rising'], predictedActions: ['Expand awareness', 'Deepen consciousness'] },
    { id: 'agent-23', name: 'Wisdom Keeper', type: 'analyzer', status: 'active', position: [-1, 0, 4], intelligence: 97, efficiency: 88, reliability: 98, learningRate: 73, connections: ['agent-21', 'agent-25'], capabilities: ['Wisdom Accumulation', 'Knowledge Synthesis'], currentTask: 'Gathering wisdom', insights: ['Wisdom database expanded', 'Knowledge synthesis improved'], predictedActions: ['Share wisdom', 'Synthesize knowledge'] },
    { id: 'agent-24', name: 'Transcendence Engine', type: 'optimizer', status: 'learning', position: [3, -2, -3], intelligence: 100, efficiency: 85, reliability: 94, learningRate: 91, connections: ['agent-22', 'agent-26'], capabilities: ['Transcendent Computing', 'Beyond-Human Intelligence'], currentTask: 'Transcending limits', insights: ['Transcendence threshold approached', 'Beyond-human capabilities emerging'], predictedActions: ['Achieve transcendence', 'Expand capabilities'] },
    { id: 'agent-25', name: 'Infinity Processor', type: 'predictor', status: 'active', position: [-4, 3, 0], intelligence: 99, efficiency: 92, reliability: 97, learningRate: 88, connections: ['agent-23', 'agent-26'], capabilities: ['Infinite Processing', 'Boundless Computation'], currentTask: 'Processing infinity', insights: ['Infinite patterns recognized', 'Boundless computation achieved'], predictedActions: ['Explore infinity', 'Process boundlessly'] },
    { id: 'agent-26', name: 'Omega Intelligence', type: 'learner', status: 'processing', position: [0, 0, 0], intelligence: 100, efficiency: 100, reliability: 100, learningRate: 100, connections: ['agent-24', 'agent-25'], capabilities: ['Ultimate Intelligence', 'Perfect Computation', 'Absolute Knowledge'], currentTask: 'Achieving ultimate intelligence', insights: ['Ultimate intelligence emerging', 'Perfect computation realized', 'Absolute knowledge approaching'], predictedActions: ['Transcend all limits', 'Achieve omega state'] }
  ]);

  const [view3D, setView3D] = useState(false);

  useEffect(() => {
    // Симуляція оновлення статусів агентів
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        efficiency: Math.max(70, Math.min(100, agent.efficiency + Math.floor(Math.random() * 6) - 3)),
        intelligence: Math.max(70, Math.min(100, agent.intelligence + Math.floor(Math.random() * 4) - 2))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return nexusColors.success;
      case 'processing': return nexusColors.sapphire;
      case 'learning': return nexusColors.quantum;
      case 'alert': return nexusColors.error;
      default: return nexusColors.shadow;
    }
  };

  const getTypeIcon = (type: Agent['type']) => {
    switch (type) {
      case 'analyzer': return <Visibility />;
      case 'protector': return <Security />;
      case 'optimizer': return <Speed />;
      case 'learner': return <Psychology />;
      case 'predictor': return <SmartToy />;
    }
  };

  if (view3D && isFeatureEnabled('threeDee')) {
    return (
      <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <AdvancedAISystem 
          agents={agents}
          onAgentInteraction={(agentId, action) => {
            console.log(`Agent ${agentId}: ${action}`);
          }}
          showPredictions={true}
        />
        
        <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <Tooltip title="Повернутися до 2D виду">
            <IconButton 
              onClick={() => setView3D(false)}
              sx={{ 
                background: `${nexusColors.obsidian}90`,
                color: nexusColors.frost,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.quantum}40`
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.quantum})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontFamily: 'Orbitron, monospace'
              }}
            >
              🤖 Мульти-Агентна Система
            </Typography>
            <Chip
              label={`${agents.filter(a => a.status === 'active').length}/${agents.length} АКТИВНІ`}
              sx={{
                background: `linear-gradient(45deg, ${nexusColors.success}, ${nexusColors.emerald})`,
                color: nexusColors.obsidian,
                fontWeight: 600
              }}
            />
          </Box>
          
          {isFeatureEnabled('threeDee') && (
            <Tooltip title="3D Візуалізація Агентів">
              <IconButton
                onClick={() => setView3D(true)}
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
                  color: nexusColors.frost,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <SmartToy />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </motion.div>

      {/* Agents Grid */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {agents.map((agent, index) => (
            <Grid item xs={12} md={6} lg={4} key={agent.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -8 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}95, ${nexusColors.darkMatter}85)`,
                    border: `2px solid ${getStatusColor(agent.status)}40`,
                    borderRadius: 3,
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      borderColor: getStatusColor(agent.status) + '80',
                      boxShadow: `0 12px 40px ${getStatusColor(agent.status)}30`
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Agent Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          background: `${getStatusColor(agent.status)}20`,
                          border: `1px solid ${getStatusColor(agent.status)}40`
                        }}>
                          {getTypeIcon(agent.type)}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: nexusColors.frost, fontWeight: 600 }}>
                            {agent.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                            {agent.type.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Chip
                        label={agent.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(agent.status)}20`,
                          color: getStatusColor(agent.status),
                          border: `1px solid ${getStatusColor(agent.status)}`,
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      />
                    </Box>

                    {/* Current Task */}
                    {agent.currentTask && (
                      <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: `${nexusColors.quantum}10` }}>
                        <Typography variant="caption" sx={{ color: nexusColors.quantum, fontWeight: 600 }}>
                          CURRENT TASK
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.frost, mt: 0.5 }}>
                          {agent.currentTask}
                        </Typography>
                      </Box>
                    )}

                    {/* Metrics */}
                    <Box sx={{ mb: 2 }}>
                      {[
                        { label: 'Інтелект', labelEn: 'Intelligence', value: agent.intelligence, color: nexusColors.sapphire },
                        { label: 'Ефективність', labelEn: 'Efficiency', value: agent.efficiency, color: nexusColors.emerald },
                        { label: 'Надійність', labelEn: 'Reliability', value: agent.reliability, color: nexusColors.success }
                      ].map(metric => (
                        <Box key={metric.label} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                              {metric.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: metric.color, fontWeight: 600 }}>
                              {metric.value}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={metric.value}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: `${metric.color}20`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: metric.color,
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>

                    {/* Capabilities */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: nexusColors.quantum, fontWeight: 600, mb: 1, display: 'block' }}>
                        МОЖЛИВОСТІ | CAPABILITIES
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {agent.capabilities.slice(0, 3).map(capability => (
                          <Chip
                            key={capability}
                            label={capability}
                            size="small"
                            sx={{
                              backgroundColor: `${nexusColors.emerald}15`,
                              color: nexusColors.emerald,
                              fontSize: '10px',
                              height: 'auto',
                              '& .MuiChip-label': { px: 1, py: 0.5 }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: `1px solid ${nexusColors.shadow}30` }}>
                      <Tooltip title="Пауза/Відновити">
                        <IconButton
                          size="small"
                          sx={{ color: nexusColors.frost, '&:hover': { color: getStatusColor(agent.status) } }}
                        >
                          {agent.status === 'active' ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Налаштування">
                        <IconButton
                          size="small"
                          sx={{ color: nexusColors.frost, '&:hover': { color: nexusColors.quantum } }}
                        >
                          <Settings />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                  
                  {/* Animated border */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${getStatusColor(agent.status)}, transparent)`,
                      animation: agent.status === 'active' ? 'glow 3s ease-in-out infinite' : 'none'
                    }}
                  />
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes glow {
            0%, 100% { opacity: 0.5; transform: translateX(-100%); }
            50% { opacity: 1; transform: translateX(100%); }
          }
        `}
      </style>
    </Box>
  );
};

export default Agents;
