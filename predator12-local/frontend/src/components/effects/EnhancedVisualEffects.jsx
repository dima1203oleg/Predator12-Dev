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
exports.HolographicOverlay = exports.MatrixRain = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const EnhancedVisualEffects = ({ gameMode = true, intensity = 'medium', theme = 'nexus', interactive = true }) => {
    const [particles, setParticles] = (0, react_1.useState)([]);
    const [connections, setConnections] = (0, react_1.useState)([]);
    const [mousePos, setMousePos] = (0, react_1.useState)({ x: 0, y: 0 });
    const canvasRef = (0, react_1.useRef)(null);
    const animationRef = (0, react_1.useRef)();
    const particleIdRef = (0, react_1.useRef)(0);
    // Налаштування для різних рівнів інтенсивності
    const getIntensityConfig = () => {
        switch (intensity) {
            case 'low':
                return { particleCount: 30, connectionDistance: 100, spawnRate: 0.3 };
            case 'medium':
                return { particleCount: 60, connectionDistance: 120, spawnRate: 0.5 };
            case 'high':
                return { particleCount: 100, connectionDistance: 150, spawnRate: 0.8 };
            default:
                return { particleCount: 60, connectionDistance: 120, spawnRate: 0.5 };
        }
    };
    // Кольори для різних тем
    const getThemeColors = () => {
        switch (theme) {
            case 'nexus':
                return [
                    nexusTheme_1.nexusColors.primary.main,
                    nexusTheme_1.nexusColors.secondary.main,
                    nexusTheme_1.nexusColors.accent.main,
                    '#00ffc6',
                    '#a020f0'
                ];
            case 'cyberpunk':
                return ['#ff0080', '#00ff80', '#0080ff', '#ff8000', '#8000ff'];
            case 'neural':
                return ['#4fc3f7', '#81c784', '#ffb74d', '#f48fb1', '#ce93d8'];
            case 'matrix':
                return ['#00ff00', '#008800', '#00cc00', '#00aa00', '#00ff88'];
            default:
                return [nexusTheme_1.nexusColors.primary.main, nexusTheme_1.nexusColors.secondary.main];
        }
    };
    const config = getIntensityConfig();
    const themeColors = getThemeColors();
    // Створення нової частинки
    const createParticle = (x, y, type = 'float') => {
        const canvas = canvasRef.current;
        if (!canvas)
            return null;
        return {
            id: particleIdRef.current++,
            x: x !== null && x !== void 0 ? x : Math.random() * canvas.width,
            y: y !== null && y !== void 0 ? y : Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.8 + 0.2,
            color: themeColors[Math.floor(Math.random() * themeColors.length)],
            life: 0,
            maxLife: Math.random() * 200 + 100,
            type
        };
    };
    // Створення з'єднання між частинками
    const createConnection = (p1, p2) => {
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        const opacity = Math.max(0, 1 - distance / config.connectionDistance) * 0.3;
        return {
            startX: p1.x,
            startY: p1.y,
            endX: p2.x,
            endY: p2.y,
            opacity,
            color: p1.color,
            width: Math.max(0.5, 2 - distance / 100)
        };
    };
    // Оновлення частинки
    const updateParticle = (particle, canvas) => {
        let newParticle = Object.assign({}, particle);
        // Оновлення позиції
        newParticle.x += newParticle.vx;
        newParticle.y += newParticle.vy;
        newParticle.life++;
        // Взаємодія з мишею
        if (interactive) {
            const dx = mousePos.x - newParticle.x;
            const dy = mousePos.y - newParticle.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < 100) {
                const force = (100 - distance) / 100;
                newParticle.vx += (dx / distance) * force * 0.01;
                newParticle.vy += (dy / distance) * force * 0.01;
            }
        }
        // Відбиття від країв
        if (newParticle.x <= 0 || newParticle.x >= canvas.width) {
            newParticle.vx *= -0.8;
            newParticle.x = Math.max(0, Math.min(canvas.width, newParticle.x));
        }
        if (newParticle.y <= 0 || newParticle.y >= canvas.height) {
            newParticle.vy *= -0.8;
            newParticle.y = Math.max(0, Math.min(canvas.height, newParticle.y));
        }
        // Затухання швидкості
        newParticle.vx *= 0.99;
        newParticle.vy *= 0.99;
        // Зміна прозорості з часом життя
        const lifeRatio = newParticle.life / newParticle.maxLife;
        newParticle.opacity = Math.max(0, 1 - lifeRatio);
        return newParticle;
    };
    // Анімаційний цикл
    const animate = () => {
        const canvas = canvasRef.current;
        const ctx = canvas === null || canvas === void 0 ? void 0 : canvas.getContext('2d');
        if (!canvas || !ctx)
            return;
        // Очищення канвасу
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Оновлення частинок
        setParticles(prevParticles => {
            const newParticles = prevParticles
                .map(particle => updateParticle(particle, canvas))
                .filter(particle => particle.life < particle.maxLife);
            // Додавання нових частинок
            while (newParticles.length < config.particleCount && Math.random() < config.spawnRate) {
                newParticles.push(createParticle());
            }
            // Малювання частинок
            newParticles.forEach(particle => {
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.shadowBlur = gameMode ? 10 : 5;
                ctx.shadowColor = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                // Додаткові ефекти для ігрового режиму
                if (gameMode && particle.type === 'neural') {
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            });
            return newParticles;
        });
        // Оновлення з'єднань
        setConnections(prevConnections => {
            const newConnections = [];
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                    if (distance < config.connectionDistance) {
                        newConnections.push(createConnection(p1, p2));
                    }
                });
            });
            // Малювання з'єднань
            newConnections.forEach(connection => {
                if (connection.opacity > 0.05) {
                    ctx.save();
                    ctx.globalAlpha = connection.opacity;
                    ctx.strokeStyle = connection.color;
                    ctx.lineWidth = connection.width;
                    ctx.shadowBlur = gameMode ? 5 : 2;
                    ctx.shadowColor = connection.color;
                    ctx.beginPath();
                    ctx.moveTo(connection.startX, connection.startY);
                    ctx.lineTo(connection.endX, connection.endY);
                    ctx.stroke();
                    ctx.restore();
                }
            });
            return newConnections;
        });
        animationRef.current = requestAnimationFrame(animate);
    };
    // Обробка руху миші
    const handleMouseMove = (event) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        setMousePos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        });
        // Створення частинок при русі миші (тільки в ігровому режимі)
        if (gameMode && Math.random() < 0.1) {
            setParticles(prev => [
                ...prev,
                createParticle(event.clientX - rect.left, event.clientY - rect.top, 'spark')
            ].slice(-config.particleCount));
        }
    };
    // Обробка кліків
    const handleClick = (event) => {
        if (!gameMode)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        // Створення вибуху частинок
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                setParticles(prev => [
                    ...prev,
                    createParticle(clickX + (Math.random() - 0.5) * 50, clickY + (Math.random() - 0.5) * 50, 'neural')
                ].slice(-config.particleCount));
            }, i * 20);
        }
    };
    // Ініціалізація та очищення
    (0, react_1.useEffect)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        // Встановлення розміру канвасу
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        // Початкові частинки
        const initialParticles = Array.from({ length: config.particleCount }, () => createParticle());
        setParticles(initialParticles);
        // Обробники подій
        if (interactive) {
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('click', handleClick);
        }
        // Запуск анімації
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (interactive) {
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('click', handleClick);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameMode, intensity, theme, interactive]);
    return (<canvas ref={canvasRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: interactive ? 'auto' : 'none',
            zIndex: -1,
            opacity: gameMode ? 0.8 : 0.4
        }}/>);
};
// Компонент для матричного ефекту
const MatrixRain = ({ gameMode = false }) => {
    const canvasRef = (0, react_1.useRef)(null);
    const animationRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        if (!gameMode)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas === null || canvas === void 0 ? void 0 : canvas.getContext('2d');
        if (!canvas || !ctx)
            return;
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        const matrix = "NEXUS CORE V3 AI PREDATOR12 SYSTEM";
        const matrixArray = matrix.split("");
        const fontSize = 10;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = nexusTheme_1.nexusColors.primary.main;
            ctx.font = `${fontSize}px monospace`;
            for (let i = 0; i < drops.length; i++) {
                const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        const animate = () => {
            draw();
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameMode]);
    if (!gameMode)
        return null;
    return (<canvas ref={canvasRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: -2,
            opacity: 0.1
        }}/>);
};
exports.MatrixRain = MatrixRain;
// Компонент для голографічного ефекту
const HolographicOverlay = ({ visible = true }) => {
    const [scanLine, setScanLine] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        const interval = setInterval(() => {
            setScanLine(prev => (prev + 2) % window.innerHeight);
        }, 16);
        return () => clearInterval(interval);
    }, [visible]);
    if (!visible)
        return null;
    return (<material_1.Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 1000,
            background: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 198, 0.03) 2px,
            rgba(0, 255, 198, 0.03) 4px
          )
        `,
            '&::before': {
                content: '""',
                position: 'absolute',
                top: scanLine,
                left: 0,
                width: '100%',
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${nexusTheme_1.nexusColors.primary.main}, transparent)`,
                boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.primary.main}`,
                transition: 'top 0.016s linear'
            }
        }}/>);
};
exports.HolographicOverlay = HolographicOverlay;
exports.default = EnhancedVisualEffects;
