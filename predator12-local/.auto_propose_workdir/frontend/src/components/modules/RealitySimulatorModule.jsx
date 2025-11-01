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
exports.RealitySimulatorModule = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const THREE = __importStar(require("three"));
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const RealitySimulatorModule = () => {
    const mountRef = (0, react_1.useRef)(null);
    const sceneRef = (0, react_1.useRef)();
    const rendererRef = (0, react_1.useRef)();
    const animationIdRef = (0, react_1.useRef)();
    const templates = react_1.default.useMemo(() => [
        {
            id: 'quantum-trade-scenario',
            name: 'Квантовий торговий сценарій',
            description: 'Оцінка впливу квантових каналів на глобальну торгівлю та логістику.',
            model_type: 'quantum_trade',
            duration: 720,
            parameters: [
                {
                    name: 'quantum_channels',
                    type: 'number',
                    value: 5,
                    min: 1,
                    max: 20,
                    description: 'Кількість активних квантових каналів зв’язку.'
                },
                {
                    name: 'trade_volume_modifier',
                    type: 'range',
                    value: 1.0,
                    min: 0.5,
                    max: 2.5,
                    description: 'Множник зміни обсягів торгівлі.'
                },
                {
                    name: 'enable_autobalance',
                    type: 'boolean',
                    value: true,
                    description: 'Автоматичне балансування між регіонами.'
                }
            ]
        },
        {
            id: 'supply-chain-stress',
            name: 'Стрес-тест ланцюга постачань',
            description: 'Моделювання стабільності ланцюга постачань під час надзвичайних ситуацій.',
            model_type: 'supply_chain',
            duration: 480,
            parameters: [
                {
                    name: 'disruption_frequency',
                    type: 'number',
                    value: 3,
                    min: 0,
                    max: 10,
                    description: 'Середня кількість збоїв на день.'
                },
                {
                    name: 'recovery_speed',
                    type: 'range',
                    value: 0.7,
                    min: 0.1,
                    max: 1,
                    description: 'Швидкість відновлення (0-1).'
                },
                {
                    name: 'buffer_capacity',
                    type: 'number',
                    value: 25,
                    min: 5,
                    max: 50,
                    description: 'Резервна пропускна здатність у %.'
                }
            ]
        }
    ], []);
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)(null);
    const [parameters, setParameters] = (0, react_1.useState)([]);
    const [simulationRuns, setSimulationRuns] = (0, react_1.useState)([]);
    const [currentRun, setCurrentRun] = (0, react_1.useState)(null);
    const [resultsDialogOpen, setResultsDialogOpen] = (0, react_1.useState)(false);
    const [selectedResults, setSelectedResults] = (0, react_1.useState)(null);
    const [show3D, setShow3D] = (0, react_1.useState)(true);
    // TODO: Отримувати templates і simulationRuns з реального API
    // const templates: SimulationTemplate[] = await simulatorAPI.getTemplates();
    // const simulationRuns: SimulationRun[] = await simulatorAPI.getRuns();
    (0, react_1.useEffect)(() => {
        // TODO: Set simulationRuns з реального API
        // setSimulationRuns(await simulatorAPI.getRuns());
    }, []);
    (0, react_1.useEffect)(() => {
        if (!mountRef.current || !show3D)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 800 / 400, 0.1, 1000);
        camera.position.set(0, 0, 10);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(800, 400);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);
        // Create fractal-like structure for simulation visualization
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(nexusTheme_1.nexusColors.amethyst),
            transparent: true,
            opacity: 0.7
        });
        const cubes = [];
        // Create branching structure
        for (let i = 0; i < 20; i++) {
            const cube = new THREE.Mesh(geometry, material.clone());
            const angle = (i / 20) * Math.PI * 2;
            const radius = 2 + Math.random() * 3;
            cube.position.x = Math.cos(angle) * radius;
            cube.position.y = Math.sin(angle) * radius;
            cube.position.z = (Math.random() - 0.5) * 4;
            cube.scale.setScalar(0.3 + Math.random() * 0.5);
            cubes.push(cube);
            scene.add(cube);
        }
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(new THREE.Color(nexusTheme_1.nexusColors.emerald), 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        // Animation loop
        let time = 0;
        const animate = () => {
            time += 0.01;
            cubes.forEach((cube, index) => {
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.02;
                // Pulsing effect
                const scale = 0.5 + Math.sin(time + index * 0.5) * 0.3;
                cube.scale.setScalar(scale);
                // Color change based on simulation state
                if (cube.material instanceof THREE.MeshPhongMaterial) {
                    const hue = (time + index * 0.1) % 1;
                    cube.material.color.setHSL(hue, 0.7, 0.5);
                }
            });
            // Rotate camera
            camera.position.x = Math.cos(time * 0.2) * 8;
            camera.position.z = Math.sin(time * 0.2) * 8;
            camera.lookAt(0, 0, 0);
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
    }, [show3D, currentRun]);
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setParameters([...template.parameters]);
    };
    const handleParameterChange = (index, value) => {
        const newParameters = [...parameters];
        newParameters[index].value = value;
        setParameters(newParameters);
    };
    const handleStartSimulation = () => {
        if (!selectedTemplate)
            return;
        const newRun = {
            id: `run_${Date.now()}`,
            name: `${selectedTemplate.name} - ${new Date().toLocaleTimeString()}`,
            status: 'running',
            progress: 0,
            started_at: new Date()
        };
        setSimulationRuns(prev => [newRun, ...prev]);
        setCurrentRun(newRun);
        // Simulate progress
        const progressInterval = setInterval(() => {
            setSimulationRuns(prev => prev.map(run => run.id === newRun.id
                ? Object.assign(Object.assign({}, run), { progress: Math.min(run.progress + Math.random() * 10, 100) }) : run));
        }, 500);
        // Complete simulation after random time
        setTimeout(() => {
            clearInterval(progressInterval);
            setSimulationRuns(prev => prev.map(run => run.id === newRun.id
                ? Object.assign(Object.assign({}, run), { status: 'completed', progress: 100, completed_at: new Date(), results: {
                        success_rate: Math.random(),
                        efficiency: Math.random(),
                        risk_score: Math.random()
                    } }) : run));
            setCurrentRun(null);
        }, 5000 + Math.random() * 5000);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return nexusTheme_1.nexusColors.emerald;
            case 'running': return nexusTheme_1.nexusColors.sapphire;
            case 'failed': return nexusTheme_1.nexusColors.crimson;
            case 'queued': return nexusTheme_1.nexusColors.warning;
            default: return nexusTheme_1.nexusColors.nebula;
        }
    };
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.warning,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusTheme_1.nexusColors.warning}`
        }}>
          <icons_material_1.Science sx={{ mr: 2, verticalAlign: 'middle' }}/>
          Симулятор Реальностей
        </material_1.Typography>

        <material_1.Grid container spacing={3}>
          {/* Simulation Setup */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.emerald }}>
                  Конфігурація Сценарію
                </material_1.Typography>

                <material_1.FormControl fullWidth sx={{ mb: 2 }}>
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Шаблон симуляції</material_1.InputLabel>
                  <material_1.Select value={(selectedTemplate === null || selectedTemplate === void 0 ? void 0 : selectedTemplate.id) || ''} onChange={(e) => {
            const template = templates.find(t => t.id === e.target.value);
            if (template)
                handleTemplateSelect(template);
        }} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    {templates.map((template) => (<material_1.MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </material_1.MenuItem>))}
                  </material_1.Select>
                </material_1.FormControl>

                {selectedTemplate && (<material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 2 }}>
                      {selectedTemplate.description}
                    </material_1.Typography>

                    <material_1.Chip label={selectedTemplate.model_type.replace('_', ' ').toUpperCase()} sx={{
                backgroundColor: nexusTheme_1.nexusColors.amethyst,
                color: nexusTheme_1.nexusColors.frost,
                mb: 2
            }}/>

                    {parameters.map((param, index) => (<material_1.Box key={param.name} sx={{ mb: 2 }}>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                          {param.description}
                        </material_1.Typography>

                        {param.type === 'number' && (<material_1.TextField fullWidth type="number" value={typeof param.value === 'number' ? param.value : Number(param.value)} onChange={(e) => handleParameterChange(index, parseFloat(e.target.value))} inputProps={{ min: param.min, max: param.max }} size="small"/>)}

                        {param.type === 'boolean' && (<material_1.FormControl fullWidth size="small">
                            <material_1.Select value={param.value ? 'true' : 'false'} onChange={(e) => handleParameterChange(index, e.target.value === 'true')}>
                              <material_1.MenuItem value="true">Увімкнено</material_1.MenuItem>
                              <material_1.MenuItem value="false">Вимкнено</material_1.MenuItem>
                            </material_1.Select>
                          </material_1.FormControl>)}

                        {param.type === 'range' && (<material_1.Box sx={{ px: 2 }}>
                            <material_1.Slider value={typeof param.value === 'number' ? param.value : Number(param.value)} onChange={(_, value) => {
                        var _a;
                        return handleParameterChange(index, Array.isArray(value) ? (_a = value[0]) !== null && _a !== void 0 ? _a : 0 : value);
                    }} valueLabelDisplay="auto" min={param.min} max={param.max} step={0.01} sx={{
                        color: nexusTheme_1.nexusColors.sapphire,
                        '& .MuiSlider-thumb': {
                            boxShadow: `0 0 10px ${nexusTheme_1.nexusColors.sapphire}`,
                        },
                    }}/>
                          </material_1.Box>)}
                      </material_1.Box>))}
                  </material_1.Box>)}

                <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                  <material_1.Button variant="contained" startIcon={<icons_material_1.PlayArrow />} onClick={handleStartSimulation} disabled={!selectedTemplate || currentRun !== null} sx={{
            backgroundColor: nexusTheme_1.nexusColors.emerald,
            '&:hover': { backgroundColor: nexusTheme_1.nexusColors.emerald + 'CC' }
        }}>
                    Запустити
                  </material_1.Button>
                  <material_1.Button variant="outlined" startIcon={<icons_material_1.Save />} disabled={!selectedTemplate}>
                    Зберегти
                  </material_1.Button>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* 3D Visualization */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.sapphire }}>
                  Фрактал Обчислень
                </material_1.Typography>

                {show3D ? (<material_1.Box ref={mountRef} sx={{
                width: '100%',
                height: 400,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                overflow: 'hidden'
            }}/>) : (<material_1.Box sx={{
                width: '100%',
                height: 400,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`
            }}>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      3D Visualization Disabled
                    </material_1.Typography>
                  </material_1.Box>)}

                {currentRun && (<material_1.Box sx={{ mt: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                      Поточна симуляція: {currentRun.name}
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={currentRun.progress} sx={{
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.sapphire,
                },
            }}/>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      {currentRun.progress.toFixed(1)}% завершено
                    </material_1.Typography>
                  </material_1.Box>)}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Simulation History */}
          <material_1.Grid item xs={12}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.amethyst }}>
                  Історія Симуляцій
                </material_1.Typography>

                <material_1.TableContainer component={material_1.Paper} sx={{ backgroundColor: 'transparent' }}>
                  <material_1.Table>
                    <material_1.TableHead>
                      <material_1.TableRow>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Назва
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Статус
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Прогрес
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Час запуску
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Дії
                        </material_1.TableCell>
                      </material_1.TableRow>
                    </material_1.TableHead>
                    <material_1.TableBody>
                      {simulationRuns.map((run) => (<material_1.TableRow key={run.id}>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                              {run.name}
                            </material_1.Typography>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Chip label={run.status} size="small" sx={{
                backgroundColor: getStatusColor(run.status),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <material_1.LinearProgress variant="determinate" value={run.progress} sx={{
                width: 100,
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(run.status),
                },
            }}/>
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                                {run.progress.toFixed(0)}%
                              </material_1.Typography>
                            </material_1.Box>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                              {run.started_at.toLocaleString()}
                            </material_1.Typography>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Button size="small" startIcon={<icons_material_1.Visibility />} onClick={() => {
                setSelectedResults(run.results);
                setResultsDialogOpen(true);
            }} disabled={!run.results} sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                              Результати
                            </material_1.Button>
                          </material_1.TableCell>
                        </material_1.TableRow>))}
                    </material_1.TableBody>
                  </material_1.Table>
                </material_1.TableContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>

        {/* Results Dialog */}
        <material_1.Dialog open={resultsDialogOpen} onClose={() => setResultsDialogOpen(false)} maxWidth="md" fullWidth>
          <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.emerald }}>
            <icons_material_1.TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }}/>
            Результати Симуляції
          </material_1.DialogTitle>
          <material_1.DialogContent>
            {selectedResults && (<material_1.Box>
                {Object.entries(selectedResults).map(([key, value]) => (<material_1.Box key={key} sx={{ mb: 2 }}>
                    <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                      {key.replace('_', ' ').toUpperCase()}: {typeof value === 'number'
                    ? value.toFixed(3)
                    : String(value)}
                    </material_1.Typography>
                  </material_1.Box>))}
              </material_1.Box>)}
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={() => setResultsDialogOpen(false)}>
              Закрити
            </material_1.Button>
          </material_1.DialogActions>
        </material_1.Dialog>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.RealitySimulatorModule = RealitySimulatorModule;
