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
exports.AdminModule = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AdminModule = () => {
    const [selectedTab, setSelectedTab] = (0, react_1.useState)('users');
    const [userDialogOpen, setUserDialogOpen] = (0, react_1.useState)(false);
    const [keyDialogOpen, setKeyDialogOpen] = (0, react_1.useState)(false);
    const [selectedUser, setSelectedUser] = (0, react_1.useState)(null);
    // TODO: Отримувати users, apiKeys, services з реального API
    // const users = await adminAPI.getUsers();
    // const apiKeys = await adminAPI.getAPIKeys();
    // const services = await adminAPI.getServices();
    const users = [];
    const apiKeys = [];
    const services = [];
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'running':
                return nexusTheme_1.nexusColors.emerald;
            case 'inactive':
            case 'stopped':
                return nexusTheme_1.nexusColors.shadow;
            case 'suspended':
            case 'error':
                return nexusTheme_1.nexusColors.crimson;
            case 'starting':
                return nexusTheme_1.nexusColors.warning;
            default:
                return nexusTheme_1.nexusColors.nebula;
        }
    };
    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'administrator':
                return nexusTheme_1.nexusColors.crimson;
            case 'analyst':
                return nexusTheme_1.nexusColors.sapphire;
            case 'operator':
                return nexusTheme_1.nexusColors.emerald;
            default:
                return nexusTheme_1.nexusColors.nebula;
        }
    };
    const handleServiceAction = (serviceId, action) => {
        console.log(`${action} service ${serviceId}`);
        // In production, this would call the actual service management API
    };
    const renderUsersTab = () => (<material_1.Card className="holographic">
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
            <icons_material_1.Person sx={{ mr: 1, verticalAlign: 'middle' }}/>
            Управління Користувачами
          </material_1.Typography>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={() => setUserDialogOpen(true)} sx={{
            backgroundColor: nexusTheme_1.nexusColors.emerald,
            '&:hover': { backgroundColor: nexusTheme_1.nexusColors.emerald + 'CC' }
        }}>
            Додати Користувача
          </material_1.Button>
        </material_1.Box>

        <material_1.TableContainer component={material_1.Paper} sx={{ backgroundColor: 'transparent' }}>
          <material_1.Table>
            <material_1.TableHead>
              <material_1.TableRow>
                <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                  Користувач
                </material_1.TableCell>
                <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                  Роль
                </material_1.TableCell>
                <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                  Статус
                </material_1.TableCell>
                <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                  Останній вхід
                </material_1.TableCell>
                <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                  Дії
                </material_1.TableCell>
              </material_1.TableRow>
            </material_1.TableHead>
            <material_1.TableBody>
              {users.map((user) => (<material_1.TableRow key={user.id}>
                  <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <material_1.Avatar sx={{
                backgroundColor: nexusTheme_1.nexusColors.sapphire,
                width: 32,
                height: 32
            }}>
                        {user.username.charAt(0).toUpperCase()}
                      </material_1.Avatar>
                      <material_1.Box>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                          {user.username}
                        </material_1.Typography>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                          {user.email}
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Box>
                  </material_1.TableCell>
                  <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                    <material_1.Chip label={user.role} size="small" sx={{
                backgroundColor: getRoleColor(user.role),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                  </material_1.TableCell>
                  <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                    <material_1.Chip label={user.status} size="small" sx={{
                backgroundColor: getStatusColor(user.status),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                  </material_1.TableCell>
                  <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      {user.lastLogin.toLocaleString()}
                    </material_1.Typography>
                  </material_1.TableCell>
                  <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                    <material_1.Box sx={{ display: 'flex', gap: 0.5 }}>
                      <material_1.Tooltip title="Переглянути">
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                          <icons_material_1.Visibility fontSize="small"/>
                        </material_1.IconButton>
                      </material_1.Tooltip>
                      <material_1.Tooltip title="Редагувати">
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.warning }} onClick={() => {
                setSelectedUser(user);
                setUserDialogOpen(true);
            }}>
                          <icons_material_1.Edit fontSize="small"/>
                        </material_1.IconButton>
                      </material_1.Tooltip>
                      <material_1.Tooltip title="Видалити">
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.crimson }}>
                          <icons_material_1.Delete fontSize="small"/>
                        </material_1.IconButton>
                      </material_1.Tooltip>
                    </material_1.Box>
                  </material_1.TableCell>
                </material_1.TableRow>))}
            </material_1.TableBody>
          </material_1.Table>
        </material_1.TableContainer>
      </material_1.CardContent>
    </material_1.Card>);
    const renderAPIKeysTab = () => (<material_1.Card className="holographic">
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
            <icons_material_1.Key sx={{ mr: 1, verticalAlign: 'middle' }}/>
            API Ключі
          </material_1.Typography>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={() => setKeyDialogOpen(true)} sx={{
            backgroundColor: nexusTheme_1.nexusColors.sapphire,
            '&:hover': { backgroundColor: nexusTheme_1.nexusColors.sapphire + 'CC' }
        }}>
            Створити Ключ
          </material_1.Button>
        </material_1.Box>

        <material_1.List>
          {apiKeys.map((key) => (<material_1.ListItem key={key.id} sx={{
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                mb: 1,
                backgroundColor: nexusTheme_1.nexusColors.darkMatter + '40'
            }}>
              <material_1.ListItemAvatar>
                <material_1.Avatar sx={{
                backgroundColor: key.isActive ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.shadow,
                width: 40,
                height: 40
            }}>
                  <icons_material_1.Key />
                </material_1.Avatar>
              </material_1.ListItemAvatar>
              <material_1.ListItemText primary={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                      {key.name}
                    </material_1.Typography>
                    <material_1.Chip label={key.isActive ? 'Active' : 'Inactive'} size="small" sx={{
                    backgroundColor: key.isActive ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.shadow,
                    color: nexusTheme_1.nexusColors.frost
                }}/>
                  </material_1.Box>} secondary={<material_1.Box>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, fontFamily: 'monospace' }}>
                      {key.key}
                    </material_1.Typography>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                      Permissions: {key.permissions.join(', ')} |
                      Created: {key.createdAt.toLocaleDateString()} |
                      {key.lastUsed && ` Last used: ${key.lastUsed.toLocaleString()}`}
                    </material_1.Typography>
                  </material_1.Box>}/>
              <material_1.ListItemSecondaryAction>
                <material_1.Box sx={{ display: 'flex', gap: 0.5 }}>
                  <material_1.Tooltip title="Переглянути">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                      <icons_material_1.Visibility fontSize="small"/>
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title="Редагувати">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.warning }}>
                      <icons_material_1.Edit fontSize="small"/>
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title="Видалити">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.crimson }}>
                      <icons_material_1.Delete fontSize="small"/>
                    </material_1.IconButton>
                  </material_1.Tooltip>
                </material_1.Box>
              </material_1.ListItemSecondaryAction>
            </material_1.ListItem>))}
        </material_1.List>
      </material_1.CardContent>
    </material_1.Card>);
    const renderServicesTab = () => (<material_1.Card className="holographic">
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
            <icons_material_1.Memory sx={{ mr: 1, verticalAlign: 'middle' }}/>
            Системні Сервіси
          </material_1.Typography>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} sx={{ color: nexusTheme_1.nexusColors.emerald }}>
            Оновити Статус
          </material_1.Button>
        </material_1.Box>

        <material_1.Grid container spacing={2}>
          {services.map((service) => (<material_1.Grid item xs={12} md={6} key={service.id}>
              <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.darkMatter}80, ${nexusTheme_1.nexusColors.obsidian}60)`,
                border: `1px solid ${getStatusColor(service.status)}40`,
                borderRadius: 2
            }}>
                <material_1.CardContent>
                  <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                      {service.name}
                    </material_1.Typography>
                    <material_1.Chip label={service.status} size="small" sx={{
                backgroundColor: getStatusColor(service.status),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                  </material_1.Box>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                        CPU Usage
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                        {service.cpu}%
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.LinearProgress variant="determinate" value={service.cpu} sx={{
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: service.cpu > 80 ? nexusTheme_1.nexusColors.crimson :
                        service.cpu > 50 ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.emerald,
                },
            }}/>
                  </material_1.Box>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                        Memory Usage
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                        {service.memory}%
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.LinearProgress variant="determinate" value={service.memory} sx={{
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: service.memory > 80 ? nexusTheme_1.nexusColors.crimson :
                        service.memory > 50 ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.sapphire,
                },
            }}/>
                  </material_1.Box>

                  <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      Uptime: {service.uptime}
                    </material_1.Typography>
                    {service.port && (<material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                        Port: {service.port}
                      </material_1.Typography>)}
                  </material_1.Box>

                  <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                    {service.status === 'running' ? (<material_1.Button size="small" startIcon={<icons_material_1.Stop />} onClick={() => handleServiceAction(service.id, 'stop')} sx={{ color: nexusTheme_1.nexusColors.crimson }}>
                        Stop
                      </material_1.Button>) : (<material_1.Button size="small" startIcon={<icons_material_1.PlayArrow />} onClick={() => handleServiceAction(service.id, 'start')} sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                        Start
                      </material_1.Button>)}
                    <material_1.Button size="small" startIcon={<icons_material_1.Refresh />} onClick={() => handleServiceAction(service.id, 'restart')} sx={{ color: nexusTheme_1.nexusColors.warning }}>
                      Restart
                    </material_1.Button>
                  </material_1.Box>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>))}
        </material_1.Grid>
      </material_1.CardContent>
    </material_1.Card>);
    const renderSettingsTab = () => (<material_1.Grid container spacing={3}>
      <material_1.Grid item xs={12} md={6}>
        <material_1.Card className="holographic">
          <material_1.CardContent>
            <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.frost }}>
              <icons_material_1.Security sx={{ mr: 1, verticalAlign: 'middle' }}/>
              Налаштування Безпеки
            </material_1.Typography>

            <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <material_1.FormControlLabel control={<material_1.Switch defaultChecked/>} label="Двофакторна автентифікація" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
              <material_1.FormControlLabel control={<material_1.Switch defaultChecked/>} label="Логування API запитів" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
              <material_1.FormControlLabel control={<material_1.Switch />} label="Автоматичне блокування підозрілих IP" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
              <material_1.FormControlLabel control={<material_1.Switch defaultChecked/>} label="Шифрування даних в спокої" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Grid>

      <material_1.Grid item xs={12} md={6}>
        <material_1.Card className="holographic">
          <material_1.CardContent>
            <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.frost }}>
              <icons_material_1.Speed sx={{ mr: 1, verticalAlign: 'middle' }}/>
              Налаштування Продуктивності
            </material_1.Typography>

            <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <material_1.TextField label="Максимальна кількість з'єднань" type="number" defaultValue={1000} size="small" fullWidth/>
              <material_1.TextField label="Timeout запитів (сек)" type="number" defaultValue={30} size="small" fullWidth/>
              <material_1.TextField label="Розмір кешу (MB)" type="number" defaultValue={512} size="small" fullWidth/>
              <material_1.FormControlLabel control={<material_1.Switch defaultChecked/>} label="Автоматичне масштабування" sx={{ color: nexusTheme_1.nexusColors.nebula }}/>
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Grid>
    </material_1.Grid>);
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.crimson,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusTheme_1.nexusColors.crimson}`
        }}>
          <icons_material_1.AdminPanelSettings sx={{ mr: 2, verticalAlign: 'middle' }}/>
          Святилище Архітектора
        </material_1.Typography>

        {/* Tab Navigation */}
        <material_1.Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          {[
            { id: 'users', label: 'Користувачі', icon: <icons_material_1.Person /> },
            { id: 'keys', label: 'API Ключі', icon: <icons_material_1.Key /> },
            { id: 'services', label: 'Сервіси', icon: <icons_material_1.Memory /> },
            { id: 'settings', label: 'Налаштування', icon: <icons_material_1.Settings /> }
        ].map((tab) => (<material_1.Button key={tab.id} variant={selectedTab === tab.id ? 'contained' : 'outlined'} startIcon={tab.icon} onClick={() => setSelectedTab(tab.id)} sx={{
                backgroundColor: selectedTab === tab.id ? nexusTheme_1.nexusColors.crimson : 'transparent',
                borderColor: nexusTheme_1.nexusColors.crimson,
                color: selectedTab === tab.id ? nexusTheme_1.nexusColors.frost : nexusTheme_1.nexusColors.crimson,
                '&:hover': {
                    backgroundColor: selectedTab === tab.id ? nexusTheme_1.nexusColors.crimson + 'CC' : nexusTheme_1.nexusColors.crimson + '20'
                }
            }}>
              {tab.label}
            </material_1.Button>))}
        </material_1.Box>

        {/* Tab Content */}
        {selectedTab === 'users' && renderUsersTab()}
        {selectedTab === 'keys' && renderAPIKeysTab()}
        {selectedTab === 'services' && renderServicesTab()}
        {selectedTab === 'settings' && renderSettingsTab()}

        {/* User Dialog */}
        <material_1.Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
          <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.emerald }}>
            {selectedUser ? 'Редагувати Користувача' : 'Додати Користувача'}
          </material_1.DialogTitle>
          <material_1.DialogContent>
            <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <material_1.TextField label="Ім'я користувача" defaultValue={(selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.username) || ''} fullWidth/>
              <material_1.TextField label="Email" type="email" defaultValue={(selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email) || ''} fullWidth/>
              <material_1.TextField label="Роль" select defaultValue={(selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.role) || 'Analyst'} fullWidth SelectProps={{ native: true }}>
                <option value="Administrator">Administrator</option>
                <option value="Analyst">Analyst</option>
                <option value="Operator">Operator</option>
                <option value="Viewer">Viewer</option>
              </material_1.TextField>
            </material_1.Box>
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={() => setUserDialogOpen(false)}>Скасувати</material_1.Button>
            <material_1.Button variant="contained" sx={{ backgroundColor: nexusTheme_1.nexusColors.emerald }} onClick={() => setUserDialogOpen(false)}>
              {selectedUser ? 'Зберегти' : 'Створити'}
            </material_1.Button>
          </material_1.DialogActions>
        </material_1.Dialog>

        {/* API Key Dialog */}
        <material_1.Dialog open={keyDialogOpen} onClose={() => setKeyDialogOpen(false)} maxWidth="sm" fullWidth>
          <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
            Створити API Ключ
          </material_1.DialogTitle>
          <material_1.DialogContent>
            <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <material_1.TextField label="Назва ключа" fullWidth placeholder="Наприклад: Production API"/>
              <material_1.TextField label="Дозволи" select fullWidth SelectProps={{
            native: true,
            multiple: true
        }}>
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="admin">Admin</option>
              </material_1.TextField>
              <material_1.TextField label="Термін дії (днів)" type="number" defaultValue={365} fullWidth/>
            </material_1.Box>
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={() => setKeyDialogOpen(false)}>Скасувати</material_1.Button>
            <material_1.Button variant="contained" sx={{ backgroundColor: nexusTheme_1.nexusColors.sapphire }} onClick={() => setKeyDialogOpen(false)}>
              Створити Ключ
            </material_1.Button>
          </material_1.DialogActions>
        </material_1.Dialog>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.AdminModule = AdminModule;
