// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  TrendingUp as TrendIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface BusinessIntelligenceDashboardProps {
  // Props інтерфейсу
}

const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);

  // Симуляція даних
  useEffect(() => {
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
    return [{
      ...randomAlert,
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      status: 'new'
    }];
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'high': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'medium': return <InfoIcon sx={{ color: '#2196f3' }} />;
      case 'low': return <SuccessIcon sx={{ color: '#4caf50' }} />;
      default: return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            💼 Business Intelligence Hub
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Розширена система бізнес-аналітики та детекції схем
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ExportIcon />}>
            Експорт
          </Button>
          <IconButton color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Вкладки */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<BankIcon />} label="Банківський сектор" />
          <Tab icon={<BusinessIcon />} label="Державний сектор" />
          <Tab icon={<TrendIcon />} label="Ринкова аналітика" />
          <Tab icon={<SecurityIcon />} label="Розслідування" />
        </Tabs>
      </Card>

      {/* Банківський сектор */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Алерти */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚨 Критичні алерти
                </Typography>
                <List dense>
                  {alerts.filter(a => a.category === 'banking').slice(0, 5).map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      <ListItem>
                        <ListItemIcon>
                          {getSeverityIcon(alert.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.message}
                          secondary={`${alert.timestamp} • Впевненість: ${alert.confidence}%`}
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Статистика */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Статистика детекції
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="suspiciousVolume"
                      stroke="#f44336"
                      fill="#f44336"
                      fillOpacity={0.3}
                      name="Підозрілий обсяг"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Детальна аналітика */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏦 Детальний аналіз банківських операцій
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Alert severity="error">
                      <Typography variant="h4">127</Typography>
                      <Typography variant="body2">Підозрілі транзакції</Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Alert severity="warning">
                      <Typography variant="h4">43</Typography>
                      <Typography variant="body2">Схеми відмивання</Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Alert severity="info">
                      <Typography variant="h4">$8.2M</Typography>
                      <Typography variant="body2">Заблокована сума</Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Alert severity="success">
                      <Typography variant="h4">94.7%</Typography>
                      <Typography variant="body2">Точність детекції</Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Державний сектор */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏛️ Моніторинг держзакупівель
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Тендер</TableCell>
                        <TableCell>Сума</TableCell>
                        <TableCell>Ризик</TableCell>
                        <TableCell>Статус</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { tender: 'Будівництво доріг', amount: '₴12.5M', risk: 'Високий', status: 'Розслідування' },
                        { tender: 'IT обладнання', amount: '₴3.2M', risk: 'Середній', status: 'Моніторинг' },
                        { tender: 'Медичне обладнання', amount: '₴8.7M', risk: 'Критичний', status: 'Блокування' }
                      ].map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.tender}</TableCell>
                          <TableCell>{row.amount}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.risk}
                              color={row.risk === 'Критичний' ? 'error' : row.risk === 'Високий' ? 'warning' : 'info'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{row.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Корупційні ризики
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Високий', value: 35, fill: '#f44336' },
                        { name: 'Середній', value: 45, fill: '#ff9800' },
                        { name: 'Низький', value: 20, fill: '#4caf50' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Ринкова аналітика */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Ринкові тренди та прогнози
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="riskScore"
                      stroke="#2196f3"
                      strokeWidth={2}
                      name="Ризик-скор"
                    />
                    <Line
                      type="monotone"
                      dataKey="compliance"
                      stroke="#4caf50"
                      strokeWidth={2}
                      name="Відповідність"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Розслідування */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 Активні розслідування
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Пріоритет</TableCell>
                        <TableCell>Докази</TableCell>
                        <TableCell>Дата</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {investigations.map((investigation) => (
                        <TableRow key={investigation.id}>
                          <TableCell>{investigation.title}</TableCell>
                          <TableCell>{investigation.type}</TableCell>
                          <TableCell>
                            <Chip label={investigation.status} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={investigation.priority}
                              color={investigation.priority === 'Критична' ? 'error' : investigation.priority === 'Висока' ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{investigation.evidence} документів</TableCell>
                          <TableCell>{investigation.timestamp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default BusinessIntelligenceDashboard;
