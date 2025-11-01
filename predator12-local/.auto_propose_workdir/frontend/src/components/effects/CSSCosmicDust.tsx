// @ts-nocheck
import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';
import { nexusColors } from '../../theme/nexusTheme';

const float = keyframes`
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

interface CSSCosmicDustProps {
  particleCount?: number;
}

export const CSSCosmicDust: React.FC<CSSCosmicDustProps> = ({ particleCount = 50 }) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    color: [nexusColors.emerald, nexusColors.sapphire, nexusColors.amethyst][Math.floor(Math.random() * 3)],
    moveX: (Math.random() - 0.5) * 200,
    moveY: (Math.random() - 0.5) * 200
  }));

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
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
          }}
        />
      ))}
    </Box>
  );
};

export default CSSCosmicDust;
