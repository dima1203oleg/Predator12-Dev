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
exports.AdvancedThemeCustomizer = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const themePresets = [
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
const AdvancedThemeCustomizer = ({ currentTheme = 'nexus-core', onThemeChange, onCustomThemeCreate, onEffectsChange }) => {
    const [selectedTheme, setSelectedTheme] = (0, react_1.useState)(themePresets.find(t => t.id === currentTheme) || themePresets[0]);
    const [customTheme, setCustomTheme] = (0, react_1.useState)(Object.assign(Object.assign({}, themePresets[0]), { id: 'custom-theme', name: 'Моя Тема', category: 'custom' }));
    const [showCustomizer, setShowCustomizer] = (0, react_1.useState)(false);
    const [previewMode, setPreviewMode] = (0, react_1.useState)(false);
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const [showEffectsPanel, setShowEffectsPanel] = (0, react_1.useState)(false);
    const [animationSpeed, setAnimationSpeed] = (0, react_1.useState)(1);
    const [particleCount, setParticleCount] = (0, react_1.useState)(50);
    const [glowIntensity, setGlowIntensity] = (0, react_1.useState)(0.8);
    const canvasRef = (0, react_1.useRef)(null);
    // Preview animation
    (0, react_1.useEffect)(() => {
        if (previewMode && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            canvas.width = 400;
            canvas.height = 200;
            let animationId;
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
    const filteredThemes = themePresets.filter(theme => selectedCategory === 'all' || theme.category === selectedCategory);
    const handleThemeSelect = (theme) => {
        setSelectedTheme(theme);
        onThemeChange === null || onThemeChange === void 0 ? void 0 : onThemeChange(theme);
    };
    const handleCustomColorChange = (colorKey, value) => {
        setCustomTheme(prev => (Object.assign(Object.assign({}, prev), { colors: Object.assign(Object.assign({}, prev.colors), { [colorKey]: value }) })));
    };
    const handleEffectChange = (effectKey, value) => {
        setCustomTheme(prev => (Object.assign(Object.assign({}, prev), { effects: Object.assign(Object.assign({}, prev.effects), { [effectKey]: value }) })));
        onEffectsChange === null || onEffectsChange === void 0 ? void 0 : onEffectsChange({
            [effectKey]: value
        });
    };
    const generateRandomTheme = () => {
        const randomColors = {
            primary: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            secondary: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            accent: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            background: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            surface: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            text: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        };
        setCustomTheme(prev => (Object.assign(Object.assign({}, prev), { colors: randomColors, name: `Випадкова Тема ${Date.now()}` })));
    };
    const saveCustomTheme = () => {
        onCustomThemeCreate === null || onCustomThemeCreate === void 0 ? void 0 : onCustomThemeCreate(customTheme);
        setShowCustomizer(false);
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'default': return <icons_material_1.Palette />;
            case 'gaming': return <icons_material_1.EmojiEvents />;
            case 'minimal': return <icons_material_1.Brightness6 />;
            case 'futuristic': return <icons_material_1.AutoAwesome />;
            case 'custom': return <icons_material_1.Tune />;
            default: return <icons_material_1.ColorLens />;
        }
    };
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Typography variant="h4" sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 1
        }}>
          🎨 Розширений Кастомізатор Тем
        </material_1.Typography>
        <material_1.Typography variant="subtitle1" color="text.secondary">
          Створюйте та налаштовуйте унікальні візуальні теми
        </material_1.Typography>
      </material_1.Box>

      {/* Controls */}
      <material_1.Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <material_1.Button variant="contained" startIcon={<icons_material_1.FormatPaint />} onClick={() => setShowCustomizer(true)} sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
        }}>
          Створити Тему
        </material_1.Button>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.Settings />} onClick={() => setShowEffectsPanel(true)}>
          Налаштування Ефектів
        </material_1.Button>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.Preview />} onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? 'Зупинити' : 'Прев\'ю'}
        </material_1.Button>

        <material_1.Button variant="outlined" startIcon={<icons_material_1.AutoAwesome />} onClick={generateRandomTheme}>
          Випадкова Тема
        </material_1.Button>
      </material_1.Box>

      {/* Category Filter */}
      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Typography variant="h6" sx={{ mb: 2 }}>
          Категорії тем:
        </material_1.Typography>
        <material_1.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (<material_1.Chip key={category} icon={getCategoryIcon(category)} label={category === 'all' ? 'Всі' : category} onClick={() => setSelectedCategory(category)} variant={selectedCategory === category ? 'filled' : 'outlined'} sx={Object.assign({}, (selectedCategory === category && {
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }))}/>))}
        </material_1.Box>
      </material_1.Box>

      {/* Theme Grid */}
      <material_1.Grid container spacing={3}>
        {filteredThemes.map((theme, index) => (<material_1.Grid item xs={12} sm={6} md={4} key={theme.id}>
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <material_1.Card sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedTheme.id === theme.id ? '2px solid' : '1px solid transparent',
                borderColor: selectedTheme.id === theme.id ? theme.colors.primary : 'transparent',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${theme.colors.primary}30`
                }
            }} onClick={() => handleThemeSelect(theme)}>
                {/* Theme Preview */}
                <material_1.Box sx={{
                height: 120,
                background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                  {/* Color Palette */}
                  <material_1.Box sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                display: 'flex',
                gap: 1
            }}>
                    {Object.values(theme.colors).slice(0, 3).map((color, i) => (<material_1.Box key={i} sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: color,
                    border: '2px solid rgba(255,255,255,0.3)'
                }}/>))}
                  </material_1.Box>

                  {/* Effects Preview */}
                  {theme.effects.particles && (<material_1.Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle, ${theme.colors.primary}20 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    animation: theme.effects.animations ? 'float 3s ease-in-out infinite' : 'none'
                }}/>)}

                  {/* Popularity Badge */}
                  <material_1.Chip icon={<icons_material_1.Star />} label={`${theme.popularity}%`} size="small" sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: theme.colors.accent,
                color: 'white'
            }}/>
                </material_1.Box>

                <material_1.CardContent>
                  <material_1.Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {theme.name}
                  </material_1.Typography>
                  <material_1.Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {theme.description}
                  </material_1.Typography>

                  <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <material_1.Chip label={theme.category} size="small" sx={{
                bgcolor: theme.colors.primary,
                color: 'white'
            }}/>
                    <material_1.LinearProgress variant="determinate" value={theme.popularity} sx={{
                width: 60,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.colors.accent,
                    borderRadius: 3
                }
            }}/>
                  </material_1.Box>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Preview Canvas */}
      <framer_motion_1.AnimatePresence>
        {previewMode && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2000
            }}>
            <material_1.Paper elevation={24} sx={{
                p: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3
            }}>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <material_1.Typography variant="h6" sx={{ color: 'white' }}>
                  Прев'ю теми: {selectedTheme.name}
                </material_1.Typography>
                <material_1.IconButton onClick={() => setPreviewMode(false)} sx={{ color: 'white' }}>
                  <icons_material_1.Close />
                </material_1.IconButton>
              </material_1.Box>
              <canvas ref={canvasRef} style={{
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px'
            }}/>
            </material_1.Paper>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Custom Theme Dialog */}
      <material_1.Dialog open={showCustomizer} onClose={() => setShowCustomizer(false)} maxWidth="md" fullWidth>
        <material_1.DialogTitle sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          🎨 Створення Кастомної Теми
        </material_1.DialogTitle>
        <material_1.DialogContent sx={{ pt: 3 }}>
          <material_1.Grid container spacing={3}>
            {/* Color Customization */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="h6" sx={{ mb: 2 }}>
                Налаштування Кольорів:
              </material_1.Typography>
              {Object.entries(customTheme.colors).map(([key, value]) => (<material_1.Box key={key} sx={{ mb: 2 }}>
                  <material_1.Typography variant="body2" sx={{ mb: 1 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <input type="color" value={value} onChange={(e) => handleCustomColorChange(key, e.target.value)} style={{
                width: 50,
                height: 30,
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer'
            }}/>
                    <material_1.Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {value}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Box>))}
            </material_1.Grid>

            {/* Effects Customization */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="h6" sx={{ mb: 2 }}>
                Візуальні Ефекти:
              </material_1.Typography>
              {Object.entries(customTheme.effects).map(([key, value]) => (<material_1.FormControlLabel key={key} control={<material_1.Switch checked={value} onChange={(e) => handleEffectChange(key, e.target.checked)}/>} label={key.charAt(0).toUpperCase() + key.slice(1)} sx={{ display: 'block', mb: 1 }}/>))}
            </material_1.Grid>
          </material_1.Grid>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowCustomizer(false)}>
            Скасувати
          </material_1.Button>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Save />} onClick={saveCustomTheme} sx={{
            background: 'linear-gradient(45deg, #4CAF50, #8BC34A)'
        }}>
            Зберегти Тему
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Effects Panel Dialog */}
      <material_1.Dialog open={showEffectsPanel} onClose={() => setShowEffectsPanel(false)} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>⚙️ Налаштування Ефектів</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ py: 2 }}>
            <material_1.Typography variant="subtitle1" sx={{ mb: 2 }}>
              Швидкість Анімацій:
            </material_1.Typography>
            <material_1.Slider value={animationSpeed} onChange={(_, value) => setAnimationSpeed(value)} min={0.1} max={3} step={0.1} valueLabelDisplay="auto" sx={{ mb: 3 }}/>

            <material_1.Typography variant="subtitle1" sx={{ mb: 2 }}>
              Кількість Частинок:
            </material_1.Typography>
            <material_1.Slider value={particleCount} onChange={(_, value) => setParticleCount(value)} min={10} max={200} step={10} valueLabelDisplay="auto" sx={{ mb: 3 }}/>

            <material_1.Typography variant="subtitle1" sx={{ mb: 2 }}>
              Інтенсивність Свічення:
            </material_1.Typography>
            <material_1.Slider value={glowIntensity} onChange={(_, value) => setGlowIntensity(value)} min={0} max={2} step={0.1} valueLabelDisplay="auto"/>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowEffectsPanel(false)}>
            Закрити
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* CSS Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </material_1.Box>);
};
exports.AdvancedThemeCustomizer = AdvancedThemeCustomizer;
exports.default = exports.AdvancedThemeCustomizer;
