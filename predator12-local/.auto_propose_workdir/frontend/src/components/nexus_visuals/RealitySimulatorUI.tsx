// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { nexusColors } from '../../theme/nexusTheme';
import { nexusAPI } from '../../services/nexusAPI';

interface SimulationParams {
  type: string;
  complexity: number;
  duration: number;
  variables: number;
}

const RealitySimulatorUI: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [params, setParams] = useState<SimulationParams>({
    type: 'scenario_analysis',
    complexity: 50,
    duration: 300,
    variables: 10
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // Create 3D fractal visualization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(400, 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create fractal-like structure
    const createFractalBranch = (depth: number, scale: number, position: THREE.Vector3, rotation: THREE.Euler) => {
      if (depth <= 0) return;

      const geometry = new THREE.CylinderGeometry(0.02 * scale, 0.05 * scale, 0.5 * scale, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL((depth / 5) * 0.8, 0.8, 0.6),
        transparent: true,
        opacity: 0.8
      });

      const branch = new THREE.Mesh(geometry, material);
      branch.position.copy(position);
      branch.rotation.copy(rotation);
      scene.add(branch);

      // Create child branches
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const newPos = position.clone().add(
          new THREE.Vector3(
            Math.cos(angle) * 0.3 * scale,
            0.4 * scale,
            Math.sin(angle) * 0.3 * scale
          )
        );
        const newRot = new THREE.Euler(
          rotation.x + (Math.random() - 0.5) * 0.5,
          rotation.y + angle,
          rotation.z + (Math.random() - 0.5) * 0.3
        );

        createFractalBranch(depth - 1, scale * 0.7, newPos, newRot);
      }
    };

    // Create initial fractal
    createFractalBranch(4, 1, new THREE.Vector3(0, -1, 0), new THREE.Euler(0, 0, 0));

    // Add particles
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xa020f0,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.set(0, 0, 5);

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate scene
      scene.rotation.y += 0.005;
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const startSimulation = async () => {
    try {
      setIsRunning(true);
      setProgress(0);
      setResults(null);

      const response = await nexusAPI.createSimulation(params.type, {
        complexity: params.complexity,
        duration: params.duration,
        variables: params.variables
      });

      setSimulationId(response.simulation_id);

      // Simulate progress
      const progressInterval = setInterval(async () => {
        if (simulationId) {
          try {
            const status = await nexusAPI.getSimulationStatus(simulationId);
            setProgress(status.progress);

            if (status.status === 'completed') {
              setResults(status.results);
              setIsRunning(false);
              clearInterval(progressInterval);
            }
          } catch (error) {
            console.error('Failed to get simulation status:', error);
          }
        }
      }, 1000);

      // Fallback completion after 10 seconds
      setTimeout(() => {
        setProgress(100);
        setResults({
          success_rate: '94%',
          risk_level: 'low',
          recommendations: [
            'Збільшити моніторинг аномалій',
            'Оптимізувати розподіл навантаження',
            'Підвищити рівень безпеки'
          ]
        });
        setIsRunning(false);
        clearInterval(progressInterval);
      }, 10000);

    } catch (error) {
      console.error('Failed to start simulation:', error);
      setIsRunning(false);
    }
  };

  const stopSimulation = () => {
    setIsRunning(false);
    setProgress(0);
    setResults(null);
    setSimulationId(null);
  };

  return (
    <Box sx={{
      height: '100%',
      p: 3,
      background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`
    }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>

        {/* Control Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusColors.amethyst}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ScienceIcon sx={{ color: nexusColors.amethyst, mr: 2, fontSize: 32 }} />
                <Typography variant="h4" sx={{
                  color: nexusColors.frost,
                  fontFamily: 'Orbitron',
                  textShadow: `0 0 10px ${nexusColors.amethyst}`
                }}>
                  Reality Simulator
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ color: nexusColors.nebula, mb: 3 }}>
                Моделюйте складні сценарії "що, якщо" та аналізуйте можливі результати
              </Typography>

              {/* Simulation Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: nexusColors.nebula }}>Тип симуляції</InputLabel>
                <Select
                  value={params.type}
                  onChange={(e) => setParams({...params, type: e.target.value})}
                  sx={{
                    color: nexusColors.frost,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: nexusColors.quantum
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: nexusColors.amethyst
                    }
                  }}
                >
                  <MenuItem value="scenario_analysis">Аналіз сценаріїв</MenuItem>
                  <MenuItem value="risk_assessment">Оцінка ризиків</MenuItem>
                  <MenuItem value="performance_prediction">Прогнозування продуктивності</MenuItem>
                  <MenuItem value="security_simulation">Симуляція безпеки</MenuItem>
                </Select>
              </FormControl>

              {/* Complexity Slider */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: nexusColors.nebula, mb: 1 }}>
                  Складність: {params.complexity}%
                </Typography>
                <Slider
                  value={params.complexity}
                  onChange={(_, value) => setParams({...params, complexity: value as number})}
                  min={10}
                  max={100}
                  sx={{
                    color: nexusColors.amethyst,
                    '& .MuiSlider-thumb': {
                      backgroundColor: nexusColors.amethyst,
                      border: `2px solid ${nexusColors.frost}`,
                      '&:hover': {
                        boxShadow: `0 0 15px ${nexusColors.amethyst}`
                      }
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: nexusColors.amethyst
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: nexusColors.quantum
                    }
                  }}
                />
              </Box>

              {/* Duration */}
              <TextField
                label="Тривалість (сек)"
                type="number"
                value={params.duration}
                onChange={(e) => setParams({...params, duration: parseInt(e.target.value)})}
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': { color: nexusColors.nebula },
                  '& .MuiInputBase-input': { color: nexusColors.frost },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.amethyst }
                }}
              />

              {/* Variables */}
              <TextField
                label="Кількість змінних"
                type="number"
                value={params.variables}
                onChange={(e) => setParams({...params, variables: parseInt(e.target.value)})}
                sx={{
                  mb: 3,
                  '& .MuiInputLabel-root': { color: nexusColors.nebula },
                  '& .MuiInputBase-input': { color: nexusColors.frost },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.amethyst }
                }}
              />

              {/* Control Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <StopIcon /> : <PlayIcon />}
                  onClick={isRunning ? stopSimulation : startSimulation}
                  disabled={isRunning && progress === 0}
                  sx={{
                    backgroundColor: isRunning ? nexusColors.crimson : nexusColors.amethyst,
                    color: nexusColors.frost,
                    '&:hover': {
                      backgroundColor: isRunning ? nexusColors.crimson : nexusColors.amethyst,
                      boxShadow: `0 0 20px ${isRunning ? nexusColors.crimson : nexusColors.amethyst}60`
                    }
                  }}
                >
                  {isRunning ? 'Зупинити' : 'Запустити'}
                </Button>
              </Box>

              {/* Progress */}
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 16 }}
                >
                  <Typography sx={{ color: nexusColors.nebula, mb: 1 }}>
                    Прогрес симуляції: {progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: `${nexusColors.amethyst}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: nexusColors.amethyst,
                        borderRadius: 4
                      }
                    }}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Visualization Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusColors.sapphire}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{
                color: nexusColors.frost,
                fontFamily: 'Orbitron',
                mb: 2
              }}>
                Quantum Fractal Visualization
              </Typography>

              {/* 3D Fractal Display */}
              <Box sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: `1px solid ${nexusColors.quantum}`,
                borderRadius: 2,
                mb: 2,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div ref={mountRef} />
                {isRunning && (
                  <Box sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    display: 'flex',
                    gap: 1
                  }}>
                    <Chip
                      label="СИМУЛЯЦІЯ АКТИВНА"
                      size="small"
                      sx={{
                        backgroundColor: `${nexusColors.amethyst}30`,
                        color: nexusColors.amethyst,
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Results */}
              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Box sx={{
                      p: 2,
                      backgroundColor: `${nexusColors.success}10`,
                      border: `1px solid ${nexusColors.success}40`,
                      borderRadius: 2
                    }}>
                      <Typography variant="h6" sx={{ color: nexusColors.success, mb: 1 }}>
                        Результати симуляції
                      </Typography>
                      <Typography sx={{ color: nexusColors.nebula, mb: 1 }}>
                        Успішність: {results.success_rate}
                      </Typography>
                      <Typography sx={{ color: nexusColors.nebula, mb: 1 }}>
                        Рівень ризику: {results.risk_level}
                      </Typography>
                      <Typography variant="body2" sx={{ color: nexusColors.shadow }}>
                        Рекомендації:
                      </Typography>
                      {results.recommendations?.map((rec: string, index: number) => (
                        <Typography key={index} variant="caption" sx={{
                          color: nexusColors.nebula,
                          display: 'block',
                          ml: 1
                        }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default RealitySimulatorUI;
