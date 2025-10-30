// @ts-nocheck
/**
 * 📊 TASK STREAM
 *
 * Real-time task queue and progress monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Collapse,
  Alert,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  Telegram as TelegramIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  HourglassEmpty as ProcessingIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';

// ============= TYPES =============

interface Task {
  id: string;
  type: 'file' | 'link' | 'telegram';
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'paused';
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  details?: {
    size?: number;
    itemsProcessed?: number;
    itemsTotal?: number;
    url?: string;
  };
  logs?: string[];
}

interface TaskStreamProps {
  onTaskCountChange?: (count: number) => void;
}

// ============= HELPER FUNCTIONS =============

const getTaskIcon = (type: string) => {
  switch (type) {
    case 'file': return <UploadIcon />;
    case 'link': return <LinkIcon />;
    case 'telegram': return <TelegramIcon />;
    default: return <ProcessingIcon />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success': return <CheckIcon sx={{ color: nexusColors.status.success }} />;
    case 'error': return <ErrorIcon sx={{ color: nexusColors.status.error }} />;
    case 'pending': return <PendingIcon sx={{ color: nexusColors.accent.yellow }} />;
    case 'processing': return <ProcessingIcon sx={{ color: nexusColors.primary.main }} />;
    case 'paused': return <PauseIcon sx={{ color: nexusColors.accent.orange }} />;
    default: return null;
  }
};

const formatDuration = (start?: string, end?: string) => {
  if (!start) return '—';
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const duration = (endTime - startTime) / 1000;

  if (duration < 60) return `${Math.round(duration)}s`;
  if (duration < 3600) return `${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s`;
  return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
};

// Mock task generator
const generateMockTasks = (): Task[] => [
  {
    id: '1',
    type: 'file',
    name: 'customs_data_2024.csv',
    status: 'success',
    progress: 100,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    startedAt: new Date(Date.now() - 290000).toISOString(),
    completedAt: new Date(Date.now() - 250000).toISOString(),
    details: { size: 15728640, itemsProcessed: 5000, itemsTotal: 5000 },
    logs: ['File uploaded', 'Parsing CSV', 'Validating data', 'Indexing...', 'Completed']
  },
  {
    id: '2',
    type: 'link',
    name: 'https://example.com/feed.xml',
    status: 'processing',
    progress: 65,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    startedAt: new Date(Date.now() - 110000).toISOString(),
    details: { itemsProcessed: 65, itemsTotal: 100, url: 'https://example.com/feed.xml' },
    logs: ['Fetching RSS feed', 'Parsing XML', 'Extracting articles...']
  },
  {
    id: '3',
    type: 'telegram',
    name: '@tech_news_ua',
    status: 'processing',
    progress: 30,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    startedAt: new Date(Date.now() - 50000).toISOString(),
    details: { itemsProcessed: 150, itemsTotal: 500 },
    logs: ['Connecting to Telegram', 'Fetching messages...']
  },
];

// ============= COMPONENT =============

const TaskStream: React.FC<TaskStreamProps> = ({ onTaskCountChange }) => {
  const [tasks, setTasks] = useState<Task[]>(generateMockTasks());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [filterTab, setFilterTab] = useState<'all' | 'processing' | 'completed' | 'failed'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Toggle task expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    switch (filterTab) {
      case 'processing': return ['pending', 'processing', 'paused'].includes(task.status);
      case 'completed': return task.status === 'success';
      case 'failed': return task.status === 'error';
      default: return true;
    }
  });

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'processing' && task.progress < 100) {
          const newProgress = Math.min(100, task.progress + Math.random() * 10);
          const isComplete = newProgress >= 100;

          return {
            ...task,
            progress: newProgress,
            status: isComplete ? 'success' : 'processing',
            completedAt: isComplete ? new Date().toISOString() : undefined,
            details: {
              ...task.details,
              itemsProcessed: task.details?.itemsTotal
                ? Math.round((task.details.itemsTotal * newProgress) / 100)
                : undefined
            }
          };
        }
        return task;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Update parent with active task count
  useEffect(() => {
    const activeCount = tasks.filter(t => ['pending', 'processing'].includes(t.status)).length;
    onTaskCountChange?.(activeCount);
  }, [tasks, onTaskCountChange]);

  // Statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    success: tasks.filter(t => t.status === 'success').length,
    error: tasks.filter(t => t.status === 'error').length,
    paused: tasks.filter(t => t.status === 'paused').length
  };

  return (
    <Stack spacing={3}>
      {/* Controls */}
      <Card sx={{
        background: nexusColors.background.paper,
        border: `1px solid ${nexusColors.border.light}`,
        p: 2
      }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          {/* Statistics */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`Total: ${stats.total}`}
              size="small"
              sx={{ bgcolor: nexusColors.primary.main + '20', color: nexusColors.primary.main }}
            />
            {stats.processing > 0 && (
              <Chip
                label={`Processing: ${stats.processing}`}
                size="small"
                icon={<ProcessingIcon />}
                sx={{ bgcolor: nexusColors.primary.main + '20', color: nexusColors.primary.main }}
              />
            )}
            <Chip
              label={`Success: ${stats.success}`}
              size="small"
              icon={<CheckIcon />}
              sx={{ bgcolor: nexusColors.status.success + '20', color: nexusColors.status.success }}
            />
            {stats.error > 0 && (
              <Chip
                label={`Failed: ${stats.error}`}
                size="small"
                icon={<ErrorIcon />}
                sx={{ bgcolor: nexusColors.status.error + '20', color: nexusColors.status.error }}
              />
            )}
            {stats.paused > 0 && (
              <Chip
                label={`Paused: ${stats.paused}`}
                size="small"
                icon={<PauseIcon />}
                sx={{ bgcolor: nexusColors.accent.orange + '20', color: nexusColors.accent.orange }}
              />
            )}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={autoRefresh ? 'contained' : 'outlined'}
              startIcon={<RefreshIcon />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              sx={{
                ...(autoRefresh && { background: nexusColors.gradients.primary }),
                ...(!autoRefresh && {
                  borderColor: nexusColors.border.medium,
                  color: nexusColors.text.secondary
                })
              }}
            >
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Filter Tabs */}
      <Card sx={{
        background: nexusColors.background.paper,
        border: `1px solid ${nexusColors.border.light}`
      }}>
        <Tabs
          value={filterTab}
          onChange={(_, value) => setFilterTab(value)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              color: nexusColors.text.secondary,
              '&.Mui-selected': {
                color: nexusColors.primary.main
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: nexusColors.primary.main
            }
          }}
        >
          <Tab label={`All (${stats.total})`} value="all" />
          <Tab label={`Processing (${stats.processing + stats.pending + stats.paused})`} value="processing" />
          <Tab label={`Completed (${stats.success})`} value="completed" />
          <Tab label={`Failed (${stats.error})`} value="failed" />
        </Tabs>
      </Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          p: 6,
          textAlign: 'center'
        }}>
          <Typography variant="body1" sx={{ color: nexusColors.text.secondary }}>
            No tasks {filterTab !== 'all' && `in "${filterTab}" state`}
          </Typography>
        </Card>
      ) : (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          maxHeight: 600,
          overflow: 'auto'
        }}>
          <List>
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    sx={{
                      borderBottom: index < filteredTasks.length - 1 ? `1px solid ${nexusColors.border.light}` : 'none',
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}
                  >
                    {/* Main Content */}
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: nexusColors.primary.main + '20' }}>
                          {getTaskIcon(task.type)}
                        </Avatar>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body1" sx={{ color: nexusColors.text.primary }}>
                              {task.name}
                            </Typography>
                            <Chip label={task.type} size="small" sx={{ height: 20 }} />
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            {/* Progress */}
                            {['pending', 'processing', 'paused'].includes(task.status) && (
                              <Box sx={{ width: '100%' }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                                    {task.details?.itemsProcessed !== undefined && task.details?.itemsTotal
                                      ? `${task.details.itemsProcessed} / ${task.details.itemsTotal} items`
                                      : 'Processing...'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                                    {Math.round(task.progress)}%
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={task.progress}
                                  sx={{
                                    '& .MuiLinearProgress-bar': {
                                      background: nexusColors.gradients.primary
                                    }
                                  }}
                                />
                              </Box>
                            )}

                            {/* Metadata */}
                            <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                              Created: {new Date(task.createdAt).toLocaleString()} •
                              Duration: {formatDuration(task.startedAt, task.completedAt)}
                            </Typography>

                            {/* Error */}
                            {task.status === 'error' && task.error && (
                              <Alert severity="error" sx={{ py: 0 }}>
                                {task.error}
                              </Alert>
                            )}
                          </Stack>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getStatusIcon(task.status)}
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(task.id)}
                          >
                            {expandedTasks.has(task.id) ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </Box>

                    {/* Expanded Details */}
                    <Collapse in={expandedTasks.has(task.id)}>
                      <Box sx={{
                        mt: 2,
                        pl: 7,
                        pt: 2,
                        borderTop: `1px solid ${nexusColors.border.light}`
                      }}>
                        <Typography variant="subtitle2" sx={{ color: nexusColors.text.primary, mb: 1 }}>
                          Logs:
                        </Typography>
                        <Stack spacing={0.5}>
                          {task.logs?.map((log, i) => (
                            <Typography
                              key={i}
                              variant="caption"
                              sx={{
                                color: nexusColors.text.secondary,
                                fontFamily: 'monospace'
                              }}
                            >
                              • {log}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    </Collapse>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Card>
      )}
    </Stack>
  );
};

export default TaskStream;
