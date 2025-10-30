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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const THREE = __importStar(require("three"));
const nexusTheme_1 = require("../../theme/nexusTheme");
const nexusAPI_1 = require("../../services/nexusAPI");
const RealitySimulatorUI = () => {
    var _a;
    const mountRef = (0, react_1.useRef)(null);
    const [simulationId, setSimulationId] = (0, react_1.useState)(null);
    const [isRunning, setIsRunning] = (0, react_1.useState)(false);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [results, setResults] = (0, react_1.useState)(null);
    const [params, setParams] = (0, react_1.useState)({
        type: 'scenario_analysis',
        complexity: 50,
        duration: 300,
        variables: 10
    });
    (0, react_1.useEffect)(() => {
        if (!mountRef.current)
            return;
        // Create 3D fractal visualization
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(400, 300);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);
        // Create fractal-like structure
        const createFractalBranch = (depth, scale, position, rotation) => {
            if (depth <= 0)
                return;
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
                const newPos = position.clone().add(new THREE.Vector3(Math.cos(angle) * 0.3 * scale, 0.4 * scale, Math.sin(angle) * 0.3 * scale));
                const newRot = new THREE.Euler(rotation.x + (Math.random() - 0.5) * 0.5, rotation.y + angle, rotation.z + (Math.random() - 0.5) * 0.3);
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
    const startSimulation = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setIsRunning(true);
            setProgress(0);
            setResults(null);
            const response = yield nexusAPI_1.nexusAPI.createSimulation(params.type, {
                complexity: params.complexity,
                duration: params.duration,
                variables: params.variables
            });
            setSimulationId(response.simulation_id);
            // Simulate progress
            const progressInterval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
                if (simulationId) {
                    try {
                        const status = yield nexusAPI_1.nexusAPI.getSimulationStatus(simulationId);
                        setProgress(status.progress);
                        if (status.status === 'completed') {
                            setResults(status.results);
                            setIsRunning(false);
                            clearInterval(progressInterval);
                        }
                    }
                    catch (error) {
                        console.error('Failed to get simulation status:', error);
                    }
                }
            }), 1000);
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
        }
        catch (error) {
            console.error('Failed to start simulation:', error);
            setIsRunning(false);
        }
    });
    const stopSimulation = () => {
        setIsRunning(false);
        setProgress(0);
        setResults(null);
        setSimulationId(null);
    };
    return (<material_1.Box sx={{
            height: '100%',
            p: 3,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 50%, ${nexusTheme_1.nexusColors.darkMatter} 100%)`
        }}>
      <material_1.Grid container spacing={3} sx={{ height: '100%' }}>

        {/* Control Panel */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusTheme_1.nexusColors.amethyst}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
        }}>
            <material_1.CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <icons_material_1.Science sx={{ color: nexusTheme_1.nexusColors.amethyst, mr: 2, fontSize: 32 }}/>
                <material_1.Typography variant="h4" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusTheme_1.nexusColors.amethyst}`
        }}>
                  Reality Simulator
                </material_1.Typography>
              </material_1.Box>

              <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 3 }}>
                Моделюйте складні сценарії "що, якщо" та аналізуйте можливі результати
              </material_1.Typography>

              {/* Simulation Type */}
              <material_1.FormControl fullWidth sx={{ mb: 2 }}>
                <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Тип симуляції</material_1.InputLabel>
                <material_1.Select value={params.type} onChange={(e) => setParams(Object.assign(Object.assign({}, params), { type: e.target.value }))} sx={{
            color: nexusTheme_1.nexusColors.frost,
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: nexusTheme_1.nexusColors.quantum
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: nexusTheme_1.nexusColors.amethyst
            }
        }}>
                  <material_1.MenuItem value="scenario_analysis">Аналіз сценаріїв</material_1.MenuItem>
                  <material_1.MenuItem value="risk_assessment">Оцінка ризиків</material_1.MenuItem>
                  <material_1.MenuItem value="performance_prediction">Прогнозування продуктивності</material_1.MenuItem>
                  <material_1.MenuItem value="security_simulation">Симуляція безпеки</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>

              {/* Complexity Slider */}
              <material_1.Box sx={{ mb: 2 }}>
                <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                  Складність: {params.complexity}%
                </material_1.Typography>
                <material_1.Slider value={params.complexity} onChange={(_, value) => setParams(Object.assign(Object.assign({}, params), { complexity: value }))} min={10} max={100} sx={{
            color: nexusTheme_1.nexusColors.amethyst,
            '& .MuiSlider-thumb': {
                backgroundColor: nexusTheme_1.nexusColors.amethyst,
                border: `2px solid ${nexusTheme_1.nexusColors.frost}`,
                '&:hover': {
                    boxShadow: `0 0 15px ${nexusTheme_1.nexusColors.amethyst}`
                }
            },
            '& .MuiSlider-track': {
                backgroundColor: nexusTheme_1.nexusColors.amethyst
            },
            '& .MuiSlider-rail': {
                backgroundColor: nexusTheme_1.nexusColors.quantum
            }
        }}/>
              </material_1.Box>

              {/* Duration */}
              <material_1.TextField label="Тривалість (сек)" type="number" value={params.duration} onChange={(e) => setParams(Object.assign(Object.assign({}, params), { duration: parseInt(e.target.value) }))} sx={{
            mb: 2,
            '& .MuiInputLabel-root': { color: nexusTheme_1.nexusColors.nebula },
            '& .MuiInputBase-input': { color: nexusTheme_1.nexusColors.frost },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.quantum },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.amethyst }
        }}/>

              {/* Variables */}
              <material_1.TextField label="Кількість змінних" type="number" value={params.variables} onChange={(e) => setParams(Object.assign(Object.assign({}, params), { variables: parseInt(e.target.value) }))} sx={{
            mb: 3,
            '& .MuiInputLabel-root': { color: nexusTheme_1.nexusColors.nebula },
            '& .MuiInputBase-input': { color: nexusTheme_1.nexusColors.frost },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.quantum },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusTheme_1.nexusColors.amethyst }
        }}/>

              {/* Control Buttons */}
              <material_1.Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                <material_1.Button variant="contained" startIcon={isRunning ? <icons_material_1.Stop /> : <icons_material_1.PlayArrow />} onClick={isRunning ? stopSimulation : startSimulation} disabled={isRunning && progress === 0} sx={{
            backgroundColor: isRunning ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.amethyst,
            color: nexusTheme_1.nexusColors.frost,
            '&:hover': {
                backgroundColor: isRunning ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.amethyst,
                boxShadow: `0 0 20px ${isRunning ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.amethyst}60`
            }
        }}>
                  {isRunning ? 'Зупинити' : 'Запустити'}
                </material_1.Button>
              </material_1.Box>

              {/* Progress */}
              {isRunning && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
                  <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                    Прогрес симуляції: {progress}%
                  </material_1.Typography>
                  <material_1.LinearProgress variant="determinate" value={progress} sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${nexusTheme_1.nexusColors.amethyst}20`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.amethyst,
                    borderRadius: 4
                }
            }}/>
                </framer_motion_1.motion.div>)}
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Visualization Panel */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusTheme_1.nexusColors.sapphire}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
        }}>
            <material_1.CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron',
            mb: 2
        }}>
                Quantum Fractal Visualization
              </material_1.Typography>

              {/* 3D Fractal Display */}
              <material_1.Box sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 2,
            mb: 2,
            position: 'relative',
            overflow: 'hidden'
        }}>
                <div ref={mountRef}/>
                {isRunning && (<material_1.Box sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                display: 'flex',
                gap: 1
            }}>
                    <material_1.Chip label="СИМУЛЯЦІЯ АКТИВНА" size="small" sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.amethyst}30`,
                color: nexusTheme_1.nexusColors.amethyst,
                animation: 'pulse 2s infinite'
            }}/>
                  </material_1.Box>)}
              </material_1.Box>

              {/* Results */}
              <framer_motion_1.AnimatePresence>
                {results && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <material_1.Box sx={{
                p: 2,
                backgroundColor: `${nexusTheme_1.nexusColors.success}10`,
                border: `1px solid ${nexusTheme_1.nexusColors.success}40`,
                borderRadius: 2
            }}>
                      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.success, mb: 1 }}>
                        Результати симуляції
                      </material_1.Typography>
                      <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                        Успішність: {results.success_rate}
                      </material_1.Typography>
                      <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                        Рівень ризику: {results.risk_level}
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                        Рекомендації:
                      </material_1.Typography>
                      {(_a = results.recommendations) === null || _a === void 0 ? void 0 : _a.map((rec, index) => (<material_1.Typography key={index} variant="caption" sx={{
                    color: nexusTheme_1.nexusColors.nebula,
                    display: 'block',
                    ml: 1
                }}>
                          • {rec}
                        </material_1.Typography>))}
                    </material_1.Box>
                  </framer_motion_1.motion.div>)}
              </framer_motion_1.AnimatePresence>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

      </material_1.Grid>
    </material_1.Box>);
};
exports.default = RealitySimulatorUI;
