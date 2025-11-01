// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch,
  Slider,
  Menu,
  MenuItem,
  Fab
} from '@mui/material';
import {
  Group,
  Person,
  VideoCall,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Chat,
  Send,
  EmojiEmotions,
  AttachFile,
  More,
  Settings,
  Notifications,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  PictureInPicture,
  Record,
  Stop,
  PlayArrow,
  Pause,
  Close,
  Add,
  Edit,
  Delete,
  Star,
  FiberManualRecord,
  Schedule,
  LocationOn,
  Phone,
  PersonAdd
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  permissions: {
    canEdit: boolean;
    canInvite: boolean;
    canRecord: boolean;
  };
  location?: string;
  timezone: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'emoji' | 'system';
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: string;
}

interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  isRecording: boolean;
  recordingDuration: number;
  sharedScreen?: string;
  activeWhiteboard: boolean;
  participantCount: number;
}

const sampleTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Олександр К.',
    role: 'Lead Developer',
    status: 'online',
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    joinedAt: new Date(Date.now() - 3600000),
    permissions: { canEdit: true, canInvite: true, canRecord: true },
    location: 'Київ',
    timezone: 'UTC+2'
  },
  {
    id: '2',
    name: 'Марія П.',
    role: 'UX Designer',
    status: 'online',
    isVideoEnabled: true,
    isAudioEnabled: false,
    isScreenSharing: false,
    joinedAt: new Date(Date.now() - 1800000),
    permissions: { canEdit: true, canInvite: false, canRecord: false },
    location: 'Львів',
    timezone: 'UTC+2'
  },
  {
    id: '3',
    name: 'Дмитро В.',
    role: 'AI Specialist',
    status: 'busy',
    isVideoEnabled: false,
    isAudioEnabled: true,
    isScreenSharing: true,
    joinedAt: new Date(Date.now() - 900000),
    permissions: { canEdit: true, canInvite: true, canRecord: false },
    location: 'Одеса',
    timezone: 'UTC+2'
  },
  {
    id: '4',
    name: 'Анна С.',
    role: 'Product Manager',
    status: 'away',
    isVideoEnabled: false,
    isAudioEnabled: false,
    isScreenSharing: false,
    joinedAt: new Date(Date.now() - 600000),
    permissions: { canEdit: false, canInvite: true, canRecord: true },
    location: 'Харків',
    timezone: 'UTC+2'
  }
];

const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: '1',
    senderName: 'Олександр К.',
    content: 'Привіт всім! Починаємо роботу над новим модулем.',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text'
  },
  {
    id: '2',
    senderId: '2',
    senderName: 'Марія П.',
    content: 'Готова показати нові макети інтерфейсу 🎨',
    timestamp: new Date(Date.now() - 3300000),
    type: 'text',
    reactions: [{ emoji: '👍', users: ['1', '3'] }]
  },
  {
    id: '3',
    senderId: '3',
    senderName: 'Дмитро В.',
    content: 'AI модуль готовий до інтеграції. Поділюся екраном.',
    timestamp: new Date(Date.now() - 1800000),
    type: 'text'
  }
];

interface RealTimeCollaborationHubProps {
  sessionId?: string;
  onSessionJoin?: (session: CollaborationSession) => void;
  onSessionLeave?: () => void;
  onMessageSend?: (message: ChatMessage) => void;
  onMemberAction?: (memberId: string, action: string) => void;
}

