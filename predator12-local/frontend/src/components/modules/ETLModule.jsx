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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const DataUpload_1 = __importDefault(require("../data/DataUpload"));
const DataPipelineFlow_1 = __importDefault(require("../data/DataPipelineFlow"));
const DataFlowMap_1 = __importDefault(require("../modules/DataFlowMap"));
const ETLModule = () => {
    const [uploadStage, setUploadStage] = (0, react_1.useState)('idle');
    const [uploadedDatasetId, setUploadedDatasetId] = (0, react_1.useState)('');
    const [showLiveFlow, setShowLiveFlow] = (0, react_1.useState)(false);
    const [pipelines] = (0, react_1.useState)([
        {
            id: 'customs-data',
            name: 'Customs Data Ingestion',
            status: 'running',
            progress: 75,
            lastRun: '2 хв тому',
            recordsProcessed: 15420
        },
        {
            id: 'osint-crawler',
            name: 'OSINT Social Crawler',
            status: 'running',
            progress: 45,
            lastRun: '5 хв тому',
            recordsProcessed: 8930
        },
        {
            id: 'telegram-parser',
            name: 'Telegram Channel Parser',
            status: 'stopped',
            progress: 0,
            lastRun: '30 хв тому',
            recordsProcessed: 0
        },
        {
            id: 'financial-sync',
            name: 'Financial Data Sync',
            status: 'error',
            progress: 23,
            lastRun: '1 год тому',
            recordsProcessed: 3450
        }
    ]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'running': return nexusTheme_1.nexusColors.success;
            case 'stopped': return nexusTheme_1.nexusColors.shadow;
            case 'error': return nexusTheme_1.nexusColors.error;
            case 'pending': return nexusTheme_1.nexusColors.warning;
            default: return nexusTheme_1.nexusColors.frost;
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'running': return '▶️';
            case 'stopped': return '⏸️';
            case 'error': return '❌';
            case 'pending': return '⏳';
            default: return '❔';
        }
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.frost,
            textAlign: 'center',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
        🏭 Фабрика Даних ETL
      </material_1.Typography>
      {/* Upload & Pipeline Flow */}
      <DataUpload_1.default apiBase={import.meta.env.VITE_API_BASE || 'http://localhost:8000'} onStageChange={setUploadStage} onUploaded={(id) => setUploadedDatasetId(id)}/>
      <DataPipelineFlow_1.default stage={uploadStage}/>
      <material_1.Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <material_1.Button variant="outlined" onClick={() => setShowLiveFlow((v) => !v)}>
          {showLiveFlow ? 'Сховати Live Flow' : 'Показати Live Flow'}
        </material_1.Button>
        {uploadedDatasetId && (<material_1.Chip label={`dataset_id: ${uploadedDatasetId}`} size="small"/>)}
      </material_1.Stack>

      {showLiveFlow && (<material_1.Box sx={{ height: 420, mb: 3, border: `1px solid ${nexusTheme_1.nexusColors.quantum}40`, borderRadius: 2, overflow: 'hidden' }}>
          <DataFlowMap_1.default nodes={[
                {
                    id: 'frontend', name: 'Frontend (Nexus Core)', type: 'frontend', position: [-6, 2, 0],
                    status: 'healthy', metrics: { latency: 20, throughput: 200, errors: 0 }, connections: ['api']
                },
                {
                    id: 'api', name: 'FastAPI', type: 'api', position: [-2, 0, 0],
                    status: uploadStage === 'uploading' || uploadStage === 'received' || uploadStage === 'analyzing' ? 'processing' : 'healthy',
                    metrics: { latency: 35, throughput: 180, errors: 1 }, connections: ['postgres', 'qdrant', 'opensearch']
                },
                {
                    id: 'postgres', name: 'PostgreSQL', type: 'database', position: [3, 2, 0],
                    status: uploadStage === 'stored_pg' || uploadStage === 'completed' ? 'processing' : 'healthy',
                    metrics: { latency: 12, throughput: 320, errors: 0 }, connections: []
                },
                {
                    id: 'qdrant', name: 'Qdrant', type: 'database', position: [4, -1, 0],
                    status: uploadStage === 'embeddings_qdrant' || uploadStage === 'completed' ? 'processing' : 'healthy',
                    metrics: { latency: 28, throughput: 140, errors: 0 }, connections: []
                },
                {
                    id: 'opensearch', name: 'OpenSearch', type: 'database', position: [6, 1, 0],
                    status: uploadStage === 'indexed_opensearch' || uploadStage === 'completed' ? 'processing' : 'healthy',
                    metrics: { latency: 42, throughput: 90, errors: 0 }, connections: []
                }
            ]} flows={[
                { id: 'f1', from: 'frontend', to: 'api', status: uploadStage !== 'idle' ? 'active' : 'idle', dataType: 'import', volume: 6, latency: 30 },
                { id: 'f2', from: 'api', to: 'postgres', status: uploadStage === 'stored_pg' || uploadStage === 'completed' ? 'active' : 'idle', dataType: 'sync', volume: 5, latency: 25 },
                { id: 'f3', from: 'api', to: 'qdrant', status: uploadStage === 'embeddings_qdrant' || uploadStage === 'completed' ? 'active' : 'idle', dataType: 'sync', volume: 4, latency: 40 },
                { id: 'f4', from: 'api', to: 'opensearch', status: uploadStage === 'indexed_opensearch' || uploadStage === 'completed' ? 'active' : 'idle', dataType: 'sync', volume: 3, latency: 55 },
            ]} onNodeClick={() => { }} onFlowClick={() => { }} enableVoiceControl={false}/>
        </material_1.Box>)}

      <material_1.Grid container spacing={3}>
        {pipelines.map((pipeline) => (<material_1.Grid item xs={12} md={6} lg={4} key={pipeline.id}>
            <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
                border: `1px solid ${getStatusColor(pipeline.status)}40`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${getStatusColor(pipeline.status)}30`
                }
            }}>
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <icons_material_1.DataObject sx={{ color: nexusTheme_1.nexusColors.sapphire, mr: 1 }}/>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, flexGrow: 1 }}>
                    {pipeline.name}
                  </material_1.Typography>
                  <material_1.Typography sx={{ fontSize: '1.2rem' }}>
                    {getStatusEmoji(pipeline.status)}
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Chip size="small" label={pipeline.status} sx={{
                backgroundColor: `${getStatusColor(pipeline.status)}20`,
                color: getStatusColor(pipeline.status),
                mb: 2
            }}/>

                {pipeline.status === 'running' && (<material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      Прогрес: {pipeline.progress}%
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={pipeline.progress} sx={{
                    bgcolor: `${nexusTheme_1.nexusColors.shadow}40`,
                    '& .MuiLinearProgress-bar': {
                        bgcolor: nexusTheme_1.nexusColors.emerald
                    }
                }}/>
                  </material_1.Box>)}

                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                  📊 Записів оброблено: {pipeline.recordsProcessed.toLocaleString()}
                </material_1.Typography>

                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow, display: 'block', mb: 2 }}>
                  🕐 Останній запуск: {pipeline.lastRun}
                </material_1.Typography>

                <material_1.Stack direction="row" spacing={1}>
                  <material_1.Button size="small" variant="contained" startIcon={pipeline.status === 'running' ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />} sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.emerald})`,
                '&:hover': {
                    background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`
                }
            }}>
                    {pipeline.status === 'running' ? 'Пауза' : 'Запуск'}
                  </material_1.Button>

                  <material_1.Button size="small" variant="outlined" startIcon={<icons_material_1.Refresh />} sx={{
                borderColor: nexusTheme_1.nexusColors.emerald,
                color: nexusTheme_1.nexusColors.emerald,
                '&:hover': {
                    borderColor: nexusTheme_1.nexusColors.sapphire,
                    color: nexusTheme_1.nexusColors.sapphire
                }
            }}>
                    Перезапуск
                  </material_1.Button>

                  <material_1.Button size="small" variant="outlined" startIcon={<icons_material_1.Settings />} sx={{
                borderColor: nexusTheme_1.nexusColors.amethyst,
                color: nexusTheme_1.nexusColors.amethyst,
                '&:hover': {
                    borderColor: nexusTheme_1.nexusColors.sapphire,
                    color: nexusTheme_1.nexusColors.sapphire
                }
            }}>
                    Налаштування
                  </material_1.Button>
                </material_1.Stack>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>))}
      </material_1.Grid>

      <material_1.Box sx={{ mt: 4, textAlign: 'center' }}>
        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
          Активні: {pipelines.filter(p => p.status === 'running').length} |
          Зупинені: {pipelines.filter(p => p.status === 'stopped').length} |
          Помилки: {pipelines.filter(p => p.status === 'error').length}
        </material_1.Typography>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = ETLModule;
