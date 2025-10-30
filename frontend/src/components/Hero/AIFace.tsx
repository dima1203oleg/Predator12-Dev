import { useEffect, useRef } from 'react';

export default function AIFace() {
  const leftEye = useRef<SVGCircleElement>(null);
  const rightEye = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Просте "мигання" очей
    const id = setInterval(() => {
      [leftEye.current, rightEye.current].forEach((el) => {
        if (!el) return;
        el.style.opacity = el.style.opacity === '1' ? '0.35' : '1';
      });
    }, 1800) as unknown as number;

    return () => clearInterval(id);
  }, []);

  return (
    <div className="ai-face">
      <svg viewBox="0 0 600 700" className="face-svg">
        {/* Градієнти */}
        <defs>
          <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#18FFFF" />
            <stop offset="100%" stopColor="#FF00E6" />
          </linearGradient>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Контур голови */}
        <path
          d="M300,30 C430,60 520,200 520,340 C520,530 430,650 300,670 C170,650 80,530 80,340 C80,200 170,60 300,30 Z"
          fill="none"
          stroke="url(#glow)"
          strokeOpacity="0.9"
          strokeWidth="2"
          filter="url(#neon-glow)"
        />

        {/* Кілька паралельних сіток обличчя */}
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M120,${120 + i * 30} C220,${100 + i * 25} 380,${100 + i * 25} 480,${120 + i * 30}`}
            fill="none"
            stroke="url(#glow)"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        ))}

        {/* Очі з анімацією */}
        <circle
          ref={leftEye}
          cx="230"
          cy="310"
          r="8"
          fill="#18FFFF"
          filter="url(#neon-glow)"
        />
        <circle
          ref={rightEye}
          cx="370"
          cy="310"
          r="8"
          fill="#18FFFF"
          filter="url(#neon-glow)"
        />

        {/* Ніс */}
        <path
          d="M300,350 C295,390 305,410 300,430"
          stroke="#18FFFF"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />

        {/* Рот */}
        <path
          d="M250,470 C300,490 350,470 350,470"
          stroke="#FF00E6"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* Підказка */}
      <div className="ai-hint">Постав запит… я поговорю з агентами 🚀</div>

      {/* Статус AI */}
      <div className="ai-status">
        <span className="status-dot"></span>
        <span className="status-text">Готовий до роботи</span>
      </div>
    </div>
  );
}
