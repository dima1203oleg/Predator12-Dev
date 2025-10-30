// @ts-nocheck
/**
 * 📱 TELEGRAM CONNECTOR
 *
 * Підключення до Telegram каналів та груп
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Telegram as TelegramIcon,
  Group as GroupIcon,
  Campaign as ChannelIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';

// ============= TYPES =============

interface TelegramSource {
  id: string;
  identifier: string; // @channel or invite link
  type: 'channel' | 'group';
  status: 'pending' | 'connecting' | 'active' | 'error';
  name?: string;
  avatar?: string;
  members?: number;
  messagesCollected?: number;
  lastSync?: string;
  error?: string;
  filters: {
    media: boolean;
    links: boolean;
    forwards: boolean;
    minLength?: number;
  };
}

// ============= HELPER FUNCTIONS =============

const detectTelegramType = (identifier: string): 'channel' | 'group' => {
  if (identifier.startsWith('@')) return 'channel';
  if (identifier.includes('joinchat')) return 'group';
  return 'channel';
};

const formatIdentifier = (identifier: string): string => {
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

const TelegramConnector: React.FC = () => {
  const [sources, setSources] = useState<TelegramSource[]>([]);
  const [inputIdentifier, setInputIdentifier] = useState('');
  const [apiConnected, setApiConnected] = useState(false);
  const [apiToken, setApiToken] = useState('');

  // Filter settings
  const [collectMedia, setCollectMedia] = useState(true);
  const [collectLinks, setCollectLinks] = useState(true);
  const [collectForwards, setCollectForwards] = useState(false);
  const [minMessageLength, setMinMessageLength] = useState(0);

  // Connect API
  const handleConnectAPI = useCallback(async () => {
    if (!apiToken.trim()) return;

    try {
      // TODO: Implement real API connection
      // await fetch('/api/ingest/telegram/connect', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: apiToken })
      // });

      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApiConnected(true);
    } catch (error) {
      console.error('Failed to connect Telegram API:', error);
    }
  }, [apiToken]);

  // Add source
  const handleAddSource = useCallback(() => {
    if (!inputIdentifier.trim()) return;
    if (!apiConnected) {
      alert('Please connect Telegram API first');
      return;
    }

    const formatted = formatIdentifier(inputIdentifier);

    const newSource: TelegramSource = {
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
  const handleConnectSources = useCallback(async () => {
    const pendingSources = sources.filter(s => s.status === 'pending');

    for (const source of pendingSources) {
      // Update status to connecting
      setSources(prev => prev.map(s =>
        s.id === source.id ? { ...s, status: 'connecting' } : s
      ));

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
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock data
        const mockData = {
          name: source.identifier.replace('@', ''),
          avatar: `https://ui-avatars.com/api/?name=${source.identifier.replace('@', '')}&background=random`,
          members: Math.floor(Math.random() * 10000) + 100,
          messagesCollected: 0,
          lastSync: new Date().toISOString()
        };

        // Success
        setSources(prev => prev.map(s =>
          s.id === source.id
            ? { ...s, status: 'active', ...mockData }
            : s
        ));
      } catch (error) {
        // Error
        setSources(prev => prev.map(s =>
          s.id === source.id
            ? { ...s, status: 'error', error: error instanceof Error ? error.message : 'Connection failed' }
            : s
        ));
      }
    }
  }, [sources]);

  // Sync source
  const handleSync = useCallback(async (id: string) => {
    const source = sources.find(s => s.id === id);
    if (!source || source.status !== 'active') return;

    try {
      // TODO: Implement real sync
      // await fetch(`/api/ingest/telegram/${id}/sync`, { method: 'POST' });

      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSources(prev => prev.map(s =>
        s.id === id
          ? {
              ...s,
              messagesCollected: (s.messagesCollected || 0) + Math.floor(Math.random() * 50) + 1,
              lastSync: new Date().toISOString()
            }
          : s
      ));
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [sources]);

  // Remove source
  const handleRemove = useCallback((id: string) => {
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

  return (
    <Stack spacing={3}>
      {/* API Connection */}
      {!apiConnected && (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          p: 3
        }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TelegramIcon sx={{ fontSize: 40, color: nexusColors.primary.main }} />
              <Box>
                <Typography variant="h6" sx={{ color: nexusColors.text.primary }}>
                  Connect Telegram API
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  Required to access channels and groups
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info">
              Get your API token from{' '}
              <a
                href="https://my.telegram.org/apps"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: nexusColors.primary.main }}
              >
                my.telegram.org/apps
              </a>
            </Alert>

            <TextField
              fullWidth
              label="API Token"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your Telegram API token"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: nexusColors.text.primary,
                  '& fieldset': { borderColor: nexusColors.border.medium }
                }
              }}
            />

            <Button
              variant="contained"
              startIcon={<TelegramIcon />}
              onClick={handleConnectAPI}
              disabled={!apiToken.trim()}
              sx={{
                background: nexusColors.gradients.primary,
                alignSelf: 'flex-start',
                '&:disabled': {
                  background: nexusColors.border.light
                }
              }}
            >
              Connect API
            </Button>
          </Stack>
        </Card>
      )}

      {/* Add Source Form */}
      {apiConnected && (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          p: 3
        }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ color: nexusColors.text.primary }}>
              Add Telegram Source
            </Typography>

            {/* Identifier Input */}
            <TextField
              fullWidth
              label="Channel or Group"
              value={inputIdentifier}
              onChange={(e) => setInputIdentifier(e.target.value)}
              placeholder="@channel or https://t.me/joinchat/..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
              helperText="Enter @channel username or invite link"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: nexusColors.text.primary,
                  '& fieldset': { borderColor: nexusColors.border.medium }
                }
              }}
            />

            {/* Filter Settings */}
            <Divider sx={{ borderColor: nexusColors.border.light }} />

            <Typography variant="subtitle2" sx={{ color: nexusColors.text.secondary }}>
              Collection Filters
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Switch
                    checked={collectMedia}
                    onChange={(e) => setCollectMedia(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: nexusColors.primary.main
                      }
                    }}
                  />
                }
                label="Collect Media (images, videos)"
                sx={{ color: nexusColors.text.secondary }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={collectLinks}
                    onChange={(e) => setCollectLinks(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: nexusColors.primary.main
                      }
                    }}
                  />
                }
                label="Collect Links"
                sx={{ color: nexusColors.text.secondary }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={collectForwards}
                    onChange={(e) => setCollectForwards(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: nexusColors.primary.main
                      }
                    }}
                  />
                }
                label="Collect Forwards"
                sx={{ color: nexusColors.text.secondary }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: nexusColors.text.secondary }}>Min Message Length</InputLabel>
                <Select
                  value={minMessageLength}
                  onChange={(e) => setMinMessageLength(e.target.value as number)}
                  label="Min Message Length"
                  sx={{
                    color: nexusColors.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.border.medium }
                  }}
                >
                  <MenuItem value={0}>No limit</MenuItem>
                  <MenuItem value={50}>50+ characters</MenuItem>
                  <MenuItem value={100}>100+ characters</MenuItem>
                  <MenuItem value={200}>200+ characters</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Add Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSource}
              disabled={!inputIdentifier.trim()}
              sx={{
                background: nexusColors.gradients.primary,
                alignSelf: 'flex-start',
                '&:disabled': {
                  background: nexusColors.border.light
                }
              }}
            >
              Add Source
            </Button>
          </Stack>
        </Card>
      )}

      {/* Statistics */}
      {sources.length > 0 && (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          p: 2
        }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2}>
              <Chip
                label={`Total: ${stats.total}`}
                size="small"
                sx={{ bgcolor: nexusColors.primary.main + '20', color: nexusColors.primary.main }}
              />
              <Chip
                label={`Pending: ${stats.pending}`}
                size="small"
                icon={<PendingIcon />}
                sx={{ bgcolor: nexusColors.accent.yellow + '20', color: nexusColors.accent.yellow }}
              />
              <Chip
                label={`Active: ${stats.active}`}
                size="small"
                icon={<CheckIcon />}
                sx={{ bgcolor: nexusColors.status.success + '20', color: nexusColors.status.success }}
              />
              {stats.error > 0 && (
                <Chip
                  label={`Errors: ${stats.error}`}
                  size="small"
                  icon={<ErrorIcon />}
                  sx={{ bgcolor: nexusColors.status.error + '20', color: nexusColors.status.error }}
                />
              )}
              {stats.totalMessages > 0 && (
                <Chip
                  label={`Messages: ${stats.totalMessages}`}
                  size="small"
                  sx={{ bgcolor: nexusColors.accent.cyan + '20', color: nexusColors.accent.cyan }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<TelegramIcon />}
                disabled={stats.pending === 0}
                onClick={handleConnectSources}
                sx={{
                  background: nexusColors.gradients.primary,
                  '&:disabled': {
                    background: nexusColors.border.light
                  }
                }}
              >
                Connect ({stats.pending})
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Sources List */}
      {sources.length > 0 && (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          maxHeight: 500,
          overflow: 'auto'
        }}>
          <List>
            {sources.map((source, index) => (
              <ListItem
                key={source.id}
                sx={{
                  borderBottom: index < sources.length - 1 ? `1px solid ${nexusColors.border.light}` : 'none'
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={source.avatar}
                    sx={{ bgcolor: nexusColors.primary.main }}
                  >
                    {source.type === 'channel' ? <ChannelIcon /> : <GroupIcon />}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body1" sx={{ color: nexusColors.text.primary }}>
                        {source.name || source.identifier}
                      </Typography>
                      <Chip
                        label={source.type}
                        size="small"
                        sx={{ height: 20 }}
                      />
                      {source.members && (
                        <Chip
                          label={`${source.members.toLocaleString()} members`}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        {source.identifier}
                      </Typography>

                      {source.status === 'active' && (
                        <Stack direction="row" spacing={1}>
                          <Typography variant="caption" sx={{ color: nexusColors.status.success }}>
                            {source.messagesCollected || 0} messages collected
                          </Typography>
                          {source.lastSync && (
                            <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                              • Last sync: {new Date(source.lastSync).toLocaleString()}
                            </Typography>
                          )}
                        </Stack>
                      )}

                      {source.status === 'connecting' && (
                        <Typography variant="caption" sx={{ color: nexusColors.accent.cyan }}>
                          Connecting...
                        </Typography>
                      )}

                      {source.status === 'error' && (
                        <Alert severity="error" sx={{ py: 0 }}>
                          {source.error || 'Connection failed'}
                        </Alert>
                      )}
                    </Stack>
                  }
                />

                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {source.status === 'active' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleSync(source.id)}
                          title="Sync now"
                        >
                          <SyncIcon />
                        </IconButton>
                        <CheckIcon sx={{ color: nexusColors.status.success }} />
                      </>
                    )}
                    {source.status === 'error' && (
                      <ErrorIcon sx={{ color: nexusColors.status.error }} />
                    )}
                    {source.status === 'pending' && (
                      <PendingIcon sx={{ color: nexusColors.accent.yellow }} />
                    )}

                    <IconButton
                      size="small"
                      onClick={() => handleRemove(source.id)}
                      disabled={source.status === 'connecting'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </Stack>
  );
};

export default TelegramConnector;
