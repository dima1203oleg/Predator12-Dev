"use strict";
/**
 * 🎨 THEME SWITCHER COMPONENT
 *
 * Компонент для динамічного переключення тем інтерфейсу
 */
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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const themes_1 = require("../../theme/themes");
const ThemeSwitcher = ({ currentThemeId, onThemeChange, }) => {
    const theme = (0, material_1.useTheme)();
    const [open, setOpen] = (0, react_1.useState)(false);
    const [hoveredTheme, setHoveredTheme] = (0, react_1.useState)(null);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleThemeSelect = (themeId) => {
        onThemeChange(themeId);
        handleClose();
    };
    const currentTheme = themes_1.allThemes.find(t => t.id === currentThemeId) || themes_1.allThemes[0];
    return (<>
      {/* Floating Theme Button */}
      <material_1.Tooltip title="Змінити тему" placement="left">
        <material_1.IconButton onClick={handleOpen} sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: '#fff',
            boxShadow: `0 4px 20px ${(0, material_1.alpha)(theme.palette.primary.main, 0.4)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'scale(1.1) rotate(90deg)',
                boxShadow: `0 8px 32px ${(0, material_1.alpha)(theme.palette.primary.main, 0.6)}`,
            },
            zIndex: 1200,
        }}>
          <icons_material_1.Palette sx={{ fontSize: 28 }}/>
        </material_1.IconButton>
      </material_1.Tooltip>

      {/* Theme Selection Dialog */}
      <material_1.Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{
            sx: {
                borderRadius: 4,
                background: theme.palette.background.default,
                border: `1px solid ${(0, material_1.alpha)(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 24px 48px ${(0, material_1.alpha)(theme.palette.primary.main, 0.3)}`,
            },
        }}>
        <material_1.DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
            borderBottom: `1px solid ${(0, material_1.alpha)(theme.palette.primary.main, 0.1)}`,
        }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <material_1.Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
        }}>
              🎨
            </material_1.Box>
            <material_1.Box>
              <material_1.Typography variant="h5" fontWeight={700}>
                Вибір теми
              </material_1.Typography>
              <material_1.Typography variant="body2" color="text.secondary">
                Оберіть тему для інтерфейсу Predator12
              </material_1.Typography>
            </material_1.Box>
          </material_1.Box>
          <material_1.IconButton onClick={handleClose} size="small">
            <icons_material_1.Close />
          </material_1.IconButton>
        </material_1.DialogTitle>

        <material_1.DialogContent sx={{ pt: 3, pb: 3 }}>
          <material_1.Grid container spacing={3}>
            {themes_1.allThemes.map((themeConfig) => (<material_1.Grid item xs={12} sm={6} md={4} key={themeConfig.id}>
                <ThemePreviewCard theme={themeConfig} isSelected={currentThemeId === themeConfig.id} isHovered={hoveredTheme === themeConfig.id} onSelect={() => handleThemeSelect(themeConfig.id)} onHover={() => setHoveredTheme(themeConfig.id)} onLeave={() => setHoveredTheme(null)}/>
              </material_1.Grid>))}
          </material_1.Grid>

          {/* Current Theme Info */}
          <material_1.Box sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            background: (0, material_1.alpha)(theme.palette.primary.main, 0.05),
            border: `1px solid ${(0, material_1.alpha)(theme.palette.primary.main, 0.2)}`,
        }}>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <material_1.Typography variant="h6" fontWeight={600}>
                Поточна тема:
              </material_1.Typography>
              <material_1.Chip icon={currentTheme.type === 'dark' ? <icons_material_1.Brightness4 /> : <icons_material_1.Brightness7 />} label={`${currentTheme.icon} ${currentTheme.name}`} color="primary" sx={{ fontWeight: 600 }}/>
            </material_1.Box>
            <material_1.Typography variant="body2" color="text.secondary">
              {currentTheme.description}
            </material_1.Typography>
          </material_1.Box>
        </material_1.DialogContent>
      </material_1.Dialog>
    </>);
};
const ThemePreviewCard = ({ theme, isSelected, isHovered, onSelect, onHover, onLeave, }) => {
    return (<material_1.Card onClick={onSelect} onMouseEnter={onHover} onMouseLeave={onLeave} sx={{
            cursor: 'pointer',
            position: 'relative',
            height: '100%',
            background: theme.colors.background.paper,
            border: isSelected
                ? `2px solid ${theme.colors.primary.main}`
                : `1px solid ${theme.colors.border.light}`,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
            boxShadow: isHovered
                ? `0 12px 32px ${theme.colors.primary.glow}`
                : 'none',
            '&:hover': {
                borderColor: theme.colors.primary.main,
            },
        }}>
      {isSelected && (<material_1.Box sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: theme.colors.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                    '0%, 100%': {
                        boxShadow: `0 0 0 0 ${theme.colors.primary.glow}`,
                    },
                    '50%': {
                        boxShadow: `0 0 0 8px ${theme.colors.primary.glow}`,
                    },
                },
            }}>
          <icons_material_1.Check sx={{ fontSize: 20, color: '#fff' }}/>
        </material_1.Box>)}

      <material_1.CardContent sx={{ p: 2 }}>
        {/* Theme Icon & Name */}
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <material_1.Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: theme.colors.gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: `0 4px 12px ${theme.colors.primary.glow}`,
        }}>
            {theme.icon}
          </material_1.Box>
          <material_1.Box>
            <material_1.Typography variant="h6" fontWeight={700} sx={{ color: theme.colors.text.primary }}>
              {theme.name}
            </material_1.Typography>
            <material_1.Chip icon={theme.type === 'dark' ? <icons_material_1.Brightness4 /> : <icons_material_1.Brightness7 />} label={theme.type === 'dark' ? 'Темна' : 'Світла'} size="small" sx={{
            height: 20,
            fontSize: 11,
            background: (0, material_1.alpha)(theme.colors.primary.main, 0.1),
            color: theme.colors.primary.main,
            border: `1px solid ${(0, material_1.alpha)(theme.colors.primary.main, 0.3)}`,
        }}/>
          </material_1.Box>
        </material_1.Box>

        {/* Description */}
        <material_1.Typography variant="body2" sx={{
            color: theme.colors.text.secondary,
            mb: 2,
            minHeight: 40,
        }}>
          {theme.description}
        </material_1.Typography>

        {/* Color Palette Preview */}
        <material_1.Box>
          <material_1.Typography variant="caption" sx={{
            color: theme.colors.text.secondary,
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: 1,
            mb: 1,
            display: 'block',
        }}>
            Палітра
          </material_1.Typography>
          <material_1.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <ColorSwatch color={theme.colors.primary.main}/>
            <ColorSwatch color={theme.colors.secondary.main}/>
            {Object.values(theme.colors.accent).slice(0, 4).map((color, idx) => (<ColorSwatch key={idx} color={color} size={28}/>))}
          </material_1.Box>
        </material_1.Box>

        {/* Gradient Preview */}
        <material_1.Box sx={{
            mt: 2,
            height: 8,
            borderRadius: 1,
            background: theme.colors.gradients.primary,
            boxShadow: `0 2px 8px ${theme.colors.primary.glow}`,
        }}/>
      </material_1.CardContent>
    </material_1.Card>);
};
const ColorSwatch = ({ color, size = 32 }) => {
    return (<material_1.Tooltip title={color} arrow>
      <material_1.Box sx={{
            width: size,
            height: size,
            borderRadius: 1,
            background: color,
            border: '2px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'scale(1.15)',
                boxShadow: `0 4px 12px ${(0, material_1.alpha)(color, 0.5)}`,
            },
        }}/>
    </material_1.Tooltip>);
};
exports.default = ThemeSwitcher;
