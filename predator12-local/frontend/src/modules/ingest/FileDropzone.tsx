// @ts-nocheck
/**
 * 📁 FILE DROPZONE
 *
 * Drag & Drop зона для завантаження файлів
 * Підтримка: CSV, XLSX, PDF, Images, Videos
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  Button,
  LinearProgress,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';

// ============= TYPES =============

interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

// ============= HELPER FUNCTIONS =============

const getFileIcon = (type: string) => {
  if (type.includes('image')) return <ImageIcon />;
  if (type.includes('video')) return <VideoIcon />;
  if (type.includes('pdf')) return <PdfIcon />;
  if (type.includes('sheet') || type.includes('csv')) return <TableIcon />;
  return <FileIcon />;
};

const getFileTypeLabel = (type: string) => {
  if (type.includes('image')) return 'Image';
  if (type.includes('video')) return 'Video';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('sheet')) return 'XLSX';
  if (type.includes('csv')) return 'CSV';
  return 'File';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// ============= COMPONENT =============

const FileDropzone: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // File selection handler
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const newFiles: FileItem[] = Array.from(selectedFiles).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // File input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // Upload files
  const handleUpload = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const fileItem of pendingFiles) {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      try {
        // Simulate upload with progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        }

        // TODO: Implement real API call
        // const formData = new FormData();
        // formData.append('file', fileItem.file);
        // await fetch('/api/ingest/upload', { method: 'POST', body: formData });

        // Success
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, status: 'success', progress: 100 } : f
        ));
      } catch (error) {
        // Error
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ));
      }
    }
  }, [files]);

  // Remove file
  const handleRemove = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

  // Statistics
  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    success: files.filter(f => f.status === 'success').length,
    error: files.filter(f => f.status === 'error').length
  };

  return (
    <Stack spacing={3}>
      {/* Dropzone */}
      <motion.div
        whileHover={{ scale: isDragging ? 1 : 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          sx={{
            background: isDragging
              ? `linear-gradient(135deg, ${nexusColors.primary.main}20, ${nexusColors.secondary.main}20)`
              : nexusColors.background.paper,
            border: `2px dashed ${isDragging ? nexusColors.primary.main : nexusColors.border.medium}`,
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Stack spacing={2} alignItems="center">
            <UploadIcon sx={{
              fontSize: 64,
              color: isDragging ? nexusColors.primary.main : nexusColors.text.secondary
            }} />

            <Typography variant="h6" sx={{ color: nexusColors.text.primary }}>
              {isDragging ? 'Drop files here' : 'Drag & Drop or Click to Upload'}
            </Typography>

            <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
              Supported: CSV, XLSX, PDF, Images (PNG, JPG, GIF), Videos (MP4, AVI)
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip label="CSV" size="small" sx={{ bgcolor: nexusColors.accent.green + '20', color: nexusColors.accent.green }} />
              <Chip label="XLSX" size="small" sx={{ bgcolor: nexusColors.accent.cyan + '20', color: nexusColors.accent.cyan }} />
              <Chip label="PDF" size="small" sx={{ bgcolor: nexusColors.accent.orange + '20', color: nexusColors.accent.orange }} />
              <Chip label="Images" size="small" sx={{ bgcolor: nexusColors.accent.pink + '20', color: nexusColors.accent.pink }} />
              <Chip label="Videos" size="small" sx={{ bgcolor: nexusColors.accent.purple + '20', color: nexusColors.accent.purple }} />
            </Stack>
          </Stack>

          <input
            id="file-input"
            type="file"
            multiple
            accept=".csv,.xlsx,.pdf,image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
        </Card>
      </motion.div>

      {/* Statistics */}
      {files.length > 0 && (
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
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<UploadIcon />}
                disabled={stats.pending === 0}
                onClick={handleUpload}
                sx={{
                  background: nexusColors.gradients.primary,
                  '&:disabled': {
                    background: nexusColors.border.light
                  }
                }}
              >
                Upload ({stats.pending})
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

      {/* File List */}
      {files.length > 0 && (
        <Card sx={{
          background: nexusColors.background.paper,
          border: `1px solid ${nexusColors.border.light}`,
          maxHeight: 500,
          overflow: 'auto'
        }}>
          <List>
            {files.map((fileItem, index) => (
              <ListItem
                key={fileItem.id}
                sx={{
                  borderBottom: index < files.length - 1 ? `1px solid ${nexusColors.border.light}` : 'none'
                }}
              >
                <ListItemIcon>
                  {getFileIcon(fileItem.file.type)}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ color: nexusColors.text.primary }}>
                        {fileItem.file.name}
                      </Typography>
                      <Chip
                        label={getFileTypeLabel(fileItem.file.type)}
                        size="small"
                        sx={{ height: 20 }}
                      />
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        {formatFileSize(fileItem.file.size)}
                      </Typography>

                      {fileItem.status === 'uploading' && (
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress
                            variant="determinate"
                            value={fileItem.progress}
                            sx={{
                              '& .MuiLinearProgress-bar': {
                                background: nexusColors.gradients.primary
                              }
                            }}
                          />
                        </Box>
                      )}

                      {fileItem.status === 'error' && (
                        <Alert severity="error" sx={{ py: 0 }}>
                          {fileItem.error || 'Upload failed'}
                        </Alert>
                      )}
                    </Stack>
                  }
                />

                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {fileItem.status === 'success' && (
                      <CheckIcon sx={{ color: nexusColors.status.success }} />
                    )}
                    {fileItem.status === 'error' && (
                      <ErrorIcon sx={{ color: nexusColors.status.error }} />
                    )}
                    {fileItem.status === 'pending' && (
                      <PendingIcon sx={{ color: nexusColors.accent.yellow }} />
                    )}

                    <IconButton
                      size="small"
                      onClick={() => handleRemove(fileItem.id)}
                      disabled={fileItem.status === 'uploading'}
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

export default FileDropzone;
