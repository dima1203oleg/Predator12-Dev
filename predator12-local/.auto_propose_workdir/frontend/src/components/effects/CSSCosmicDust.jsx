"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSCosmicDust = void 0;
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const system_1 = require("@mui/system");
const nexusTheme_1 = require("../../theme/nexusTheme");
const float = (0, system_1.keyframes) `
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;
const CSSCosmicDust = ({ particleCount = 50 }) => {
    const particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        color: [nexusTheme_1.nexusColors.emerald, nexusTheme_1.nexusColors.sapphire, nexusTheme_1.nexusColors.amethyst][Math.floor(Math.random() * 3)],
        moveX: (Math.random() - 0.5) * 200,
        moveY: (Math.random() - 0.5) * 200
    }));
    return (<material_1.Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1
        }}>
      {particles.map((particle) => (<material_1.Box key={particle.id} sx={{
                position: 'absolute',
                left: particle.left,
                top: particle.top,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                borderRadius: '50%',
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                animation: `${float} ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                '@keyframes float': {
                    '0%, 100%': {
                        transform: 'translate(0, 0)',
                        opacity: 0
                    },
                    '10%': {
                        opacity: 0.8
                    },
                    '90%': {
                        opacity: 0.8
                    },
                    '50%': {
                        transform: `translate(${particle.moveX}px, ${particle.moveY}px)`,
                        opacity: 1
                    }
                }
            }}/>))}
    </material_1.Box>);
};
exports.CSSCosmicDust = CSSCosmicDust;
exports.default = exports.CSSCosmicDust;
