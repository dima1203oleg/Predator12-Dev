/**
 * 🎨 THEME SWITCHER COMPONENT
 *
 * Компонент для динамічного переключення тем інтерфейсу
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from '@mui/icons-material';
import { allThemes, ThemeConfig } from '../../theme/themes';

interface ThemeSwitcherProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentThemeId,
  onThemeChange,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleThemeSelect = (themeId: string) => {
    onThemeChange(themeId);
    handleClose();
  };

  const currentTheme = allThemes.find(t => t.id === currentThemeId) || allThemes[0];

  return (
    <>
      {/* Floating Theme Button */}
      <Tooltip title="Змінити тему" placement="left">
        <IconButton
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: '#fff',
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.6)}`,
            },
            zIndex: 1200,
          }}
        >
          <PaletteIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Tooltip>

      {/* Theme Selection Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: theme.palette.background.default,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              🎨
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Вибір теми
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Оберіть тему для інтерфейсу Predator12
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Grid container spacing={3}>
            {allThemes.map((themeConfig) => (
              <Grid item xs={12} sm={6} md={4} key={themeConfig.id}>
                <ThemePreviewCard
                  theme={themeConfig}
                  isSelected={currentThemeId === themeConfig.id}
                  isHovered={hoveredTheme === themeConfig.id}
                  onSelect={() => handleThemeSelect(themeConfig.id)}
                  onHover={() => setHoveredTheme(themeConfig.id)}
                  onLeave={() => setHoveredTheme(null)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Current Theme Info */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Поточна тема:
              </Typography>
              <Chip
                icon={currentTheme.type === 'dark' ? <DarkIcon /> : <LightIcon />}
                label={`${currentTheme.icon} ${currentTheme.name}`}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {currentTheme.description}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ============= THEME PREVIEW CARD =============

interface ThemePreviewCardProps {
  theme: ThemeConfig;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  theme,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}) => {
  return (
    <Card
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      sx={{
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
      }}
    >
      {isSelected && (
        <Box
          sx={{
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
          }}
        >
          <CheckIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
      )}

      <CardContent sx={{ p: 2 }}>
        {/* Theme Icon & Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: theme.colors.gradients.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              boxShadow: `0 4px 12px ${theme.colors.primary.glow}`,
            }}
          >
            {theme.icon}
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: theme.colors.text.primary }}
            >
              {theme.name}
            </Typography>
            <Chip
              icon={theme.type === 'dark' ? <DarkIcon /> : <LightIcon />}
              label={theme.type === 'dark' ? 'Темна' : 'Світла'}
              size="small"
              sx={{
                height: 20,
                fontSize: 11,
                background: alpha(theme.colors.primary.main, 0.1),
                color: theme.colors.primary.main,
                border: `1px solid ${alpha(theme.colors.primary.main, 0.3)}`,
              }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: theme.colors.text.secondary,
            mb: 2,
            minHeight: 40,
          }}
        >
          {theme.description}
        </Typography>

        {/* Color Palette Preview */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: 1,
              mb: 1,
              display: 'block',
            }}
          >
            Палітра
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <ColorSwatch color={theme.colors.primary.main} />
            <ColorSwatch color={theme.colors.secondary.main} />
            {Object.values(theme.colors.accent).slice(0, 4).map((color, idx) => (
              <ColorSwatch key={idx} color={color} size={28} />
            ))}
          </Box>
        </Box>

        {/* Gradient Preview */}
        <Box
          sx={{
            mt: 2,
            height: 8,
            borderRadius: 1,
            background: theme.colors.gradients.primary,
            boxShadow: `0 2px 8px ${theme.colors.primary.glow}`,
          }}
        />
      </CardContent>
    </Card>
  );
};

// ============= COLOR SWATCH =============

interface ColorSwatchProps {
  color: string;
  size?: number;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, size = 32 }) => {
  return (
    <Tooltip title={color} arrow>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          background: color,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.15)',
            boxShadow: `0 4px 12px ${alpha(color, 0.5)}`,
          },
        }}
      />
    </Tooltip>
  );
};

export default ThemeSwitcher;
