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
exports.HolographicAIFace = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const nexusTheme_1 = require("../../theme/nexusTheme");
// Canvas Fallback Component for better performance
const CanvasFallbackFace = ({ emotion, isSpeaking, intensity, systemHealth, size }) => {
    const canvasRef = (0, react_1.useRef)(null);
    const animationRef = (0, react_1.useRef)();
    const fallbackSizeConfig = {
        small: { width: 120, height: 120 },
        medium: { width: 180, height: 180 },
        large: { width: 240, height: 240 }
    };
    const config = fallbackSizeConfig[size] || fallbackSizeConfig.small;
    (0, react_1.useEffect)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let time = 0;
        const animate = () => {
            time += 0.016; // ~60fps
            // Clear canvas
            ctx.clearRect(0, 0, config.width, config.height);
            const centerX = config.width / 2;
            const centerY = config.height / 2;
            const baseRadius = config.width * 0.3;
            // Emotion colors
            const emotionColors = {
                neutral: { primary: '#4FC3F7', secondary: '#29B6F6', accent: '#03A9F4' },
                success: { primary: '#66BB6A', secondary: '#4CAF50', accent: '#388E3C' },
                alert: { primary: '#FFA726', secondary: '#FF9800', accent: '#F57C00' },
                error: { primary: '#EF5350', secondary: '#F44336', accent: '#D32F2F' },
                processing: { primary: '#AB47BC', secondary: '#9C27B0', accent: '#7B1FA2' }
            };
            const colors = emotionColors[emotion] || emotionColors.neutral;
            // Animate particles in circle formation (simplified face outline)
            const particleCount = 24;
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
                const radius = baseRadius + Math.sin(time * 2 + i * 0.5) * 5;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius * 0.8; // Ellipse for face shape
                // Particle size based on speaking and emotion
                const particleSize = isSpeaking ? 3 + Math.sin(time * 10 + i) * 1 : 2;
                // Create gradient
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize * 2);
                gradient.addColorStop(0, colors.primary);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
            // Eyes (simplified)
            const eyeY = centerY - baseRadius * 0.3;
            const eyeSize = isSpeaking ? 4 + Math.sin(time * 8) * 1 : 3;
            // Left eye
            ctx.fillStyle = colors.accent;
            ctx.beginPath();
            ctx.arc(centerX - baseRadius * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            // Right eye
            ctx.beginPath();
            ctx.arc(centerX + baseRadius * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            // Mouth (animated for speaking)
            if (isSpeaking) {
                const mouthY = centerY + baseRadius * 0.2;
                const mouthWidth = 20 + Math.sin(time * 15) * 5;
                const mouthHeight = 8 + Math.sin(time * 12) * 3;
                ctx.strokeStyle = colors.secondary;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(centerX, mouthY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            // Aura effect (simplified)
            const auraRadius = baseRadius * 1.8 + Math.sin(time) * 10;
            const auraGradient = ctx.createRadialGradient(centerX, centerY, baseRadius, centerX, centerY, auraRadius);
            auraGradient.addColorStop(0, 'transparent');
            auraGradient.addColorStop(0.7, colors.primary + '20');
            auraGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
            ctx.fill();
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [emotion, isSpeaking, intensity, systemHealth, config]);
    return (<canvas ref={canvasRef} width={config.width} height={config.height} style={{
            width: config.width,
            height: config.height,
            borderRadius: '50%'
        }}/>);
};
{
    (cpuLoad > 0.8 || memoryUsage > 0.8) && (<material_1.Box sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            fontSize: '10px',
            color: nexusTheme_1.nexusColors.crimson,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '2px 6px',
            borderRadius: '8px',
            border: `1px solid ${nexusTheme_1.nexusColors.crimson}`,
            animation: 'pulse 1s infinite'
        }}>
            ⚠️ HIGH LOAD
          </material_1.Box>);
}
{
    message && (<material_1.Box sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '10px',
            padding: '8px 12px',
            borderRadius: '15px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            fontSize: '12px',
            color: nexusTheme_1.nexusColors.frost,
            maxWidth: '200px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
        }}>
            {message}
          </material_1.Box>);
}
material_1.Box >
;
;
return (<material_1.Box sx={Object.assign(Object.assign({ position: 'relative' }, fixedPosition), { opacity: adaptiveOpacity && hideOnOverlap ? 0.7 : 1, transition: 'opacity 0.3s ease' })}>
      <div ref={mountRef}/>

      {/* Performance indicator */}
      {performanceMode === 'high' && fps < 50 && (<material_1.Box sx={{
            position: 'absolute',
            bottom: -20,
            left: 0,
            fontSize: '8px',
            color: nexusTheme_1.nexusColors.nebula,
            opacity: 0.7
        }}>
          FPS: {fps}
        </material_1.Box>)}

      {/* System Health Indicators */}
      {systemHealth !== 'optimal' && (<>
          {/* CPU Load Indicator */}
          <material_1.Box sx={{
            position: 'absolute',
            top: -15,
            left: -15,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: `conic-gradient(
                ${nexusTheme_1.nexusColors.crimson} ${cpuLoad * 360}deg,
                rgba(255, 255, 255, 0.1) 0deg
              )`,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
        }}>
            CPU
          </material_1.Box>

          {/* Memory Usage Indicator */}
          <material_1.Box sx={{
            position: 'absolute',
            top: -15,
            right: -15,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: `conic-gradient(
                ${nexusTheme_1.nexusColors.sapphire} ${memoryUsage * 360}deg,
                rgba(255, 255, 255, 0.1) 0deg
              )`,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
        }}>
            RAM
          </material_1.Box>
        </>)}

      {/* Message display */}
      {message && (<material_1.Box sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '10px',
            padding: '8px 12px',
            borderRadius: '15px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            fontSize: '12px',
            color: nexusTheme_1.nexusColors.frost,
            maxWidth: '200px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            opacity: isSpeaking ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
        }}>
          {message}
        </material_1.Box>)}
    </material_1.Box>);
;
exports.default = exports.HolographicAIFace;