export const RealTimeCollaborationHub: React.FC<RealTimeCollaborationHubProps> = ({
  sessionId,
  onSessionJoin,
  onSessionLeave,
  onMessageSend,
  onMemberAction
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(sampleTeamMembers);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [myVideo, setMyVideo] = useState({ enabled: true, audio: true });
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemberList, setShowMemberList] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState(75);

  const [session, setSession] = useState<CollaborationSession>({
    id: sessionId || 'session-1',
    name: 'Nexus Core Development Meeting',
    description: 'Робоча сесія з розробки нових модулів',
    startTime: new Date(),
    isRecording: false,
    recordingDuration: 0,
    activeWhiteboard: false,
    participantCount: teamMembers.length
  });

  const chatRef = useRef<HTMLDivElement>(null);
  const videoGridRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'Ви',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    onMessageSend?.(message);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVideo = () => {
    setMyVideo(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleAudio = () => {
    setMyVideo(prev => ({ ...prev, audio: !prev.audio }));
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(prev => !prev);
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
    setIsScreenSharing(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'busy': return '#FF9800';
      case 'away': return '#FFC107';
      case 'offline': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
          existingReaction.users.push('current-user');
        } else {
          reactions.push({ emoji, users: ['current-user'] });
        }

        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            🤝 Real-Time Collaboration Hub
          </Typography>

          <Chip
            icon={<Group />}
            label={`${teamMembers.length} Active`}
            sx={{
              bgcolor: 'rgba(76, 175, 80, 0.2)',
              color: '#4CAF50'
            }}
          />

          {isRecording && (
            <Chip
              icon={<FiberManualRecord sx={{ animation: 'pulse 1s infinite' }} />}
              label={`REC ${formatTime(recordingTime)}`}
              sx={{
                bgcolor: 'rgba(244, 67, 54, 0.2)',
                color: '#F44336'
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isVideoCall ? (
            <Button
              variant="contained"
              startIcon={<VideoCall />}
              onClick={startVideoCall}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50, #8BC34A)'
              }}
            >
              Start Video Call
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={myVideo.audio ? "Mute" : "Unmute"}>
                <IconButton
                  onClick={toggleAudio}
                  sx={{
                    color: myVideo.audio ? '#4CAF50' : '#F44336',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  {myVideo.audio ? <Mic /> : <MicOff />}
                </IconButton>
              </Tooltip>

              <Tooltip title={myVideo.enabled ? "Turn off camera" : "Turn on camera"}>
                <IconButton
                  onClick={toggleVideo}
                  sx={{
                    color: myVideo.enabled ? '#4CAF50' : '#F44336',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  {myVideo.enabled ? <Videocam /> : <VideocamOff />}
                </IconButton>
              </Tooltip>

              <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                <IconButton
                  onClick={toggleScreenShare}
                  sx={{
                    color: isScreenSharing ? '#FF9800' : 'inherit',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                </IconButton>
              </Tooltip>

              <Tooltip title={isRecording ? "Stop recording" : "Start recording"}>
                <IconButton
                  onClick={toggleRecording}
                  sx={{
                    color: isRecording ? '#F44336' : 'inherit',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  {isRecording ? <Stop /> : <Record />}
                </IconButton>
              </Tooltip>

              <Button
                variant="outlined"
                startIcon={<Phone />}
                onClick={endVideoCall}
                sx={{
                  color: '#F44336',
                  borderColor: '#F44336'
                }}
              >
                End Call
              </Button>
            </Box>
          )}

          <IconButton onClick={() => setShowSettings(true)}>
            <Settings />
          </IconButton>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Grid / Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isVideoCall ? (
            <Box
              ref={videoGridRef}
              sx={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 2,
                p: 2,
                overflow: 'auto'
              }}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: 200,
                      background: member.isVideoEnabled
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #333 0%, #666 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {!member.isVideoEnabled && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: getStatusColor(member.status),
                            mx: 'auto',
                            mb: 1
                          }}
                        >
                          <Person fontSize="large" />
                        </Avatar>
                        <Typography variant="h6">{member.name}</Typography>
                      </Box>
                    )}

                    {/* Video Controls Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        right: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {member.name}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!member.isAudioEnabled && (
                          <MicOff fontSize="small" sx={{ color: '#F44336' }} />
                        )}
                        {member.isScreenSharing && (
                          <ScreenShare fontSize="small" sx={{ color: '#FF9800' }} />
                        )}
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: getStatusColor(member.status)
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <VideoCall sx={{ fontSize: 120, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }} />
                <Typography variant="h4" textAlign="center" sx={{ mb: 2 }}>
                  Ready to collaborate?
                </Typography>
                <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
                  Start a video call to work together in real-time
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<VideoCall />}
                  onClick={startVideoCall}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    px: 4,
                    py: 1.5
                  }}
                >
                  Start Video Call
                </Button>
              </motion.div>
            </Box>
          )}
        </Box>

        {/* Side Panel */}
        <Box
          sx={{
            width: showMemberList || chatOpen ? 350 : 0,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Panel Tabs */}
          <Box
            sx={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Button
              variant={showMemberList ? 'contained' : 'text'}
              onClick={() => {
                setShowMemberList(true);
                setChatOpen(false);
              }}
              sx={{ flex: 1, borderRadius: 0 }}
            >
              <Group sx={{ mr: 1 }} />
              Team ({teamMembers.length})
            </Button>
            <Button
              variant={chatOpen ? 'contained' : 'text'}
              onClick={() => {
                setChatOpen(true);
                setShowMemberList(false);
              }}
              sx={{ flex: 1, borderRadius: 0 }}
            >
              <Chat sx={{ mr: 1 }} />
              Chat ({chatMessages.length})
            </Button>
          </Box>

          {/* Team Members List */}
          {showMemberList && (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List>
                {teamMembers.map((member) => (
                  <ListItem key={member.id}>
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(member.status),
                              border: '2px solid white'
                            }}
                          />
                        }
                      >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {member.role}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {member.location} • {member.status}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {member.isVideoEnabled && (
                              <Chip size="small" label="Video" color="primary" />
                            )}
                            {member.isAudioEnabled && (
                              <Chip size="small" label="Audio" color="success" />
                            )}
                            {member.isScreenSharing && (
                              <Chip size="small" label="Sharing" color="warning" />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Chat */}
          {chatOpen && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Messages */}
              <Box
                ref={chatRef}
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 1
                }}
              >
                {chatMessages.map((message) => (
                  <Box key={message.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" fontWeight="bold">
                        {message.senderName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>

                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: message.senderId === 'current-user'
                          ? 'primary.main'
                          : 'rgba(255,255,255,0.05)',
                        ml: message.senderId === 'current-user' ? 2 : 0,
                        mr: message.senderId === 'current-user' ? 0 : 2
                      }}
                    >
                      <Typography variant="body2">
                        {message.content}
                      </Typography>

                      {message.reactions && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          {message.reactions.map((reaction, index) => (
                            <Chip
                              key={index}
                              size="small"
                              label={`${reaction.emoji} ${reaction.users.length}`}
                              onClick={() => addReaction(message.id, reaction.emoji)}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Box>
                ))}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <IconButton size="small">
                    <EmojiEmotions />
                  </IconButton>
                  <IconButton size="small">
                    <AttachFile />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Floating Action Button */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 16,
          right: showMemberList || chatOpen ? 366 : 16,
          transition: 'right 0.3s ease'
        }}
        onClick={() => {
          if (!showMemberList && !chatOpen) {
            setChatOpen(true);
          } else {
            setShowMemberList(false);
            setChatOpen(false);
          }
        }}
      >
        {showMemberList || chatOpen ? <Close /> : <Chat />}
      </Fab>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🔧 Collaboration Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              }
              label="Enable Notifications"
              sx={{ display: 'block', mb: 2 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Volume: {volume}%
            </Typography>
            <Slider
              value={volume}
              onChange={(_, value) => setVolume(value as number)}
              min={0}
              max={100}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>Session Info</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Session ID: {session.id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Started: {session.startTime.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Participants: {session.participantCount}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

export default RealTimeCollaborationHub;
