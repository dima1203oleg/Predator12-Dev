"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const SIZE_DIMENSIONS = {
    small: 120,
    medium: 160,
    large: 220
};
const EMOTION_LABEL = {
    neutral: 'Нейтральний режим',
    alert: 'Попередження',
    processing: 'Обробка',
    success: 'Оптимальний стан',
    error: 'Аварійний режим'
};
const HolographicAIFace = (_a) => {
    var _b, _c;
    var { isHidden, isActive = true, isSpeaking, emotion = 'neutral', message, systemHealth = 'optimal', intensity = 0.5, size = 'medium', performanceMode, fallbackMode, onPerformanceChange, style } = _a, rest = __rest(_a, ["isHidden", "isActive", "isSpeaking", "emotion", "message", "systemHealth", "intensity", "size", "performanceMode", "fallbackMode", "onPerformanceChange", "style"]);
    react_1.default.useEffect(() => {
        if (onPerformanceChange) {
            onPerformanceChange(60, Boolean(fallbackMode));
        }
    }, [fallbackMode, onPerformanceChange]);
    if (isHidden || !isActive) {
        return null;
    }
    const dimension = (_b = SIZE_DIMENSIONS[size]) !== null && _b !== void 0 ? _b : SIZE_DIMENSIONS.medium;
    const emotionText = (_c = EMOTION_LABEL[emotion]) !== null && _c !== void 0 ? _c : EMOTION_LABEL.neutral;
    return (<material_1.Box {...rest} sx={Object.assign({ width: dimension, height: dimension, borderRadius: '50%', border: '2px solid rgba(0, 255, 204, 0.4)', background: 'linear-gradient(135deg, rgba(0, 26, 38, 0.8), rgba(6, 12, 24, 0.8))', boxShadow: '0 0 30px rgba(0, 255, 204, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2, gap: 1, textAlign: 'center', position: 'relative' }, style)}>
      <material_1.Typography variant="caption" sx={{ letterSpacing: 1, textTransform: 'uppercase', color: '#7ef9ff' }}>
        {emotionText}
      </material_1.Typography>
      <material_1.Typography variant="body2" sx={{ color: '#e0f7fa', fontWeight: 600 }}>
        {systemHealth.toUpperCase()}
      </material_1.Typography>
      <material_1.Typography variant="caption" sx={{ color: '#80deea' }}>
        Інтенсивність: {(intensity * 100).toFixed(0)}%
      </material_1.Typography>
      {isSpeaking && (<material_1.Typography variant="caption" sx={{ color: '#ffab91' }}>
          🎙️ Голос активний
        </material_1.Typography>)}
      {message && (<material_1.Typography variant="caption" sx={{ color: '#b3e5fc' }}>
          {message}
        </material_1.Typography>)}
      {performanceMode && (<material_1.Typography variant="caption" sx={{ color: '#4dd0e1' }}>
          Режим: {performanceMode}
        </material_1.Typography>)}
      {fallbackMode && (<material_1.Typography variant="caption" sx={{ color: '#ffcc80' }}>
          Canvas fallback активний
        </material_1.Typography>)}
    </material_1.Box>);
};
exports.default = HolographicAIFace;
