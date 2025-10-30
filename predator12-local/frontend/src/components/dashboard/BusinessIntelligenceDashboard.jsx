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
const recharts_1 = require("recharts");
const framer_motion_1 = require("framer-motion");
const BusinessIntelligenceDashboard = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)(0);
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    const [investigations, setInvestigations] = (0, react_1.useState)([]);
    const [marketData, setMarketData] = (0, react_1.useState)([]);
    // Симуляція даних
    (0, react_1.useEffect)(() => {
        const timer = setInterval(() => {
            // Генерація нових алертів
            const newAlerts = generateRandomAlerts();
            setAlerts(prev => [...newAlerts, ...prev.slice(0, 19)]);
            // Оновлення ринкових даних
            const newMarketData = generateMarketData();
            setMarketData(prev => [...prev.slice(-29), newMarketData]);
            // Оновлення розслідувань
            if (Math.random() < 0.2) {
                const newInvestigation = generateInvestigation();
                setInvestigations(prev => [newInvestigation, ...prev.slice(0, 9)]);
            }
        }, 3000);
        return () => clearInterval(timer);
    }, []);
    const generateRandomAlerts = () => {
        const alertTypes = [
            {
                type: 'suspicious_transaction',
                message: 'Підозріла транзакція $1.2M через криптовалюту',
                severity: 'high',
                category: 'banking',
                confidence: 92.5
            },
            {
                type: 'procurement_fraud',
                message: 'Виявлено завищення цін у держзакупівлі на 280%',
                severity: 'critical',
                category: 'government',
                confidence: 89.1
            },
            {
                type: 'market_manipulation',
                message: 'Можлива маніпуляція акціями ENERGY сектору',
                severity: 'medium',
                category: 'market',
                confidence: 76.3
            },
            {
                type: 'tax_evasion',
                message: 'Схема мінімізації податків через офшори',
                severity: 'high',
                category: 'finance',
                confidence: 84.7
            }
        ];
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        return [Object.assign(Object.assign({}, randomAlert), { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), status: 'new' })];
    };
    const generateMarketData = () => ({
        time: new Date().toLocaleTimeString(),
        suspiciousVolume: Math.random() * 100,
        riskScore: Math.random() * 100,
        compliance: 85 + Math.random() * 15,
        investigations: Math.floor(Math.random() * 10)
    });
    const generateInvestigation = () => ({
        id: Date.now(),
        title: `Розслідування #${Math.floor(Math.random() * 9999)}`,
        type: ['Банківське шахрайство', 'Корупція в держсекторі', 'Ринкові маніпуляції'][Math.floor(Math.random() * 3)],
        status: ['В процесі', 'Аналіз', 'Перевірка'][Math.floor(Math.random() * 3)],
        priority: ['Висока', 'Критична', 'Середня'][Math.floor(Math.random() * 3)],
        evidence: Math.floor(Math.random() * 50) + 10,
        timestamp: new Date().toLocaleString()
    });
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <icons_material_1.Error sx={{ color: '#f44336' }}/>;
            case 'high': return <icons_material_1.Warning sx={{ color: '#ff9800' }}/>;
            case 'medium': return <icons_material_1.Info sx={{ color: '#2196f3' }}/>;
            case 'low': return <icons_material_1.CheckCircle sx={{ color: '#4caf50' }}/>;
            default: return <icons_material_1.Info />;
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#f44336';
            case 'high': return '#ff9800';
            case 'medium': return '#2196f3';
            case 'low': return '#4caf50';
            default: return '#9e9e9e';
        }
    };
    const TabPanel = ({ children, value, index }) => (<div hidden={value !== index}>
      {value === index && <material_1.Box sx={{ p: 3 }}>{children}</material_1.Box>}
    </div>);
    return (<material_1.Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Заголовок */}
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <material_1.Box>
          <material_1.Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            💼 Business Intelligence Hub
          </material_1.Typography>
          <material_1.Typography variant="subtitle1" color="text.secondary">
            Розширена система бізнес-аналітики та детекції схем
          </material_1.Typography>
        </material_1.Box>
        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Download />}>
            Експорт
          </material_1.Button>
          <material_1.IconButton color="primary">
            <icons_material_1.Refresh />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.Box>

      {/* Вкладки */}
      <material_1.Card sx={{ mb: 3 }}>
        <material_1.Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <material_1.Tab icon={<icons_material_1.AccountBalance />} label="Банківський сектор"/>
          <material_1.Tab icon={<icons_material_1.Business />} label="Державний сектор"/>
          <material_1.Tab icon={<icons_material_1.TrendingUp />} label="Ринкова аналітика"/>
          <material_1.Tab icon={<icons_material_1.Security />} label="Розслідування"/>
        </material_1.Tabs>
      </material_1.Card>

      {/* Банківський сектор */}
      <TabPanel value={activeTab} index={0}>
        <material_1.Grid container spacing={3}>
          {/* Алерти */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  🚨 Критичні алерти
                </material_1.Typography>
                <material_1.List dense>
                  {alerts.filter(a => a.category === 'banking').slice(0, 5).map((alert) => (<framer_motion_1.motion.div key={alert.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <material_1.ListItem>
                        <material_1.ListItemIcon>
                          {getSeverityIcon(alert.severity)}
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary={alert.message} secondary={`${alert.timestamp} • Впевненість: ${alert.confidence}%`}/>
                      </material_1.ListItem>
                    </framer_motion_1.motion.div>))}
                </material_1.List>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Статистика */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  📊 Статистика детекції
                </material_1.Typography>
                <recharts_1.ResponsiveContainer width="100%" height={200}>
                  <recharts_1.AreaChart data={marketData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="time"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Area type="monotone" dataKey="suspiciousVolume" stroke="#f44336" fill="#f44336" fillOpacity={0.3} name="Підозрілий обсяг"/>
                  </recharts_1.AreaChart>
                </recharts_1.ResponsiveContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Детальна аналітика */}
          <material_1.Grid item xs={12}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  🏦 Детальний аналіз банківських операцій
                </material_1.Typography>
                <material_1.Grid container spacing={2}>
                  <material_1.Grid item xs={12} sm={6} md={3}>
                    <material_1.Alert severity="error">
                      <material_1.Typography variant="h4">127</material_1.Typography>
                      <material_1.Typography variant="body2">Підозрілі транзакції</material_1.Typography>
                    </material_1.Alert>
                  </material_1.Grid>
                  <material_1.Grid item xs={12} sm={6} md={3}>
                    <material_1.Alert severity="warning">
                      <material_1.Typography variant="h4">43</material_1.Typography>
                      <material_1.Typography variant="body2">Схеми відмивання</material_1.Typography>
                    </material_1.Alert>
                  </material_1.Grid>
                  <material_1.Grid item xs={12} sm={6} md={3}>
                    <material_1.Alert severity="info">
                      <material_1.Typography variant="h4">$8.2M</material_1.Typography>
                      <material_1.Typography variant="body2">Заблокована сума</material_1.Typography>
                    </material_1.Alert>
                  </material_1.Grid>
                  <material_1.Grid item xs={12} sm={6} md={3}>
                    <material_1.Alert severity="success">
                      <material_1.Typography variant="h4">94.7%</material_1.Typography>
                      <material_1.Typography variant="body2">Точність детекції</material_1.Typography>
                    </material_1.Alert>
                  </material_1.Grid>
                </material_1.Grid>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </TabPanel>

      {/* Державний сектор */}
      <TabPanel value={activeTab} index={1}>
        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12} md={8}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  🏛️ Моніторинг держзакупівель
                </material_1.Typography>
                <material_1.TableContainer>
                  <material_1.Table size="small">
                    <material_1.TableHead>
                      <material_1.TableRow>
                        <material_1.TableCell>Тендер</material_1.TableCell>
                        <material_1.TableCell>Сума</material_1.TableCell>
                        <material_1.TableCell>Ризик</material_1.TableCell>
                        <material_1.TableCell>Статус</material_1.TableCell>
                      </material_1.TableRow>
                    </material_1.TableHead>
                    <material_1.TableBody>
                      {[
            { tender: 'Будівництво доріг', amount: '₴12.5M', risk: 'Високий', status: 'Розслідування' },
            { tender: 'IT обладнання', amount: '₴3.2M', risk: 'Середній', status: 'Моніторинг' },
            { tender: 'Медичне обладнання', amount: '₴8.7M', risk: 'Критичний', status: 'Блокування' }
        ].map((row, index) => (<material_1.TableRow key={index}>
                          <material_1.TableCell>{row.tender}</material_1.TableCell>
                          <material_1.TableCell>{row.amount}</material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.Chip label={row.risk} color={row.risk === 'Критичний' ? 'error' : row.risk === 'Високий' ? 'warning' : 'info'} size="small"/>
                          </material_1.TableCell>
                          <material_1.TableCell>{row.status}</material_1.TableCell>
                        </material_1.TableRow>))}
                    </material_1.TableBody>
                  </material_1.Table>
                </material_1.TableContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          <material_1.Grid item xs={12} md={4}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  📈 Корупційні ризики
                </material_1.Typography>
                <recharts_1.ResponsiveContainer width="100%" height={200}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie data={[
            { name: 'Високий', value: 35, fill: '#f44336' },
            { name: 'Середній', value: 45, fill: '#ff9800' },
            { name: 'Низький', value: 20, fill: '#4caf50' }
        ]} cx="50%" cy="50%" outerRadius={60} dataKey="value" label/>
                    <recharts_1.Tooltip />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </TabPanel>

      {/* Ринкова аналітика */}
      <TabPanel value={activeTab} index={2}>
        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  📊 Ринкові тренди та прогнози
                </material_1.Typography>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={marketData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="time"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Line type="monotone" dataKey="riskScore" stroke="#2196f3" strokeWidth={2} name="Ризик-скор"/>
                    <recharts_1.Line type="monotone" dataKey="compliance" stroke="#4caf50" strokeWidth={2} name="Відповідність"/>
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </TabPanel>

      {/* Розслідування */}
      <TabPanel value={activeTab} index={3}>
        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  🔍 Активні розслідування
                </material_1.Typography>
                <material_1.TableContainer>
                  <material_1.Table>
                    <material_1.TableHead>
                      <material_1.TableRow>
                        <material_1.TableCell>ID</material_1.TableCell>
                        <material_1.TableCell>Тип</material_1.TableCell>
                        <material_1.TableCell>Статус</material_1.TableCell>
                        <material_1.TableCell>Пріоритет</material_1.TableCell>
                        <material_1.TableCell>Докази</material_1.TableCell>
                        <material_1.TableCell>Дата</material_1.TableCell>
                      </material_1.TableRow>
                    </material_1.TableHead>
                    <material_1.TableBody>
                      {investigations.map((investigation) => (<material_1.TableRow key={investigation.id}>
                          <material_1.TableCell>{investigation.title}</material_1.TableCell>
                          <material_1.TableCell>{investigation.type}</material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.Chip label={investigation.status} size="small"/>
                          </material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.Chip label={investigation.priority} color={investigation.priority === 'Критична' ? 'error' : investigation.priority === 'Висока' ? 'warning' : 'default'} size="small"/>
                          </material_1.TableCell>
                          <material_1.TableCell>{investigation.evidence} документів</material_1.TableCell>
                          <material_1.TableCell>{investigation.timestamp}</material_1.TableCell>
                        </material_1.TableRow>))}
                    </material_1.TableBody>
                  </material_1.Table>
                </material_1.TableContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </TabPanel>
    </material_1.Box>);
};
exports.default = BusinessIntelligenceDashboard;
