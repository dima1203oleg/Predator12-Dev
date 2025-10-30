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
exports.RealTimeCollaborationHub = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const sampleTeamMembers = [
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
const sampleMessages = [
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
const RealTimeCollaborationHub = ({ sessionId, onSessionJoin, onSessionLeave, onMessageSend, onMemberAction }) => {
    const [teamMembers, setTeamMembers] = (0, react_1.useState)(sampleTeamMembers);
    const [chatMessages, setChatMessages] = (0, react_1.useState)(sampleMessages);
    const [newMessage, setNewMessage] = (0, react_1.useState)('');
    const [isVideoCall, setIsVideoCall] = (0, react_1.useState)(false);
    const [myVideo, setMyVideo] = (0, react_1.useState)({ enabled: true, audio: true });
    const [isScreenSharing, setIsScreenSharing] = (0, react_1.useState)(false);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [showMemberList, setShowMemberList] = (0, react_1.useState)(true);
    const [chatOpen, setChatOpen] = (0, react_1.useState)(true);
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const [recordingTime, setRecordingTime] = (0, react_1.useState)(0);
    const [notifications, setNotifications] = (0, react_1.useState)(true);
    const [volume, setVolume] = (0, react_1.useState)(75);
    const [session, setSession] = (0, react_1.useState)({
        id: sessionId || 'session-1',
        name: 'Nexus Core Development Meeting',
        description: 'Робоча сесія з розробки нових модулів',
        startTime: new Date(),
        isRecording: false,
        recordingDuration: 0,
        activeWhiteboard: false,
        participantCount: teamMembers.length
    });
    const chatRef = (0, react_1.useRef)(null);
    const videoGridRef = (0, react_1.useRef)(null);
    // Auto-scroll chat
    (0, react_1.useEffect)(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chatMessages]);
    // Recording timer
    (0, react_1.useEffect)(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);
    const handleSendMessage = () => {
        if (!newMessage.trim())
            return;
        const message = {
            id: Date.now().toString(),
            senderId: 'current-user',
            senderName: 'Ви',
            content: newMessage,
            timestamp: new Date(),
            type: 'text'
        };
        setChatMessages(prev => [...prev, message]);
        setNewMessage('');
        onMessageSend === null || onMessageSend === void 0 ? void 0 : onMessageSend(message);
    };
    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };
    const toggleVideo = () => {
        setMyVideo(prev => (Object.assign(Object.assign({}, prev), { enabled: !prev.enabled })));
    };
    const toggleAudio = () => {
        setMyVideo(prev => (Object.assign(Object.assign({}, prev), { audio: !prev.audio })));
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
        }
        else {
            setIsRecording(true);
        }
    };
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#4CAF50';
            case 'busy': return '#FF9800';
            case 'away': return '#FFC107';
            case 'offline': return '#9E9E9E';
            default: return '#9E9E9E';
        }
    };
    const addReaction = (messageId, emoji) => {
        setChatMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = msg.reactions || [];
                const existingReaction = reactions.find(r => r.emoji === emoji);
                if (existingReaction) {
                    existingReaction.users.push('current-user');
                }
                else {
                    reactions.push({ emoji, users: ['current-user'] });
                }
                return Object.assign(Object.assign({}, msg), { reactions });
            }
            return msg;
        }));
    };
    return (<material_1.Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <material_1.Paper elevation={0} sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.Typography variant="h5" sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
        }}>
            🤝 Real-Time Collaboration Hub
          </material_1.Typography>

          <material_1.Chip icon={<icons_material_1.Group />} label={`${teamMembers.length} Active`} sx={{
            bgcolor: 'rgba(76, 175, 80, 0.2)',
            color: '#4CAF50'
        }}/>

          {isRecording && (<material_1.Chip icon={<icons_material_1.FiberManualRecord sx={{ animation: 'pulse 1s infinite' }}/>} label={`REC ${formatTime(recordingTime)}`} sx={{
                bgcolor: 'rgba(244, 67, 54, 0.2)',
                color: '#F44336'
            }}/>)}
        </material_1.Box>

        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          {!isVideoCall ? (<material_1.Button variant="contained" startIcon={<icons_material_1.VideoCall />} onClick={startVideoCall} sx={{
                background: 'linear-gradient(45deg, #4CAF50, #8BC34A)'
            }}>
              Start Video Call
            </material_1.Button>) : (<material_1.Box sx={{ display: 'flex', gap: 1 }}>
              <material_1.Tooltip title={myVideo.audio ? "Mute" : "Unmute"}>
                <material_1.IconButton onClick={toggleAudio} sx={{
                color: myVideo.audio ? '#4CAF50' : '#F44336',
                bgcolor: 'rgba(255,255,255,0.1)'
            }}>
                  {myVideo.audio ? <icons_material_1.Mic /> : <icons_material_1.MicOff />}
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title={myVideo.enabled ? "Turn off camera" : "Turn on camera"}>
                <material_1.IconButton onClick={toggleVideo} sx={{
                color: myVideo.enabled ? '#4CAF50' : '#F44336',
                bgcolor: 'rgba(255,255,255,0.1)'
            }}>
                  {myVideo.enabled ? <icons_material_1.Videocam /> : <icons_material_1.VideocamOff />}
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                <material_1.IconButton onClick={toggleScreenShare} sx={{
                color: isScreenSharing ? '#FF9800' : 'inherit',
                bgcolor: 'rgba(255,255,255,0.1)'
            }}>
                  {isScreenSharing ? <icons_material_1.StopScreenShare /> : <icons_material_1.ScreenShare />}
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title={isRecording ? "Stop recording" : "Start recording"}>
                <material_1.IconButton onClick={toggleRecording} sx={{
                color: isRecording ? '#F44336' : 'inherit',
                bgcolor: 'rgba(255,255,255,0.1)'
            }}>
                  {isRecording ? <icons_material_1.Stop /> : <icons_material_1.Record />}
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Button variant="outlined" startIcon={<icons_material_1.Phone />} onClick={endVideoCall} sx={{
                color: '#F44336',
                borderColor: '#F44336'
            }}>
                End Call
              </material_1.Button>
            </material_1.Box>)}

          <material_1.IconButton onClick={() => setShowSettings(true)}>
            <icons_material_1.Settings />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.Paper>

      {/* Main Content */}
      <material_1.Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Grid / Main Content */}
        <material_1.Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isVideoCall ? (<material_1.Box ref={videoGridRef} sx={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 2,
                p: 2,
                overflow: 'auto'
            }}>
              {teamMembers.map((member, index) => (<framer_motion_1.motion.div key={member.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                  <material_1.Card sx={{
                    height: 200,
                    background: member.isVideoEnabled
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #333 0%, #666 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {!member.isVideoEnabled && (<material_1.Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <material_1.Avatar sx={{
                        width: 60,
                        height: 60,
                        bgcolor: getStatusColor(member.status),
                        mx: 'auto',
                        mb: 1
                    }}>
                          <icons_material_1.Person fontSize="large"/>
                        </material_1.Avatar>
                        <material_1.Typography variant="h6">{member.name}</material_1.Typography>
                      </material_1.Box>)}

                    {/* Video Controls Overlay */}
                    <material_1.Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                      <material_1.Typography variant="subtitle2" fontWeight="bold">
                        {member.name}
                      </material_1.Typography>

                      <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                        {!member.isAudioEnabled && (<icons_material_1.MicOff fontSize="small" sx={{ color: '#F44336' }}/>)}
                        {member.isScreenSharing && (<icons_material_1.ScreenShare fontSize="small" sx={{ color: '#FF9800' }}/>)}
                        <material_1.Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getStatusColor(member.status)
                }}/>
                      </material_1.Box>
                    </material_1.Box>
                  </material_1.Card>
                </framer_motion_1.motion.div>))}
            </material_1.Box>) : (<material_1.Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%)'
            }}>
              <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <icons_material_1.VideoCall sx={{ fontSize: 120, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }}/>
                <material_1.Typography variant="h4" textAlign="center" sx={{ mb: 2 }}>
                  Ready to collaborate?
                </material_1.Typography>
                <material_1.Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
                  Start a video call to work together in real-time
                </material_1.Typography>
                <material_1.Button variant="contained" size="large" startIcon={<icons_material_1.VideoCall />} onClick={startVideoCall} sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5
            }}>
                  Start Video Call
                </material_1.Button>
              </framer_motion_1.motion.div>
            </material_1.Box>)}
        </material_1.Box>

        {/* Side Panel */}
        <material_1.Box sx={{
            width: showMemberList || chatOpen ? 350 : 0,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Panel Tabs */}
          <material_1.Box sx={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
            <material_1.Button variant={showMemberList ? 'contained' : 'text'} onClick={() => {
            setShowMemberList(true);
            setChatOpen(false);
        }} sx={{ flex: 1, borderRadius: 0 }}>
              <icons_material_1.Group sx={{ mr: 1 }}/>
              Team ({teamMembers.length})
            </material_1.Button>
            <material_1.Button variant={chatOpen ? 'contained' : 'text'} onClick={() => {
            setChatOpen(true);
            setShowMemberList(false);
        }} sx={{ flex: 1, borderRadius: 0 }}>
              <icons_material_1.Chat sx={{ mr: 1 }}/>
              Chat ({chatMessages.length})
            </material_1.Button>
          </material_1.Box>

          {/* Team Members List */}
          {showMemberList && (<material_1.Box sx={{ flex: 1, overflow: 'auto' }}>
              <material_1.List>
                {teamMembers.map((member) => (<material_1.ListItem key={member.id}>
                    <material_1.ListItemAvatar>
                      <material_1.Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={<material_1.Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(member.status),
                        border: '2px solid white'
                    }}/>}>
                        <material_1.Avatar sx={{ bgcolor: 'primary.main' }}>
                          <icons_material_1.Person />
                        </material_1.Avatar>
                      </material_1.Badge>
                    </material_1.ListItemAvatar>
                    <material_1.ListItemText primary={member.name} secondary={<material_1.Box>
                          <material_1.Typography variant="caption" display="block">
                            {member.role}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" display="block" color="text.secondary">
                            {member.location} • {member.status}
                          </material_1.Typography>
                          <material_1.Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {member.isVideoEnabled && (<material_1.Chip size="small" label="Video" color="primary"/>)}
                            {member.isAudioEnabled && (<material_1.Chip size="small" label="Audio" color="success"/>)}
                            {member.isScreenSharing && (<material_1.Chip size="small" label="Sharing" color="warning"/>)}
                          </material_1.Box>
                        </material_1.Box>}/>
                  </material_1.ListItem>))}
              </material_1.List>
            </material_1.Box>)}

          {/* Chat */}
          {chatOpen && (<material_1.Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Messages */}
              <material_1.Box ref={chatRef} sx={{
                flex: 1,
                overflow: 'auto',
                p: 1
            }}>
                {chatMessages.map((message) => (<material_1.Box key={message.id} sx={{ mb: 2 }}>
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <material_1.Typography variant="caption" fontWeight="bold">
                        {message.senderName}
                      </material_1.Typography>
                      <material_1.Typography variant="caption" color="text.secondary">
                        {message.timestamp.toLocaleTimeString()}
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Paper sx={{
                    p: 1.5,
                    bgcolor: message.senderId === 'current-user'
                        ? 'primary.main'
                        : 'rgba(255,255,255,0.05)',
                    ml: message.senderId === 'current-user' ? 2 : 0,
                    mr: message.senderId === 'current-user' ? 0 : 2
                }}>
                      <material_1.Typography variant="body2">
                        {message.content}
                      </material_1.Typography>

                      {message.reactions && (<material_1.Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          {message.reactions.map((reaction, index) => (<material_1.Chip key={index} size="small" label={`${reaction.emoji} ${reaction.users.length}`} onClick={() => addReaction(message.id, reaction.emoji)} sx={{ height: 20, fontSize: '0.7rem' }}/>))}
                        </material_1.Box>)}
                    </material_1.Paper>
                  </material_1.Box>))}
              </material_1.Box>

              {/* Message Input */}
              <material_1.Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <material_1.Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <material_1.TextField fullWidth multiline maxRows={3} placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} variant="outlined" size="small"/>
                  <material_1.IconButton onClick={handleSendMessage} disabled={!newMessage.trim()} sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
            }}>
                    <icons_material_1.Send />
                  </material_1.IconButton>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <material_1.IconButton size="small">
                    <icons_material_1.EmojiEmotions />
                  </material_1.IconButton>
                  <material_1.IconButton size="small">
                    <icons_material_1.AttachFile />
                  </material_1.IconButton>
                </material_1.Box>
              </material_1.Box>
            </material_1.Box>)}
        </material_1.Box>
      </material_1.Box>

      {/* Floating Action Button */}
      <material_1.Fab sx={{
            position: 'fixed',
            bottom: 16,
            right: showMemberList || chatOpen ? 366 : 16,
            transition: 'right 0.3s ease'
        }} onClick={() => {
            if (!showMemberList && !chatOpen) {
                setChatOpen(true);
            }
            else {
                setShowMemberList(false);
                setChatOpen(false);
            }
        }}>
        {showMemberList || chatOpen ? <icons_material_1.Close /> : <icons_material_1.Chat />}
      </material_1.Fab>

      {/* Settings Dialog */}
      <material_1.Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>🔧 Collaboration Settings</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ py: 2 }}>
            <material_1.FormControlLabel control={<material_1.Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)}/>} label="Enable Notifications" sx={{ display: 'block', mb: 2 }}/>

            <material_1.Typography variant="subtitle2" sx={{ mb: 1 }}>
              Volume: {volume}%
            </material_1.Typography>
            <material_1.Slider value={volume} onChange={(_, value) => setVolume(value)} min={0} max={100} sx={{ mb: 2 }}/>

            <material_1.Divider sx={{ my: 2 }}/>

            <material_1.Typography variant="h6" sx={{ mb: 2 }}>Session Info</material_1.Typography>
            <material_1.Typography variant="body2" sx={{ mb: 1 }}>
              Session ID: {session.id}
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{ mb: 1 }}>
              Started: {session.startTime.toLocaleString()}
            </material_1.Typography>
            <material_1.Typography variant="body2">
              Participants: {session.participantCount}
            </material_1.Typography>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowSettings(false)}>Close</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </material_1.Box>);
};
exports.RealTimeCollaborationHub = RealTimeCollaborationHub;
exports.default = exports.RealTimeCollaborationHub;
