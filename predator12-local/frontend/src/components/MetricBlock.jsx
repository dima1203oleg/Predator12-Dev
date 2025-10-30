"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const MetricBlock = ({ title, value, unit, icon, color = '#8B5CF6', trend, assistiveLabel }) => {
    const trendPositive = (trend !== null && trend !== void 0 ? trend : 0) > 0;
    return (<div className="metric-block" role="group" aria-label={assistiveLabel || `${title} metric`}>
      <div className="metric-icon" style={{ color }} aria-hidden="true">{icon}</div>
      <div className="metric-title">{title}</div>
      <div className="metric-value-row">
        <div className="metric-value" data-testid="metric-value">{value.toFixed(1)}</div>
        <div className="metric-unit">{unit}</div>
      </div>
      <div className="progress-outer" aria-hidden="true">
        <div className="progress-inner" style={{ width: `${Math.min(100, Math.max(0, value))}%` }}/>
      </div>
      {trend !== undefined && (<div className={`metric-trend ${trendPositive ? 'positive' : 'negative'}`}>
          {trendPositive ? '▲' : '▼'} {Math.abs(trend)}%
        </div>)}
    </div>);
};
exports.default = MetricBlock;
