// @ts-nocheck
/**
 * 📥 INGEST HUB PAGE
 *
 * Єдиний центр завантажень: файли, посилання, Telegram, статуси
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  Tabs,
  Tab,
  Typography,
  Stack,
  Chip,
  Badge
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  Telegram as TelegramIcon,
  Assessment as StatusIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';

// Import tabs
import FileDropzone from './FileDropzone';
import LinkCollector from './LinkCollector';
import TelegramConnector from './TelegramConnector';
import TaskStream from './TaskStream';
import FlowCanvas from './FlowCanvas';

// ============= TYPES =============

type TabValue = 'files' | 'links' | 'telegram' | 'status';

// ============= COMPONENT =============

const IngestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('files');
  const [activeTasks, setActiveTasks] = useState<number>(3); // Mock

  const tabs = [
    {
      value: 'files',
      label: 'Files',
      icon: <UploadIcon />,
      description: 'CSV, XLSX, PDF, Image, Video'
    },
    {
      value: 'links',
      label: 'Links',
      icon: <LinkIcon />,
      description: 'URL, RSS, Sitemap'
    },
    {
      value: 'telegram',
      label: 'Telegram',
      icon: <TelegramIcon />,
      description: '@channel, invite link'
    },
    {
      value: 'status',
      label: 'Status',
      icon: <StatusIcon />,
      description: 'Черга, прогрес, логи',
      badge: activeTasks
    },
  ];

  return (
    <Box sx={{
      p: 3,
      minHeight: '100vh',
      background: nexusColors.background.default
    }}>
      {/* Header */}
      <Stack spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{
            fontFamily: 'Orbitron',
            background: nexusColors.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            📥 Ingest Hub
          </Typography>
          <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
            Єдиний центр завантаження даних з різних джерел
          </Typography>
        </Box>

        {/* Flow Canvas - Mini Data Flow Visualization */}
        <FlowCanvas />
      </Stack>

      {/* Tabs Navigation */}
      <Card sx={{
        background: nexusColors.background.paper,
        border: `1px solid ${nexusColors.border.light}`,
        mb: 3
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              color: nexusColors.text.secondary,
              minHeight: 80,
              '&.Mui-selected': {
                color: nexusColors.primary.main
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: nexusColors.primary.main,
              height: 3
            }
          }}
        >
          {tabs.map(tab => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Stack spacing={0.5} alignItems="center">
                  <Badge
                    badgeContent={tab.badge}
                    color="error"
                    invisible={!tab.badge}
                  >
                    {tab.icon}
                  </Badge>
                  <Typography variant="body2" fontWeight={600}>
                    {tab.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                    {tab.description}
                  </Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Card>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'files' && <FileDropzone />}
        {activeTab === 'links' && <LinkCollector />}
        {activeTab === 'telegram' && <TelegramConnector />}
        {activeTab === 'status' && <TaskStream onTaskCountChange={setActiveTasks} />}
      </motion.div>
    </Box>
  );
};

export default IngestPage;
