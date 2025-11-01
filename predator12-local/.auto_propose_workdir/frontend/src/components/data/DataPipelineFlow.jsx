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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const steps = [
    { key: 'select', label: 'Вибір файлу' },
    { key: 'uploading', label: 'Завантаження → API' },
    { key: 'received', label: 'Файл отримано' },
    { key: 'analyzing', label: 'Аналіз структури' },
    { key: 'stored_pg', label: 'Запис у PostgreSQL' },
    { key: 'embeddings_qdrant', label: 'Вектори у Qdrant' },
    { key: 'indexed_opensearch', label: 'Індекс в OpenSearch' },
    { key: 'completed', label: 'Готово' },
];
const stageIndexMap = {
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
const DataPipelineFlow = ({ stage }) => {
    var _a;
    const activeStep = (0, react_1.useMemo)(() => { var _a; return (_a = stageIndexMap[stage]) !== null && _a !== void 0 ? _a : 0; }, [stage]);
    return (<material_1.Box sx={{ p: 2, mb: 2, border: '1px solid #1f2a38', borderRadius: 2, background: 'rgba(15,20,30,0.6)' }}>
      <material_1.Typography variant="subtitle1" sx={{ color: '#cfe8ff', mb: 1 }}>
        🔄 Етапи обробки даних
      </material_1.Typography>
      <material_1.Stepper alternativeLabel activeStep={activeStep} sx={{
            '& .MuiStepIcon-root': { color: '#1f2a38' },
            '& .MuiStepIcon-root.Mui-active': { color: '#00ffc6' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#0A75FF' },
            '& .MuiStepLabel-label': { color: '#9fb3c8' },
        }}>
        {steps.map((s) => (<material_1.Step key={s.key}>
            <material_1.StepLabel>{s.label}</material_1.StepLabel>
          </material_1.Step>))}
      </material_1.Stepper>
      <material_1.Typography variant="caption" sx={{ color: stage === 'error' ? '#ff6699' : '#9fb3c8', mt: 1, display: 'block' }}>
        Поточний етап: {(_a = steps[activeStep]) === null || _a === void 0 ? void 0 : _a.label}
      </material_1.Typography>
    </material_1.Box>);
};
exports.default = DataPipelineFlow;
