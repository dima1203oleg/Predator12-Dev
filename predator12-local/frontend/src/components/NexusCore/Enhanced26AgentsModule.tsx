// @ts-nocheck
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Box, Grid, Chip, Avatar } from '@mui/material';
import { Psychology, SmartToy, Security, Analytics, Code, Language } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

// 26 Agents Data
const agents = [
  { id: 1, name: 'Chief Orchestrator', type: 'orchestrator', icon: <Psychology />, color: '#FF6B6B', load: 85 },
  { id: 2, name: 'Data Scientist', type: 'analytics', icon: <Analytics />, color: '#4ECDC4', load: 72 },
  { id: 3, name: 'ML Engineer', type: 'ml', icon: <SmartToy />, color: '#45B7D1', load: 68 },
  { id: 4, name: 'Security Analyst', type: 'security', icon: <Security />, color: '#F39C12', load: 91 },
  { id: 5, name: 'Code Generator', type: 'code', icon: <Code />, color: '#9B59B6', load: 76 },
  { id: 6, name: 'NLP Processor', type: 'nlp', icon: <Language />, color: '#E74C3C', load: 83 },
  // ... (abbreviated for space)
];

const Agent3D: React.FC<{ agent: any }> = ({ agent }) => (
  <group position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5]}>
    <Sphere args={[0.3, 16, 16]}>
      <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={0.3} />
    </Sphere>
    <Html position={[0, 0.5, 0]} center>
      <div style={{ color: agent.color, fontSize: '10px', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', borderRadius: '2px' }}>
        {agent.name}
      </div>
    </Html>
  </group>
);

export const Enhanced26AgentsModule: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative', background: nexusColors.void }}>
      {/* 3D Visualization */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color={nexusColors.emerald} />
        
        {/* Central Hub */}
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color={nexusColors.emerald} wireframe transparent opacity={0.6} />
        </Sphere>
        
        {/* Agents */}
        {agents.map((agent) => (
          <Agent3D key={agent.id} agent={agent} />
        ))}
      </Canvas>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ position: 'absolute', top: 20, left: 20, width: 350, zIndex: 10 }}
      >
        <Card sx={{ background: 'rgba(10, 15, 26, 0.95)', border: `2px solid ${nexusColors.sapphire}40` }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: nexusColors.sapphire, mb: 2 }}>
              🤖 26 AI Agents Hub
            </Typography>
            
            <Grid container spacing={1}>
              {agents.map((agent) => (
                <Grid item xs={6} key={agent.id}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${agent.color}20, ${nexusColors.void}60)`,
                      border: `1px solid ${agent.color}40`,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, backgroundColor: agent.color }}>
                          {agent.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                            {agent.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: agent.color, display: 'block' }}>
                            {agent.load}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Enhanced26AgentsModule;
