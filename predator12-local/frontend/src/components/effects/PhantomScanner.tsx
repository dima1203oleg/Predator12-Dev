// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { nexusColors } from '../../theme/nexusTheme';

interface PhantomScannerProps {
  active?: boolean;
  scanSpeed?: number; // seconds per scan
  scanLines?: number;
  color?: string;
  onScanComplete?: () => void;
}

export const PhantomScanner: React.FC<PhantomScannerProps> = ({
  active = true,
  scanSpeed = 3,
  scanLines = 20,
  color = nexusColors.emerald,
  onScanComplete
}) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(active);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) {
      setScanning(false);
      return;
    }

    setScanning(true);
    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = (elapsed % scanSpeed) / scanSpeed;
      
      setScanProgress(progress);

      if (elapsed >= scanSpeed) {
        onScanComplete?.();
        startTime = Date.now();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [active, scanSpeed, onScanComplete]);

  // Canvas-based scan effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw scan lines
    for (let i = 0; i < scanLines; i++) {
      const y = (i / scanLines) * height;
      const opacity = Math.abs(Math.sin((scanProgress * Math.PI * 2) + (i * 0.2)));
      
      ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw moving scan beam
    const beamY = scanProgress * height;
    const gradient = ctx.createLinearGradient(0, beamY - 50, 0, beamY + 50);
    gradient.addColorStop(0, `${color}00`);
    gradient.addColorStop(0.5, `${color}ff`);
    gradient.addColorStop(1, `${color}00`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, beamY - 50, width, 100);

    // Draw radar sweep effect
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    const angle = scanProgress * Math.PI * 2;

    const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    sweepGradient.addColorStop(0, `${color}40`);
    sweepGradient.addColorStop(1, `${color}00`);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.fillStyle = sweepGradient;
    ctx.fillRect(-radius, 0, radius, radius);
    ctx.restore();
  }, [scanProgress, color, scanLines]);

  return (
    <AnimatePresence>
      {scanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 100
          }}
        >
          {/* Canvas for scan effects */}
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            style={{
              width: '100%',
              height: '100%',
              mixBlendMode: 'screen'
            }}
          />

          {/* Scan status indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: '8px 16px',
              background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
              border: `1px solid ${color}60`,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
                animation: 'pulse 1s infinite'
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: nexusColors.frost,
                fontFamily: 'Orbitron, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Scanning... {Math.floor(scanProgress * 100)}%
            </Typography>
          </Box>

          {/* Corner brackets */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
            const [vertical, horizontal] = corner.split('-');
            return (
              <motion.div
                key={corner}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  position: 'absolute',
                  [vertical]: 20,
                  [horizontal]: 20,
                  width: 40,
                  height: 40,
                  border: `2px solid ${color}`,
                  [`border${vertical === 'top' ? 'Bottom' : 'Top'}`]: 'none',
                  [`border${horizontal === 'left' ? 'Right' : 'Left'}`]: 'none',
                  boxShadow: `0 0 10px ${color}60`
                }}
              />
            );
          })}

          {/* Crosshair */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 60,
              height: 60,
              border: `1px solid ${color}80`,
              borderRadius: '50%',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                backgroundColor: color,
                opacity: 0.6
              },
              '&::before': {
                top: '50%',
                left: '10%',
                right: '10%',
                height: '1px',
                transform: 'translateY(-50%)'
              },
              '&::after': {
                left: '50%',
                top: '10%',
                bottom: '10%',
                width: '1px',
                transform: 'translateX(-50%)'
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhantomScanner;
