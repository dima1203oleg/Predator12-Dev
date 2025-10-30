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
exports.ChronoSpatialModule = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const THREE = __importStar(require("three"));
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const ChronoSpatialModule = ({ events = [] }) => {
    const mountRef = (0, react_1.useRef)(null);
    const sceneRef = (0, react_1.useRef)();
    const rendererRef = (0, react_1.useRef)();
    const animationIdRef = (0, react_1.useRef)();
    // Time controls
    const [currentTime, setCurrentTime] = (0, react_1.useState)(0);
    const [timeRange, setTimeRange] = (0, react_1.useState)([0, 100]);
    const [isPlaying, setIsPlaying] = (0, react_1.useState)(false);
    const [playbackSpeed, setPlaybackSpeed] = (0, react_1.useState)(1);
    const [selectedEventType, setSelectedEventType] = (0, react_1.useState)('all');
    const [show3D, setShow3D] = (0, react_1.useState)(true);
    // TODO: Отримувати events з реального API
    // const events = await chronoSpatialAPI.getEvents();
    const allEvents = events.length > 0 ? events : [];
    (0, react_1.useEffect)(() => {
        if (!mountRef.current || !show3D)
            return;
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
            color: new THREE.Color(nexusTheme_1.nexusColors.sapphire),
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(new THREE.Color(nexusTheme_1.nexusColors.emerald), 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        // Create event markers
        const eventMarkers = [];
        allEvents.forEach((event) => {
            if (event.timestamp <= currentTime) {
                const phi = (90 - event.lat) * (Math.PI / 180);
                const theta = (event.lon + 180) * (Math.PI / 180);
                const radius = 5.2;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                const markerGeometry = new THREE.SphereGeometry(0.1 * event.intensity, 16, 16);
                let markerColor;
                switch (event.type) {
                    case 'incident':
                        markerColor = nexusTheme_1.nexusColors.crimson;
                        break;
                    case 'anomaly':
                        markerColor = nexusTheme_1.nexusColors.warning;
                        break;
                    case 'alert':
                        markerColor = nexusTheme_1.nexusColors.amethyst;
                        break;
                    default:
                        markerColor = nexusTheme_1.nexusColors.emerald;
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
    (0, react_1.useEffect)(() => {
        if (!isPlaying)
            return;
        const interval = setInterval(() => {
            setCurrentTime(prev => {
                const next = prev + playbackSpeed;
                return next > timeRange[1] ? timeRange[0] : next;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, timeRange]);
    const filteredEvents = allEvents.filter(event => selectedEventType === 'all' || event.type === selectedEventType);
    const currentEvents = filteredEvents.filter(event => Math.abs(event.timestamp - currentTime) < 5);
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.emerald,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusTheme_1.nexusColors.emerald}`
        }}>
          <icons_material_1.Timeline sx={{ mr: 2, verticalAlign: 'middle' }}/>
          Хроно-просторовий Аналіз
        </material_1.Typography>

        <material_1.Grid container spacing={3}>
          {/* 3D Visualization */}
          <material_1.Grid item xs={12} lg={8}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    <icons_material_1.Public sx={{ mr: 1, verticalAlign: 'middle' }}/>
                    Глобальна Карта Подій
                  </material_1.Typography>
                  <material_1.FormControlLabel control={<material_1.Switch checked={show3D} onChange={(e) => setShow3D(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="3D Режим" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
                </material_1.Box>

                {show3D ? (<material_1.Box ref={mountRef} sx={{
                width: '100%',
                height: 600,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                overflow: 'hidden'
            }}/>) : (<material_1.Box sx={{
                width: '100%',
                height: 600,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`
            }}>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      2D Map View (Coming Soon)
                    </material_1.Typography>
                  </material_1.Box>)}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Controls and Events */}
          <material_1.Grid item xs={12} lg={4}>
            {/* Time Controls */}
            <material_1.Card className="holographic" sx={{ mb: 2 }}>
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.sapphire }}>
                  Часові Контроли
                </material_1.Typography>

                <material_1.Box sx={{ mb: 3 }}>
                  <material_1.Typography variant="body2" sx={{ mb: 1, color: nexusTheme_1.nexusColors.nebula }}>
                    Поточний час: {currentTime.toFixed(1)}
                  </material_1.Typography>
                  <material_1.Slider value={currentTime} min={timeRange[0]} max={timeRange[1]} onChange={(_, value) => setCurrentTime(value)} sx={{
            color: nexusTheme_1.nexusColors.emerald,
            '& .MuiSlider-thumb': {
                boxShadow: `0 0 10px ${nexusTheme_1.nexusColors.emerald}`,
            },
        }}/>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <material_1.Button variant="outlined" size="small" onClick={() => setCurrentTime(timeRange[0])} sx={{ minWidth: 'auto' }}>
                    <icons_material_1.SkipPrevious />
                  </material_1.Button>
                  <material_1.Button variant="outlined" size="small" onClick={() => setIsPlaying(!isPlaying)} sx={{ minWidth: 'auto' }}>
                    {isPlaying ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />}
                  </material_1.Button>
                  <material_1.Button variant="outlined" size="small" onClick={() => setCurrentTime(timeRange[1])} sx={{ minWidth: 'auto' }}>
                    <icons_material_1.SkipNext />
                  </material_1.Button>
                </material_1.Box>

                <material_1.FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Швидкість</material_1.InputLabel>
                  <material_1.Select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    <material_1.MenuItem value={0.5}>0.5x</material_1.MenuItem>
                    <material_1.MenuItem value={1}>1x</material_1.MenuItem>
                    <material_1.MenuItem value={2}>2x</material_1.MenuItem>
                    <material_1.MenuItem value={5}>5x</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>

                <material_1.FormControl fullWidth size="small">
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Тип подій</material_1.InputLabel>
                  <material_1.Select value={selectedEventType} onChange={(e) => setSelectedEventType(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    <material_1.MenuItem value="all">Всі</material_1.MenuItem>
                    <material_1.MenuItem value="incident">Інциденти</material_1.MenuItem>
                    <material_1.MenuItem value="anomaly">Аномалії</material_1.MenuItem>
                    <material_1.MenuItem value="alert">Алерти</material_1.MenuItem>
                    <material_1.MenuItem value="normal">Нормальні</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.CardContent>
            </material_1.Card>

            {/* Current Events */}
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.amethyst }}>
                  Поточні Події
                </material_1.Typography>

                {currentEvents.length === 0 ? (<material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Немає подій в поточному часовому проміжку
                  </material_1.Typography>) : (currentEvents.map((event) => (<material_1.Box key={event.id} sx={{ mb: 2, p: 2, border: `1px solid ${nexusTheme_1.nexusColors.quantum}`, borderRadius: 1 }}>
                      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                          {event.title}
                        </material_1.Typography>
                        <material_1.Chip label={event.type} size="small" sx={{
                backgroundColor: event.type === 'incident' ? nexusTheme_1.nexusColors.crimson :
                    event.type === 'anomaly' ? nexusTheme_1.nexusColors.warning :
                        event.type === 'alert' ? nexusTheme_1.nexusColors.amethyst : nexusTheme_1.nexusColors.emerald,
                color: nexusTheme_1.nexusColors.frost
            }}/>
                      </material_1.Box>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                        {event.description}
                      </material_1.Typography>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                        Координати: {event.lat.toFixed(2)}, {event.lon.toFixed(2)} |
                        Час: {event.timestamp} |
                        Інтенсивність: {(event.intensity * 100).toFixed(0)}%
                      </material_1.Typography>
                    </material_1.Box>)))}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.ChronoSpatialModule = ChronoSpatialModule;
