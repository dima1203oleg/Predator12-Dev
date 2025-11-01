// @ts-nocheck
import React, { useMemo } from 'react';
import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';
import type { UploadStage } from './DataUpload';

interface DataPipelineFlowProps {
  stage: UploadStage;
}

const steps = [
  { key: 'select', label: 'Вибір файлу' },
  { key: 'uploading', label: 'Завантаження → API' },
  { key: 'received', label: 'Файл отримано' },
  { key: 'analyzing', label: 'Аналіз структури' },
  { key: 'stored_pg', label: 'Запис у PostgreSQL' },
  { key: 'embeddings_qdrant', label: 'Вектори у Qdrant' },
  { key: 'indexed_opensearch', label: 'Індекс в OpenSearch' },
  { key: 'completed', label: 'Готово' },
] as const;

const stageIndexMap: Record<UploadStage, number> = {
  idle: 0,
  select: 0,
  uploading: 1,
  received: 2,
  analyzing: 3,
  stored_pg: 4,
  embeddings_qdrant: 5,
  indexed_opensearch: 6,
  completed: 7,
  error: 1,
};

const DataPipelineFlow: React.FC<DataPipelineFlowProps> = ({ stage }) => {
  const activeStep = useMemo(() => stageIndexMap[stage] ?? 0, [stage]);

  return (
    <Box sx={{ p: 2, mb: 2, border: '1px solid #1f2a38', borderRadius: 2, background: 'rgba(15,20,30,0.6)' }}>
      <Typography variant="subtitle1" sx={{ color: '#cfe8ff', mb: 1 }}>
        🔄 Етапи обробки даних
      </Typography>
      <Stepper alternativeLabel activeStep={activeStep} sx={{
        '& .MuiStepIcon-root': { color: '#1f2a38' },
        '& .MuiStepIcon-root.Mui-active': { color: '#00ffc6' },
        '& .MuiStepIcon-root.Mui-completed': { color: '#0A75FF' },
        '& .MuiStepLabel-label': { color: '#9fb3c8' },
      }}>
        {steps.map((s) => (
          <Step key={s.key}>
            <StepLabel>{s.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Typography variant="caption" sx={{ color: stage === 'error' ? '#ff6699' : '#9fb3c8', mt: 1, display: 'block' }}>
        Поточний етап: {steps[activeStep]?.label}
      </Typography>
    </Box>
  );
};

export default DataPipelineFlow;
