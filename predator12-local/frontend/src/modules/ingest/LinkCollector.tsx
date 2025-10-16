// @ts-nocheck
/**
 * 🔗 LINK COLLECTOR
 *
 * Збір даних з URL, RSS, Sitemap
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
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  RssFeed as RssIcon,
  Map as SitemapIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';

// ============= TYPES =============

interface LinkItem {
  id: string;
  url: string;
  type: 'url' | 'rss' | 'sitemap';
  status: 'pending' | 'processing' | 'success' | 'error';
  depth?: number;
  extractImages?: boolean;
  extractLinks?: boolean;
  error?: string;
  itemsFound?: number;
}

// ============= HELPER FUNCTIONS =============

const getLinkTypeIcon = (type: string) => {
  switch (type) {
    case 'rss': return <RssIcon />;
    case 'sitemap': return <SitemapIcon />;
    default: return <LinkIcon />;
  }
};

const detectLinkType = (url: string): 'url' | 'rss' | 'sitemap' => {
  const lower = url.toLowerCase();
  if (lower.includes('rss') || lower.includes('feed')) return 'rss';
  if (lower.includes('sitemap')) return 'sitemap';
  return 'url';
};

// ============= COMPONENT =============

const LinkCollector: React.FC = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [linkType, setLinkType] = useState<'url' | 'rss' | 'sitemap'>('url');
  const [crawlDepth, setCrawlDepth] = useState(1);
  const [extractImages, setExtractImages] = useState(true);
  const [extractLinks, setExtractLinks] = useState(false);

  // Add link
  const handleAddLink = useCallback(() => {
    if (!inputUrl.trim()) return;

    const newLink: LinkItem = {
      id: `${Date.now()}-${Math.random()}`,
      url: inputUrl.trim(),
      type: linkType,
      status: 'pending',
      depth: crawlDepth,
      extractImages,
      extractLinks
    };

    setLinks(prev => [...prev, newLink]);
    setInputUrl('');
  }, [inputUrl, linkType, crawlDepth, extractImages, extractLinks]);

  // Auto-detect link type
  const handleUrlChange = useCallback((url: string) => {
    setInputUrl(url);
    setLinkType(detectLinkType(url));
  }, []);

  // Process links
  const handleProcessLinks = useCallback(async () => {
    const pendingLinks = links.filter(l => l.status === 'pending');

    for (const linkItem of pendingLinks) {
      // Update status to processing
      setLinks(prev => prev.map(l =>
        l.id === linkItem.id ? { ...l, status: 'processing' } : l
      ));

      try {
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // TODO: Implement real API call
        // const response = await fetch('/api/ingest/crawl', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     url: linkItem.url,
        //     type: linkItem.type,
        //     depth: linkItem.depth,
        //     extractImages: linkItem.extractImages,
        //     extractLinks: linkItem.extractLinks
        //   })
        // });
        // const data = await response.json();

        // Success
        setLinks(prev => prev.map(l =>
          l.id === linkItem.id
            ? { ...l, status: 'success', itemsFound: Math.floor(Math.random() * 100) + 1 }
            : l
        ));
      } catch (error) {
        // Error
        setLinks(prev => prev.map(l =>
          l.id === linkItem.id
            ? { ...l, status: 'error', error: error instanceof Error ? error.message : 'Processing failed' }
            : l
        ));
      }
    }
  }, [links]);

  // Remove link
  const handleRemove = useCallback((id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    setLinks([]);
  }, []);

  // Statistics
  const stats = {
    total: links.length,
    pending: links.filter(l => l.status === 'pending').length,
    processing: links.filter(l => l.status === 'processing').length,
    success: links.filter(l => l.status === 'success').length,
    error: links.filter(l => l.status === 'error').length,
    totalItems: links.reduce((sum, l) => sum + (l.itemsFound || 0), 0)
  };

  return (
    <Stack spacing={3}>
      {/* Input Form */}
      <Card sx={{
        background: nexusColors.background.paper,
        border: `1px solid ${nexusColors.border.light}`,
        p: 3
      }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ color: nexusColors.text.primary }}>
            Add Link Source
          </Typography>

          {/* URL Input */}
          <TextField
            fullWidth
            label="URL"
            value={inputUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com or https://example.com/feed.xml"
            onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: nexusColors.text.primary,
                '& fieldset': { borderColor: nexusColors.border.medium }
              }
            }}
          />

          {/* Options */}
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: nexusColors.text.secondary }}>Type</InputLabel>
              <Select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as any)}
                label="Type"
                sx={{
                  color: nexusColors.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.border.medium }
                }}
              >
                <MenuItem value="url">URL (Web Page)</MenuItem>
                <MenuItem value="rss">RSS Feed</MenuItem>
                <MenuItem value="sitemap">Sitemap</MenuItem>
              </Select>
            </FormControl>

            {linkType === 'url' && (
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: nexusColors.text.secondary }}>Crawl Depth</InputLabel>
                <Select
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(e.target.value as number)}
                  label="Crawl Depth"
                  sx={{
                    color: nexusColors.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.border.medium }
                  }}
                >
                  <MenuItem value={1}>Level 1 (Current page)</MenuItem>
                  <MenuItem value={2}>Level 2 (+ Links)</MenuItem>
                  <MenuItem value={3}>Level 3 (Deep crawl)</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={extractImages}
                  onChange={(e) => setExtractImages(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: nexusColors.primary.main
                    }
                  }}
                />
              }
              label="Extract Images"
              sx={{ color: nexusColors.text.secondary }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={extractLinks}
                  onChange={(e) => setExtractLinks(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: nexusColors.primary.main
                    }
                  }}
                />
              }
              label="Extract Links"
              sx={{ color: nexusColors.text.secondary }}
            />
          </Stack>

          {/* Add Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddLink}
            disabled={!inputUrl.trim()}
            sx={{
              background: nexusColors.gradients.primary,
              alignSelf: 'flex-start',
              '&:disabled': {
                background: nexusColors.border.light
              }
            }}
          >
            Add to Queue
          </Button>
        </Stack>
      </Card>

      {/* Statistics */}
      {links.length > 0 && (
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
                label={`Success: ${stats.success}`}
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
              {stats.totalItems > 0 && (
                <Chip
                  label={`Items Found: ${stats.totalItems}`}
                  size="small"
                  sx={{ bgcolor: nexusColors.accent.cyan + '20', color: nexusColors.accent.cyan }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<StartIcon />}
                disabled={stats.pending === 0}
                onClick={handleProcessLinks}
                sx={{
                  background: nexusColors.gradients.primary,
                  '&:disabled': {
                    background: nexusColors.border.light
                  }
                }}
              >
                Process ({stats.pending})
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearAll}
                sx={{
                  borderColor: nexusColors.border.medium,
                  color: nexusColors.text.secondary
                }}
              >
                Clear All
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Link List */}
      {links.length > 0 && (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          maxHeight: 500,
          overflow: 'auto'
        }}>
          <List>
            {links.map((linkItem, index) => (
              <ListItem
                key={linkItem.id}
                sx={{
                  borderBottom: index < links.length - 1 ? `1px solid ${nexusColors.border.light}` : 'none'
                }}
              >
                <ListItemIcon>
                  {getLinkTypeIcon(linkItem.type)}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          color: nexusColors.text.primary,
                          maxWidth: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {linkItem.url}
                      </Typography>
                      <Chip
                        label={linkItem.type.toUpperCase()}
                        size="small"
                        sx={{ height: 20 }}
                      />
                      {linkItem.depth && linkItem.depth > 1 && (
                        <Chip
                          label={`Depth: ${linkItem.depth}`}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      {linkItem.status === 'processing' && (
                        <Typography variant="caption" sx={{ color: nexusColors.accent.cyan }}>
                          Processing...
                        </Typography>
                      )}

                      {linkItem.status === 'success' && linkItem.itemsFound !== undefined && (
                        <Typography variant="caption" sx={{ color: nexusColors.status.success }}>
                          Found {linkItem.itemsFound} items
                        </Typography>
                      )}

                      {linkItem.status === 'error' && (
                        <Alert severity="error" sx={{ py: 0 }}>
                          {linkItem.error || 'Processing failed'}
                        </Alert>
                      )}
                    </Stack>
                  }
                />

                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {linkItem.status === 'success' && (
                      <CheckIcon sx={{ color: nexusColors.status.success }} />
                    )}
                    {linkItem.status === 'error' && (
                      <ErrorIcon sx={{ color: nexusColors.status.error }} />
                    )}
                    {linkItem.status === 'pending' && (
                      <PendingIcon sx={{ color: nexusColors.accent.yellow }} />
                    )}

                    <IconButton
                      size="small"
                      onClick={() => handleRemove(linkItem.id)}
                      disabled={linkItem.status === 'processing'}
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

export default LinkCollector;
