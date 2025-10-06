// @ts-nocheck
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Key as KeyIcon,
  Memory as MemoryIcon,
  Speed as PerformanceIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  avatar?: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  isActive: boolean;
}

interface SystemService {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  cpu: number;
  memory: number;
  uptime: string;
  port?: number;
}

export const AdminModule: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'users' | 'keys' | 'services' | 'settings'>('users');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // TODO: Отримувати users, apiKeys, services з реального API
  // const users = await adminAPI.getUsers();
  // const apiKeys = await adminAPI.getAPIKeys();
  // const services = await adminAPI.getServices();
  const users: User[] = [];
  const apiKeys: APIKey[] = [];
  const services: SystemService[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return nexusColors.emerald;
      case 'inactive':
      case 'stopped':
        return nexusColors.shadow;
      case 'suspended':
      case 'error':
        return nexusColors.crimson;
      case 'starting':
        return nexusColors.warning;
      default:
        return nexusColors.nebula;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return nexusColors.crimson;
      case 'analyst':
        return nexusColors.sapphire;
      case 'operator':
        return nexusColors.emerald;
      default:
        return nexusColors.nebula;
    }
  };

  const handleServiceAction = (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    console.log(`${action} service ${serviceId}`);
    // In production, this would call the actual service management API
  };

  const renderUsersTab = () => (
    <Card className="holographic">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: nexusColors.frost }}>
            <UserIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Управління Користувачами
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUserDialogOpen(true)}
            sx={{
              backgroundColor: nexusColors.emerald,
              '&:hover': { backgroundColor: nexusColors.emerald + 'CC' }
            }}
          >
            Додати Користувача
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                  Користувач
                </TableCell>
                <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                  Роль
                </TableCell>
                <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                  Статус
                </TableCell>
                <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                  Останній вхід
                </TableCell>
                <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                  Дії
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ borderColor: nexusColors.quantum }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: nexusColors.sapphire,
                          width: 32,
                          height: 32
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                          {user.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: nexusColors.quantum }}>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        backgroundColor: getRoleColor(user.role),
                        color: nexusColors.frost
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderColor: nexusColors.quantum }}>
                    <Chip
                      label={user.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(user.status),
                        color: nexusColors.frost
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderColor: nexusColors.quantum }}>
                    <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                      {user.lastLogin.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: nexusColors.quantum }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Переглянути">
                        <IconButton size="small" sx={{ color: nexusColors.sapphire }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редагувати">
                        <IconButton 
                          size="small" 
                          sx={{ color: nexusColors.warning }}
                          onClick={() => {
                            setSelectedUser(user);
                            setUserDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Видалити">
                        <IconButton size="small" sx={{ color: nexusColors.crimson }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderAPIKeysTab = () => (
    <Card className="holographic">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: nexusColors.frost }}>
            <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            API Ключі
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setKeyDialogOpen(true)}
            sx={{
              backgroundColor: nexusColors.sapphire,
              '&:hover': { backgroundColor: nexusColors.sapphire + 'CC' }
            }}
          >
            Створити Ключ
          </Button>
        </Box>

        <List>
          {apiKeys.map((key) => (
            <ListItem
              key={key.id}
              sx={{
                border: `1px solid ${nexusColors.quantum}`,
                borderRadius: 2,
                mb: 1,
                backgroundColor: nexusColors.darkMatter + '40'
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    backgroundColor: key.isActive ? nexusColors.emerald : nexusColors.shadow,
                    width: 40,
                    height: 40
                  }}
                >
                  <KeyIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ color: nexusColors.frost }}>
                      {key.name}
                    </Typography>
                    <Chip
                      label={key.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: key.isActive ? nexusColors.emerald : nexusColors.shadow,
                        color: nexusColors.frost
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: nexusColors.nebula, fontFamily: 'monospace' }}>
                      {key.key}
                    </Typography>
                    <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                      Permissions: {key.permissions.join(', ')} | 
                      Created: {key.createdAt.toLocaleDateString()} |
                      {key.lastUsed && ` Last used: ${key.lastUsed.toLocaleString()}`}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Переглянути">
                    <IconButton size="small" sx={{ color: nexusColors.sapphire }}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Редагувати">
                    <IconButton size="small" sx={{ color: nexusColors.warning }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Видалити">
                    <IconButton size="small" sx={{ color: nexusColors.crimson }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderServicesTab = () => (
    <Card className="holographic">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: nexusColors.frost }}>
            <MemoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Системні Сервіси
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ color: nexusColors.emerald }}
          >
            Оновити Статус
          </Button>
        </Box>

        <Grid container spacing={2}>
          {services.map((service) => (
            <Grid item xs={12} md={6} key={service.id}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${nexusColors.darkMatter}80, ${nexusColors.obsidian}60)`,
                  border: `1px solid ${getStatusColor(service.status)}40`,
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                      {service.name}
                    </Typography>
                    <Chip
                      label={service.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(service.status),
                        color: nexusColors.frost
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                        CPU Usage
                      </Typography>
                      <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                        {service.cpu}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={service.cpu}
                      sx={{
                        backgroundColor: nexusColors.darkMatter,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: service.cpu > 80 ? nexusColors.crimson : 
                                         service.cpu > 50 ? nexusColors.warning : nexusColors.emerald,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                        Memory Usage
                      </Typography>
                      <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                        {service.memory}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={service.memory}
                      sx={{
                        backgroundColor: nexusColors.darkMatter,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: service.memory > 80 ? nexusColors.crimson : 
                                         service.memory > 50 ? nexusColors.warning : nexusColors.sapphire,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                      Uptime: {service.uptime}
                    </Typography>
                    {service.port && (
                      <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                        Port: {service.port}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {service.status === 'running' ? (
                      <Button
                        size="small"
                        startIcon={<StopIcon />}
                        onClick={() => handleServiceAction(service.id, 'stop')}
                        sx={{ color: nexusColors.crimson }}
                      >
                        Stop
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<StartIcon />}
                        onClick={() => handleServiceAction(service.id, 'start')}
                        sx={{ color: nexusColors.emerald }}
                      >
                        Start
                      </Button>
                    )}
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleServiceAction(service.id, 'restart')}
                      sx={{ color: nexusColors.warning }}
                    >
                      Restart
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card className="holographic">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: nexusColors.frost }}>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Налаштування Безпеки
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Двофакторна автентифікація"
                sx={{ color: nexusColors.nebula }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Логування API запитів"
                sx={{ color: nexusColors.nebula }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Автоматичне блокування підозрілих IP"
                sx={{ color: nexusColors.nebula }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Шифрування даних в спокої"
                sx={{ color: nexusColors.nebula }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card className="holographic">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: nexusColors.frost }}>
              <PerformanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Налаштування Продуктивності
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Максимальна кількість з'єднань"
                type="number"
                defaultValue={1000}
                size="small"
                fullWidth
              />
              <TextField
                label="Timeout запитів (сек)"
                type="number"
                defaultValue={30}
                size="small"
                fullWidth
              />
              <TextField
                label="Розмір кешу (MB)"
                type="number"
                defaultValue={512}
                size="small"
                fullWidth
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Автоматичне масштабування"
                sx={{ color: nexusColors.nebula }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

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
            color: nexusColors.crimson,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusColors.crimson}`
          }}
        >
          <AdminIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Святилище Архітектора
        </Typography>

        {/* Tab Navigation */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          {[
            { id: 'users', label: 'Користувачі', icon: <UserIcon /> },
            { id: 'keys', label: 'API Ключі', icon: <KeyIcon /> },
            { id: 'services', label: 'Сервіси', icon: <MemoryIcon /> },
            { id: 'settings', label: 'Налаштування', icon: <SettingsIcon /> }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'contained' : 'outlined'}
              startIcon={tab.icon}
              onClick={() => setSelectedTab(tab.id as any)}
              sx={{
                backgroundColor: selectedTab === tab.id ? nexusColors.crimson : 'transparent',
                borderColor: nexusColors.crimson,
                color: selectedTab === tab.id ? nexusColors.frost : nexusColors.crimson,
                '&:hover': {
                  backgroundColor: selectedTab === tab.id ? nexusColors.crimson + 'CC' : nexusColors.crimson + '20'
                }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Tab Content */}
        {selectedTab === 'users' && renderUsersTab()}
        {selectedTab === 'keys' && renderAPIKeysTab()}
        {selectedTab === 'services' && renderServicesTab()}
        {selectedTab === 'settings' && renderSettingsTab()}

        {/* User Dialog */}
        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: nexusColors.emerald }}>
            {selectedUser ? 'Редагувати Користувача' : 'Додати Користувача'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Ім'я користувача"
                defaultValue={selectedUser?.username || ''}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                defaultValue={selectedUser?.email || ''}
                fullWidth
              />
              <TextField
                label="Роль"
                select
                defaultValue={selectedUser?.role || 'Analyst'}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="Administrator">Administrator</option>
                <option value="Analyst">Analyst</option>
                <option value="Operator">Operator</option>
                <option value="Viewer">Viewer</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)}>Скасувати</Button>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: nexusColors.emerald }}
              onClick={() => setUserDialogOpen(false)}
            >
              {selectedUser ? 'Зберегти' : 'Створити'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* API Key Dialog */}
        <Dialog open={keyDialogOpen} onClose={() => setKeyDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: nexusColors.sapphire }}>
            Створити API Ключ
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Назва ключа"
                fullWidth
                placeholder="Наприклад: Production API"
              />
              <TextField
                label="Дозволи"
                select
                fullWidth
                SelectProps={{ 
                  native: true,
                  multiple: true 
                }}
              >
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="admin">Admin</option>
              </TextField>
              <TextField
                label="Термін дії (днів)"
                type="number"
                defaultValue={365}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setKeyDialogOpen(false)}>Скасувати</Button>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: nexusColors.sapphire }}
              onClick={() => setKeyDialogOpen(false)}
            >
              Створити Ключ
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};
