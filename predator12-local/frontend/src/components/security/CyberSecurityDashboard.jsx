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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const CyberSecurityDashboard = () => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const [scanActive, setScanActive] = (0, react_1.useState)(false);
    const [threatDialogOpen, setThreatDialogOpen] = (0, react_1.useState)(false);
    const [selectedThreat, setSelectedThreat] = (0, react_1.useState)(null);
    const [lastScan, setLastScan] = (0, react_1.useState)(new Date());
    // Генерація загроз для демонстрації
    const generateThreats = () => [
        {
            id: '1',
            type: 'Підозрілий трафік',
            severity: 'high',
            source: '192.168.1.100',
            target: 'Web Server',
            description: 'Виявлено незвичайну кількість запитів з одного IP',
            timestamp: new Date(Date.now() - Math.random() * 3600000),
            status: 'active',
            mitigationSteps: ['Блокувати IP', 'Аналіз логів', 'Оновити правила фаєрволу']
        },
        {
            id: '2',
            type: 'Спроба злому',
            severity: 'critical',
            source: 'External',
            target: 'SSH Service',
            description: 'Множинні невдалі спроби входу в SSH',
            timestamp: new Date(Date.now() - Math.random() * 7200000),
            status: 'investigating',
            mitigationSteps: ['Змінити порт SSH', 'Увімкнути 2FA', 'Заборонити root доступ']
        },
        {
            id: '3',
            type: 'Malware підпис',
            severity: 'medium',
            source: 'Email Attachment',
            target: 'Workstation #5',
            description: 'Знайдено потенційно шкідливий файл',
            timestamp: new Date(Date.now() - Math.random() * 1800000),
            status: 'mitigated',
            mitigationSteps: ['Видалити файл', 'Сканувати систему', 'Оновити антивірус']
        },
        {
            id: '4',
            type: 'DDoS атака',
            severity: 'high',
            source: 'Multiple IPs',
            target: 'Load Balancer',
            description: 'Високе навантаження з множинних джерел',
            timestamp: new Date(Date.now() - Math.random() * 600000),
            status: 'active',
            mitigationSteps: ['Увімкнути DDoS protection', 'Масштабувати ресурси', 'Фільтрувати трафік']
        }
    ];
    const [threats, setThreats] = (0, react_1.useState)(generateThreats());
    // Метрики безпеки
    const securityMetrics = [
        {
            id: 'firewall',
            name: 'Стан Фаєрволу',
            value: 98,
            maxValue: 100,
            unit: '%',
            status: 'good',
            icon: icons_material_1.Shield,
            color: nexusTheme_1.nexusColors.success.main,
            description: 'Фаєрвол працює стабільно'
        },
        {
            id: 'antivirus',
            name: 'Антивірусний захист',
            value: 95,
            maxValue: 100,
            unit: '%',
            status: 'good',
            icon: icons_material_1.Security,
            color: nexusTheme_1.nexusColors.success.main,
            description: 'Антивірус активний та оновлений'
        },
        {
            id: 'intrusion',
            name: 'Система детекції вторгнень',
            value: 87,
            maxValue: 100,
            unit: '%',
            status: 'warning',
            icon: icons_material_1.Visibility,
            color: nexusTheme_1.nexusColors.warning.main,
            description: 'IDS потребує оновлення правил'
        },
        {
            id: 'encryption',
            name: 'Рівень шифрування',
            value: 100,
            maxValue: 100,
            unit: '%',
            status: 'good',
            icon: icons_material_1.Lock,
            color: nexusTheme_1.nexusColors.success.main,
            description: 'Всі з\'єднання зашифровані'
        },
        {
            id: 'vulnerabilities',
            name: 'Відомі вразливості',
            value: 3,
            maxValue: 10,
            unit: '',
            status: 'warning',
            icon: icons_material_1.BugReport,
            color: nexusTheme_1.nexusColors.warning.main,
            description: '3 критичні вразливості потребують патчів'
        },
        {
            id: 'compliance',
            name: 'Відповідність стандартам',
            value: 92,
            maxValue: 100,
            unit: '%',
            status: 'good',
            icon: icons_material_1.Gavel,
            color: nexusTheme_1.nexusColors.success.main,
            description: 'Відповідає стандартам ISO 27001'
        }
    ];
    // Оновлення загроз
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setThreats(prev => {
                    const newThreats = generateThreats();
                    return [...prev.slice(-2), ...newThreats.slice(0, 1)];
                });
            }
        }, 15000);
        return () => clearInterval(interval);
    }, []);
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return nexusTheme_1.nexusColors.error.main;
            case 'high':
                return nexusTheme_1.nexusColors.warning.main;
            case 'medium':
                return nexusTheme_1.nexusColors.info.main;
            case 'low':
                return nexusTheme_1.nexusColors.success.main;
            default:
                return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return <icons_material_1.Error sx={{ color: nexusTheme_1.nexusColors.error.main }}/>;
            case 'high':
                return <icons_material_1.Warning sx={{ color: nexusTheme_1.nexusColors.warning.main }}/>;
            case 'medium':
                return <icons_material_1.Info sx={{ color: nexusTheme_1.nexusColors.info.main }}/>;
            case 'low':
                return <icons_material_1.CheckCircle sx={{ color: nexusTheme_1.nexusColors.success.main }}/>;
            default:
                return <icons_material_1.Info />;
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return nexusTheme_1.nexusColors.error.main;
            case 'investigating':
                return nexusTheme_1.nexusColors.warning.main;
            case 'mitigated':
                return nexusTheme_1.nexusColors.success.main;
            default:
                return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const runSecurityScan = () => __awaiter(void 0, void 0, void 0, function* () {
        setScanActive(true);
        setLastScan(new Date());
        // Симуляція сканування
        yield new Promise(resolve => setTimeout(resolve, 3000));
        // Оновлення загроз після сканування
        const newThreats = generateThreats().slice(0, 2);
        setThreats(prev => [...prev, ...newThreats]);
        setScanActive(false);
    });
    const renderSecurityMetrics = () => (<material_1.Grid container spacing={3}>
      {securityMetrics.map((metric) => (<material_1.Grid item xs={12} sm={6} md={4} key={metric.id}>
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.random() * 0.3 }} whileHover={{ scale: 1.05, y: -5 }}>
            <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${metric.color}30`,
                borderRadius: 3,
                '&:hover': {
                    boxShadow: `0 10px 30px ${metric.color}40`,
                    border: `1px solid ${metric.color}60`
                },
                transition: 'all 0.3s ease'
            }}>
              <material_1.CardContent sx={{ p: 3 }}>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${metric.color}40, ${metric.color}60)`,
                width: 50,
                height: 50
            }}>
                    <metric.icon sx={{ color: metric.color }}/>
                  </material_1.Avatar>

                  <material_1.Chip label={metric.status === 'good' ? 'Добре' : metric.status === 'warning' ? 'Увага' : 'Критично'} sx={{
                background: `${metric.color}20`,
                color: metric.color,
                fontWeight: 'bold'
            }}/>
                </material_1.Box>

                <material_1.Typography variant="h4" sx={{
                color: nexusTheme_1.nexusColors.text.primary,
                fontWeight: 'bold',
                mb: 1,
                background: `linear-gradient(45deg, ${metric.color}, ${nexusTheme_1.nexusColors.accent.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                  {metric.value}{metric.unit}
                </material_1.Typography>

                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 1, fontWeight: 600 }}>
                  {metric.name}
                </material_1.Typography>

                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 2 }}>
                  {metric.description}
                </material_1.Typography>

                <material_1.LinearProgress variant="determinate" value={(metric.value / metric.maxValue) * 100} sx={{
                height: 6,
                borderRadius: 3,
                background: `${nexusTheme_1.nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${metric.color}60, ${metric.color})`
                }
            }}/>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>
        </material_1.Grid>))}
    </material_1.Grid>);
    const renderThreatsList = () => (<material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
            borderRadius: 3,
            mt: 3
        }}>
      <material_1.CardContent sx={{ p: 3 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
            🚨 Активні Загрози
          </material_1.Typography>
          <material_1.Button variant="outlined" startIcon={scanActive ? <Stop /> : <icons_material_1.PlayArrow />} onClick={runSecurityScan} disabled={scanActive} sx={{
            borderColor: nexusTheme_1.nexusColors.accent.main,
            color: nexusTheme_1.nexusColors.accent.main,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.accent.light,
                background: `${nexusTheme_1.nexusColors.accent.main}20`
            }
        }}>
            {scanActive ? 'Сканування...' : 'Запустити сканування'}
          </material_1.Button>
        </material_1.Box>

        {scanActive && (<material_1.Box sx={{ mb: 3 }}>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
              Сканування безпеки в процесі...
            </material_1.Typography>
            <material_1.LinearProgress sx={{
                height: 4,
                borderRadius: 2,
                background: `${nexusTheme_1.nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`
                }
            }}/>
          </material_1.Box>)}

        <material_1.List>
          {threats.slice(0, 6).map((threat, index) => (<framer_motion_1.motion.div key={threat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <material_1.ListItem sx={{
                background: `${nexusTheme_1.nexusColors.secondary.dark}20`,
                borderRadius: 2,
                mb: 1,
                border: `1px solid ${getSeverityColor(threat.severity)}30`,
                '&:hover': {
                    background: `${nexusTheme_1.nexusColors.secondary.dark}40`,
                    border: `1px solid ${getSeverityColor(threat.severity)}60`
                },
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }} onClick={() => {
                setSelectedThreat(threat);
                setThreatDialogOpen(true);
            }}>
                <material_1.ListItemIcon>
                  {getSeverityIcon(threat.severity)}
                </material_1.ListItemIcon>
                <material_1.ListItemText primary={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                        {threat.type}
                      </material_1.Typography>
                      <material_1.Chip label={threat.severity.toUpperCase()} size="small" sx={{
                    background: getSeverityColor(threat.severity),
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                }}/>
                      <material_1.Chip label={threat.status} size="small" sx={{
                    background: `${getStatusColor(threat.status)}20`,
                    color: getStatusColor(threat.status),
                    fontSize: '0.7rem'
                }}/>
                    </material_1.Box>} secondary={<material_1.Box>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        {threat.description}
                      </material_1.Typography>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        {threat.source} → {threat.target} • {threat.timestamp.toLocaleTimeString()}
                      </material_1.Typography>
                    </material_1.Box>}/>
              </material_1.ListItem>
            </framer_motion_1.motion.div>))}
        </material_1.List>

        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mt: 2, textAlign: 'center' }}>
          Останнє сканування: {lastScan.toLocaleString()}
        </material_1.Typography>
      </material_1.CardContent>
    </material_1.Card>);
    const renderNetworkMap = () => (<material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
            borderRadius: 3,
            mt: 3
        }}>
      <material_1.CardContent sx={{ p: 3 }}>
        <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold', mb: 3 }}>
          🌐 Карта Мережі
        </material_1.Typography>

        <material_1.Grid container spacing={3}>
          {[
            { name: 'Web Server', status: 'secure', icon: icons_material_1.Cloud, connections: 45 },
            { name: 'Database', status: 'warning', icon: icons_material_1.Storage, connections: 12 },
            { name: 'Router', status: 'secure', icon: icons_material_1.Router, connections: 23 },
            { name: 'Workstations', status: 'secure', icon: icons_material_1.Computer, connections: 67 },
            { name: 'Mobile Devices', status: 'warning', icon: icons_material_1.PhoneAndroid, connections: 34 },
            { name: 'IoT Devices', status: 'critical', icon: icons_material_1.NetworkCheck, connections: 89 }
        ].map((device, index) => (<material_1.Grid item xs={12} sm={6} md={4} key={device.name}>
              <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <material_1.Paper sx={{
                p: 2,
                background: `${nexusTheme_1.nexusColors.secondary.dark}30`,
                border: `1px solid ${device.status === 'secure' ? nexusTheme_1.nexusColors.success.main :
                    device.status === 'warning' ? nexusTheme_1.nexusColors.warning.main :
                        nexusTheme_1.nexusColors.error.main}30`,
                borderRadius: 2,
                textAlign: 'center',
                '&:hover': {
                    background: `${nexusTheme_1.nexusColors.secondary.dark}50`,
                    transform: 'translateY(-5px)'
                },
                transition: 'all 0.3s ease'
            }}>
                  <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${device.status === 'secure' ? nexusTheme_1.nexusColors.success.main :
                    device.status === 'warning' ? nexusTheme_1.nexusColors.warning.main :
                        nexusTheme_1.nexusColors.error.main}40, ${device.status === 'secure' ? nexusTheme_1.nexusColors.success.main :
                    device.status === 'warning' ? nexusTheme_1.nexusColors.warning.main :
                        nexusTheme_1.nexusColors.error.main}60)`,
                margin: '0 auto',
                mb: 1
            }}>
                    <device.icon />
                  </material_1.Avatar>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold', mb: 1 }}>
                    {device.name}
                  </material_1.Typography>
                  <material_1.Chip label={device.status} size="small" sx={{
                background: `${device.status === 'secure' ? nexusTheme_1.nexusColors.success.main :
                    device.status === 'warning' ? nexusTheme_1.nexusColors.warning.main :
                        nexusTheme_1.nexusColors.error.main}20`,
                color: device.status === 'secure' ? nexusTheme_1.nexusColors.success.main :
                    device.status === 'warning' ? nexusTheme_1.nexusColors.warning.main :
                        nexusTheme_1.nexusColors.error.main,
                mb: 1
            }}/>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                    {device.connections} з'єднань
                  </material_1.Typography>
                </material_1.Paper>
              </framer_motion_1.motion.div>
            </material_1.Grid>))}
        </material_1.Grid>
      </material_1.CardContent>
    </material_1.Card>);
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.error.main}, ${nexusTheme_1.nexusColors.warning.main})`,
            width: 60,
            height: 60
        }}>
            <icons_material_1.Security sx={{ fontSize: '2rem' }}/>
          </material_1.Avatar>
          <material_1.Box>
            <material_1.Typography variant="h3" sx={{
            color: nexusTheme_1.nexusColors.text.primary,
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.error.main}, ${nexusTheme_1.nexusColors.warning.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
              🛡️ Центр Кібербезпеки
            </material_1.Typography>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
              Моніторинг загроз та захист системи
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* Вкладки */}
      <material_1.Paper sx={{
            background: `${nexusTheme_1.nexusColors.primary.dark}60`,
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            mb: 3
        }}>
        <material_1.Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{
            '& .MuiTab-root': {
                color: nexusTheme_1.nexusColors.text.secondary,
                fontWeight: 'bold',
                '&.Mui-selected': {
                    color: nexusTheme_1.nexusColors.error.main
                }
            },
            '& .MuiTabs-indicator': {
                background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.error.main}, ${nexusTheme_1.nexusColors.warning.main})`
            }
        }}>
          <material_1.Tab label="🛡️ Огляд"/>
          <material_1.Tab label="🚨 Загрози"/>
          <material_1.Tab label="🌐 Мережа"/>
          <material_1.Tab label="📊 Звіти"/>
        </material_1.Tabs>
      </material_1.Paper>

      {/* Контент вкладок */}
      <framer_motion_1.AnimatePresence mode="wait">
        {currentTab === 0 && (<framer_motion_1.motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            {renderSecurityMetrics()}
          </framer_motion_1.motion.div>)}

        {currentTab === 1 && (<framer_motion_1.motion.div key="threats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            {renderThreatsList()}
          </framer_motion_1.motion.div>)}

        {currentTab === 2 && (<framer_motion_1.motion.div key="network" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            {renderNetworkMap()}
          </framer_motion_1.motion.div>)}

        {currentTab === 3 && (<framer_motion_1.motion.div key="reports" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3,
                p: 4,
                textAlign: 'center'
            }}>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                📊 Звіти та Аналітика
              </material_1.Typography>
              <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 3 }}>
                Детальні звіти безпеки та статистика загроз
              </material_1.Typography>
              <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.error.main}, ${nexusTheme_1.nexusColors.warning.main})`,
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5
            }}>
                Генерувати звіт
              </material_1.Button>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Діалог деталей загрози */}
      <material_1.Dialog open={threatDialogOpen} onClose={() => setThreatDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}95, ${nexusTheme_1.nexusColors.secondary.dark}90)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3
            }
        }}>
        {selectedThreat && (<>
            <material_1.DialogTitle sx={{
                color: nexusTheme_1.nexusColors.text.primary,
                borderBottom: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
              {getSeverityIcon(selectedThreat.severity)}
              Деталі Загрози: {selectedThreat.type}
            </material_1.DialogTitle>
            <material_1.DialogContent sx={{ pt: 3 }}>
              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                    Джерело:
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    {selectedThreat.source}
                  </material_1.Typography>

                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                    Ціль:
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    {selectedThreat.target}
                  </material_1.Typography>

                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                    Час виявлення:
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    {selectedThreat.timestamp.toLocaleString()}
                  </material_1.Typography>
                </material_1.Grid>

                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                    Опис:
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    {selectedThreat.description}
                  </material_1.Typography>

                  {selectedThreat.mitigationSteps && (<>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                        Кроки нейтралізації:
                      </material_1.Typography>
                      <material_1.List dense>
                        {selectedThreat.mitigationSteps.map((step, index) => (<material_1.ListItem key={index} sx={{ px: 0 }}>
                            <material_1.ListItemIcon sx={{ minWidth: 20 }}>
                              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.accent.main }}>
                                {index + 1}.
                              </material_1.Typography>
                            </material_1.ListItemIcon>
                            <material_1.ListItemText primary={step} sx={{ '& .MuiListItemText-primary': { color: nexusTheme_1.nexusColors.text.primary } }}/>
                          </material_1.ListItem>))}
                      </material_1.List>
                    </>)}
                </material_1.Grid>
              </material_1.Grid>
            </material_1.DialogContent>
            <material_1.DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
              <material_1.Button onClick={() => setThreatDialogOpen(false)} sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                Закрити
              </material_1.Button>
              <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white'
            }}>
                Застосувати заходи
              </material_1.Button>
            </material_1.DialogActions>
          </>)}
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = CyberSecurityDashboard;
