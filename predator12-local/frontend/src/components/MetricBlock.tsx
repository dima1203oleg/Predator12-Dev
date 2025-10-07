import React from 'react';

interface MetricBlockProps {
  title: string;
  value: number;
  unit: string;
  icon: string;
  color?: string;
  trend?: number;
  assistiveLabel?: string;
}

const MetricBlock: React.FC<MetricBlockProps> = ({ title, value, unit, icon, color = '#8B5CF6', trend, assistiveLabel }) => {
  const trendPositive = (trend ?? 0) > 0;
  return (
    <div className="metric-block" role="group" aria-label={assistiveLabel || `${title} metric`}>
      <div className="metric-icon" style={{ color }} aria-hidden="true">{icon}</div>
      <div className="metric-title">{title}</div>
      <div className="metric-value-row">
        <div className="metric-value" data-testid="metric-value">{value.toFixed(1)}</div>
        <div className="metric-unit">{unit}</div>
      </div>
      <div className="progress-outer" aria-hidden="true">
        <div className="progress-inner" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {trend !== undefined && (
        <div className={`metric-trend ${trendPositive ? 'positive' : 'negative'}`}>
          {trendPositive ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

export default MetricBlock;
