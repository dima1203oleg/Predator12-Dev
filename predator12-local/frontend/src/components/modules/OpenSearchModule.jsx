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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchModule = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const OpenSearchModule = () => {
    const [selectedDashboard, setSelectedDashboard] = (0, react_1.useState)('');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)({
        index: 'logs-*',
        query: '*',
        timeRange: {
            from: 'now-1h',
            to: 'now'
        },
        filters: []
    });
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [ssoEnabled, setSsoEnabled] = (0, react_1.useState)(true);
    const [embedMode, setEmbedMode] = (0, react_1.useState)(true);
    const [customTheme, setCustomTheme] = (0, react_1.useState)(true);
    // TODO: Отримувати dashboards, indices, timeRanges з реального OpenSearch API
    const dashboards = [];
    const indices = [];
    const timeRanges = [];
    (0, react_1.useEffect)(() => {
        // TODO: Set default dashboard з реального API
        // setSelectedDashboard(dashboards[0]?.id || '');
    }, []);
    const handleDashboardChange = (dashboardId) => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true);
        setSelectedDashboard(dashboardId);
        // TODO: Реальний API-виклик для завантаження дашборду
        // await openSearchAPI.loadDashboard(dashboardId);
        setIsLoading(false);
    });
    const handleSearch = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true);
        // TODO: Реальний API-виклик для пошуку
        // await openSearchAPI.search(searchQuery);
        setIsLoading(false);
    });
    const addFilter = () => {
        setSearchQuery(prev => (Object.assign(Object.assign({}, prev), { filters: [
                ...prev.filters,
                { field: 'level', operator: 'is', value: 'ERROR' }
            ] })));
    };
    const removeFilter = (index) => {
        setSearchQuery(prev => (Object.assign(Object.assign({}, prev), { filters: prev.filters.filter((_, i) => i !== index) })));
    };
    const generateOpenSearchUrl = () => {
        // In production, this would generate the actual OpenSearch Dashboard URL
        const baseUrl = 'http://localhost:5601'; // OpenSearch Dashboard URL
        const dashboard = dashboards.find(d => d.id === selectedDashboard);
        if (dashboard) {
            return `${baseUrl}/app/dashboards#/view/${dashboard.id}`;
        }
        return `${baseUrl}/app/home`;
    };
    const selectedDashboardData = dashboards.find(d => d.id === selectedDashboard);
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.info,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusTheme_1.nexusColors.info}`
        }}>
          <icons_material_1.Search sx={{ mr: 2, verticalAlign: 'middle' }}/>
          Аналітична Палуба
        </material_1.Typography>

        <material_1.Grid container spacing={3}>
          {/* Dashboard Controls */}
          <material_1.Grid item xs={12} md={4}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.emerald }}>
                  <icons_material_1.Dashboard sx={{ mr: 1, verticalAlign: 'middle' }}/>
                  Панель Управління
                </material_1.Typography>

                <material_1.FormControl fullWidth sx={{ mb: 2 }}>
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Дашборд</material_1.InputLabel>
                  <material_1.Select value={selectedDashboard} onChange={(e) => handleDashboardChange(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    {dashboards.map((dashboard) => (<material_1.MenuItem key={dashboard.id} value={dashboard.id}>
                        <material_1.Box>
                          <material_1.Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {dashboard.name}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                            {dashboard.category}
                          </material_1.Typography>
                        </material_1.Box>
                      </material_1.MenuItem>))}
                  </material_1.Select>
                </material_1.FormControl>

                {selectedDashboardData && (<material_1.Box sx={{ mb: 2, p: 2, border: `1px solid ${nexusTheme_1.nexusColors.quantum}`, borderRadius: 1 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                      {selectedDashboardData.description}
                    </material_1.Typography>
                    <material_1.Chip label={selectedDashboardData.category} size="small" sx={{
                backgroundColor: nexusTheme_1.nexusColors.sapphire,
                color: nexusTheme_1.nexusColors.frost,
                mr: 1
            }}/>
                    {selectedDashboardData.isDefault && (<material_1.Chip label="Default" size="small" sx={{
                    backgroundColor: nexusTheme_1.nexusColors.emerald,
                    color: nexusTheme_1.nexusColors.frost
                }}/>)}
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow, display: 'block', mt: 1 }}>
                      Оновлено: {selectedDashboardData.lastModified.toLocaleString()}
                    </material_1.Typography>
                  </material_1.Box>)}

                <material_1.Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={() => handleDashboardChange(selectedDashboard)} size="small">
                    Оновити
                  </material_1.Button>
                  <material_1.Tooltip title="Повноекранний режим">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                      <icons_material_1.Fullscreen />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title="Налаштування">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.warning }}>
                      <icons_material_1.Settings />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                </material_1.Box>

                {/* Integration Settings */}
                <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.amethyst, mb: 1 }}>
                  Налаштування Інтеграції
                </material_1.Typography>

                <material_1.FormControlLabel control={<material_1.Switch checked={ssoEnabled} onChange={(e) => setSsoEnabled(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="SSO Authentication" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block', mb: 1 }}/>

                <material_1.FormControlLabel control={<material_1.Switch checked={embedMode} onChange={(e) => setEmbedMode(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="Embedded Mode" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block', mb: 1 }}/>

                <material_1.FormControlLabel control={<material_1.Switch checked={customTheme} onChange={(e) => setCustomTheme(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="Nexus Theme" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block' }}/>
              </material_1.CardContent>
            </material_1.Card>

            {/* Quick Search */}
            <material_1.Card className="holographic" sx={{ mt: 2 }}>
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.sapphire }}>
                  <icons_material_1.FilterList sx={{ mr: 1, verticalAlign: 'middle' }}/>
                  Швидкий Пошук
                </material_1.Typography>

                <material_1.FormControl fullWidth sx={{ mb: 2 }}>
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Індекс</material_1.InputLabel>
                  <material_1.Select value={searchQuery.index} onChange={(e) => setSearchQuery(prev => (Object.assign(Object.assign({}, prev), { index: e.target.value })))} sx={{ color: nexusTheme_1.nexusColors.frost }} size="small">
                    {indices.map((index) => (<material_1.MenuItem key={index} value={index}>
                        {index}
                      </material_1.MenuItem>))}
                  </material_1.Select>
                </material_1.FormControl>

                <material_1.TextField fullWidth label="Query" value={searchQuery.query} onChange={(e) => setSearchQuery(prev => (Object.assign(Object.assign({}, prev), { query: e.target.value })))} placeholder="Enter search query..." size="small" sx={{ mb: 2 }}/>

                <material_1.FormControl fullWidth sx={{ mb: 2 }}>
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.nebula }}>Часовий діапазон</material_1.InputLabel>
                  <material_1.Select value={searchQuery.timeRange.from} onChange={(e) => setSearchQuery(prev => (Object.assign(Object.assign({}, prev), { timeRange: Object.assign(Object.assign({}, prev.timeRange), { from: e.target.value }) })))} sx={{ color: nexusTheme_1.nexusColors.frost }} size="small">
                    {timeRanges.map((range) => (<material_1.MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </material_1.MenuItem>))}
                  </material_1.Select>
                </material_1.FormControl>

                {/* Filters */}
                <material_1.Box sx={{ mb: 2 }}>
                  <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      Фільтри
                    </material_1.Typography>
                    <material_1.Button size="small" onClick={addFilter} sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                      Додати
                    </material_1.Button>
                  </material_1.Box>

                  {searchQuery.filters.map((filter, index) => (<material_1.Chip key={index} label={`${filter.field} ${filter.operator} ${filter.value}`} onDelete={() => removeFilter(index)} size="small" sx={{
                backgroundColor: nexusTheme_1.nexusColors.amethyst,
                color: nexusTheme_1.nexusColors.frost,
                mr: 1,
                mb: 1
            }}/>))}
                </material_1.Box>

                <material_1.Button variant="contained" startIcon={<icons_material_1.Search />} onClick={handleSearch} disabled={isLoading} fullWidth sx={{
            backgroundColor: nexusTheme_1.nexusColors.sapphire,
            '&:hover': { backgroundColor: nexusTheme_1.nexusColors.sapphire + 'CC' }
        }}>
                  Виконати Пошук
                </material_1.Button>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* OpenSearch Dashboard Embed */}
          <material_1.Grid item xs={12} md={8}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    <icons_material_1.InsertChart sx={{ mr: 1, verticalAlign: 'middle' }}/>
                    OpenSearch Dashboard
                  </material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {ssoEnabled && (<material_1.Chip label="SSO Active" size="small" sx={{
                backgroundColor: nexusTheme_1.nexusColors.emerald,
                color: nexusTheme_1.nexusColors.frost
            }}/>)}
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                      {generateOpenSearchUrl()}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Box>

                {isLoading && (<material_1.Box sx={{ mb: 2 }}>
                    <material_1.LinearProgress sx={{
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.sapphire,
                },
            }}/>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      Завантаження дашборду...
                    </material_1.Typography>
                  </material_1.Box>)}

                {embedMode ? (<material_1.Box sx={{
                width: '100%',
                height: 600,
                border: `2px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                background: customTheme
                    ? `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`
                    : '#ffffff'
            }}>
                    {/* Simulated OpenSearch Dashboard */}
                    <material_1.Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2
            }}>
                      {/* Header */}
                      <material_1.Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                pb: 1,
                borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`
            }}>
                        <material_1.Typography variant="h6" sx={{ color: customTheme ? nexusTheme_1.nexusColors.frost : '#333' }}>
                          {(selectedDashboardData === null || selectedDashboardData === void 0 ? void 0 : selectedDashboardData.name) || 'Dashboard'}
                        </material_1.Typography>
                        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                          <material_1.Chip label="Live" size="small" color="success"/>
                          <material_1.Chip label={searchQuery.timeRange.from} size="small"/>
                        </material_1.Box>
                      </material_1.Box>

                      {/* Mock Dashboard Content */}
                      <material_1.Grid container spacing={2} sx={{ flex: 1 }}>
                        <material_1.Grid item xs={6}>
                          <material_1.Box sx={{
                height: 200,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 1,
                p: 2,
                background: customTheme ? nexusTheme_1.nexusColors.darkMatter + '40' : '#f5f5f5'
            }}>
                            <material_1.Typography variant="subtitle2" sx={{ color: customTheme ? nexusTheme_1.nexusColors.frost : '#333', mb: 1 }}>
                              Events Over Time
                            </material_1.Typography>
                            <material_1.Box sx={{
                height: '80%',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-around',
                gap: 1
            }}>
                              {[40, 65, 30, 80, 45, 70, 55].map((height, i) => (<material_1.Box key={i} sx={{
                    width: 20,
                    height: `${height}%`,
                    backgroundColor: nexusTheme_1.nexusColors.sapphire,
                    borderRadius: '2px 2px 0 0'
                }}/>))}
                            </material_1.Box>
                          </material_1.Box>
                        </material_1.Grid>

                        <material_1.Grid item xs={6}>
                          <material_1.Box sx={{
                height: 200,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 1,
                p: 2,
                background: customTheme ? nexusTheme_1.nexusColors.darkMatter + '40' : '#f5f5f5'
            }}>
                            <material_1.Typography variant="subtitle2" sx={{ color: customTheme ? nexusTheme_1.nexusColors.frost : '#333', mb: 1 }}>
                              Top Sources
                            </material_1.Typography>
                            <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {['application.log', 'security.log', 'system.log', 'network.log'].map((source, i) => (<material_1.Box key={source} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <material_1.Typography variant="body2" sx={{ color: customTheme ? nexusTheme_1.nexusColors.nebula : '#666' }}>
                                    {source}
                                  </material_1.Typography>
                                  <material_1.Typography variant="body2" sx={{ color: customTheme ? nexusTheme_1.nexusColors.frost : '#333' }}>
                                    {Math.floor(Math.random() * 1000)}
                                  </material_1.Typography>
                                </material_1.Box>))}
                            </material_1.Box>
                          </material_1.Box>
                        </material_1.Grid>

                        <material_1.Grid item xs={12}>
                          <material_1.Box sx={{
                height: 250,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 1,
                p: 2,
                background: customTheme ? nexusTheme_1.nexusColors.darkMatter + '40' : '#f5f5f5'
            }}>
                            <material_1.Typography variant="subtitle2" sx={{ color: customTheme ? nexusTheme_1.nexusColors.frost : '#333', mb: 1 }}>
                              Recent Events
                            </material_1.Typography>
                            <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '90%', overflow: 'auto' }}>
                              {Array.from({ length: 8 }, (_, i) => (<material_1.Box key={i} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                    border: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                    borderRadius: 1
                }}>
                                  <material_1.Typography variant="body2" sx={{ color: customTheme ? nexusTheme_1.nexusColors.nebula : '#666' }}>
                                    {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                                  </material_1.Typography>
                                  <material_1.Typography variant="body2" sx={{ color: customTheme ? nexusTheme_1.nexusColors.frost : '#333' }}>
                                    Event {i + 1} - Sample log entry
                                  </material_1.Typography>
                                  <material_1.Chip label={['INFO', 'WARN', 'ERROR'][i % 3]} size="small" sx={{
                    backgroundColor: ['INFO', 'WARN', 'ERROR'][i % 3] === 'ERROR'
                        ? nexusTheme_1.nexusColors.crimson
                        : ['INFO', 'WARN', 'ERROR'][i % 3] === 'WARN'
                            ? nexusTheme_1.nexusColors.warning
                            : nexusTheme_1.nexusColors.emerald,
                    color: nexusTheme_1.nexusColors.frost
                }}/>
                                </material_1.Box>))}
                            </material_1.Box>
                          </material_1.Box>
                        </material_1.Grid>
                      </material_1.Grid>
                    </material_1.Box>

                    {/* Overlay for demo purposes */}
                    <material_1.Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: isLoading ? 'auto' : 'none'
            }}>
                      <material_1.Box sx={{ textAlign: 'center' }}>
                        <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.emerald, mb: 1 }}>
                          Синхронізація з OpenSearch...
                        </material_1.Typography>
                        <material_1.LinearProgress sx={{
                width: 200,
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.emerald,
                },
            }}/>
                      </material_1.Box>
                    </material_1.Box>
                  </material_1.Box>) : (<material_1.Alert severity="info" sx={{ mb: 2 }}>
                    Embedded mode disabled.
                    <material_1.Button href={generateOpenSearchUrl()} target="_blank" sx={{ ml: 1, color: nexusTheme_1.nexusColors.sapphire }}>
                      Open in new tab
                    </material_1.Button>
                  </material_1.Alert>)}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.OpenSearchModule = OpenSearchModule;
