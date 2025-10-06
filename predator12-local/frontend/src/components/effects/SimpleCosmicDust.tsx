// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { nexusColors } from '../../theme/nexusTheme';

interface SimpleCosmicDustProps {
  particleCount?: number;
  opacity?: number;
  speed?: number;
}

export const SimpleCosmicDust: React.FC<SimpleCosmicDustProps> = ({
  particleCount = 100,
  opacity = 0.6,
  speed = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * speed * 0.5;
        this.vy = (Math.random() - 0.5) * speed * 0.5;
        this.size = Math.random() * 2 + 1;
        
        const colors = [nexusColors.emerald, nexusColors.sapphire, nexusColors.amethyst];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = Math.random();
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;

        // Update life
        this.life += 0.01;
        if (this.life > 1) this.life = 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const lifeFade = Math.sin(this.life * Math.PI);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(lifeFade * opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    // Animation loop
    let animationId: number;
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

export default SimpleCosmicDust;
