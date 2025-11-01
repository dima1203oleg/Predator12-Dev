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
exports.AISupervisionModule = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const THREE = __importStar(require("three"));
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AISupervisionModule = ({ agents = [] }) => {
    const mountRef = (0, react_1.useRef)(null);
    const sceneRef = (0, react_1.useRef)();
    const rendererRef = (0, react_1.useRef)();
    const animationIdRef = (0, react_1.useRef)();
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [show3D, setShow3D] = (0, react_1.useState)(true);
    const [autoRotate, setAutoRotate] = (0, react_1.useState)(true);
    // TODO: Отримувати agents з реального API
    // const agents = await aiSupervisionAPI.getAgents();
    const allAgents = agents.length > 0 ? agents : [];
    (0, react_1.useEffect)(() => {
        if (!mountRef.current || !show3D)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(800, 600);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(new THREE.Color(nexusTheme_1.nexusColors.emerald), 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        // Create central hub
        const hubGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const hubMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(nexusTheme_1.nexusColors.emerald),
            transparent: true,
            opacity: 0.8,
            emissive: new THREE.Color(nexusTheme_1.nexusColors.emerald),
            emissiveIntensity: 0.2
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        scene.add(hub);
        // Create agent nodes
        const agentMeshes = {};
        const connections = [];
        allAgents.forEach((agent) => {
            // Agent node
            const nodeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            let nodeColor;
            switch (agent.status) {
                case 'active':
                    nodeColor = nexusTheme_1.nexusColors.emerald;
                    break;
                case 'idle':
                    nodeColor = nexusTheme_1.nexusColors.sapphire;
                    break;
                case 'error':
                    nodeColor = nexusTheme_1.nexusColors.crimson;
                    break;
                default:
                    nodeColor = nexusTheme_1.nexusColors.shadow;
            }
            const nodeMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(nodeColor),
                transparent: true,
                opacity: 0.8,
                emissive: new THREE.Color(nodeColor),
                emissiveIntensity: 0.1
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(agent.position.x, agent.position.y, agent.position.z);
            agentMeshes[agent.id] = node;
            scene.add(node);
            // Connection to hub
            const points = [hub.position, node.position];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: new THREE.Color(nodeColor),
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            connections.push(line);
            scene.add(line);
            // Agent type indicator (ring around node)
            let ringColor;
            switch (agent.type) {
                case 'supervisor':
                    ringColor = nexusTheme_1.nexusColors.amethyst;
                    break;
                case 'worker':
                    ringColor = nexusTheme_1.nexusColors.sapphire;
                    break;
                case 'monitor':
                    ringColor = nexusTheme_1.nexusColors.warning;
                    break;
                case 'analyzer':
                    ringColor = nexusTheme_1.nexusColors.info;
                    break;
                default:
                    ringColor = nexusTheme_1.nexusColors.nebula;
            }
            const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(ringColor),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(node.position);
            ring.lookAt(camera.position);
            scene.add(ring);
        });
        // Animation loop
        let time = 0;
        const animate = () => {
            time += 0.01;
            // Rotate hub
            hub.rotation.x += 0.01;
            hub.rotation.y += 0.02;
            // Pulse hub based on activity
            const scale = 1 + Math.sin(time * 2) * 0.1;
            hub.scale.setScalar(scale);
            // Animate agent nodes
            Object.values(agentMeshes).forEach((mesh, index) => {
                mesh.rotation.x += 0.02;
                mesh.rotation.y += 0.01;
                // Floating animation
                const offset = index * 0.5;
                mesh.position.y += Math.sin(time + offset) * 0.01;
            });
            // Auto-rotate camera
            if (autoRotate) {
                camera.position.x = Math.cos(time * 0.2) * 12;
                camera.position.z = Math.sin(time * 0.2) * 12;
                camera.lookAt(0, 0, 0);
            }
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
    }, [show3D, autoRotate, selectedAgent]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return nexusTheme_1.nexusColors.emerald;
            case 'idle': return nexusTheme_1.nexusColors.sapphire;
            case 'error': return nexusTheme_1.nexusColors.crimson;
            default: return nexusTheme_1.nexusColors.shadow;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'supervisor': return nexusTheme_1.nexusColors.amethyst;
            case 'worker': return nexusTheme_1.nexusColors.sapphire;
            case 'monitor': return nexusTheme_1.nexusColors.warning;
            case 'analyzer': return nexusTheme_1.nexusColors.info;
            default: return nexusTheme_1.nexusColors.nebula;
        }
    };
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.sapphire,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusTheme_1.nexusColors.sapphire}`
        }}>
          <icons_material_1.Psychology sx={{ mr: 2, verticalAlign: 'middle' }}/>
          Орбітальний Вулик ШІ
        </material_1.Typography>

        <material_1.Grid container spacing={3}>
          {/* 3D Agent Visualization */}
          <material_1.Grid item xs={12} lg={8}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    Рій Агентів MAS
                  </material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', gap: 2 }}>
                    <material_1.FormControlLabel control={<material_1.Switch checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="Авто-обертання" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
                    <material_1.FormControlLabel control={<material_1.Switch checked={show3D} onChange={(e) => setShow3D(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="3D Режим" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
                  </material_1.Box>
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
                      2D Network View (Coming Soon)
                    </material_1.Typography>
                  </material_1.Box>)}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Agent Statistics */}
          <material_1.Grid item xs={12} lg={4}>
            <material_1.Card className="holographic" sx={{ mb: 2 }}>
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.amethyst }}>
                  Статистика Системи
                </material_1.Typography>

                <material_1.Box sx={{ mb: 2 }}>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                    Активні агенти: {allAgents.filter(a => a.status === 'active').length} / {allAgents.length}
                  </material_1.Typography>
                  <material_1.LinearProgress variant="determinate" value={(allAgents.filter(a => a.status === 'active').length / allAgents.length) * 100} sx={{
            backgroundColor: nexusTheme_1.nexusColors.darkMatter,
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.emerald,
            },
        }}/>
                </material_1.Box>

                <material_1.Box sx={{ mb: 2 }}>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                    Середня продуктивність: {(allAgents.reduce((acc, a) => acc + a.performance, 0) / allAgents.length).toFixed(1)}%
                  </material_1.Typography>
                  <material_1.LinearProgress variant="determinate" value={allAgents.reduce((acc, a) => acc + a.performance, 0) / allAgents.length} sx={{
            backgroundColor: nexusTheme_1.nexusColors.darkMatter,
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.sapphire,
            },
        }}/>
                </material_1.Box>

                <material_1.Box sx={{ mb: 2 }}>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                    Використання пам'яті: {(allAgents.reduce((acc, a) => acc + a.memory, 0) / allAgents.length).toFixed(1)}%
                  </material_1.Typography>
                  <material_1.LinearProgress variant="determinate" value={allAgents.reduce((acc, a) => acc + a.memory, 0) / allAgents.length} sx={{
            backgroundColor: nexusTheme_1.nexusColors.darkMatter,
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.warning,
            },
        }}/>
                </material_1.Box>

                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                  Загальна кількість завдань: {allAgents.reduce((acc, a) => acc + a.tasks, 0)}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>

            {/* Agent List */}
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.emerald }}>
                  Список Агентів
                </material_1.Typography>

                <material_1.TableContainer component={material_1.Paper} sx={{ backgroundColor: 'transparent' }}>
                  <material_1.Table size="small">
                    <material_1.TableHead>
                      <material_1.TableRow>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Агент
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Статус
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Дії
                        </material_1.TableCell>
                      </material_1.TableRow>
                    </material_1.TableHead>
                    <material_1.TableBody>
                      {allAgents.map((agent) => (<material_1.TableRow key={agent.id}>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Box>
                              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                                {agent.name}
                              </material_1.Typography>
                              <material_1.Chip label={agent.type} size="small" sx={{
                backgroundColor: getTypeColor(agent.type),
                color: nexusTheme_1.nexusColors.frost,
                fontSize: '0.7rem'
            }}/>
                            </material_1.Box>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Chip label={agent.status} size="small" sx={{
                backgroundColor: getStatusColor(agent.status),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Box sx={{ display: 'flex', gap: 0.5 }}>
                              <material_1.Tooltip title="Переглянути деталі">
                                <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                                  <icons_material_1.Visibility fontSize="small"/>
                                </material_1.IconButton>
                              </material_1.Tooltip>
                              <material_1.Tooltip title="Перезапустити">
                                <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.warning }}>
                                  <icons_material_1.Refresh fontSize="small"/>
                                </material_1.IconButton>
                              </material_1.Tooltip>
                            </material_1.Box>
                          </material_1.TableCell>
                        </material_1.TableRow>))}
                    </material_1.TableBody>
                  </material_1.Table>
                </material_1.TableContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.AISupervisionModule = AISupervisionModule;
