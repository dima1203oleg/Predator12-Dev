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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AnalyticsModule = () => {
    const [dashboardUrl] = (0, react_1.useState)('http://localhost:5601');
    const [isConnected, setIsConnected] = (0, react_1.useState)(true);
    const [searches] = (0, react_1.useState)([
        {
            id: 'customs-fraud',
            name: 'Пошук шахрайства',
            query: 'customs_fraud_detection',
            lastUsed: '10 хв тому',
            results: 247
        },
        {
            id: 'trade-anomalies',
            name: 'Торговельні аномалії',
            query: 'trade_volume_anomalies',
            lastUsed: '25 хв тому',
            results: 89
        },
        {
            id: 'compliance-check',
            name: 'Перевірка відповідності',
            query: 'compliance_violations',
            lastUsed: '1 год тому',
            results: 156
        }
    ]);
    const [indices] = (0, react_1.useState)([
        { name: 'customs-declarations', docs: 1234567, size: '2.3 GB', status: 'healthy' },
        { name: 'trade-transactions', docs: 890123, size: '1.8 GB', status: 'healthy' },
        { name: 'osint-data', docs: 456789, size: '980 MB', status: 'warning' },
        { name: 'fraud-patterns', docs: 78901, size: '450 MB', status: 'healthy' }
    ]);
    const handleOpenDashboard = () => {
        window.open(dashboardUrl, '_blank');
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return nexusTheme_1.nexusColors.success;
            case 'warning': return nexusTheme_1.nexusColors.warning;
            case 'error': return nexusTheme_1.nexusColors.error;
            default: return nexusTheme_1.nexusColors.frost;
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'healthy': return '🟢';
            case 'warning': return '🟡';
            case 'error': return '🔴';
            default: return '⚪';
        }
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.frost,
            textAlign: 'center',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.emerald})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
        🔍 Аналітична Палуба OpenSearch
      </material_1.Typography>

      {/* Статус з'єднання */}
      <material_1.Alert severity={isConnected ? "success" : "error"} sx={{
            mb: 3,
            background: isConnected ? `${nexusTheme_1.nexusColors.success}20` : `${nexusTheme_1.nexusColors.error}20`,
            border: `1px solid ${isConnected ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.error}40`,
            color: nexusTheme_1.nexusColors.frost
        }}>
        {isConnected ?
            `✅ З'єднання з OpenSearch активне (${dashboardUrl})` :
            `❌ Немає з'єднання з OpenSearch`}
      </material_1.Alert>

      <material_1.Grid container spacing={3}>
        {/* Швидкий доступ */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
            border: `1px solid ${nexusTheme_1.nexusColors.sapphire}40`,
            borderRadius: 2,
            p: 3,
            textAlign: 'center'
        }}>
            <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              🚀 Швидкий доступ
            </material_1.Typography>

            <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 3 }}>
              Відкрити повнофункціональну OpenSearch Dashboard для глибокого аналізу даних
            </material_1.Typography>

            <material_1.Button variant="contained" size="large" startIcon={<icons_material_1.OpenInNew />} onClick={handleOpenDashboard} sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.emerald})`,
            fontSize: '1.1rem',
            py: 1.5,
            px: 4,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`
            }
        }}>
              Відкрити OpenSearch Dashboard
            </material_1.Button>

            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow, display: 'block', mt: 2 }}>
              {dashboardUrl}
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>

        {/* Швидкі пошуки */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
            border: `1px solid ${nexusTheme_1.nexusColors.emerald}40`,
            borderRadius: 2,
            p: 2
        }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              ⚡ Швидкі пошуки
            </material_1.Typography>

            {searches.map((search) => (<material_1.Box key={search.id} sx={{ mb: 2, p: 1.5, background: `${nexusTheme_1.nexusColors.obsidian}80`, borderRadius: 1 }}>
                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 600 }}>
                    {search.name}
                  </material_1.Typography>
                  <material_1.Chip size="small" label={`${search.results} результатів`} sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
                color: nexusTheme_1.nexusColors.emerald,
                fontSize: '0.7rem'
            }}/>
                </material_1.Box>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block', mb: 1 }}>
                  Query: {search.query}
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                  Останнє використання: {search.lastUsed}
                </material_1.Typography>
              </material_1.Box>))}

            <material_1.Button variant="outlined" fullWidth startIcon={<icons_material_1.Search />} sx={{
            mt: 1,
            borderColor: nexusTheme_1.nexusColors.emerald,
            color: nexusTheme_1.nexusColors.emerald,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.sapphire,
                color: nexusTheme_1.nexusColors.sapphire
            }
        }}>
              Новий пошук
            </material_1.Button>
          </material_1.Card>
        </material_1.Grid>

        {/* Індекси */}
        <material_1.Grid item xs={12}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
            border: `1px solid ${nexusTheme_1.nexusColors.amethyst}40`,
            borderRadius: 2,
            p: 2
        }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              📚 Стан індексів
            </material_1.Typography>

            <material_1.Grid container spacing={2}>
              {indices.map((index) => (<material_1.Grid item xs={12} sm={6} md={3} key={index.name}>
                  <material_1.Box sx={{
                p: 2,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}CC, ${nexusTheme_1.nexusColors.darkMatter}80)`,
                border: `1px solid ${getStatusColor(index.status)}40`,
                borderRadius: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 15px ${getStatusColor(index.status)}30`
                }
            }}>
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <material_1.Typography sx={{ fontSize: '1rem', mr: 1 }}>
                        {getStatusEmoji(index.status)}
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 600 }}>
                        {index.name}
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block' }}>
                      📄 Документів: {index.docs.toLocaleString()}
                    </material_1.Typography>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block' }}>
                      💾 Розмір: {index.size}
                    </material_1.Typography>

                    <material_1.Chip size="small" label={index.status} sx={{
                mt: 1,
                backgroundColor: `${getStatusColor(index.status)}20`,
                color: getStatusColor(index.status),
                fontSize: '0.7rem'
            }}/>
                  </material_1.Box>
                </material_1.Grid>))}
            </material_1.Grid>
          </material_1.Card>
        </material_1.Grid>

        {/* Додаткові дії */}
        <material_1.Grid item xs={12}>
          <material_1.Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <material_1.Button variant="outlined" startIcon={<icons_material_1.Analytics />} sx={{
            borderColor: nexusTheme_1.nexusColors.sapphire,
            color: nexusTheme_1.nexusColors.sapphire,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.emerald,
                color: nexusTheme_1.nexusColors.emerald
            }
        }}>
              Створити візуалізацію
            </material_1.Button>

            <material_1.Button variant="outlined" startIcon={<icons_material_1.FilterList />} sx={{
            borderColor: nexusTheme_1.nexusColors.amethyst,
            color: nexusTheme_1.nexusColors.amethyst,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.sapphire,
                color: nexusTheme_1.nexusColors.sapphire
            }
        }}>
              Налаштувати фільтри
            </material_1.Button>

            <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} sx={{
            borderColor: nexusTheme_1.nexusColors.emerald,
            color: nexusTheme_1.nexusColors.emerald,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.warning,
                color: nexusTheme_1.nexusColors.warning
            }
        }}>
              Оновити дані
            </material_1.Button>
          </material_1.Box>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = AnalyticsModule;
