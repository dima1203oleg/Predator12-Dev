// @ts-nocheck
import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  PlayArrow as ActionIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppEventStore } from '../../stores/appEventStore';
import { nexusColors } from '../../theme/nexusTheme';

const NotificationHub: React.FC = () => {
  const { events, unreadCount, markAsRead } = useAppEventStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getEventIcon = (level: string) => {
    switch (level) {
      case 'error': return <ErrorIcon sx={{ color: nexusColors.error }} />;
      case 'warn': return <WarningIcon sx={{ color: nexusColors.warning }} />;
      case 'success': return <SuccessIcon sx={{ color: nexusColors.success }} />;
      case 'action-required': return <ActionIcon sx={{ color: nexusColors.sapphire }} />;
      default: return <InfoIcon sx={{ color: nexusColors.frost }} />;
    }
  };

  const getEventColor = (level: string) => {
    switch (level) {
      case 'error': return nexusColors.error;
      case 'warn': return nexusColors.warning;
      case 'success': return nexusColors.success;
      case 'action-required': return nexusColors.sapphire;
      default: return nexusColors.frost;
    }
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return `${diff}с тому`;
    if (diff < 3600) return `${Math.floor(diff / 60)}хв тому`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}год тому`;
    return timestamp.toLocaleDateString('uk-UA');
  };

  const handleEventClick = (eventId: string) => {
    markAsRead(eventId);
  };

  return (
    <>
      <Tooltip title="Центр сповіщень" placement="left">
        <IconButton
          onClick={handleClick}
          sx={{
            color: nexusColors.frost,
            '&:hover': {
              backgroundColor: `${nexusColors.quantum}40`,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.3s ease',
            minWidth: 44,
            minHeight: 44 // WCAG compliance
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusColors.quantum}`,
            borderRadius: 2,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
              Сповіщення
            </Typography>
            <Chip
              label={`${unreadCount} нових`}
              size="small"
              sx={{
                backgroundColor: unreadCount > 0 ? `${nexusColors.error}20` : `${nexusColors.success}20`,
                color: unreadCount > 0 ? nexusColors.error : nexusColors.success
              }}
            />
          </Box>
          
          <Divider sx={{ borderColor: nexusColors.quantum, mb: 2 }} />

          {events.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: nexusColors.shadow }}>
                Немає сповіщень
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 350, overflow: 'auto', p: 0 }}>
              <AnimatePresence>
                {events.slice(0, 10).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem
                      sx={{
                        border: `1px solid ${!event.isRead ? getEventColor(event.level) + '40' : 'transparent'}`,
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: !event.isRead ? `${getEventColor(event.level)}10` : 'transparent',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: `${nexusColors.quantum}20`
                        }
                      }}
                      onClick={() => handleEventClick(event.id)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getEventIcon(event.level)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: nexusColors.frost,
                              fontWeight: !event.isRead ? 'bold' : 'normal'
                            }}
                          >
                            {event.message}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                            {formatTimeAgo(event.timestamp)}
                          </Typography>
                        }
                      />
                    </ListItem>

                    {/* Action buttons */}
                    {event.actions && event.actions.length > 0 && (
                      <Box sx={{ ml: 5, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {event.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="small"
                            variant={action.type === 'primary' ? 'contained' : 'outlined'}
                            color={action.type === 'danger' ? 'error' : 'primary'}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.action();
                              handleEventClick(event.id);
                            }}
                            sx={{
                              minHeight: 32,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              borderRadius: 1
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationHub;
