import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  GlobalStyles
} from '@mui/material';
import {
  Palette,
  Brightness6,
  FormatPaint,
  AutoAwesome,
  Tune,
  Refresh,
  Save,
  Download,
  Upload,
  Preview,
  ColorLens,
  Gradient,
  Wallpaper,
  Animation,
  Star,
  EmojiEvents,
  Settings,
  Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  effects: {
    particles: boolean;
    glow: boolean;
    animations: boolean;
    shadows: boolean;
  };
  category: 'default' | 'gaming' | 'minimal' | 'futuristic' | 'custom';
  popularity: number;
  preview?: string;
}

const themePresets: ThemePreset[] = [
  {
    id: 'nexus-core',
    name: 'Nexus Core',
    description: 'Основна тема з фіолетово-синіми кольорами',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#ff6b35',
      background: '#0f0f23',
      surface: '#1a1a2e',
      text: '#ffffff'
    },
    effects: {
      particles: true,
      glow: true,
      animations: true,
      shadows: true
    },
    category: 'default',
    popularity: 95
  },
  {
    id: 'cyber-matrix',
    name: 'Cyber Matrix',
    description: 'Зелена матрична тема в стилі кіберпанк',
    colors: {
      primary: '#00ff00',
      secondary: '#00cc66',
      accent: '#ff0040',
      background: '#000000',
      surface: '#001100',
      text: '#00ff00'
    },
    effects: {
      particles: true,
      glow: true,
      animations: true,
      shadows: false
    },
    category: 'gaming',
    popularity: 87
  },
  {
    id: 'quantum-blue',
    name: 'Quantum Blue',
    description: 'Синя квантова тема з голографічними ефектами',
    colors: {
      primary: '#0066ff',
      secondary: '#0099ff',
      accent: '#ffaa00',
      background: '#000022',
      surface: '#001133',
      text: '#ccddff'
    },
    effects: {
      particles: true,
      glow: true,
      animations: true,
      shadows: true
    },
    category: 'futuristic',
    popularity: 78
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Неонова тема з яскравими рожевими акцентами',
    colors: {
      primary: '#ff0080',
      secondary: '#8000ff',
      accent: '#00ffff',
      background: '#0a0a0a',
      surface: '#1a0a1a',
      text: '#ffffff'
    },
    effects: {
      particles: true,
      glow: true,
      animations: true,
      shadows: true
    },
    category: 'gaming',
    popularity: 82
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Мінімальна світла тема для денного використання',
    colors: {
      primary: '#2196f3',
      secondary: '#1976d2',
      accent: '#ff9800',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121'
    },
    effects: {
      particles: false,
      glow: false,
      animations: false,
      shadows: true
    },
    category: 'minimal',
    popularity: 65
  }
];

interface AdvancedThemeCustomizerProps {
  currentTheme?: string;
  onThemeChange?: (theme: ThemePreset) => void;
  onCustomThemeCreate?: (theme: ThemePreset) => void;
  onEffectsChange?: (effects: any) => void;
}

