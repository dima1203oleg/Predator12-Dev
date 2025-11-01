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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const styles_1 = require("@mui/material/styles");
const material_1 = require("@mui/material");
const react_router_dom_1 = require("react-router-dom");
const nexusTheme_1 = require("./theme/nexusTheme");
const MainLayout_1 = __importDefault(require("./layout/MainLayout"));
const Dashboard_1 = __importDefault(require("./pages/Dashboard"));
const Agents_1 = __importDefault(require("./pages/Agents"));
const DataOps_1 = __importDefault(require("./pages/DataOps"));
const Security_1 = __importDefault(require("./pages/Security"));
const NexusVisualEffects_1 = require("./components/effects/NexusVisualEffects");
const loaderBackground = [
    'radial-gradient(circle at top, rgba(10, 255, 200, 0.08), transparent 60%)',
    'radial-gradient(circle at bottom, rgba(10, 117, 255, 0.12), transparent 55%)',
    '#010409'
].join(', ');
const LoaderOverlay = () => (<material_1.Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: loaderBackground
    }}>
    <material_1.CircularProgress sx={{ color: '#38bdf8' }} size={48} thickness={4}/>
    <material_1.Typography variant="subtitle1" sx={{ color: '#93c5fd', mt: 3 }}>
      Ініціалізація Predator Nexus UI...
    </material_1.Typography>
  </material_1.Box>);
const NotFoundPage = () => (<material_1.Box sx={{ p: 6, textAlign: 'center' }}>
    <material_1.Typography variant="h2" sx={{ color: '#fca5a5', fontWeight: 700 }}>
      404
    </material_1.Typography>
    <material_1.Typography variant="h5" sx={{ color: '#bfdbfe', mt: 2 }}>
      Розділ у розробці. Повернімося на головну панель.
    </material_1.Typography>
  </material_1.Box>);
const MinimalApp = () => {
    return (<styles_1.ThemeProvider theme={nexusTheme_1.nexusTheme}>
      <material_1.CssBaseline />

      {/* Nexus Visual Effects */}
      <NexusVisualEffects_1.NexusVisualEffects showCosmicDust={true} showHolographicFrames={true} showScanLines={true}/>
      <react_router_dom_1.BrowserRouter>
        <react_1.Suspense fallback={<LoaderOverlay />}>
          <react_router_dom_1.Routes>
            <react_router_dom_1.Route path="/" element={<MainLayout_1.default />}>
              <react_router_dom_1.Route index element={<react_router_dom_1.Navigate to="/dashboard" replace/>}/>
              <react_router_dom_1.Route path="dashboard" element={<Dashboard_1.default />}/>
              <react_router_dom_1.Route path="agents" element={<Agents_1.default />}/>
              <react_router_dom_1.Route path="dataops" element={<DataOps_1.default />}/>
              <react_router_dom_1.Route path="security" element={<Security_1.default />}/>
              <react_router_dom_1.Route path="*" element={<NotFoundPage />}/>
            </react_router_dom_1.Route>
          </react_router_dom_1.Routes>
        </react_1.Suspense>
      </react_router_dom_1.BrowserRouter>
    </styles_1.ThemeProvider>);
};
exports.default = MinimalApp;
