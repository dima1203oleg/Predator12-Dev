"use strict";
// @ts-nocheck
/**
 * 📱 TELEGRAM CONNECTOR
 *
 * Підключення до Telegram каналів та груп
 */
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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
// ============= HELPER FUNCTIONS =============
const detectTelegramType = (identifier) => {
    if (identifier.startsWith('@'))
        return 'channel';
    if (identifier.includes('joinchat'))
        return 'group';
    return 'channel';
};
const formatIdentifier = (identifier) => {
    identifier = identifier.trim();
    // Extract from full URL
    if (identifier.includes('t.me/')) {
        const parts = identifier.split('t.me/')[1];
        if (parts.startsWith('joinchat/')) {
            return identifier; // Keep full invite link
        }
        return '@' + parts.split('?')[0].split('/')[0];
    }
    // Add @ if missing
    if (!identifier.startsWith('@') && !identifier.includes('joinchat')) {
        return '@' + identifier;
    }
    return identifier;
};
// ============= COMPONENT =============
const TelegramConnector = () => {
    const [sources, setSources] = (0, react_1.useState)([]);
    const [inputIdentifier, setInputIdentifier] = (0, react_1.useState)('');
    const [apiConnected, setApiConnected] = (0, react_1.useState)(false);
    const [apiToken, setApiToken] = (0, react_1.useState)('');
    // Filter settings
    const [collectMedia, setCollectMedia] = (0, react_1.useState)(true);
    const [collectLinks, setCollectLinks] = (0, react_1.useState)(true);
    const [collectForwards, setCollectForwards] = (0, react_1.useState)(false);
    const [minMessageLength, setMinMessageLength] = (0, react_1.useState)(0);
    // Connect API
    const handleConnectAPI = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiToken.trim())
            return;
        try {
            // TODO: Implement real API connection
            // await fetch('/api/ingest/telegram/connect', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ token: apiToken })
            // });
            // Simulate connection
            yield new Promise(resolve => setTimeout(resolve, 1000));
            setApiConnected(true);
        }
        catch (error) {
            console.error('Failed to connect Telegram API:', error);
        }
    }), [apiToken]);
    // Add source
    const handleAddSource = (0, react_1.useCallback)(() => {
        if (!inputIdentifier.trim())
            return;
        if (!apiConnected) {
            alert('Please connect Telegram API first');
            return;
        }
        const formatted = formatIdentifier(inputIdentifier);
        const newSource = {
            id: `${Date.now()}-${Math.random()}`,
            identifier: formatted,
            type: detectTelegramType(formatted),
            status: 'pending',
            filters: {
                media: collectMedia,
                links: collectLinks,
                forwards: collectForwards,
                minLength: minMessageLength > 0 ? minMessageLength : undefined
            }
        };
        setSources(prev => [...prev, newSource]);
        setInputIdentifier('');
    }, [inputIdentifier, apiConnected, collectMedia, collectLinks, collectForwards, minMessageLength]);
    // Connect sources
    const handleConnectSources = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        const pendingSources = sources.filter(s => s.status === 'pending');
        for (const source of pendingSources) {
            // Update status to connecting
            setSources(prev => prev.map(s => s.id === source.id ? Object.assign(Object.assign({}, s), { status: 'connecting' }) : s));
            try {
                // TODO: Implement real API call
                // const response = await fetch('/api/ingest/telegram/subscribe', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify({
                //     identifier: source.identifier,
                //     filters: source.filters
                //   })
                // });
                // const data = await response.json();
                // Simulate connection
                yield new Promise(resolve => setTimeout(resolve, 2000));
                // Mock data
                const mockData = {
                    name: source.identifier.replace('@', ''),
                    avatar: `https://ui-avatars.com/api/?name=${source.identifier.replace('@', '')}&background=random`,
                    members: Math.floor(Math.random() * 10000) + 100,
                    messagesCollected: 0,
                    lastSync: new Date().toISOString()
                };
                // Success
                setSources(prev => prev.map(s => s.id === source.id
                    ? Object.assign(Object.assign(Object.assign({}, s), { status: 'active' }), mockData) : s));
            }
            catch (error) {
                // Error
                setSources(prev => prev.map(s => s.id === source.id
                    ? Object.assign(Object.assign({}, s), { status: 'error', error: error instanceof Error ? error.message : 'Connection failed' }) : s));
            }
        }
    }), [sources]);
    // Sync source
    const handleSync = (0, react_1.useCallback)((id) => __awaiter(void 0, void 0, void 0, function* () {
        const source = sources.find(s => s.id === id);
        if (!source || source.status !== 'active')
            return;
        try {
            // TODO: Implement real sync
            // await fetch(`/api/ingest/telegram/${id}/sync`, { method: 'POST' });
            // Simulate sync
            yield new Promise(resolve => setTimeout(resolve, 1000));
            setSources(prev => prev.map(s => s.id === id
                ? Object.assign(Object.assign({}, s), { messagesCollected: (s.messagesCollected || 0) + Math.floor(Math.random() * 50) + 1, lastSync: new Date().toISOString() }) : s));
        }
        catch (error) {
            console.error('Sync failed:', error);
        }
    }), [sources]);
    // Remove source
    const handleRemove = (0, react_1.useCallback)((id) => {
        setSources(prev => prev.filter(s => s.id !== id));
    }, []);
    // Statistics
    const stats = {
        total: sources.length,
        pending: sources.filter(s => s.status === 'pending').length,
        active: sources.filter(s => s.status === 'active').length,
        error: sources.filter(s => s.status === 'error').length,
        totalMessages: sources.reduce((sum, s) => sum + (s.messagesCollected || 0), 0)
    };
    return (<material_1.Stack spacing={3}>
      {/* API Connection */}
      {!apiConnected && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                p: 3
            }}>
          <material_1.Stack spacing={2}>
            <material_1.Stack direction="row" spacing={2} alignItems="center">
              <icons_material_1.Telegram sx={{ fontSize: 40, color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>
              <material_1.Box>
                <material_1.Typography variant="h6" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary }}>
                  Connect Telegram API
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                  Required to access channels and groups
                </material_1.Typography>
              </material_1.Box>
            </material_1.Stack>

            <material_1.Alert severity="info">
              Get your API token from{' '}
              <a href="https://my.telegram.org/apps" target="_blank" rel="noopener noreferrer" style={{ color: nexusThemeV2_1.nexusColorsDark.primary.main }}>
                my.telegram.org/apps
              </a>
            </material_1.Alert>

            <material_1.TextField fullWidth label="API Token" type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="Enter your Telegram API token" sx={{
                '& .MuiOutlinedInput-root': {
                    color: nexusThemeV2_1.nexusColorsDark.text.primary,
                    '& fieldset': { borderColor: nexusThemeV2_1.nexusColorsDark.border.medium }
                }
            }}/>

            <material_1.Button variant="contained" startIcon={<icons_material_1.Telegram />} onClick={handleConnectAPI} disabled={!apiToken.trim()} sx={{
                background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
                alignSelf: 'flex-start',
                '&:disabled': {
                    background: nexusThemeV2_1.nexusColorsDark.border.light
                }
            }}>
              Connect API
            </material_1.Button>
          </material_1.Stack>
        </material_1.Card>)}

      {/* Add Source Form */}
      {apiConnected && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                p: 3
            }}>
          <material_1.Stack spacing={2}>
            <material_1.Typography variant="h6" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary }}>
              Add Telegram Source
            </material_1.Typography>

            {/* Identifier Input */}
            <material_1.TextField fullWidth label="Channel or Group" value={inputIdentifier} onChange={(e) => setInputIdentifier(e.target.value)} placeholder="@channel or https://t.me/joinchat/..." onKeyPress={(e) => e.key === 'Enter' && handleAddSource()} helperText="Enter @channel username or invite link" sx={{
                '& .MuiOutlinedInput-root': {
                    color: nexusThemeV2_1.nexusColorsDark.text.primary,
                    '& fieldset': { borderColor: nexusThemeV2_1.nexusColorsDark.border.medium }
                }
            }}/>

            {/* Filter Settings */}
            <material_1.Divider sx={{ borderColor: nexusThemeV2_1.nexusColorsDark.border.light }}/>

            <material_1.Typography variant="subtitle2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
              Collection Filters
            </material_1.Typography>

            <material_1.Stack direction="row" spacing={2} flexWrap="wrap">
              <material_1.FormControlLabel control={<material_1.Switch checked={collectMedia} onChange={(e) => setCollectMedia(e.target.checked)} sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: nexusThemeV2_1.nexusColorsDark.primary.main
                    }
                }}/>} label="Collect Media (images, videos)" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}/>

              <material_1.FormControlLabel control={<material_1.Switch checked={collectLinks} onChange={(e) => setCollectLinks(e.target.checked)} sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: nexusThemeV2_1.nexusColorsDark.primary.main
                    }
                }}/>} label="Collect Links" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}/>

              <material_1.FormControlLabel control={<material_1.Switch checked={collectForwards} onChange={(e) => setCollectForwards(e.target.checked)} sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: nexusThemeV2_1.nexusColorsDark.primary.main
                    }
                }}/>} label="Collect Forwards" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}/>

              <material_1.FormControl sx={{ minWidth: 200 }}>
                <material_1.InputLabel sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>Min Message Length</material_1.InputLabel>
                <material_1.Select value={minMessageLength} onChange={(e) => setMinMessageLength(e.target.value)} label="Min Message Length" sx={{
                color: nexusThemeV2_1.nexusColorsDark.text.primary,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusThemeV2_1.nexusColorsDark.border.medium }
            }}>
                  <material_1.MenuItem value={0}>No limit</material_1.MenuItem>
                  <material_1.MenuItem value={50}>50+ characters</material_1.MenuItem>
                  <material_1.MenuItem value={100}>100+ characters</material_1.MenuItem>
                  <material_1.MenuItem value={200}>200+ characters</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Stack>

            {/* Add Button */}
            <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={handleAddSource} disabled={!inputIdentifier.trim()} sx={{
                background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
                alignSelf: 'flex-start',
                '&:disabled': {
                    background: nexusThemeV2_1.nexusColorsDark.border.light
                }
            }}>
              Add Source
            </material_1.Button>
          </material_1.Stack>
        </material_1.Card>)}

      {/* Statistics */}
      {sources.length > 0 && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                p: 2
            }}>
          <material_1.Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <material_1.Stack direction="row" spacing={2}>
              <material_1.Chip label={`Total: ${stats.total}`} size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.primary.main + '20', color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>
              <material_1.Chip label={`Pending: ${stats.pending}`} size="small" icon={<icons_material_1.Schedule />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.yellow + '20', color: nexusThemeV2_1.nexusColorsDark.accent.yellow }}/>
              <material_1.Chip label={`Active: ${stats.active}`} size="small" icon={<icons_material_1.CheckCircle />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.success + '20', color: nexusThemeV2_1.nexusColorsDark.status.success }}/>
              {stats.error > 0 && (<material_1.Chip label={`Errors: ${stats.error}`} size="small" icon={<icons_material_1.Error />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.error + '20', color: nexusThemeV2_1.nexusColorsDark.status.error }}/>)}
              {stats.totalMessages > 0 && (<material_1.Chip label={`Messages: ${stats.totalMessages}`} size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.cyan + '20', color: nexusThemeV2_1.nexusColorsDark.accent.cyan }}/>)}
            </material_1.Stack>

            <material_1.Stack direction="row" spacing={1}>
              <material_1.Button variant="contained" size="small" startIcon={<icons_material_1.Telegram />} disabled={stats.pending === 0} onClick={handleConnectSources} sx={{
                background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
                '&:disabled': {
                    background: nexusThemeV2_1.nexusColorsDark.border.light
                }
            }}>
                Connect ({stats.pending})
              </material_1.Button>
            </material_1.Stack>
          </material_1.Stack>
        </material_1.Card>)}

      {/* Sources List */}
      {sources.length > 0 && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                maxHeight: 500,
                overflow: 'auto'
            }}>
          <material_1.List>
            {sources.map((source, index) => (<material_1.ListItem key={source.id} sx={{
                    borderBottom: index < sources.length - 1 ? `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}` : 'none'
                }}>
                <material_1.ListItemAvatar>
                  <material_1.Avatar src={source.avatar} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.primary.main }}>
                    {source.type === 'channel' ? <icons_material_1.Campaign /> : <icons_material_1.Group />}
                  </material_1.Avatar>
                </material_1.ListItemAvatar>

                <material_1.ListItemText primary={<material_1.Stack direction="row" spacing={1} alignItems="center">
                      <material_1.Typography variant="body1" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary }}>
                        {source.name || source.identifier}
                      </material_1.Typography>
                      <material_1.Chip label={source.type} size="small" sx={{ height: 20 }}/>
                      {source.members && (<material_1.Chip label={`${source.members.toLocaleString()} members`} size="small" sx={{ height: 20 }}/>)}
                    </material_1.Stack>} secondary={<material_1.Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                        {source.identifier}
                      </material_1.Typography>

                      {source.status === 'active' && (<material_1.Stack direction="row" spacing={1}>
                          <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.status.success }}>
                            {source.messagesCollected || 0} messages collected
                          </material_1.Typography>
                          {source.lastSync && (<material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                              • Last sync: {new Date(source.lastSync).toLocaleString()}
                            </material_1.Typography>)}
                        </material_1.Stack>)}

                      {source.status === 'connecting' && (<material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.accent.cyan }}>
                          Connecting...
                        </material_1.Typography>)}

                      {source.status === 'error' && (<material_1.Alert severity="error" sx={{ py: 0 }}>
                          {source.error || 'Connection failed'}
                        </material_1.Alert>)}
                    </material_1.Stack>}/>

                <material_1.ListItemSecondaryAction>
                  <material_1.Stack direction="row" spacing={1} alignItems="center">
                    {source.status === 'active' && (<>
                        <material_1.IconButton size="small" onClick={() => handleSync(source.id)} title="Sync now">
                          <icons_material_1.Sync />
                        </material_1.IconButton>
                        <icons_material_1.CheckCircle sx={{ color: nexusThemeV2_1.nexusColorsDark.status.success }}/>
                      </>)}
                    {source.status === 'error' && (<icons_material_1.Error sx={{ color: nexusThemeV2_1.nexusColorsDark.status.error }}/>)}
                    {source.status === 'pending' && (<icons_material_1.Schedule sx={{ color: nexusThemeV2_1.nexusColorsDark.accent.yellow }}/>)}

                    <material_1.IconButton size="small" onClick={() => handleRemove(source.id)} disabled={source.status === 'connecting'}>
                      <icons_material_1.Delete />
                    </material_1.IconButton>
                  </material_1.Stack>
                </material_1.ListItemSecondaryAction>
              </material_1.ListItem>))}
          </material_1.List>
        </material_1.Card>)}
    </material_1.Stack>);
};
exports.default = TelegramConnector;
