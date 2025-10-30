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
const framer_motion_1 = require("framer-motion");
const appEventStore_1 = require("../../stores/appEventStore");
const nexusTheme_1 = require("../../theme/nexusTheme");
const NotificationHub = () => {
    const { events, unreadCount, markAsRead } = (0, appEventStore_1.useAppEventStore)();
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const getEventIcon = (level) => {
        switch (level) {
            case 'error': return <icons_material_1.Error sx={{ color: nexusTheme_1.nexusColors.error }}/>;
            case 'warn': return <icons_material_1.Warning sx={{ color: nexusTheme_1.nexusColors.warning }}/>;
            case 'success': return <icons_material_1.CheckCircle sx={{ color: nexusTheme_1.nexusColors.success }}/>;
            case 'action-required': return <icons_material_1.PlayArrow sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>;
            default: return <icons_material_1.Info sx={{ color: nexusTheme_1.nexusColors.frost }}/>;
        }
    };
    const getEventColor = (level) => {
        switch (level) {
            case 'error': return nexusTheme_1.nexusColors.error;
            case 'warn': return nexusTheme_1.nexusColors.warning;
            case 'success': return nexusTheme_1.nexusColors.success;
            case 'action-required': return nexusTheme_1.nexusColors.sapphire;
            default: return nexusTheme_1.nexusColors.frost;
        }
    };
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
        if (diff < 60)
            return `${diff}с тому`;
        if (diff < 3600)
            return `${Math.floor(diff / 60)}хв тому`;
        if (diff < 86400)
            return `${Math.floor(diff / 3600)}год тому`;
        return timestamp.toLocaleDateString('uk-UA');
    };
    const handleEventClick = (eventId) => {
        markAsRead(eventId);
    };
    return (<>
      <material_1.Tooltip title="Центр сповіщень" placement="left">
        <material_1.IconButton onClick={handleClick} sx={{
            color: nexusTheme_1.nexusColors.frost,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}40`,
                transform: 'scale(1.05)'
            },
            transition: 'all 0.3s ease',
            minWidth: 44,
            minHeight: 44 // WCAG compliance
        }}>
          <material_1.Badge badgeContent={unreadCount} color="error" max={99}>
            <icons_material_1.Notifications />
          </material_1.Badge>
        </material_1.IconButton>
      </material_1.Tooltip>

      <material_1.Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }} transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }} PaperProps={{
            sx: {
                width: 380,
                maxHeight: 500,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }
        }}>
        <material_1.Box sx={{ p: 2 }}>
          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
              Сповіщення
            </material_1.Typography>
            <material_1.Chip label={`${unreadCount} нових`} size="small" sx={{
            backgroundColor: unreadCount > 0 ? `${nexusTheme_1.nexusColors.error}20` : `${nexusTheme_1.nexusColors.success}20`,
            color: unreadCount > 0 ? nexusTheme_1.nexusColors.error : nexusTheme_1.nexusColors.success
        }}/>
          </material_1.Box>

          <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

          {events.length === 0 ? (<material_1.Box sx={{ textAlign: 'center', py: 4 }}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                Немає сповіщень
              </material_1.Typography>
            </material_1.Box>) : (<material_1.List sx={{ maxHeight: 350, overflow: 'auto', p: 0 }}>
              <framer_motion_1.AnimatePresence>
                {events.slice(0, 10).map((event) => (<framer_motion_1.motion.div key={event.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <material_1.ListItem sx={{
                    border: `1px solid ${!event.isRead ? getEventColor(event.level) + '40' : 'transparent'}`,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: !event.isRead ? `${getEventColor(event.level)}10` : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`
                    }
                }} onClick={() => handleEventClick(event.id)}>
                      <material_1.ListItemIcon sx={{ minWidth: 36 }}>
                        {getEventIcon(event.level)}
                      </material_1.ListItemIcon>

                      <material_1.ListItemText primary={<material_1.Typography variant="body2" sx={{
                        color: nexusTheme_1.nexusColors.frost,
                        fontWeight: !event.isRead ? 'bold' : 'normal'
                    }}>
                            {event.message}
                          </material_1.Typography>} secondary={<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                            {formatTimeAgo(event.timestamp)}
                          </material_1.Typography>}/>
                    </material_1.ListItem>

                    {/* Action buttons */}
                    {event.actions && event.actions.length > 0 && (<material_1.Box sx={{ ml: 5, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {event.actions.map((action, index) => (<material_1.Button key={index} size="small" variant={action.type === 'primary' ? 'contained' : 'outlined'} color={action.type === 'danger' ? 'error' : 'primary'} onClick={(e) => {
                            e.stopPropagation();
                            action.action();
                            handleEventClick(event.id);
                        }} sx={{
                            minHeight: 32,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            borderRadius: 1
                        }}>
                            {action.label}
                          </material_1.Button>))}
                      </material_1.Box>)}
                  </framer_motion_1.motion.div>))}
              </framer_motion_1.AnimatePresence>
            </material_1.List>)}
        </material_1.Box>
      </material_1.Popover>
    </>);
};
exports.default = NotificationHub;
