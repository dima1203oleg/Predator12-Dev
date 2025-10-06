import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
import ContextualChat from './ContextualChat';
const GuideSystemDemo = ({ currentModule = 'dashboard', systemHealth = 'optimal', agentsData = [] }) => {
    const [chatVisible, setChatVisible] = useState(false);
    return (_jsxs(Box, { sx: { minHeight: '100vh', p: 2, background: `linear-gradient(135deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})` }, children: [_jsx(Typography, { variant: "h5", sx: { color: nexusColors.frost, mb: 2 }, children: "Guide System Demo" }), !chatVisible && (_jsx(IconButton, { onClick: () => setChatVisible(true), sx: {
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    backgroundColor: `${nexusColors.quantum}80`,
                    color: nexusColors.frost,
                    '&:hover': {
                        backgroundColor: `${nexusColors.quantum}B0`,
                        transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s ease',
                    zIndex: 1000
                }, "aria-label": "\u0412\u0456\u0434\u043A\u0440\u0438\u0442\u0438 \u0447\u0430\u0442 \u0433\u0456\u0434\u0430", children: _jsx(ChatIcon, {}) })), _jsx(ContextualChat, { visible: chatVisible, module: currentModule, systemHealth: systemHealth, agentsData: agentsData, onClose: () => setChatVisible(false), closable: true })] }));
};
export default GuideSystemDemo;
