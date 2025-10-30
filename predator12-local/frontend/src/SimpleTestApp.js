"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const styles_1 = require("@mui/material/styles");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
// Simple theme
const theme = (0, styles_1.createTheme)({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00FFC6',
        },
        secondary: {
            main: '#A020F0',
        },
        background: {
            default: '#000000',
            paper: '#1A1D2E',
        },
    },
});
// Simple test component
function SimpleTestApp() {
    return (<material_1.Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #0F121A 50%, #1A1D2E 100%)',
            padding: 4,
        }}>
      <material_1.Container maxWidth="lg">
        <material_1.Typography variant="h2" align="center" sx={{
            color: '#00FFC6',
            mb: 4,
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(0, 255, 198, 0.8)',
        }}>
          🚀 Predator Analytics
        </material_1.Typography>

        <material_1.Typography variant="h4" align="center" sx={{ color: '#A020F0', mb: 6 }}>
          Multi-Agent System Dashboard
        </material_1.Typography>

        <material_1.Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <material_1.Card sx={{ bgcolor: 'rgba(26, 29, 46, 0.8)', border: '1px solid #00FFC6' }}>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <icons_material_1.SmartToy sx={{ fontSize: 40, color: '#00FFC6' }}/>
                <material_1.Typography variant="h5" sx={{ color: '#fff' }}>
                  26 AI Agents
                </material_1.Typography>
              </material_1.Box>
              <material_1.Typography sx={{ color: '#C5D1E6' }}>
                Multi-Agent System активний та працює
              </material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>

          <material_1.Card sx={{ bgcolor: 'rgba(26, 29, 46, 0.8)', border: '1px solid #00FF88' }}>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <icons_material_1.TrendingUp sx={{ fontSize: 40, color: '#00FF88' }}/>
                <material_1.Typography variant="h5" sx={{ color: '#fff' }}>
                  Self-Healing
                </material_1.Typography>
              </material_1.Box>
              <material_1.Typography sx={{ color: '#C5D1E6' }}>
                Автоматичне відновлення активне
              </material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>

          <material_1.Card sx={{ bgcolor: 'rgba(26, 29, 46, 0.8)', border: '1px solid #A020F0' }}>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <icons_material_1.Rocket sx={{ fontSize: 40, color: '#A020F0' }}/>
                <material_1.Typography variant="h5" sx={{ color: '#fff' }}>
                  Self-Learning
                </material_1.Typography>
              </material_1.Box>
              <material_1.Typography sx={{ color: '#C5D1E6' }}>
                Continuous learning у процесі
              </material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Box>

        <material_1.Box sx={{
            mt: 6,
            p: 4,
            bgcolor: 'rgba(26, 29, 46, 0.6)',
            borderRadius: 2,
            border: '2px solid #00FFC6',
            textAlign: 'center',
        }}>
          <material_1.Typography variant="h6" sx={{ color: '#00FFC6', mb: 2 }}>
            ✅ Веб-інтерфейс працює!
          </material_1.Typography>
          <material_1.Typography sx={{ color: '#C5D1E6' }}>
            Якщо ви бачите цей текст - React рендериться коректно
          </material_1.Typography>
        </material_1.Box>
      </material_1.Container>
    </material_1.Box>);
}
// Render
const root = document.getElementById('root');
if (root) {
    client_1.default.createRoot(root).render(<react_1.default.StrictMode>
      <styles_1.ThemeProvider theme={theme}>
        <SimpleTestApp />
      </styles_1.ThemeProvider>
    </react_1.default.StrictMode>);
}
exports.default = SimpleTestApp;
