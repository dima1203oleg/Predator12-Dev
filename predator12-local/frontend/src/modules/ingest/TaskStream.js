"use strict";
// @ts-nocheck
/**
 * 📊 TASK STREAM
 *
 * Real-time task queue and progress monitoring
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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
// ============= HELPER FUNCTIONS =============
const getTaskIcon = (type) => {
    switch (type) {
        case 'file': return <icons_material_1.CloudUpload />;
        case 'link': return <icons_material_1.Link />;
        case 'telegram': return <icons_material_1.Telegram />;
        default: return <icons_material_1.HourglassEmpty />;
    }
};
const getStatusIcon = (status) => {
    switch (status) {
        case 'success': return <icons_material_1.CheckCircle sx={{ color: nexusThemeV2_1.nexusColorsDark.status.success }}/>;
        case 'error': return <icons_material_1.Error sx={{ color: nexusThemeV2_1.nexusColorsDark.status.error }}/>;
        case 'pending': return <icons_material_1.Schedule sx={{ color: nexusThemeV2_1.nexusColorsDark.accent.yellow }}/>;
        case 'processing': return <icons_material_1.HourglassEmpty sx={{ color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>;
        case 'paused': return <icons_material_1.Pause sx={{ color: nexusThemeV2_1.nexusColorsDark.accent.orange }}/>;
        default: return null;
    }
};
const formatDuration = (start, end) => {
    if (!start)
        return '—';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = (endTime - startTime) / 1000;
    if (duration < 60)
        return `${Math.round(duration)}s`;
    if (duration < 3600)
        return `${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
};
// Mock task generator
const generateMockTasks = () => [
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
const TaskStream = ({ onTaskCountChange }) => {
    const [tasks, setTasks] = (0, react_1.useState)(generateMockTasks());
    const [expandedTasks, setExpandedTasks] = (0, react_1.useState)(new Set());
    const [filterTab, setFilterTab] = (0, react_1.useState)('all');
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    // Toggle task expansion
    const toggleExpand = (0, react_1.useCallback)((id) => {
        setExpandedTasks(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            }
            else {
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
    (0, react_1.useEffect)(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            setTasks(prev => prev.map(task => {
                var _a;
                if (task.status === 'processing' && task.progress < 100) {
                    const newProgress = Math.min(100, task.progress + Math.random() * 10);
                    const isComplete = newProgress >= 100;
                    return Object.assign(Object.assign({}, task), { progress: newProgress, status: isComplete ? 'success' : 'processing', completedAt: isComplete ? new Date().toISOString() : undefined, details: Object.assign(Object.assign({}, task.details), { itemsProcessed: ((_a = task.details) === null || _a === void 0 ? void 0 : _a.itemsTotal)
                                ? Math.round((task.details.itemsTotal * newProgress) / 100)
                                : undefined }) });
                }
                return task;
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, [autoRefresh]);
    // Update parent with active task count
    (0, react_1.useEffect)(() => {
        const activeCount = tasks.filter(t => ['pending', 'processing'].includes(t.status)).length;
        onTaskCountChange === null || onTaskCountChange === void 0 ? void 0 : onTaskCountChange(activeCount);
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
    return (<material_1.Stack spacing={3}>
      {/* Controls */}
      <material_1.Card sx={{
            background: nexusThemeV2_1.nexusColorsDark.background.paper,
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
            p: 2
        }}>
        <material_1.Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          {/* Statistics */}
          <material_1.Stack direction="row" spacing={1} flexWrap="wrap">
            <material_1.Chip label={`Total: ${stats.total}`} size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.primary.main + '20', color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>
            {stats.processing > 0 && (<material_1.Chip label={`Processing: ${stats.processing}`} size="small" icon={<icons_material_1.HourglassEmpty />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.primary.main + '20', color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>)}
            <material_1.Chip label={`Success: ${stats.success}`} size="small" icon={<icons_material_1.CheckCircle />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.success + '20', color: nexusThemeV2_1.nexusColorsDark.status.success }}/>
            {stats.error > 0 && (<material_1.Chip label={`Failed: ${stats.error}`} size="small" icon={<icons_material_1.Error />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.error + '20', color: nexusThemeV2_1.nexusColorsDark.status.error }}/>)}
            {stats.paused > 0 && (<material_1.Chip label={`Paused: ${stats.paused}`} size="small" icon={<icons_material_1.Pause />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.orange + '20', color: nexusThemeV2_1.nexusColorsDark.accent.orange }}/>)}
          </material_1.Stack>

          {/* Actions */}
          <material_1.Stack direction="row" spacing={1}>
            <material_1.Button size="small" variant={autoRefresh ? 'contained' : 'outlined'} startIcon={<icons_material_1.Refresh />} onClick={() => setAutoRefresh(!autoRefresh)} sx={Object.assign(Object.assign({}, (autoRefresh && { background: nexusThemeV2_1.nexusColorsDark.gradients.primary })), (!autoRefresh && {
            borderColor: nexusThemeV2_1.nexusColorsDark.border.medium,
            color: nexusThemeV2_1.nexusColorsDark.text.secondary
        }))}>
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </material_1.Button>
          </material_1.Stack>
        </material_1.Stack>
      </material_1.Card>

      {/* Filter Tabs */}
      <material_1.Card sx={{
            background: nexusThemeV2_1.nexusColorsDark.background.paper,
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`
        }}>
        <material_1.Tabs value={filterTab} onChange={(_, value) => setFilterTab(value)} variant="fullWidth" sx={{
            '& .MuiTab-root': {
                color: nexusThemeV2_1.nexusColorsDark.text.secondary,
                '&.Mui-selected': {
                    color: nexusThemeV2_1.nexusColorsDark.primary.main
                }
            },
            '& .MuiTabs-indicator': {
                backgroundColor: nexusThemeV2_1.nexusColorsDark.primary.main
            }
        }}>
          <material_1.Tab label={`All (${stats.total})`} value="all"/>
          <material_1.Tab label={`Processing (${stats.processing + stats.pending + stats.paused})`} value="processing"/>
          <material_1.Tab label={`Completed (${stats.success})`} value="completed"/>
          <material_1.Tab label={`Failed (${stats.error})`} value="failed"/>
        </material_1.Tabs>
      </material_1.Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                p: 6,
                textAlign: 'center'
            }}>
          <material_1.Typography variant="body1" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
            No tasks {filterTab !== 'all' && `in "${filterTab}" state`}
          </material_1.Typography>
        </material_1.Card>) : (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                maxHeight: 600,
                overflow: 'auto'
            }}>
          <material_1.List>
            <framer_motion_1.AnimatePresence>
              {filteredTasks.map((task, index) => {
                var _a, _b, _c;
                return (<framer_motion_1.motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                  <material_1.ListItem sx={{
                        borderBottom: index < filteredTasks.length - 1 ? `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}` : 'none',
                        flexDirection: 'column',
                        alignItems: 'stretch'
                    }}>
                    {/* Main Content */}
                    <material_1.Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                      <material_1.ListItemIcon>
                        <material_1.Avatar sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.primary.main + '20' }}>
                          {getTaskIcon(task.type)}
                        </material_1.Avatar>
                      </material_1.ListItemIcon>

                      <material_1.ListItemText primary={<material_1.Stack direction="row" spacing={1} alignItems="center">
                            <material_1.Typography variant="body1" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary }}>
                              {task.name}
                            </material_1.Typography>
                            <material_1.Chip label={task.type} size="small" sx={{ height: 20 }}/>
                          </material_1.Stack>} secondary={<material_1.Stack spacing={1} sx={{ mt: 1 }}>
                            {/* Progress */}
                            {['pending', 'processing', 'paused'].includes(task.status) && (<material_1.Box sx={{ width: '100%' }}>
                                <material_1.Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                  <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                                    {((_a = task.details) === null || _a === void 0 ? void 0 : _a.itemsProcessed) !== undefined && ((_b = task.details) === null || _b === void 0 ? void 0 : _b.itemsTotal)
                                ? `${task.details.itemsProcessed} / ${task.details.itemsTotal} items`
                                : 'Processing...'}
                                  </material_1.Typography>
                                  <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                                    {Math.round(task.progress)}%
                                  </material_1.Typography>
                                </material_1.Stack>
                                <material_1.LinearProgress variant="determinate" value={task.progress} sx={{
                                '& .MuiLinearProgress-bar': {
                                    background: nexusThemeV2_1.nexusColorsDark.gradients.primary
                                }
                            }}/>
                              </material_1.Box>)}

                            {/* Metadata */}
                            <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                              Created: {new Date(task.createdAt).toLocaleString()} •
                              Duration: {formatDuration(task.startedAt, task.completedAt)}
                            </material_1.Typography>

                            {/* Error */}
                            {task.status === 'error' && task.error && (<material_1.Alert severity="error" sx={{ py: 0 }}>
                                {task.error}
                              </material_1.Alert>)}
                          </material_1.Stack>}/>

                      <material_1.ListItemSecondaryAction>
                        <material_1.Stack direction="row" spacing={1} alignItems="center">
                          {getStatusIcon(task.status)}
                          <material_1.IconButton size="small" onClick={() => toggleExpand(task.id)}>
                            {expandedTasks.has(task.id) ? <icons_material_1.ExpandLess /> : <icons_material_1.ExpandMore />}
                          </material_1.IconButton>
                        </material_1.Stack>
                      </material_1.ListItemSecondaryAction>
                    </material_1.Box>

                    {/* Expanded Details */}
                    <material_1.Collapse in={expandedTasks.has(task.id)}>
                      <material_1.Box sx={{
                        mt: 2,
                        pl: 7,
                        pt: 2,
                        borderTop: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`
                    }}>
                        <material_1.Typography variant="subtitle2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary, mb: 1 }}>
                          Logs:
                        </material_1.Typography>
                        <material_1.Stack spacing={0.5}>
                          {(_c = task.logs) === null || _c === void 0 ? void 0 : _c.map((log, i) => (<material_1.Typography key={i} variant="caption" sx={{
                            color: nexusThemeV2_1.nexusColorsDark.text.secondary,
                            fontFamily: 'monospace'
                        }}>
                              • {log}
                            </material_1.Typography>))}
                        </material_1.Stack>
                      </material_1.Box>
                    </material_1.Collapse>
                  </material_1.ListItem>
                </framer_motion_1.motion.div>);
            })}
            </framer_motion_1.AnimatePresence>
          </material_1.List>
        </material_1.Card>)}
    </material_1.Stack>);
};
exports.default = TaskStream;
