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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const framer_motion_1 = require("framer-motion");
const react_2 = require("@use-gesture/react");
const react_hotkeys_hook_1 = require("react-hotkeys-hook");
const THREE = __importStar(require("three"));
const material_1 = require("@mui/material");
const Search_1 = __importDefault(require("@mui/icons-material/Search"));
const Visibility_1 = __importDefault(require("@mui/icons-material/Visibility"));
const VisibilityOff_1 = __importDefault(require("@mui/icons-material/VisibilityOff"));
const PlayArrow_1 = __importDefault(require("@mui/icons-material/PlayArrow"));
const Pause_1 = __importDefault(require("@mui/icons-material/Pause"));
// 3D вузол системи як "планета"
const SystemPlanet = ({ node, onClick, isSelected, isFiltered }) => {
    const meshRef = (0, react_1.useRef)(null);
    const [hovered, setHovered] = (0, react_1.useState)(false);
    // Анімація обертання та пульсації
    (0, fiber_1.useFrame)((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            // Пульсація залежно від статусу
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
            const scale = node.status === 'processing' ? pulse * 1.2 :
                node.status === 'error' ? pulse * 1.3 : pulse;
            meshRef.current.scale.setScalar(scale * (isSelected ? 1.4 : 1));
        }
    });
    // Кольори залежно від типу та статусу
    const getNodeColor = () => {
        if (node.status === 'error')
            return '#ff0066';
        if (node.status === 'warning')
            return '#ffaa00';
        if (node.status === 'processing')
            return '#00aaff';
        switch (node.type) {
            case 'frontend': return '#00ff66';
            case 'service': return '#0099ff';
            case 'database': return '#9900ff';
            case 'queue': return '#ff9900';
            case 'api': return '#00ffaa';
            default: return '#ffffff';
        }
    };
    const getNodeSize = () => {
        switch (node.type) {
            case 'database': return 0.8;
            case 'queue': return 0.6;
            case 'service': return 0.7;
            case 'frontend': return 0.9;
            default: return 0.5;
        }
    };
    if (isFiltered)
        return null;
    return (<group position={node.position}>
      <mesh ref={meshRef} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={getNodeSize()}>
        <sphereGeometry args={[1, 32, 32]}/>
        <meshStandardMaterial color={getNodeColor()} transparent opacity={hovered ? 0.9 : 0.7} emissive={getNodeColor()} emissiveIntensity={hovered ? 0.3 : 0.1}/>
      </mesh>

      {/* Sparkles для активних вузлів */}
      {node.status === 'processing' && (<drei_1.Sparkles count={20} scale={[2, 2, 2]} size={1} speed={0.6} color={getNodeColor()}/>)}

      {/* Назва вузла */}
      <drei_1.Html position={[0, 1.5, 0]} center>
        <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: getNodeColor(),
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: `1px solid ${getNodeColor()}`,
            textAlign: 'center',
            minWidth: '80px'
        }}>
          {node.name}
          <br />
          <span style={{ fontSize: '10px', opacity: 0.8 }}>
            {node.metrics.latency}ms | {node.metrics.throughput}/s
          </span>
        </framer_motion_1.motion.div>
      </drei_1.Html>
    </group>);
};
// Анімований потік даних між вузлами
const DataFlowLine = ({ flow, nodes, isVisible }) => {
    const lineRef = (0, react_1.useRef)(null);
    const [particles, setParticles] = (0, react_1.useState)([]);
    const fromNode = nodes.find(n => n.id === flow.from);
    const toNode = nodes.find(n => n.id === flow.to);
    (0, react_1.useEffect)(() => {
        if (fromNode && toNode && isVisible) {
            // Створюємо частинки для анімації потоку
            const particleCount = Math.min(flow.volume, 10);
            const newParticles = [];
            for (let i = 0; i < particleCount; i++) {
                const progress = i / particleCount;
                const position = new THREE.Vector3()
                    .lerpVectors(new THREE.Vector3(...fromNode.position), new THREE.Vector3(...toNode.position), progress);
                newParticles.push(position);
            }
            setParticles(newParticles);
        }
    }, [flow, fromNode, toNode, isVisible]);
    (0, fiber_1.useFrame)((state, delta) => {
        if (particles.length > 0 && fromNode && toNode) {
            // Анімуємо частинки по лінії
            setParticles(prevParticles => prevParticles.map((particle, index) => {
                const speed = flow.status === 'active' ? 0.02 : 0.005;
                const progress = (index / prevParticles.length + state.clock.elapsedTime * speed) % 1;
                return new THREE.Vector3()
                    .lerpVectors(new THREE.Vector3(...fromNode.position), new THREE.Vector3(...toNode.position), progress);
            }));
        }
    });
    if (!fromNode || !toNode || !isVisible)
        return null;
    const getFlowColor = () => {
        if (flow.status === 'error')
            return '#ff0066';
        switch (flow.dataType) {
            case 'import': return '#00ff66';
            case 'query': return '#0099ff';
            case 'sync': return '#ffaa00';
            case 'alert': return '#ff6600';
            default: return '#ffffff';
        }
    };
    return (<group ref={lineRef}>
      {/* Лінія з'єднання */}
      <drei_1.Line points={[fromNode.position, toNode.position]} color={getFlowColor()} lineWidth={flow.volume / 10} transparent opacity={0.6}/>

      {/* Анімовані частинки */}
      {particles.map((position, index) => (<mesh key={index} position={position.toArray()}>
          <sphereGeometry args={[0.05, 8, 8]}/>
          <meshBasicMaterial color={getFlowColor()} transparent opacity={0.8}/>
        </mesh>))}
    </group>);
};
// Головний компонент Data Flow Map
const DataFlowMap = ({ nodes, flows, onNodeClick, onFlowClick, enableVoiceControl = true }) => {
    const [selectedNode, setSelectedNode] = (0, react_1.useState)(null);
    const [filteredNodeTypes, setFilteredNodeTypes] = (0, react_1.useState)(new Set());
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    const [autoRotate, setAutoRotate] = (0, react_1.useState)(true);
    const [showMetrics, setShowMetrics] = (0, react_1.useState)(true);
    // Фільтрація вузлів
    const filteredNodes = nodes.filter(node => {
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !filteredNodeTypes.has(node.type);
        return matchesSearch && matchesType;
    });
    // Обробка кліку по вузлу
    const handleNodeClick = (0, react_1.useCallback)((node) => {
        setSelectedNode(node);
        onNodeClick === null || onNodeClick === void 0 ? void 0 : onNodeClick(node);
    }, [onNodeClick]);
    // Жести
    const bind = (0, react_2.useGesture)({
        onPinch: ({ offset: [scale] }) => {
            // Zoom logic handled by OrbitControls
        },
        onDoubleClick: () => {
            setSelectedNode(null);
        }
    });
    // Гарячі клавіші
    (0, react_hotkeys_hook_1.useHotkeys)('escape', () => setSelectedNode(null));
    (0, react_hotkeys_hook_1.useHotkeys)('space', () => setIsPaused(!isPaused));
    (0, react_hotkeys_hook_1.useHotkeys)('r', () => setAutoRotate(!autoRotate));
    (0, react_hotkeys_hook_1.useHotkeys)('m', () => setShowMetrics(!showMetrics));
    // Голосові команди
    (0, react_1.useEffect)(() => {
        if (enableVoiceControl && 'webkitSpeechRecognition' in window) {
            // Voice control implementation would go here
        }
    }, [enableVoiceControl]);
    return (<material_1.Box sx={{ display: 'flex', height: '100vh', background: '#0a0a0f' }}>
      {/* Бічна панель з контролами */}
      <material_1.Paper elevation={3} sx={{
            width: 300,
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #333',
            p: 2,
            overflowY: 'auto'
        }}>
        {/* Пошук */}
        <material_1.TextField fullWidth placeholder="Пошук вузлів..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{
            startAdornment: <Search_1.default sx={{ color: '#00ff66', mr: 1 }}/>
        }} sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
                color: '#00ff66',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#00ff66' },
                '&.Mui-focused fieldset': { borderColor: '#00ff66' }
            }
        }}/>

        {/* Фільтри */}
        <material_1.Typography variant="h6" sx={{ color: '#00ff66', mb: 1 }}>
          Фільтри
        </material_1.Typography>

        {['service', 'database', 'queue', 'api', 'frontend'].map(type => (<material_1.FormControlLabel key={type} control={<material_1.Switch checked={!filteredNodeTypes.has(type)} onChange={(e) => {
                    const newFiltered = new Set(filteredNodeTypes);
                    if (e.target.checked) {
                        newFiltered.delete(type);
                    }
                    else {
                        newFiltered.add(type);
                    }
                    setFilteredNodeTypes(newFiltered);
                }} sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#00ff66'
                    }
                }}/>} label={type} sx={{ color: '#ccc', display: 'block' }}/>))}

        {/* Контроли */}
        <material_1.Box sx={{ mt: 3 }}>
          <material_1.Typography variant="h6" sx={{ color: '#00ff66', mb: 1 }}>
            Контроли
          </material_1.Typography>

          <material_1.IconButton onClick={() => setIsPaused(!isPaused)} sx={{ color: isPaused ? '#ff6600' : '#00ff66', mr: 1 }}>
            {isPaused ? <PlayArrow_1.default /> : <Pause_1.default />}
          </material_1.IconButton>

          <material_1.IconButton onClick={() => setShowMetrics(!showMetrics)} sx={{ color: showMetrics ? '#00ff66' : '#666' }}>
            {showMetrics ? <Visibility_1.default /> : <VisibilityOff_1.default />}
          </material_1.IconButton>
        </material_1.Box>

        {/* Інформація про вибраний вузол */}
        {selectedNode && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
            <material_1.Card sx={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66' }}>
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ color: '#00ff66' }}>
                  {selectedNode.name}
                </material_1.Typography>
                <material_1.Chip label={selectedNode.type} size="small" sx={{ background: '#00ff66', color: '#000', mb: 1 }}/>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Статус: <span style={{ color: '#00ff66' }}>{selectedNode.status}</span>
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Затримка: {selectedNode.metrics.latency}ms
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Пропускна здатність: {selectedNode.metrics.throughput}/s
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Помилки: {selectedNode.metrics.errors}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>)}

        {/* Список потоків */}
        <material_1.Typography variant="h6" sx={{ color: '#00ff66', mt: 3, mb: 1 }}>
          Активні потоки
        </material_1.Typography>
        <material_1.List dense>
          {flows.filter(f => f.status === 'active').map(flow => (<material_1.ListItem key={flow.id} button onClick={() => onFlowClick === null || onFlowClick === void 0 ? void 0 : onFlowClick(flow)} sx={{
                border: '1px solid #333',
                borderRadius: 1,
                mb: 1,
                '&:hover': { background: 'rgba(0, 255, 102, 0.1)' }
            }}>
              <material_1.ListItemText primary={`${flow.from} → ${flow.to}`} secondary={`${flow.dataType} | ${flow.volume} req/s`} primaryTypographyProps={{ color: '#00ff66', fontSize: '14px' }} secondaryTypographyProps={{ color: '#ccc', fontSize: '12px' }}/>
            </material_1.ListItem>))}
        </material_1.List>
      </material_1.Paper>

      {/* 3D сцена */}
      <material_1.Box {...bind()} sx={{ flex: 1, position: 'relative' }}>
        <fiber_1.Canvas camera={{ position: [0, 0, 15], fov: 75 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={0.2}/>
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ff66"/>
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0099ff"/>

          {/* Вузли системи */}
          {filteredNodes.map(node => (<SystemPlanet key={node.id} node={node} onClick={() => handleNodeClick(node)} isSelected={(selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.id) === node.id} isFiltered={filteredNodeTypes.has(node.type)}/>))}

          {/* Потоки даних */}
          {!isPaused && flows.map(flow => {
            var _a;
            return (<DataFlowLine key={flow.id} flow={flow} nodes={nodes} isVisible={!filteredNodeTypes.has(((_a = nodes.find(n => n.id === flow.from)) === null || _a === void 0 ? void 0 : _a.type) || '')}/>);
        })}

          <drei_1.OrbitControls autoRotate={autoRotate && !selectedNode} autoRotateSpeed={0.5} enableZoom={true} enablePan={true} maxDistance={30} minDistance={5}/>
        </fiber_1.Canvas>

        {/* Оверлей з підказками */}
        <material_1.Box sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
          <material_1.Typography variant="caption" sx={{
            color: '#666',
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: 1
        }}>
            ESC: скасувати вибір | SPACE: пауза | R: обертання | M: метрики
          </material_1.Typography>

          <material_1.Typography variant="caption" sx={{
            color: '#00ff66',
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: 1
        }}>
            Вузлів: {filteredNodes.length} | Потоків: {flows.filter(f => f.status === 'active').length}
          </material_1.Typography>
        </material_1.Box>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = DataFlowMap;
