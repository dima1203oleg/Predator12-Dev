// @ts-nocheck
import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

export type UploadStage =
  | 'idle'
  | 'select'
  | 'uploading'
  | 'received'
  | 'analyzing'
  | 'stored_pg'
  | 'embeddings_qdrant'
  | 'indexed_opensearch'
  | 'completed'
  | 'error';

interface DataUploadProps {
  apiBase?: string; // default http://localhost:8000
  onStageChange?: (stage: UploadStage) => void;
  onUploaded?: (datasetId: string) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({
  apiBase = 'http://localhost:8000',
  onStageChange,
  onUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [datasetId, setDatasetId] = useState<string>('');
  const [preview, setPreview] = useState<{ schema: Record<string, string>; sample_data: any[] } | null>(null);
  const [message, setMessage] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setProgress(0);
      setStage('select');
      setPreview(null);
      setMessage('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const canUpload = useMemo(() => !!file && stage !== 'uploading', [file, stage]);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setStage('uploading');
      onStageChange?.('uploading');
      setMessage('Завантаження файлу...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);

      const res = await axios.post(`${apiBase}/api/v1/dataops/datasets/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const p = Math.round((evt.loaded * 100) / evt.total);
            setProgress(p);
          }
        },
      });

      const id = res.data?.dataset_id as string;
      setDatasetId(id);
      setStage('received');
      onStageChange?.('received');
      setMessage('Файл отримано API. Аналіз структури...');

      // Симуляція етапів пайплайну з невеликими паузами
      await new Promise((r) => setTimeout(r, 400));
      setStage('analyzing');
      onStageChange?.('analyzing');

      await new Promise((r) => setTimeout(r, 400));
      setStage('stored_pg');
      onStageChange?.('stored_pg');

      await new Promise((r) => setTimeout(r, 400));
      setStage('embeddings_qdrant');
      onStageChange?.('embeddings_qdrant');

      await new Promise((r) => setTimeout(r, 400));
      setStage('indexed_opensearch');
      onStageChange?.('indexed_opensearch');

      // Завантажити превʼю
      const prev = await axios.get(`${apiBase}/api/v1/dataops/datasets/${id}/preview?limit=5`);
      setPreview({ schema: prev.data?.schema || {}, sample_data: prev.data?.sample_data || [] });

      setStage('completed');
      onStageChange?.('completed');
      setMessage('Готово! Дані завантажені та проіндексовані.');
      onUploaded?.(id);
    } catch (err: any) {
      console.error(err);
      setStage('error');
      onStageChange?.('error');
      setMessage('Помилка при завантаженні файлу. Перевірте бекенд та формат.');
    }
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    setStage('idle');
    setDatasetId('');
    setPreview(null);
    setMessage('');
  };

  return (
    <Paper elevation={4} sx={{ p: 2, mb: 3, border: '1px solid #1f2a38', background: 'rgba(10,15,26,0.9)' }}>
      <Typography variant="h6" sx={{ color: '#00ffc6', mb: 1 }}>
        📥 Завантаження даних (Excel / CSV)
      </Typography>
      <Typography variant="body2" sx={{ color: '#9fb3c8', mb: 2 }}>
        Перетягніть файл або оберіть його вручну. Підтримка: .xlsx, .xls, .csv, .json
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed #0A75FF',
          borderRadius: 2,
          textAlign: 'center',
          color: '#9fb3c8',
          background: isDragActive ? 'rgba(10,117,255,0.1)' : 'rgba(15,20,30,0.6)',
          cursor: 'pointer',
          mb: 2,
        }}
      >
        <input {...getInputProps()} />
        {file ? (
          <>
            <Typography sx={{ color: '#cfe8ff' }}>{file.name}</Typography>
            <Typography variant="caption">{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
          </>
        ) : (
          <Typography>Перетягніть файл сюди або натисніть для вибору</Typography>
        )}
      </Box>

      {stage === 'uploading' && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption">{progress}%</Typography>
        </Box>
      )}

      {message && (
        <Typography variant="body2" sx={{ color: stage === 'error' ? '#ff6699' : '#00ffc6', mb: 1 }}>
          {message}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleUpload} disabled={!canUpload}>
          Завантажити
        </Button>
        <Button variant="outlined" color="inherit" onClick={reset} disabled={stage === 'uploading'}>
          Скинути
        </Button>
        {datasetId && <Chip label={`dataset_id: ${datasetId}`} size="small" />}
      </Stack>

      {preview && (
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#cfe8ff', mb: 1 }}>
            🔎 Превʼю даних
          </Typography>
          <Table size="small" sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <TableHead>
              <TableRow>
                {Object.keys(preview.schema).map((col) => (
                  <TableCell key={col} sx={{ color: '#9fb3c8' }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.sample_data.map((row, idx) => (
                <TableRow key={idx}>
                  {Object.keys(preview.schema).map((col) => (
                    <TableCell key={col} sx={{ color: '#cfe8ff' }}>{String(row[col])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};

export default DataUpload;
