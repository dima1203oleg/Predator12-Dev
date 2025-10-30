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
exports.SimpleCosmicDust = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const nexusTheme_1 = require("../../theme/nexusTheme");
const SimpleCosmicDust = ({ particleCount = 100, opacity = 0.6, speed = 1 }) => {
    const canvasRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        // Particle class
        class Particle {
            constructor(canvasWidth, canvasHeight) {
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() * canvasHeight;
                this.vx = (Math.random() - 0.5) * speed * 0.5;
                this.vy = (Math.random() - 0.5) * speed * 0.5;
                this.size = Math.random() * 2 + 1;
                const colors = [nexusTheme_1.nexusColors.emerald, nexusTheme_1.nexusColors.sapphire, nexusTheme_1.nexusColors.amethyst];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.life = Math.random();
            }
            update(canvasWidth, canvasHeight) {
                this.x += this.vx;
                this.y += this.vy;
                // Wrap around edges
                if (this.x < 0)
                    this.x = canvasWidth;
                if (this.x > canvasWidth)
                    this.x = 0;
                if (this.y < 0)
                    this.y = canvasHeight;
                if (this.y > canvasHeight)
                    this.y = 0;
                // Update life
                this.life += 0.01;
                if (this.life > 1)
                    this.life = 0;
            }
            draw(ctx) {
                const lifeFade = Math.sin(this.life * Math.PI);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + Math.floor(lifeFade * opacity * 255).toString(16).padStart(2, '0');
                ctx.fill();
            }
        }
        // Create particles
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(canvas.width, canvas.height));
        }
        // Animation loop
        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update(canvas.width, canvas.height);
                particle.draw(ctx);
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [particleCount, opacity, speed]);
    return (<canvas ref={canvasRef} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
        }}/>);
};
exports.SimpleCosmicDust = SimpleCosmicDust;
exports.default = exports.SimpleCosmicDust;
