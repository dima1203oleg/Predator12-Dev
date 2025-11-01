"use strict";
/**
 * RiskBanner Component - Risk Alerts Display
 *
 * Features:
 * - Shows top priority alert from OpenSearch
 * - Auto-scroll for multiple alerts
 * - Click to view details/source
 * - Arrow navigation
 * - Severity-based color coding
 * - Dismissible
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
const react_i18next_1 = require("react-i18next");
const assistantStore_1 = require("../state/assistantStore");
function RiskBanner() {
    const { t } = (0, react_i18next_1.useTranslation)();
    const alertsState = (0, assistantStore_1.useAssistantStore)((s) => s.alerts);
    const nextAlert = (0, assistantStore_1.useAssistantStore)((s) => s.nextAlert);
    const prevAlert = (0, assistantStore_1.useAssistantStore)((s) => s.prevAlert);
    const setAlerts = (0, assistantStore_1.useAssistantStore)((s) => s.setAlerts);
    const alerts = alertsState.items;
    const currentIndex = alertsState.activeIndex;
    // Auto-scroll through alerts
    (0, react_1.useEffect)(() => {
        if (alerts.length <= 1)
            return;
        const interval = setInterval(() => {
            nextAlert();
        }, 5000);
        return () => clearInterval(interval);
    }, [alerts.length, nextAlert]);
    if (alerts.length === 0)
        return null;
    const currentAlert = alerts[currentIndex];
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-600 border-red-500';
            case 'high': return 'bg-orange-600 border-orange-500';
            case 'medium': return 'bg-yellow-600 border-yellow-500';
            case 'low': return 'bg-blue-600 border-blue-500';
            default: return 'bg-gray-600 border-gray-500';
        }
    };
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'medium': return '⚡';
            case 'low': return 'ℹ️';
            default: return '📌';
        }
    };
    const handleDismiss = () => {
        const newAlerts = alerts.filter((_, idx) => idx !== currentIndex);
        setAlerts(newAlerts);
    };
    const handlePrev = () => {
        prevAlert();
    };
    const handleNext = () => {
        nextAlert();
    };
    const handleViewSource = () => {
        if (currentAlert.source) {
            window.open(currentAlert.source, '_blank');
        }
    };
    return (<div className={`
        col-span-3 p-4 border-t border-cyan-500/20
        ${getSeverityColor(currentAlert.severity)}
        flex items-center justify-between gap-4
        animate-slide-in
      `} role="alert" aria-live="assertive">
      {/* Icon & Content */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl flex-shrink-0">
          {getSeverityIcon(currentAlert.severity)}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase text-white">
              {currentAlert.severity}
            </span>
            {currentAlert.entityId && (<span className="text-xs text-white/70">
                • {currentAlert.entityId}
              </span>)}
          </div>
          <p className="text-sm text-white font-medium truncate">
            {currentAlert.message}
          </p>
          <p className="text-xs text-white/70 mt-1">
            {new Date(currentAlert.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Navigation (if multiple alerts) */}
        {alerts.length > 1 && (<div className="flex items-center gap-1">
            <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded transition-colors" aria-label={t('alerts.prev')}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-xs text-white/70 font-mono min-w-[3rem] text-center">
              {currentIndex + 1} / {alerts.length}
            </span>
            <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded transition-colors" aria-label={t('alerts.next')}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>)}

        {/* View Source */}
        {currentAlert.source && (<button onClick={handleViewSource} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition-colors" aria-label={t('alerts.viewSource')}>
            {t('alerts.viewSource')}
          </button>)}

        {/* Dismiss */}
        <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded transition-colors" aria-label={t('alerts.dismiss')}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>);
}
exports.default = RiskBanner;
