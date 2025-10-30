"use strict";
/**
 * 🎨 THEME INTEGRATION EXAMPLE
 *
 * Приклад інтеграції системи тем у додаток
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const ThemeContext_1 = require("./contexts/ThemeContext");
const ThemeSwitcher_1 = __importDefault(require("./components/theme/ThemeSwitcher"));
// ============= APP WITH THEME =============
const AppContent = () => {
    const { currentTheme, setTheme, colors } = (0, ThemeContext_1.useNexusTheme)();
    return (<material_1.Box sx={{
            minHeight: '100vh',
            background: colors.background.default,
            transition: 'all 0.5s ease',
        }}>
      <material_1.Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <material_1.Box sx={{ mb: 6, textAlign: 'center' }}>
          <material_1.Typography variant="h2" fontWeight={700} sx={{
            background: colors.gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
        }}>
            🎨 Predator12 Nexus Core V3
          </material_1.Typography>
          <material_1.Typography variant="h5" color="text.secondary">
            Multi-Theme System Demo
          </material_1.Typography>
        </material_1.Box>

        {/* Current Theme Info */}
        <material_1.Card sx={{ mb: 4 }}>
          <material_1.CardContent>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <material_1.Box sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            background: colors.gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
        }}>
                {currentTheme.icon}
              </material_1.Box>
              <material_1.Box>
                <material_1.Typography variant="h4" fontWeight={700}>
                  {currentTheme.name}
                </material_1.Typography>
                <material_1.Typography variant="body1" color="text.secondary">
                  {currentTheme.description}
                </material_1.Typography>
              </material_1.Box>
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>

        {/* Demo Components */}
        <material_1.Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Primary Button */}
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Primary Button
              </material_1.Typography>
              <material_1.Button variant="contained" fullWidth>
                Click Me
              </material_1.Button>
            </material_1.CardContent>
          </material_1.Card>

          {/* Secondary Button */}
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Secondary Button
              </material_1.Typography>
              <material_1.Button variant="contained" color="secondary" fullWidth>
                Secondary
              </material_1.Button>
            </material_1.CardContent>
          </material_1.Card>

          {/* Outlined Button */}
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Outlined Button
              </material_1.Typography>
              <material_1.Button variant="outlined" fullWidth>
                Outlined
              </material_1.Button>
            </material_1.CardContent>
          </material_1.Card>

          {/* Status Colors */}
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Status Colors
              </material_1.Typography>
              <material_1.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <material_1.Button size="small" variant="contained" color="success">
                  Success
                </material_1.Button>
                <material_1.Button size="small" variant="contained" color="warning">
                  Warning
                </material_1.Button>
                <material_1.Button size="small" variant="contained" color="error">
                  Error
                </material_1.Button>
                <material_1.Button size="small" variant="contained" color="info">
                  Info
                </material_1.Button>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Box>

        {/* Accent Colors Preview */}
        <material_1.Card sx={{ mt: 4 }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Accent Colors
            </material_1.Typography>
            <material_1.Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(colors.accent).map(([name, color]) => (<material_1.Box key={name} sx={{ textAlign: 'center' }}>
                  <material_1.Box sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                background: color,
                mb: 1,
                border: '2px solid rgba(255, 255, 255, 0.2)',
            }}/>
                  <material_1.Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                    {name}
                  </material_1.Typography>
                </material_1.Box>))}
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>

        {/* Gradients Preview */}
        <material_1.Card sx={{ mt: 4 }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Gradients
            </material_1.Typography>
            <material_1.Box sx={{ display: 'grid', gap: 2 }}>
              {Object.entries(colors.gradients).map(([name, gradient]) => (<material_1.Box key={name}>
                  <material_1.Typography variant="caption" sx={{ mb: 1, display: 'block', textTransform: 'capitalize' }}>
                    {name}
                  </material_1.Typography>
                  <material_1.Box sx={{
                height: 60,
                borderRadius: 2,
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                    <material_1.Typography variant="h6" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                      {name.charAt(0).toUpperCase() + name.slice(1)} Gradient
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Box>))}
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Container>

      {/* Theme Switcher */}
      <ThemeSwitcher_1.default currentThemeId={currentTheme.id} onThemeChange={setTheme}/>
    </material_1.Box>);
};
// ============= MAIN APP =============
const App = () => {
    return (<ThemeContext_1.NexusThemeProvider defaultThemeId="dark-cyber">
      <AppContent />
    </ThemeContext_1.NexusThemeProvider>);
};
exports.default = App;
