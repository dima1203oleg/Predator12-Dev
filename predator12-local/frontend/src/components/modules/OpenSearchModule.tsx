// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  LinearProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { 
  Search as SearchIcon, 
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  InsertChart as ChartIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useTranslation } from '../../i18n/I18nProvider';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  category: string;
  lastModified: Date;
  isDefault: boolean;
}

interface SearchQuery {
  index: string;
  query: string;
  timeRange: {
    from: string;
    to: string;
  };
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
}

export const OpenSearchModule: React.FC = () => {
  const [selectedDashboard, setSelectedDashboard] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    index: 'logs-*',
    query: '*',
    timeRange: {
      from: 'now-1h',
      to: 'now'
    },
    filters: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [embedMode, setEmbedMode] = useState(true);
  const [customTheme, setCustomTheme] = useState(true);

  // TODO: Отримувати dashboards, indices, timeRanges з реального OpenSearch API
  const dashboards: Dashboard[] = [];
  const indices: string[] = [];
  const timeRanges: { label: string; value: string }[] = [];

  useEffect(() => {
    // TODO: Set default dashboard з реального API
    // setSelectedDashboard(dashboards[0]?.id || '');
  }, []);

  const handleDashboardChange = async (dashboardId: string) => {
    setIsLoading(true);
    setSelectedDashboard(dashboardId);
    // TODO: Реальний API-виклик для завантаження дашборду
    // await openSearchAPI.loadDashboard(dashboardId);
    setIsLoading(false);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    // TODO: Реальний API-виклик для пошуку
    // await openSearchAPI.search(searchQuery);
    setIsLoading(false);
  };

  const addFilter = () => {
    setSearchQuery(prev => ({
      ...prev,
      filters: [
        ...prev.filters,
        { field: 'level', operator: 'is', value: 'ERROR' }
      ]
    }));
  };

  const removeFilter = (index: number) => {
    setSearchQuery(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
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

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3, 
            color: nexusColors.info,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusColors.info}`
          }}
        >
          <SearchIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Аналітична Палуба
        </Typography>

        <Grid container spacing={3}>
          {/* Dashboard Controls */}
          <Grid item xs={12} md={4}>
            <Card className="holographic">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.emerald }}>
                  <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Панель Управління
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: nexusColors.nebula }}>Дашборд</InputLabel>
                  <Select
                    value={selectedDashboard}
                    onChange={(e) => handleDashboardChange(e.target.value)}
                    sx={{ color: nexusColors.frost }}
                  >
                    {dashboards.map((dashboard) => (
                      <MenuItem key={dashboard.id} value={dashboard.id}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {dashboard.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                            {dashboard.category}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedDashboardData && (
                  <Box sx={{ mb: 2, p: 2, border: `1px solid ${nexusColors.quantum}`, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.frost, mb: 1 }}>
                      {selectedDashboardData.description}
                    </Typography>
                    <Chip
                      label={selectedDashboardData.category}
                      size="small"
                      sx={{
                        backgroundColor: nexusColors.sapphire,
                        color: nexusColors.frost,
                        mr: 1
                      }}
                    />
                    {selectedDashboardData.isDefault && (
                      <Chip
                        label="Default"
                        size="small"
                        sx={{
                          backgroundColor: nexusColors.emerald,
                          color: nexusColors.frost
                        }}
                      />
                    )}
                    <Typography variant="caption" sx={{ color: nexusColors.shadow, display: 'block', mt: 1 }}>
                      Оновлено: {selectedDashboardData.lastModified.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => handleDashboardChange(selectedDashboard)}
                    size="small"
                  >
                    Оновити
                  </Button>
                  <Tooltip title="Повноекранний режим">
                    <IconButton size="small" sx={{ color: nexusColors.sapphire }}>
                      <FullscreenIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Налаштування">
                    <IconButton size="small" sx={{ color: nexusColors.warning }}>
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Integration Settings */}
                <Typography variant="subtitle2" sx={{ color: nexusColors.amethyst, mb: 1 }}>
                  Налаштування Інтеграції
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={ssoEnabled}
                      onChange={(e) => setSsoEnabled(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: nexusColors.emerald,
                        },
                      }}
                    />
                  }
                  label="SSO Authentication"
                  sx={{ color: nexusColors.nebula, display: 'block', mb: 1 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={embedMode}
                      onChange={(e) => setEmbedMode(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: nexusColors.emerald,
                        },
                      }}
                    />
                  }
                  label="Embedded Mode"
                  sx={{ color: nexusColors.nebula, display: 'block', mb: 1 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={customTheme}
                      onChange={(e) => setCustomTheme(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: nexusColors.emerald,
                        },
                      }}
                    />
                  }
                  label="Nexus Theme"
                  sx={{ color: nexusColors.nebula, display: 'block' }}
                />
              </CardContent>
            </Card>

            {/* Quick Search */}
            <Card className="holographic" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.sapphire }}>
                  <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Швидкий Пошук
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: nexusColors.nebula }}>Індекс</InputLabel>
                  <Select
                    value={searchQuery.index}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, index: e.target.value }))}
                    sx={{ color: nexusColors.frost }}
                    size="small"
                  >
                    {indices.map((index) => (
                      <MenuItem key={index} value={index}>
                        {index}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Query"
                  value={searchQuery.query}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="Enter search query..."
                  size="small"
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: nexusColors.nebula }}>Часовий діапазон</InputLabel>
                  <Select
                    value={searchQuery.timeRange.from}
                    onChange={(e) => setSearchQuery(prev => ({ 
                      ...prev, 
                      timeRange: { ...prev.timeRange, from: e.target.value }
                    }))}
                    sx={{ color: nexusColors.frost }}
                    size="small"
                  >
                    {timeRanges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Filters */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                      Фільтри
                    </Typography>
                    <Button
                      size="small"
                      onClick={addFilter}
                      sx={{ color: nexusColors.emerald }}
                    >
                      Додати
                    </Button>
                  </Box>
                  
                  {searchQuery.filters.map((filter, index) => (
                    <Chip
                      key={index}
                      label={`${filter.field} ${filter.operator} ${filter.value}`}
                      onDelete={() => removeFilter(index)}
                      size="small"
                      sx={{
                        backgroundColor: nexusColors.amethyst,
                        color: nexusColors.frost,
                        mr: 1,
                        mb: 1
                      }}
                    />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={isLoading}
                  fullWidth
                  sx={{
                    backgroundColor: nexusColors.sapphire,
                    '&:hover': { backgroundColor: nexusColors.sapphire + 'CC' }
                  }}
                >
                  Виконати Пошук
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* OpenSearch Dashboard Embed */}
          <Grid item xs={12} md={8}>
            <Card className="holographic">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                    <ChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    OpenSearch Dashboard
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {ssoEnabled && (
                      <Chip
                        label="SSO Active"
                        size="small"
                        sx={{
                          backgroundColor: nexusColors.emerald,
                          color: nexusColors.frost
                        }}
                      />
                    )}
                    <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                      {generateOpenSearchUrl()}
                    </Typography>
                  </Box>
                </Box>
                
                {isLoading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      sx={{
                        backgroundColor: nexusColors.darkMatter,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: nexusColors.sapphire,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                      Завантаження дашборду...
                    </Typography>
                  </Box>
                )}

                {embedMode ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: 600,
                      border: `2px solid ${nexusColors.quantum}`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      background: customTheme 
                        ? `linear-gradient(135deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                        : '#ffffff'
                    }}
                  >
                    {/* Simulated OpenSearch Dashboard */}
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2,
                        pb: 1,
                        borderBottom: `1px solid ${nexusColors.quantum}`
                      }}>
                        <Typography variant="h6" sx={{ color: customTheme ? nexusColors.frost : '#333' }}>
                          {selectedDashboardData?.name || 'Dashboard'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip label="Live" size="small" color="success" />
                          <Chip label={searchQuery.timeRange.from} size="small" />
                        </Box>
                      </Box>

                      {/* Mock Dashboard Content */}
                      <Grid container spacing={2} sx={{ flex: 1 }}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            height: 200, 
                            border: `1px solid ${nexusColors.quantum}`,
                            borderRadius: 1,
                            p: 2,
                            background: customTheme ? nexusColors.darkMatter + '40' : '#f5f5f5'
                          }}>
                            <Typography variant="subtitle2" sx={{ color: customTheme ? nexusColors.frost : '#333', mb: 1 }}>
                              Events Over Time
                            </Typography>
                            <Box sx={{ 
                              height: '80%', 
                              display: 'flex', 
                              alignItems: 'end', 
                              justifyContent: 'space-around',
                              gap: 1
                            }}>
                              {[40, 65, 30, 80, 45, 70, 55].map((height, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 20,
                                    height: `${height}%`,
                                    backgroundColor: nexusColors.sapphire,
                                    borderRadius: '2px 2px 0 0'
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ 
                            height: 200, 
                            border: `1px solid ${nexusColors.quantum}`,
                            borderRadius: 1,
                            p: 2,
                            background: customTheme ? nexusColors.darkMatter + '40' : '#f5f5f5'
                          }}>
                            <Typography variant="subtitle2" sx={{ color: customTheme ? nexusColors.frost : '#333', mb: 1 }}>
                              Top Sources
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {['application.log', 'security.log', 'system.log', 'network.log'].map((source, i) => (
                                <Box key={source} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ color: customTheme ? nexusColors.nebula : '#666' }}>
                                    {source}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: customTheme ? nexusColors.frost : '#333' }}>
                                    {Math.floor(Math.random() * 1000)}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ 
                            height: 250, 
                            border: `1px solid ${nexusColors.quantum}`,
                            borderRadius: 1,
                            p: 2,
                            background: customTheme ? nexusColors.darkMatter + '40' : '#f5f5f5'
                          }}>
                            <Typography variant="subtitle2" sx={{ color: customTheme ? nexusColors.frost : '#333', mb: 1 }}>
                              Recent Events
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '90%', overflow: 'auto' }}>
                              {Array.from({ length: 8 }, (_, i) => (
                                <Box key={i} sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  p: 1,
                                  border: `1px solid ${nexusColors.quantum}40`,
                                  borderRadius: 1
                                }}>
                                  <Typography variant="body2" sx={{ color: customTheme ? nexusColors.nebula : '#666' }}>
                                    {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: customTheme ? nexusColors.frost : '#333' }}>
                                    Event {i + 1} - Sample log entry
                                  </Typography>
                                  <Chip 
                                    label={['INFO', 'WARN', 'ERROR'][i % 3]} 
                                    size="small"
                                    sx={{
                                      backgroundColor: ['INFO', 'WARN', 'ERROR'][i % 3] === 'ERROR' 
                                        ? nexusColors.crimson 
                                        : ['INFO', 'WARN', 'ERROR'][i % 3] === 'WARN'
                                        ? nexusColors.warning
                                        : nexusColors.emerald,
                                      color: nexusColors.frost
                                    }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Overlay for demo purposes */}
                    <Box
                      sx={{
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
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: nexusColors.emerald, mb: 1 }}>
                          Синхронізація з OpenSearch...
                        </Typography>
                        <LinearProgress
                          sx={{
                            width: 200,
                            backgroundColor: nexusColors.darkMatter,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: nexusColors.emerald,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Embedded mode disabled. 
                    <Button 
                      href={generateOpenSearchUrl()} 
                      target="_blank" 
                      sx={{ ml: 1, color: nexusColors.sapphire }}
                    >
                      Open in new tab
                    </Button>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};
