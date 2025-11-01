"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const emotionColor = {
    neutral: nexusTheme_1.nexusColors.sapphire,
    happy: nexusTheme_1.nexusColors.emerald,
    concerned: nexusTheme_1.nexusColors.warning,
    focused: nexusTheme_1.nexusColors.amethyst,
    alert: nexusTheme_1.nexusColors.crimson
};
const Avatar3D = ({ isVisible = true, isSpeaking = false, emotion = 'neutral', speech, quality = 'medium' }) => {
    if (!isVisible) {
        return null;
    }
    return (<material_1.Box sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 50% 20%, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`,
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            overflow: 'hidden'
        }}>
      <material_1.Box sx={{
            width: quality === 'high' ? 220 : quality === 'medium' ? 200 : 180,
            height: quality === 'high' ? 220 : quality === 'medium' ? 200 : 180,
            borderRadius: '50%',
            border: `2px solid ${emotionColor[emotion]}`,
            boxShadow: `0 0 35px ${emotionColor[emotion]}60`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: `radial-gradient(circle at 50% 30%, ${nexusTheme_1.nexusColors.obsidian} 0%, ${nexusTheme_1.nexusColors.darkMatter} 55%, ${nexusTheme_1.nexusColors.void} 100%)`,
            '&::after': {
                content: '""',
                position: 'absolute',
                inset: 14,
                borderRadius: '50%',
                border: `1px dashed ${emotionColor[emotion]}60`,
                animation: isSpeaking ? 'pulseRing 1.2s infinite' : 'none'
            }
        }}>
        <material_1.Box sx={{
            width: '55%',
            height: '55%',
            borderRadius: '45% 45% 50% 50%',
            border: `1px solid ${emotionColor[emotion]}`,
            boxShadow: `0 0 18px ${emotionColor[emotion]}75`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingY: 3,
            paddingX: 2,
            background: `${nexusTheme_1.nexusColors.obsidian}CC`
        }}>
          <material_1.Box sx={{
            display: 'flex',
            gap: 2,
            width: '100%',
            justifyContent: 'space-between'
        }}>
            {[0, 1].map((eye) => (<material_1.Box key={eye} sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `${emotionColor[emotion]}30`,
                border: `1px solid ${emotionColor[emotion]}90`,
                boxShadow: `0 0 12px ${emotionColor[emotion]}60`,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '30%',
                    left: isSpeaking ? '48%' : '50%',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: nexusTheme_1.nexusColors.frost,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 8px ${emotionColor[emotion]}`
                }
            }}/>))}
          </material_1.Box>

          <material_1.Box sx={{
            width: isSpeaking ? '70%' : '55%',
            height: 18,
            borderRadius: 9,
            background: `${emotionColor[emotion]}35`,
            border: `1px solid ${emotionColor[emotion]}80`,
            boxShadow: `0 0 12px ${emotionColor[emotion]}60`,
            transition: 'width 0.35s ease',
            animation: isSpeaking ? 'speechWave 0.45s ease-in-out infinite alternate' : 'none'
        }}/>
        </material_1.Box>
      </material_1.Box>

      {speech && (<material_1.Typography variant="caption" sx={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                color: nexusTheme_1.nexusColors.frost,
                background: `${nexusTheme_1.nexusColors.obsidian}B8`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                maxWidth: '80%',
                textAlign: 'center'
            }}>
          {speech}
        </material_1.Typography>)}

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.9; }
          70% { transform: scale(1.18); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        @keyframes speechWave {
          0% { transform: scaleY(0.7); }
          100% { transform: scaleY(1.2); }
        }
      `}</style>
    </material_1.Box>);
};
exports.default = Avatar3D;
