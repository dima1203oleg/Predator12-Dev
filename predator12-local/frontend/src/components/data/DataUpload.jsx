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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const react_dropzone_1 = require("react-dropzone");
const axios_1 = __importDefault(require("axios"));
const material_1 = require("@mui/material");
const DataUpload = ({ apiBase = 'http://localhost:8000', onStageChange, onUploaded, }) => {
    const [file, setFile] = (0, react_1.useState)(null);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [stage, setStage] = (0, react_1.useState)('idle');
    const [datasetId, setDatasetId] = (0, react_1.useState)('');
    const [preview, setPreview] = (0, react_1.useState)(null);
    const [message, setMessage] = (0, react_1.useState)('');
    const onDrop = (0, react_1.useCallback)((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setProgress(0);
            setStage('select');
            setPreview(null);
            setMessage('');
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({ onDrop, multiple: false });
    const canUpload = (0, react_1.useMemo)(() => !!file && stage !== 'uploading', [file, stage]);
    const handleUpload = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!file)
            return;
        try {
            setStage('uploading');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('uploading');
            setMessage('Завантаження файлу...');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            const res = yield axios_1.default.post(`${apiBase}/api/v1/dataops/datasets/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (evt) => {
                    if (evt.total) {
                        const p = Math.round((evt.loaded * 100) / evt.total);
                        setProgress(p);
                    }
                },
            });
            const id = (_a = res.data) === null || _a === void 0 ? void 0 : _a.dataset_id;
            setDatasetId(id);
            setStage('received');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('received');
            setMessage('Файл отримано API. Аналіз структури...');
            // Симуляція етапів пайплайну з невеликими паузами
            yield new Promise((r) => setTimeout(r, 400));
            setStage('analyzing');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('analyzing');
            yield new Promise((r) => setTimeout(r, 400));
            setStage('stored_pg');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('stored_pg');
            yield new Promise((r) => setTimeout(r, 400));
            setStage('embeddings_qdrant');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('embeddings_qdrant');
            yield new Promise((r) => setTimeout(r, 400));
            setStage('indexed_opensearch');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('indexed_opensearch');
            // Завантажити превʼю
            const prev = yield axios_1.default.get(`${apiBase}/api/v1/dataops/datasets/${id}/preview?limit=5`);
            setPreview({ schema: ((_b = prev.data) === null || _b === void 0 ? void 0 : _b.schema) || {}, sample_data: ((_c = prev.data) === null || _c === void 0 ? void 0 : _c.sample_data) || [] });
            setStage('completed');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('completed');
            setMessage('Готово! Дані завантажені та проіндексовані.');
            onUploaded === null || onUploaded === void 0 ? void 0 : onUploaded(id);
        }
        catch (err) {
            console.error(err);
            setStage('error');
            onStageChange === null || onStageChange === void 0 ? void 0 : onStageChange('error');
            setMessage('Помилка при завантаженні файлу. Перевірте бекенд та формат.');
        }
    });
    const reset = () => {
        setFile(null);
        setProgress(0);
        setStage('idle');
        setDatasetId('');
        setPreview(null);
        setMessage('');
    };
    return (<material_1.Paper elevation={4} sx={{ p: 2, mb: 3, border: '1px solid #1f2a38', background: 'rgba(10,15,26,0.9)' }}>
      <material_1.Typography variant="h6" sx={{ color: '#00ffc6', mb: 1 }}>
        📥 Завантаження даних (Excel / CSV)
      </material_1.Typography>
      <material_1.Typography variant="body2" sx={{ color: '#9fb3c8', mb: 2 }}>
        Перетягніть файл або оберіть його вручну. Підтримка: .xlsx, .xls, .csv, .json
      </material_1.Typography>

      <material_1.Box {...getRootProps()} sx={{
            p: 3,
            border: '2px dashed #0A75FF',
            borderRadius: 2,
            textAlign: 'center',
            color: '#9fb3c8',
            background: isDragActive ? 'rgba(10,117,255,0.1)' : 'rgba(15,20,30,0.6)',
            cursor: 'pointer',
            mb: 2,
        }}>
        <input {...getInputProps()}/>
        {file ? (<>
            <material_1.Typography sx={{ color: '#cfe8ff' }}>{file.name}</material_1.Typography>
            <material_1.Typography variant="caption">{(file.size / 1024 / 1024).toFixed(2)} MB</material_1.Typography>
          </>) : (<material_1.Typography>Перетягніть файл сюди або натисніть для вибору</material_1.Typography>)}
      </material_1.Box>

      {stage === 'uploading' && (<material_1.Box sx={{ mb: 2 }}>
          <material_1.LinearProgress variant="determinate" value={progress}/>
          <material_1.Typography variant="caption">{progress}%</material_1.Typography>
        </material_1.Box>)}

      {message && (<material_1.Typography variant="body2" sx={{ color: stage === 'error' ? '#ff6699' : '#00ffc6', mb: 1 }}>
          {message}
        </material_1.Typography>)}

      <material_1.Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <material_1.Button variant="contained" onClick={handleUpload} disabled={!canUpload}>
          Завантажити
        </material_1.Button>
        <material_1.Button variant="outlined" color="inherit" onClick={reset} disabled={stage === 'uploading'}>
          Скинути
        </material_1.Button>
        {datasetId && <material_1.Chip label={`dataset_id: ${datasetId}`} size="small"/>}
      </material_1.Stack>

      {preview && (<material_1.Box>
          <material_1.Typography variant="subtitle1" sx={{ color: '#cfe8ff', mb: 1 }}>
            🔎 Превʼю даних
          </material_1.Typography>
          <material_1.Table size="small" sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <material_1.TableHead>
              <material_1.TableRow>
                {Object.keys(preview.schema).map((col) => (<material_1.TableCell key={col} sx={{ color: '#9fb3c8' }}>{col}</material_1.TableCell>))}
              </material_1.TableRow>
            </material_1.TableHead>
            <material_1.TableBody>
              {preview.sample_data.map((row, idx) => (<material_1.TableRow key={idx}>
                  {Object.keys(preview.schema).map((col) => (<material_1.TableCell key={col} sx={{ color: '#cfe8ff' }}>{String(row[col])}</material_1.TableCell>))}
                </material_1.TableRow>))}
            </material_1.TableBody>
          </material_1.Table>
        </material_1.Box>)}
    </material_1.Paper>);
};
exports.default = DataUpload;
