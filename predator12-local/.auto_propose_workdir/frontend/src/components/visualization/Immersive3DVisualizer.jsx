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
exports.Immersive3DVisualizer = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const generateSampleData = () => {
    const nodeTypes = ['server', 'database', 'ai-agent', 'user', 'process'];
    const statuses = ['active', 'warning', 'error', 'idle'];
    const colors = ['#667eea', '#764ba2', '#ff6b35', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];
    return Array.from({ length: 50 }, (_, i) => ({
        id: `node-${i}`,
        name: `Node ${i + 1}`,
        type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
        position: {
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20
        },
        connections: Array.from({ length: Math.floor(Math.random() * 5) }, () => `node-${Math.floor(Math.random() * 50)}`),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        metrics: {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            network: Math.random() * 100,
            performance: Math.random() * 100
        },
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 0.5
    }));
};
const Immersive3DVisualizer = ({ data = generateSampleData(), onNodeSelect, onSceneChange, enableVR = true, enableAR = true }) => {
    const canvasRef = (0, react_1.useRef)(null);
    const animationRef = (0, react_1.useRef)();
    const [isPlaying, setIsPlaying] = (0, react_1.useState)(true);
    const [selectedNode, setSelectedNode] = (0, react_1.useState)(null);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [cameraMode, setCameraMode] = (0, react_1.useState)('orbit');
    const [renderMode, setRenderMode] = (0, react_1.useState)('solid');
    const [isFullscreen, setIsFullscreen] = (0, react_1.useState)(false);
    const [sceneConfig, setSceneConfig] = (0, react_1.useState)({
        gridVisible: true,
        axesVisible: true,
        animationSpeed: 1,
        cameraPosition: { x: 0, y: 0, z: 30 },
        lightIntensity: 1,
        fogEnabled: true,
        particlesEnabled: true,
        autoRotate: true,
        quality: 'high'
    });
    // 3D Scene state
    const [camera, setCamera] = (0, react_1.useState)({
        position: { x: 0, y: 0, z: 30 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 75
    });
    const [mousePosition, setMousePosition] = (0, react_1.useState)({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [zoom, setZoom] = (0, react_1.useState)(1);
    // AI Асистент для 3D навігації
    const [aiAssistantActive, setAiAssistantActive] = (0, react_1.useState)(false);
    const [aiSuggestions, setAiSuggestions] = (0, react_1.useState)([]);
    const [voiceControlActive, setVoiceControlActive] = (0, react_1.useState)(false);
    const [hapticFeedback, setHapticFeedback] = (0, react_1.useState)(true);
    // Інтерактивні режими
    const [interactionMode, setInteractionMode] = (0, react_1.useState)('explore');
    const [multiUserMode, setMultiUserMode] = (0, react_1.useState)(false);
    const [realTimeSync, setRealTimeSync] = (0, react_1.useState)(false);
    // Покращений рендеринг
    const [rayTracingEnabled, setRayTracingEnabled] = (0, react_1.useState)(false);
    const [particleEffects, setParticleEffects] = (0, react_1.useState)(true);
    const [dynamicLighting, setDynamicLighting] = (0, react_1.useState)(true);
    const [shadows, setShadows] = (0, react_1.useState)(true);
    // Покращений рендеринг
    const [rayTracingEnabled, setRayTracingEnabled] = (0, react_1.useState)(false);
    const [particleEffects, setParticleEffects] = (0, react_1.useState)(true);
    const [dynamicLighting, setDynamicLighting] = (0, react_1.useState)(true);
    const [shadows, setShadows] = (0, react_1.useState)(true);
    // AI аналітика сцени
    const analyzeScene = () => {
        const suggestions = [
            "🎯 Виявлено кластер з високою активністю в правому секторі",
            "⚡ Рекомендую збільшити масштаб вузла 'AI-Agents' для детального аналізу",
            "🔍 Помічено аномальну активність в мережевому трафіку",
            "📊 Оптимальний кут огляду: 45° для кращого аналізу зв'язків",
            "🌐 Переключіться на тепловий режим для візуалізації навантаження"
        ];
        setAiSuggestions(suggestions.slice(0, 3));
    };
    // Голосові команди для 3D навігації
    const handleVoiceCommand = (command) => {
        const lowerCommand = command.toLowerCase();
        if (lowerCommand.includes('zoom in') || lowerCommand.includes('наблизити')) {
            setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { cameraPosition: Object.assign(Object.assign({}, prev.cameraPosition), { z: prev.cameraPosition.z * 0.8 }) })));
        }
        else if (lowerCommand.includes('zoom out') || lowerCommand.includes('віддалити')) {
            setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { cameraPosition: Object.assign(Object.assign({}, prev.cameraPosition), { z: prev.cameraPosition.z * 1.2 }) })));
        }
        else if (lowerCommand.includes('rotate') || lowerCommand.includes('обертати')) {
            setCameraMode('orbit');
        }
        else if (lowerCommand.includes('analyze') || lowerCommand.includes('аналіз')) {
            setInteractionMode('analyze');
            analyzeScene();
        }
    };
    // Ініціалізація AI асистента
    (0, react_1.useEffect)(() => {
        if (aiAssistantActive) {
            analyzeScene();
            const interval = setInterval(analyzeScene, 10000); // Оновлення кожні 10 секунд
            return () => clearInterval(interval);
        }
    }, [aiAssistantActive, data]);
    // Memoized calculations
    const processedNodes = (0, react_1.useMemo)(() => {
        return data.map(node => (Object.assign(Object.assign({}, node), { screenPosition: project3DTo2D(node.position, camera, canvasRef.current) })));
    }, [data, camera]);
    // 3D to 2D projection
    function project3DTo2D(pos3D, cam, canvas) {
        if (!canvas)
            return { x: 0, y: 0, visible: false };
        const width = canvas.width;
        const height = canvas.height;
        // Simple perspective projection
        const distance = cam.position.z;
        const scale = distance / (distance + pos3D.z);
        return {
            x: (pos3D.x * scale * zoom + width / 2),
            y: (pos3D.y * scale * zoom + height / 2),
            visible: pos3D.z > -distance && scale > 0.1
        };
    }
    // Animation loop
    (0, react_1.useEffect)(() => {
        if (!canvasRef.current || !isPlaying)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let time = 0;
        const animate = () => {
            // Clear canvas
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw grid if enabled
            if (sceneConfig.gridVisible) {
                drawGrid(ctx, canvas);
            }
            // Draw connections
            drawConnections(ctx, processedNodes);
            // Draw nodes
            drawNodes(ctx, processedNodes, time);
            // Draw particles if enabled
            if (sceneConfig.particlesEnabled) {
                drawParticles(ctx, canvas, time);
            }
            // Update camera for auto-rotation
            if (sceneConfig.autoRotate) {
                setCamera(prev => (Object.assign(Object.assign({}, prev), { rotation: Object.assign(Object.assign({}, prev.rotation), { y: prev.rotation.y + 0.01 * sceneConfig.animationSpeed }) })));
            }
            time += sceneConfig.animationSpeed;
            animationRef.current = requestAnimationFrame(animate);
        };
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        animate();
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, sceneConfig, processedNodes, zoom]);
    const drawGrid = (ctx, canvas) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        const steps = 20;
        for (let i = -steps; i <= steps; i++) {
            const pos = i * (gridSize / steps);
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 + pos * zoom, 0);
            ctx.lineTo(canvas.width / 2 + pos * zoom, canvas.height);
            ctx.stroke();
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2 + pos * zoom);
            ctx.lineTo(canvas.width, canvas.height / 2 + pos * zoom);
            ctx.stroke();
        }
    };
    const drawConnections = (ctx, nodes) => {
        nodes.forEach(node => {
            if (!node.screenPosition.visible)
                return;
            node.connections.forEach((connId) => {
                const connectedNode = nodes.find(n => n.id === connId);
                if (!connectedNode || !connectedNode.screenPosition.visible)
                    return;
                ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(node.screenPosition.x, node.screenPosition.y);
                ctx.lineTo(connectedNode.screenPosition.x, connectedNode.screenPosition.y);
                ctx.stroke();
            });
        });
    };
    const drawNodes = (ctx, nodes, time) => {
        nodes.forEach(node => {
            if (!node.screenPosition.visible)
                return;
            const { x, y } = node.screenPosition;
            const radius = node.size * 10 * zoom;
            // Node glow effect
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
            gradient.addColorStop(0, node.color + '80');
            gradient.addColorStop(1, node.color + '00');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            ctx.fill();
            // Main node
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            // Status indicator
            const statusColor = {
                active: '#4CAF50',
                warning: '#FF9800',
                error: '#F44336',
                idle: '#9E9E9E'
            }[node.status];
            ctx.fillStyle = statusColor;
            ctx.beginPath();
            ctx.arc(x + radius * 0.7, y - radius * 0.7, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Pulsing effect for active nodes
            if (node.status === 'active') {
                const pulse = Math.sin(time * 0.05) * 0.5 + 0.5;
                ctx.strokeStyle = node.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, radius + pulse * 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            // Node label
            if (radius > 5) {
                ctx.fillStyle = 'white';
                ctx.font = `${Math.max(8, radius / 2)}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(node.name, x, y + radius + 15);
            }
        });
    };
    const drawParticles = (ctx, canvas, time) => {
        const particleCount = 100;
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.sin(time * 0.01 + i) * canvas.width / 4) + canvas.width / 2;
            const y = (Math.cos(time * 0.015 + i) * canvas.height / 4) + canvas.height / 2;
            const alpha = (Math.sin(time * 0.02 + i) + 1) / 4;
            ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    };
    // Event handlers
    const handleCanvasClick = (event) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        // Find clicked node
        const clickedNode = processedNodes.find(node => {
            if (!node.screenPosition.visible)
                return false;
            const distance = Math.sqrt(Math.pow(clickX - node.screenPosition.x, 2) +
                Math.pow(clickY - node.screenPosition.y, 2));
            return distance <= node.size * 10 * zoom;
        });
        if (clickedNode) {
            setSelectedNode(clickedNode);
            onNodeSelect === null || onNodeSelect === void 0 ? void 0 : onNodeSelect(clickedNode);
        }
    };
    const handleMouseMove = (event) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const newMousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        if (isDragging && cameraMode === 'free') {
            const deltaX = (newMousePos.x - mousePosition.x) * 0.01;
            const deltaY = (newMousePos.y - mousePosition.y) * 0.01;
            setCamera(prev => (Object.assign(Object.assign({}, prev), { rotation: Object.assign(Object.assign({}, prev.rotation), { x: prev.rotation.x - deltaY, y: prev.rotation.y + deltaX }) })));
        }
        setMousePosition(newMousePos);
    };
    const handleWheel = (event) => {
        event.preventDefault();
        const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(0.1, Math.min(5, prev * zoomDelta)));
    };
    const toggleFullscreen = () => {
        var _a;
        if (!document.fullscreenElement) {
            (_a = canvasRef.current) === null || _a === void 0 ? void 0 : _a.requestFullscreen();
            setIsFullscreen(true);
        }
        else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };
    const resetCamera = () => {
        setCamera({
            position: { x: 0, y: 0, z: 30 },
            rotation: { x: 0, y: 0, z: 0 },
            fov: 75
        });
        setZoom(1);
    };
    const takeScreenshot = () => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const link = document.createElement('a');
        link.download = `nexus-3d-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };
    const getNodeTypeIcon = (type) => {
        switch (type) {
            case 'server': return <icons_material_1.Storage />;
            case 'database': return <icons_material_1.Memory />;
            case 'ai-agent': return <icons_material_1.Psychology />;
            case 'user': return <icons_material_1.Memory />;
            case 'process': return <icons_material_1.TrendingUp />;
            default: return <icons_material_1.Cloud />;
        }
    };
    return (<material_1.Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Controls */}
      <material_1.Paper elevation={0} sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
        }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.Typography variant="h5" sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
        }}>
            🌌 3D Immersive Visualizer
          </material_1.Typography>
          <material_1.Chip icon={<icons_material_1.ThreeDRotation />} label={`${data.length} Nodes`} sx={{
            bgcolor: 'rgba(102, 126, 234, 0.2)',
            color: 'white'
        }}/>
        </material_1.Box>

        <material_1.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* Playback Controls */}
          <material_1.ButtonGroup size="small">
            <material_1.Button onClick={() => setIsPlaying(!isPlaying)} startIcon={isPlaying ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />}>
              {isPlaying ? 'Pause' : 'Play'}
            </material_1.Button>
            <material_1.Button onClick={() => setIsPlaying(false)} startIcon={<icons_material_1.Stop />}>
              Stop
            </material_1.Button>
          </material_1.ButtonGroup>

          {/* Camera Controls */}
          <material_1.ButtonGroup size="small">
            <material_1.Button variant={cameraMode === 'orbit' ? 'contained' : 'outlined'} onClick={() => setCameraMode('orbit')}>
              Orbit
            </material_1.Button>
            <material_1.Button variant={cameraMode === 'free' ? 'contained' : 'outlined'} onClick={() => setCameraMode('free')}>
              Free
            </material_1.Button>
            <material_1.Button variant={cameraMode === 'follow' ? 'contained' : 'outlined'} onClick={() => setCameraMode('follow')}>
              Follow
            </material_1.Button>
          </material_1.ButtonGroup>

          {/* Render Mode */}
          <material_1.ButtonGroup size="small">
            <material_1.Button variant={renderMode === 'solid' ? 'contained' : 'outlined'} onClick={() => setRenderMode('solid')}>
              Solid
            </material_1.Button>
            <material_1.Button variant={renderMode === 'wireframe' ? 'contained' : 'outlined'} onClick={() => setRenderMode('wireframe')}>
              Wire
            </material_1.Button>
            <material_1.Button variant={renderMode === 'points' ? 'contained' : 'outlined'} onClick={() => setRenderMode('points')}>
              Points
            </material_1.Button>
          </material_1.ButtonGroup>

          {/* Action Buttons */}
          <material_1.Tooltip title="Reset Camera">
            <material_1.IconButton onClick={resetCamera}>
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="Screenshot">
            <material_1.IconButton onClick={takeScreenshot}>
              <icons_material_1.CameraAlt />
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="Settings">
            <material_1.IconButton onClick={() => setShowSettings(true)}>
              <icons_material_1.Settings />
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <material_1.IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <icons_material_1.FullscreenExit /> : <icons_material_1.Fullscreen />}
            </material_1.IconButton>
          </material_1.Tooltip>

          {/* VR/AR Buttons */}
          {enableVR && (<material_1.Tooltip title="Enter VR">
              <material_1.IconButton>
                <icons_material_1.ViewInAr />
              </material_1.IconButton>
            </material_1.Tooltip>)}
        </material_1.Box>
      </material_1.Paper>

      {/* Main 3D Canvas */}
      <material_1.Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{
            width: '100%',
            height: '100%',
            cursor: cameraMode === 'free' ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
            background: 'radial-gradient(circle at center, #0a0a2e 0%, #000000 100%)'
        }} onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} onWheel={handleWheel}/>

        {/* Zoom Indicator */}
        <material_1.Chip label={`Zoom: ${(zoom * 100).toFixed(0)}%`} size="small" sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white'
        }}/>

        {/* Camera Info */}
        <material_1.Paper sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            p: 1,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '0.8rem'
        }}>
          <material_1.Typography variant="caption" display="block">
            Camera: {cameraMode.toUpperCase()}
          </material_1.Typography>
          <material_1.Typography variant="caption" display="block">
            Mode: {renderMode.toUpperCase()}
          </material_1.Typography>
          <material_1.Typography variant="caption" display="block">
            Nodes: {data.length}
          </material_1.Typography>
        </material_1.Paper>
      </material_1.Box>

      {/* Node Details Panel */}
      <framer_motion_1.AnimatePresence>
        {selectedNode && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                zIndex: 1000
            }}>
            <material_1.Card sx={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${selectedNode.color}`,
                color: 'white'
            }}>
              <material_1.CardContent>
                <material_1.Grid container spacing={2} alignItems="center">
                  <material_1.Grid item>
                    <material_1.Avatar sx={{
                bgcolor: selectedNode.color,
                width: 60,
                height: 60
            }}>
                      {getNodeTypeIcon(selectedNode.type)}
                    </material_1.Avatar>
                  </material_1.Grid>
                  <material_1.Grid item xs>
                    <material_1.Typography variant="h6" fontWeight="bold">
                      {selectedNode.name}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Type: {selectedNode.type.toUpperCase()} | Status: {selectedNode.status.toUpperCase()}
                    </material_1.Typography>

                    <material_1.Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {Object.entries(selectedNode.metrics).map(([key, value]) => (<material_1.Box key={key} sx={{ minWidth: 80 }}>
                          <material_1.Typography variant="caption" display="block">
                            {key.toUpperCase()}
                          </material_1.Typography>
                          <material_1.Typography variant="h6" color={selectedNode.color}>
                            {value === null || value === void 0 ? void 0 : value.toFixed(1)}%
                          </material_1.Typography>
                        </material_1.Box>))}
                    </material_1.Box>
                  </material_1.Grid>
                  <material_1.Grid item>
                    <material_1.IconButton onClick={() => setSelectedNode(null)} sx={{ color: 'white' }}>
                      <icons_material_1.VisibilityOff />
                    </material_1.IconButton>
                  </material_1.Grid>
                </material_1.Grid>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* AI Assistant Panel */}
      <framer_motion_1.AnimatePresence>
        {aiAssistantActive && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} style={{
                position: 'absolute',
                top: 100,
                right: 20,
                width: 350,
                maxHeight: 'calc(100vh - 200px)',
                zIndex: 2000
            }}>
            <material_1.Card sx={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                overflowY: 'auto'
            }}>
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <icons_material_1.Psychology sx={{ mr: 1, color: 'white' }}/>
                  <material_1.Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    AI Асистент 3D
                  </material_1.Typography>
                  <material_1.IconButton size="small" onClick={() => setAiAssistantActive(false)} sx={{ ml: 'auto', color: 'white' }}>
                    <icons_material_1.Close />
                  </material_1.IconButton>
                </material_1.Box>

                <material_1.Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Інтелектуальний аналіз 3D сцени та рекомендації
                </material_1.Typography>

                {/* AI Suggestions */}
                <material_1.List dense sx={{ mb: 2 }}>
                  {aiSuggestions.map((suggestion, index) => (<material_1.ListItem key={index} sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1,
                    mb: 1,
                    p: 1
                }}>
                      <material_1.ListItemText primary={suggestion} sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }}/>
                    </material_1.ListItem>))}
                </material_1.List>

                {/* Quick Actions */}
                <material_1.Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Швидкі Дії:
                </material_1.Typography>
                <material_1.Grid container spacing={1}>
                  <material_1.Grid item xs={6}>
                    <material_1.Button fullWidth size="small" variant="outlined" onClick={() => setInteractionMode('analyze')} sx={{ color: 'white', borderColor: 'white' }}>
                      Аналіз
                    </material_1.Button>
                  </material_1.Grid>
                  <material_1.Grid item xs={6}>
                    <material_1.Button fullWidth size="small" variant="outlined" onClick={() => setRenderMode('wireframe')} sx={{ color: 'white', borderColor: 'white' }}>
                      Каркас
                    </material_1.Button>
                  </material_1.Grid>
                  <material_1.Grid item xs={6}>
                    <material_1.Button fullWidth size="small" variant="outlined" onClick={resetCamera} sx={{ color: 'white', borderColor: 'white' }}>
                      Скинути
                    </material_1.Button>
                  </material_1.Grid>
                  <material_1.Grid item xs={6}>
                    <material_1.Button fullWidth size="small" variant="outlined" onClick={takeScreenshot} sx={{ color: 'white', borderColor: 'white' }}>
                      Фото
                    </material_1.Button>
                  </material_1.Grid>
                </material_1.Grid>

                {/* Voice Control Status */}
                {voiceControlActive && (<material_1.Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <material_1.Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      <icons_material_1.Mic sx={{ mr: 1, fontSize: 16 }}/>
                      Голосове управління активне
                    </material_1.Typography>
                    <material_1.Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                      Скажіть: "наблизити", "обертати", "аналіз"
                    </material_1.Typography>
                  </material_1.Box>)}
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Settings Dialog */}
      <material_1.Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="md" fullWidth>
        <material_1.DialogTitle sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          🌌 3D Scene Settings
        </material_1.DialogTitle>
        <material_1.DialogContent sx={{ pt: 3 }}>
          <material_1.Grid container spacing={3}>
            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="h6" sx={{ mb: 2 }}>Visual Settings</material_1.Typography>

              <material_1.FormControlLabel control={<material_1.Switch checked={sceneConfig.gridVisible} onChange={(e) => setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { gridVisible: e.target.checked })))}/>} label="Show Grid" sx={{ display: 'block', mb: 2 }}/>

              <material_1.FormControlLabel control={<material_1.Switch checked={sceneConfig.particlesEnabled} onChange={(e) => setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { particlesEnabled: e.target.checked })))}/>} label="Particles" sx={{ display: 'block', mb: 2 }}/>

              <material_1.FormControlLabel control={<material_1.Switch checked={sceneConfig.autoRotate} onChange={(e) => setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { autoRotate: e.target.checked })))}/>} label="Auto Rotate" sx={{ display: 'block', mb: 2 }}/>

              <material_1.Typography variant="subtitle2" sx={{ mb: 1 }}>
                Animation Speed: {sceneConfig.animationSpeed}
              </material_1.Typography>
              <material_1.Slider value={sceneConfig.animationSpeed} onChange={(_, value) => setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { animationSpeed: value })))} min={0.1} max={3} step={0.1} sx={{ mb: 2 }}/>
            </material_1.Grid>

            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="h6" sx={{ mb: 2 }}>Performance</material_1.Typography>

              <material_1.Typography variant="subtitle2" sx={{ mb: 1 }}>
                Quality: {sceneConfig.quality.toUpperCase()}
              </material_1.Typography>
              <material_1.Slider value={['low', 'medium', 'high', 'ultra'].indexOf(sceneConfig.quality)} onChange={(_, value) => {
            const qualities = ['low', 'medium', 'high', 'ultra'];
            setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { quality: qualities[value] })));
        }} min={0} max={3} step={1} marks={[
            { value: 0, label: 'Low' },
            { value: 1, label: 'Med' },
            { value: 2, label: 'High' },
            { value: 3, label: 'Ultra' }
        ]} sx={{ mb: 2 }}/>

              <material_1.Typography variant="subtitle2" sx={{ mb: 1 }}>
                Light Intensity: {sceneConfig.lightIntensity}
              </material_1.Typography>
              <material_1.Slider value={sceneConfig.lightIntensity} onChange={(_, value) => setSceneConfig(prev => (Object.assign(Object.assign({}, prev), { lightIntensity: value })))} min={0.1} max={2} step={0.1} sx={{ mb: 2 }}/>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowSettings(false)}>
            Close
          </material_1.Button>
          <material_1.Button variant="contained" onClick={() => {
            onSceneChange === null || onSceneChange === void 0 ? void 0 : onSceneChange(sceneConfig);
            setShowSettings(false);
        }}>
            Apply
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.Immersive3DVisualizer = Immersive3DVisualizer;
exports.default = exports.Immersive3DVisualizer;
