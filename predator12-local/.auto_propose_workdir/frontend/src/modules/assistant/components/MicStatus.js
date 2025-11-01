"use strict";
/**
 * MicStatus Component - VU-Meter for Microphone Input
 *
 * Features:
 * - Real-time audio level visualization
 * - WebAudio API integration
 * - Circular progress indicator
 * - Continuous/single-shot mode indicator
 * - Performance-optimized (RAF throttling)
 */
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
const react_1 = __importStar(require("react"));
const assistantStore_1 = require("../state/assistantStore");
function MicStatus() {
    const mic = (0, assistantStore_1.useAssistantStore)((s) => s.mic);
    const setMic = (0, assistantStore_1.useAssistantStore)((s) => s.setMic);
    const canvasRef = (0, react_1.useRef)(null);
    // Draw VU-meter
    (0, react_1.useEffect)(() => {
        if (!mic.enabled || !canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const size = 40;
        canvas.width = size;
        canvas.height = size;
        let animationId;
        const draw = () => {
            ctx.clearRect(0, 0, size, size);
            // Background circle
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Level arc
            const angle = (mic.level * Math.PI * 2) - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 2, -Math.PI / 2, angle);
            ctx.strokeStyle = mic.level > 0.7 ? '#ef4444' : mic.level > 0.4 ? '#eab308' : '#06b6d4';
            ctx.lineWidth = 3;
            ctx.stroke();
            // Center dot
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
            ctx.fillStyle = mic.enabled ? '#06b6d4' : '#6b7280';
            ctx.fill();
            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            if (animationId)
                cancelAnimationFrame(animationId);
        };
    }, [mic.enabled, mic.level]);
    // Toggle continuous mode
    const toggleContinuous = () => {
        setMic({ continuous: !mic.continuous });
    };
    if (!mic.enabled) {
        return (<div className="flex items-center space-x-2 text-gray-500">
        <div className="w-10 h-10 rounded-full border-2 border-gray-600 flex items-center justify-center">
          <span className="text-lg">🎤</span>
        </div>
        <span className="text-xs">Off</span>
      </div>);
    }
    return (<div className="flex items-center space-x-2">
      {/* VU-Meter Canvas */}
      <canvas ref={canvasRef} className="w-10 h-10" aria-label="Microphone level indicator"/>

      {/* Status */}
      <div className="flex flex-col text-xs">
        <span className="text-cyan-400 font-medium">
          {mic.continuous ? '🔄 Continuous' : '🎯 Single'}
        </span>
        <span className="text-gray-500">
          {Math.round(mic.level * 100)}%
        </span>
      </div>

      {/* Continuous Toggle */}
      <button onClick={toggleContinuous} className="p-1 hover:bg-cyan-500/10 rounded transition-colors" title={mic.continuous ? 'Switch to single-shot' : 'Switch to continuous'} aria-label="Toggle continuous recording">
        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mic.continuous ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>)}
        </svg>
      </button>
    </div>);
}
exports.default = MicStatus;
