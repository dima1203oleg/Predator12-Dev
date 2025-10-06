// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  Timeline as TimelineIcon,
  Public as GlobeIcon
} from '@mui/icons-material';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

interface GeoEvent {
  id: string;
  lat: number;
  lon: number;
  timestamp: number;
  intensity: number;
  type: 'incident' | 'anomaly' | 'alert' | 'normal';
  title: string;
  description: string;
}

interface ChronoSpatialModuleProps {
  events?: GeoEvent[];
}

export const ChronoSpatialModule: React.FC<ChronoSpatialModuleProps> = ({
  events = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();
  
  // Time controls
  const [currentTime, setCurrentTime] = useState(0);
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [show3D, setShow3D] = useState(true);

  // TODO: Отримувати events з реального API
  // const events = await chronoSpatialAPI.getEvents();
  const allEvents = events.length > 0 ? events : [];

  useEffect(() => {
    if (!mountRef.current || !show3D) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(nexusColors.sapphire),
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(new THREE.Color(nexusColors.emerald), 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create event markers
    const eventMarkers: THREE.Mesh[] = [];
    
    allEvents.forEach((event) => {
      if (event.timestamp <= currentTime) {
        const phi = (90 - event.lat) * (Math.PI / 180);
        const theta = (event.lon + 180) * (Math.PI / 180);
        const radius = 5.2;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const markerGeometry = new THREE.SphereGeometry(0.1 * event.intensity, 16, 16);
        let markerColor: string;
        
        switch (event.type) {
          case 'incident':
            markerColor = nexusColors.crimson;
            break;
          case 'anomaly':
            markerColor = nexusColors.warning;
            break;
          case 'alert':
            markerColor = nexusColors.amethyst;
            break;
          default:
            markerColor = nexusColors.emerald;
        }

        const markerMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(markerColor),
          transparent: true,
          opacity: 0.8
        });

        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, y, z);
        eventMarkers.push(marker);
        scene.add(marker);

        // Add pulsing effect for recent events
        if (currentTime - event.timestamp < 10) {
          const pulseGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
          const pulseMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(markerColor),
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
          });
          const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
          pulse.position.copy(marker.position);
          pulse.lookAt(camera.position);
          scene.add(pulse);
        }
      }
    });

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      // Rotate Earth
      earth.rotation.y += 0.005;
      
      // Animate markers
      eventMarkers.forEach((marker, index) => {
        marker.rotation.x += 0.02;
        marker.rotation.y += 0.02;
        
        // Pulse effect
        const scale = 1 + Math.sin(time * 3 + index) * 0.2;
        marker.scale.setScalar(scale);
      });
      
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentTime, show3D, selectedEventType]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + playbackSpeed;
        return next > timeRange[1] ? timeRange[0] : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, timeRange]);

  const filteredEvents = allEvents.filter(event => 
    selectedEventType === 'all' || event.type === selectedEventType
  );

  const currentEvents = filteredEvents.filter(event => 
    Math.abs(event.timestamp - currentTime) < 5
  );

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3, 
            color: nexusColors.emerald,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusColors.emerald}`
          }}
        >
          <TimelineIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Хроно-просторовий Аналіз
        </Typography>

        <Grid container spacing={3}>
          {/* 3D Visualization */}
          <Grid item xs={12} lg={8}>
            <Card className="holographic">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                    <GlobeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Глобальна Карта Подій
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={show3D}
                        onChange={(e) => setShow3D(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: nexusColors.emerald,
                          },
                        }}
                      />
                    }
                    label="3D Режим"
                    sx={{ color: nexusColors.nebula }}
                  />
                </Box>
                
                {show3D ? (
                  <Box
                    ref={mountRef}
                    sx={{
                      width: '100%',
                      height: 600,
                      border: `1px solid ${nexusColors.quantum}`,
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 600,
                      border: `1px solid ${nexusColors.quantum}`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(45deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                    }}
                  >
                    <Typography variant="h6" sx={{ color: nexusColors.nebula }}>
                      2D Map View (Coming Soon)
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Controls and Events */}
          <Grid item xs={12} lg={4}>
            {/* Time Controls */}
            <Card className="holographic" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.sapphire }}>
                  Часові Контроли
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: nexusColors.nebula }}>
                    Поточний час: {currentTime.toFixed(1)}
                  </Typography>
                  <Slider
                    value={currentTime}
                    min={timeRange[0]}
                    max={timeRange[1]}
                    onChange={(_, value) => setCurrentTime(value as number)}
                    sx={{
                      color: nexusColors.emerald,
                      '& .MuiSlider-thumb': {
                        boxShadow: `0 0 10px ${nexusColors.emerald}`,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentTime(timeRange[0])}
                    sx={{ minWidth: 'auto' }}
                  >
                    <PrevIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsPlaying(!isPlaying)}
                    sx={{ minWidth: 'auto' }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentTime(timeRange[1])}
                    sx={{ minWidth: 'auto' }}
                  >
                    <NextIcon />
                  </Button>
                </Box>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: nexusColors.nebula }}>Швидкість</InputLabel>
                  <Select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(e.target.value as number)}
                    sx={{ color: nexusColors.frost }}
                  >
                    <MenuItem value={0.5}>0.5x</MenuItem>
                    <MenuItem value={1}>1x</MenuItem>
                    <MenuItem value={2}>2x</MenuItem>
                    <MenuItem value={5}>5x</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: nexusColors.nebula }}>Тип подій</InputLabel>
                  <Select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    sx={{ color: nexusColors.frost }}
                  >
                    <MenuItem value="all">Всі</MenuItem>
                    <MenuItem value="incident">Інциденти</MenuItem>
                    <MenuItem value="anomaly">Аномалії</MenuItem>
                    <MenuItem value="alert">Алерти</MenuItem>
                    <MenuItem value="normal">Нормальні</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Current Events */}
            <Card className="holographic">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.amethyst }}>
                  Поточні Події
                </Typography>
                
                {currentEvents.length === 0 ? (
                  <Typography variant="body2" sx={{ color: nexusColors.shadow }}>
                    Немає подій в поточному часовому проміжку
                  </Typography>
                ) : (
                  currentEvents.map((event) => (
                    <Box key={event.id} sx={{ mb: 2, p: 2, border: `1px solid ${nexusColors.quantum}`, borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
                          {event.title}
                        </Typography>
                        <Chip
                          label={event.type}
                          size="small"
                          sx={{
                            backgroundColor: event.type === 'incident' ? nexusColors.crimson :
                                           event.type === 'anomaly' ? nexusColors.warning :
                                           event.type === 'alert' ? nexusColors.amethyst : nexusColors.emerald,
                            color: nexusColors.frost
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                        {event.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                        Координати: {event.lat.toFixed(2)}, {event.lon.toFixed(2)} | 
                        Час: {event.timestamp} | 
                        Інтенсивність: {(event.intensity * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};
