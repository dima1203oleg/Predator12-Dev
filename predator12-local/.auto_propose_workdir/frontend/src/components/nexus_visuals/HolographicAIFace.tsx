// @ts-nocheck
import React from 'react';
import { Box, Typography } from '@mui/material';

type Emotion = 'neutral' | 'alert' | 'processing' | 'success' | 'error';
type SystemHealth = 'optimal' | 'warning' | 'critical' | string;
type PerformanceMode = 'low' | 'medium' | 'high' | string;
type AvatarSize = 'small' | 'medium' | 'large';

export interface HolographicAIFaceProps extends React.HTMLAttributes<HTMLDivElement> {
  isHidden?: boolean;
  isActive?: boolean;
  isSpeaking?: boolean;
  emotion?: Emotion;
  message?: string;
  systemHealth?: SystemHealth;
  intensity?: number;
  size?: AvatarSize;
  performanceMode?: PerformanceMode;
  fallbackMode?: boolean;
  onPerformanceChange?: (fps: number, fallback: boolean) => void;
}

const SIZE_DIMENSIONS: Record<AvatarSize, number> = {
  small: 120,
  medium: 160,
  large: 220
};

const EMOTION_LABEL: Record<Emotion, string> = {
  neutral: 'Нейтральний режим',
  alert: 'Попередження',
  processing: 'Обробка',
  success: 'Оптимальний стан',
  error: 'Аварійний режим'
};

const HolographicAIFace: React.FC<HolographicAIFaceProps> = ({
  isHidden,
  isActive = true,
  isSpeaking,
  emotion = 'neutral',
  message,
  systemHealth = 'optimal',
  intensity = 0.5,
  size = 'medium',
  performanceMode,
  fallbackMode,
  onPerformanceChange,
  style,
  ...rest
}) => {
  React.useEffect(() => {
    if (onPerformanceChange) {
      onPerformanceChange(60, Boolean(fallbackMode));
    }
  }, [fallbackMode, onPerformanceChange]);

  if (isHidden || !isActive) {
    return null;
  }

  const dimension = SIZE_DIMENSIONS[size] ?? SIZE_DIMENSIONS.medium;
  const emotionText = EMOTION_LABEL[emotion] ?? EMOTION_LABEL.neutral;

  return (
    <Box
      {...rest}
      sx={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        border: '2px solid rgba(0, 255, 204, 0.4)',
        background: 'linear-gradient(135deg, rgba(0, 26, 38, 0.8), rgba(6, 12, 24, 0.8))',
        boxShadow: '0 0 30px rgba(0, 255, 204, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        gap: 1,
        textAlign: 'center',
        position: 'relative',
        ...style
      }}
    >
      <Typography variant="caption" sx={{ letterSpacing: 1, textTransform: 'uppercase', color: '#7ef9ff' }}>
        {emotionText}
      </Typography>
      <Typography variant="body2" sx={{ color: '#e0f7fa', fontWeight: 600 }}>
        {systemHealth.toUpperCase()}
      </Typography>
      <Typography variant="caption" sx={{ color: '#80deea' }}>
        Інтенсивність: {(intensity * 100).toFixed(0)}%
      </Typography>
      {isSpeaking && (
        <Typography variant="caption" sx={{ color: '#ffab91' }}>
          🎙️ Голос активний
        </Typography>
      )}
      {message && (
        <Typography variant="caption" sx={{ color: '#b3e5fc' }}>
          {message}
        </Typography>
      )}
      {performanceMode && (
        <Typography variant="caption" sx={{ color: '#4dd0e1' }}>
          Режим: {performanceMode}
        </Typography>
      )}
      {fallbackMode && (
        <Typography variant="caption" sx={{ color: '#ffcc80' }}>
          Canvas fallback активний
        </Typography>
      )}
    </Box>
  );
};

export default HolographicAIFace;