export const AdvancedThemeCustomizer: React.FC<AdvancedThemeCustomizerProps> = ({
  currentTheme = 'nexus-core',
  onThemeChange,
  onCustomThemeCreate,
  onEffectsChange
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(
    themePresets.find(t => t.id === currentTheme) || themePresets[0]
  );
  const [customTheme, setCustomTheme] = useState<ThemePreset>({
    ...themePresets[0],
    id: 'custom-theme',
    name: 'Моя Тема',
    category: 'custom'
  });
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [particleCount, setParticleCount] = useState(50);
  const [glowIntensity, setGlowIntensity] = useState(0.8);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Preview animation
  useEffect(() => {
    if (previewMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 400;
      canvas.height = 200;

      let animationId: number;
      let time = 0;

      const animate = () => {
        ctx.fillStyle = selectedTheme.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw theme preview with effects
        if (selectedTheme.effects.particles) {
          for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time * 0.01 + i) * 100) + 200;
            const y = (Math.cos(time * 0.02 + i) * 50) + 100;

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = selectedTheme.colors.primary + '80';
            ctx.fill();
          }
        }

        if (selectedTheme.effects.glow) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = selectedTheme.colors.accent;
        }

        // Draw central element
        ctx.fillStyle = selectedTheme.colors.primary;
        ctx.fillRect(180, 90, 40, 20);

        time += animationSpeed;
        animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [previewMode, selectedTheme, animationSpeed]);

  const categories = ['all', 'default', 'gaming', 'minimal', 'futuristic', 'custom'];

  const filteredThemes = themePresets.filter(theme =>
    selectedCategory === 'all' || theme.category === selectedCategory
  );

  const handleThemeSelect = (theme: ThemePreset) => {
    setSelectedTheme(theme);
    onThemeChange?.(theme);
  };

  const handleCustomColorChange = (colorKey: string, value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleEffectChange = (effectKey: string, value: boolean) => {
    setCustomTheme(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [effectKey]: value
      }
    }));

    onEffectsChange?.({
      [effectKey]: value
    });
  };

  const generateRandomTheme = () => {
    const randomColors = {
      primary: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      secondary: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      accent: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      background: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      surface: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      text: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };

    setCustomTheme(prev => ({
      ...prev,
      colors: randomColors,
      name: `Випадкова Тема ${Date.now()}`
    }));
  };

  const saveCustomTheme = () => {
    onCustomThemeCreate?.(customTheme);
    setShowCustomizer(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'default': return <Palette />;
      case 'gaming': return <EmojiEvents />;
      case 'minimal': return <Brightness6 />;
      case 'futuristic': return <AutoAwesome />;
      case 'custom': return <Tune />;
      default: return <ColorLens />;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          🎨 Розширений Кастомізатор Тем
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Створюйте та налаштовуйте унікальні візуальні теми
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<FormatPaint />}
          onClick={() => setShowCustomizer(true)}
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          Створити Тему
        </Button>

        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => setShowEffectsPanel(true)}
        >
          Налаштування Ефектів
        </Button>

        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? 'Зупинити' : 'Прев\'ю'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<AutoAwesome />}
          onClick={generateRandomTheme}
        >
          Випадкова Тема
        </Button>
      </Box>

      {/* Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Категорії тем:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category}
              icon={getCategoryIcon(category)}
              label={category === 'all' ? 'Всі' : category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{
                ...(selectedCategory === category && {
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                })
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Theme Grid */}
      <Grid container spacing={3}>
        {filteredThemes.map((theme, index) => (
          <Grid item xs={12} sm={6} md={4} key={theme.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedTheme.id === theme.id ? '2px solid' : '1px solid transparent',
                  borderColor: selectedTheme.id === theme.id ? theme.colors.primary : 'transparent',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${theme.colors.primary}30`
                  }
                }}
                onClick={() => handleThemeSelect(theme)}
              >
                {/* Theme Preview */}
                <Box
                  sx={{
                    height: 120,
                    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Color Palette */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      display: 'flex',
                      gap: 1
                    }}
                  >
                    {Object.values(theme.colors).slice(0, 3).map((color, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: color,
                          border: '2px solid rgba(255,255,255,0.3)'
                        }}
                      />
                    ))}
                  </Box>

                  {/* Effects Preview */}
                  {theme.effects.particles && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `radial-gradient(circle, ${theme.colors.primary}20 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                        animation: theme.effects.animations ? 'float 3s ease-in-out infinite' : 'none'
                      }}
                    />
                  )}

                  {/* Popularity Badge */}
                  <Chip
                    icon={<Star />}
                    label={`${theme.popularity}%`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: theme.colors.accent,
                      color: 'white'
                    }}
                  />
                </Box>

                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {theme.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {theme.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={theme.category}
                      size="small"
                      sx={{
                        bgcolor: theme.colors.primary,
                        color: 'white'
                      }}
                    />
                    <LinearProgress
                      variant="determinate"
                      value={theme.popularity}
                      sx={{
                        width: 60,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.colors.accent,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Preview Canvas */}
      <AnimatePresence>
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000
            }}
          >
            <Paper
              elevation={24}
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Прев'ю теми: {selectedTheme.name}
                </Typography>
                <IconButton
                  onClick={() => setPreviewMode(false)}
                  sx={{ color: 'white' }}
                >
                  <Close />
                </IconButton>
              </Box>
              <canvas
                ref={canvasRef}
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px'
                }}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Theme Dialog */}
      <Dialog
        open={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          🎨 Створення Кастомної Теми
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Color Customization */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Налаштування Кольорів:
              </Typography>
              {Object.entries(customTheme.colors).map(([key, value]) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleCustomColorChange(key, e.target.value)}
                      style={{
                        width: 50,
                        height: 30,
                        border: 'none',
                        borderRadius: 5,
                        cursor: 'pointer'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Grid>

            {/* Effects Customization */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Візуальні Ефекти:
              </Typography>
              {Object.entries(customTheme.effects).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Switch
                      checked={value}
                      onChange={(e) => handleEffectChange(key, e.target.checked)}
                    />
                  }
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomizer(false)}>
            Скасувати
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveCustomTheme}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #8BC34A)'
            }}
          >
            Зберегти Тему
          </Button>
        </DialogActions>
      </Dialog>

      {/* Effects Panel Dialog */}
      <Dialog
        open={showEffectsPanel}
        onClose={() => setShowEffectsPanel(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>⚙️ Налаштування Ефектів</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Швидкість Анімацій:
            </Typography>
            <Slider
              value={animationSpeed}
              onChange={(_, value) => setAnimationSpeed(value as number)}
              min={0.1}
              max={3}
              step={0.1}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Кількість Частинок:
            </Typography>
            <Slider
              value={particleCount}
              onChange={(_, value) => setParticleCount(value as number)}
              min={10}
              max={200}
              step={10}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Інтенсивність Свічення:
            </Typography>
            <Slider
              value={glowIntensity}
              onChange={(_, value) => setGlowIntensity(value as number)}
              min={0}
              max={2}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEffectsPanel(false)}>
            Закрити
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS Animation Styles */}
      <GlobalStyles styles={`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `} />
    </Box>
  );
};

export default AdvancedThemeCustomizer;
