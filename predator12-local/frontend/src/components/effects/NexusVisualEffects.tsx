// @ts-nocheck
import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

// Keyframe animations
const float1 = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate(-100px, -100px) rotate(360deg); opacity: 0; }
`;

const float2 = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate(150px, -80px) rotate(-360deg); opacity: 0; }
`;

const float3 = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate(-80px, 120px) rotate(180deg); opacity: 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 5px currentColor); }
  50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 20px currentColor); }
`;

const scanH = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100vw); }
`;

const scanV = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`;

interface NexusVisualEffectsProps {
  showCosmicDust?: boolean;
  showHolographicFrames?: boolean;
  showScanLines?: boolean;
}

export const NexusVisualEffects: React.FC<NexusVisualEffectsProps> = ({
  showCosmicDust = true,
  showHolographicFrames = true,
  showScanLines = true
}) => {
  const particles = [
    { color: '#00FFC6', animation: float1, duration: '15s', top: '10%', left: '5%', size: 2 },
    { color: '#0A75FF', animation: float2, duration: '20s', top: '30%', left: '15%', size: 3 },
    { color: '#A020F0', animation: float3, duration: '18s', top: '50%', left: '25%', size: 2 },
    { color: '#00FFC6', animation: float1, duration: '12s', top: '70%', left: '35%', size: 2 },
    { color: '#0A75FF', animation: float2, duration: '25s', top: '20%', left: '45%', size: 3 },
    { color: '#A020F0', animation: float3, duration: '16s', top: '80%', left: '55%', size: 2 },
    { color: '#00FFC6', animation: float1, duration: '22s', top: '40%', left: '65%', size: 2 },
    { color: '#0A75FF', animation: float2, duration: '14s', top: '60%', left: '75%', size: 3 },
    { color: '#A020F0', animation: float3, duration: '19s', top: '15%', left: '85%', size: 2 },
    { color: '#00FFC6', animation: float1, duration: '17s', top: '90%', left: '95%', size: 2 }
  ];

  return (
    <>
      {/* Cosmic Dust */}
      {showCosmicDust && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {particles.map((particle, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: particle.color,
                borderRadius: '50%',
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
                animation: `${particle.animation} ${particle.duration} infinite linear`,
                top: particle.top,
                left: particle.left
              }}
            />
          ))}
        </Box>
      )}

      {/* Holographic Frames */}
      {showHolographicFrames && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          {/* Top Left */}
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              left: 20,
              width: 60,
              height: 60,
              borderTop: '3px solid #00FFC6',
              borderLeft: '3px solid #00FFC6',
              animation: `${pulse} 2s infinite`,
              filter: 'drop-shadow(0 0 10px #00FFC6)'
            }}
          />
          
          {/* Top Right */}
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              right: 20,
              width: 60,
              height: 60,
              borderTop: '3px solid #0A75FF',
              borderRight: '3px solid #0A75FF',
              animation: `${pulse} 2.5s infinite`,
              filter: 'drop-shadow(0 0 10px #0A75FF)'
            }}
          />
          
          {/* Bottom Left */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: 20,
              width: 60,
              height: 60,
              borderBottom: '3px solid #A020F0',
              borderLeft: '3px solid #A020F0',
              animation: `${pulse} 3s infinite`,
              filter: 'drop-shadow(0 0 10px #A020F0)'
            }}
          />
          
          {/* Bottom Right */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              width: 60,
              height: 60,
              borderBottom: '3px solid #FF0033',
              borderRight: '3px solid #FF0033',
              animation: `${pulse} 2.2s infinite`,
              filter: 'drop-shadow(0 0 10px #FF0033)'
            }}
          />
        </Box>
      )}

      {/* Scan Lines */}
      {showScanLines && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          {/* Horizontal Scan Line */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00FFC6, transparent)',
              animation: `${scanH} 8s infinite linear`
            }}
          />
          
          {/* Vertical Scan Line */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '2px',
              height: '100%',
              background: 'linear-gradient(180deg, transparent, #0A75FF, transparent)',
              animation: `${scanV} 12s infinite linear`
            }}
          />
        </Box>
      )}
    </>
  );
};

export default NexusVisualEffects;
