import React from 'react';

// ============= TYPES =============
export interface AIAgent {
  id: string;
  name: string;
  type: 'autonomous' | 'supervised' | 'specialized';
  status: 'active' | 'idle' | 'training' | 'error';
  tasksCompleted: number;
  successRate: number;
  model: string;
  lastActivity: string;
  specialty?: string; // Added specialty field for self-improvement agents
}

export interface AIModel {
  id: string;
  name: string;
  type: 'llm' | 'vision' | 'embedding' | 'classifier';
  provider: string;
  status: 'loaded' | 'loading' | 'error' | 'unloaded';
  requests: number;
  avgLatency: number;
  accuracy?: number;
  size: string;
}

export interface TrainingPipeline {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  startTime: string;
  estimatedEndTime?: string;
}

// ============= AI AGENT CARD =============
export const AgentCard: React.FC<{ agent: AIAgent; onClick?: () => void }> = ({ agent, onClick }) => {
  const statusColors = {
    active: '#10B981',
    idle: '#F59E0B',
    training: '#3B82F6',
  };

  const typeIcons = {
    autonomous: '🤖',
    supervised: '👨‍💼',
    specialized: '🎯',
  };

  const color = statusColors[agent.status];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '32px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}20`,
            borderRadius: '12px',
          }}
        >
          {typeIcons[agent.type]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            {agent.name}
          </div>
          <div style={{ color: '#888', fontSize: '12px', textTransform: 'capitalize' }}>
            {agent.type} Agent
          </div>
        </div>
        <div
          style={{
            background: `${color}20`,
            color: color,
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {agent.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Tasks Completed</div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>
            {agent.tasksCompleted.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Success Rate</div>
          <div style={{ color: color, fontSize: '18px', fontWeight: '700' }}>
            {agent.successRate}%
          </div>
        </div>
      </div>

      {agent.specialty && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '12px',
        }}>
          <div style={{ color: '#8B5CF6', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
            SPECIALTY
          </div>
          <div style={{ color: '#fff', fontSize: '12px', lineHeight: '1.4' }}>
            {agent.specialty}
          </div>
        </div>
      )}

      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: '#888', fontSize: '11px' }}>Model</div>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{agent.model}</div>
        </div>
        <div style={{ color: '#666', fontSize: '11px' }}>{agent.lastActivity}</div>
      </div>
    </div>
  );
};

// ============= AI MODEL CARD =============
export const ModelCard: React.FC<{ model: AIModel; onClick?: () => void }> = ({ model, onClick }) => {
  const statusColors = {
    loaded: '#10B981',
    loading: '#F59E0B',
    error: '#EF4444',
  };

  const typeIcons = {
    llm: '🧠',
    vision: '👁️',
    embedding: '🔗',
    classifier: '🏷️',
  };

  const color = statusColors[model.status];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '32px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}20`,
            borderRadius: '12px',
          }}
        >
          {typeIcons[model.type]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            {model.name}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            {model.provider} · {model.size}
          </div>
        </div>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 15px ${color}`,
            animation: model.status === 'loaded' ? 'pulse 2s infinite' : 'none',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Requests</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>
            {model.requests.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Latency</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>
            {model.avgLatency}ms
          </div>
        </div>
        {model.accuracy && (
          <div>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Accuracy</div>
            <div style={{ color: color, fontSize: '16px', fontWeight: '700' }}>
              {model.accuracy}%
            </div>
          </div>
        )}
      </div>

      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div
          style={{
            width: `${model.accuracy || 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
};

// ============= AI STATS SUMMARY =============
export const AIStatsSummary: React.FC<{
  totalAgents: number;
  activeAgents: number;
  totalModels: number;
  totalRequests: number;
}> = ({ totalAgents, activeAgents, totalModels, totalRequests }) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🤖</div>
          <div style={{ color: '#fff', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
            {totalAgents}
          </div>
          <div style={{ color: '#888', fontSize: '14px' }}>AI Agents</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚡</div>
          <div style={{ color: '#10B981', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
            {activeAgents}
          </div>
          <div style={{ color: '#888', fontSize: '14px' }}>Active Now</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🧠</div>
          <div style={{ color: '#fff', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
            {totalModels}
          </div>
          <div style={{ color: '#888', fontSize: '14px' }}>AI Models</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📊</div>
          <div style={{ color: '#8B5CF6', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
            {(totalRequests / 1000).toFixed(1)}K
          </div>
          <div style={{ color: '#888', fontSize: '14px' }}>Total Requests</div>
        </div>
      </div>
    </div>
  );
};

// ============= AGENT ACTIVITY TIMELINE =============
export const AgentActivityTimeline: React.FC<{
  activities: Array<{ agent: string; action: string; time: string; status: 'success' | 'error' | 'info' }>;
}> = ({ activities }) => {
  const statusColors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6',
  };

  const statusIcons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '24px',
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
        🕒 Recent Activity
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activities.map((activity, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              borderLeft: `3px solid ${statusColors[activity.status]}`,
            }}
          >
            <div style={{ fontSize: '20px' }}>{statusIcons[activity.status]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                {activity.agent}
              </div>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
                {activity.action}
              </div>
              <div style={{ color: '#666', fontSize: '11px' }}>{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { AIAgent, AIModel };

// ============= TRAINING PIPELINE =============
interface TrainingPipeline {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  model: string;
  dataset: string;
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  eta: string;
}

export const TrainingPipelineCard: React.FC<{ pipeline: TrainingPipeline }> = ({ pipeline }) => {
  const statusColors = {
    running: '#3B82F6',
    completed: '#10B981',
    failed: '#EF4444',
    queued: '#F59E0B',
  };

  const color = statusColors[pipeline.status];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            {pipeline.name}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            {pipeline.model} • {pipeline.dataset}
          </div>
        </div>
        <div
          style={{
            background: `${color}20`,
            color: color,
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {pipeline.status}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#888', fontSize: '12px' }}>Progress</span>
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>{pipeline.progress}%</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${pipeline.progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Epoch</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
            {pipeline.epoch}/{pipeline.totalEpochs}
          </div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Loss</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>{pipeline.loss.toFixed(4)}</div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Accuracy</div>
          <div style={{ color: '#10B981', fontSize: '16px', fontWeight: '600' }}>{pipeline.accuracy}%</div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>ETA</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>{pipeline.eta}</div>
        </div>
      </div>
    </div>
  );
};

// ============= MODEL COMPARISON =============
export const ModelComparisonTable: React.FC<{ models: AIModel[] }> = ({ models }) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '24px',
        overflowX: 'auto',
      }}
    >
      <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
        🔬 Model Comparison
      </h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <th style={{ color: '#888', fontSize: '12px', fontWeight: '600', padding: '12px', textAlign: 'left' }}>
              Model
            </th>
            <th style={{ color: '#888', fontSize: '12px', fontWeight: '600', padding: '12px', textAlign: 'left' }}>
              Type
            </th>
            <th style={{ color: '#888', fontSize: '12px', fontWeight: '600', padding: '12px', textAlign: 'right' }}>
              Requests
            </th>
            <th style={{ color: '#888', fontSize: '12px', fontWeight: '600', padding: '12px', textAlign: 'right' }}>
              Latency
            </th>
            <th style={{ color: '#888', fontSize: '12px', fontWeight: '600', padding: '12px', textAlign: 'right' }}>
              Accuracy
            </th>
            <th style={{ color: '#888', fontSize: '12px', fontWeight: '600', padding: '12px', textAlign: 'right' }}>
              Size
            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr
              key={model.id}
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <td style={{ padding: '16px', color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                {model.name}
              </td>
              <td style={{ padding: '16px' }}>
                <span
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#8B5CF6',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  {model.type}
                </span>
              </td>
              <td style={{ padding: '16px', color: '#888', fontSize: '14px', textAlign: 'right' }}>
                {model.requests.toLocaleString()}
              </td>
              <td style={{ padding: '16px', color: '#888', fontSize: '14px', textAlign: 'right' }}>
                {model.avgLatency}ms
              </td>
              <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right' }}>
                <span style={{ color: model.accuracy && model.accuracy > 95 ? '#10B981' : '#F59E0B' }}>
                  {model.accuracy ? `${model.accuracy}%` : 'N/A'}
                </span>
              </td>
              <td style={{ padding: '16px', color: '#888', fontSize: '14px', textAlign: 'right' }}>
                {model.size}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============= AGENT CONTROL PANEL =============
export const AgentControlPanel: React.FC<{ agent: AIAgent; onAction: (action: string) => void }> = ({
  agent,
  onAction,
}) => {
  const actions = [
    { id: 'restart', label: 'Restart', icon: '🔄', color: '#3B82F6' },
    { id: 'pause', label: 'Pause', icon: '⏸️', color: '#F59E0B' },
    { id: 'configure', label: 'Configure', icon: '⚙️', color: '#8B5CF6' },
    { id: 'logs', label: 'View Logs', icon: '📋', color: '#10B981' },
  ];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px',
      }}
    >
      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        Agent Control: {agent.name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            style={{
              background: `${action.color}20`,
              border: `1px solid ${action.color}40`,
              borderRadius: '12px',
              padding: '12px',
              color: action.color,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${action.color}40`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${action.color}20`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '18px' }}>{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============= AI METRICS DASHBOARD =============
export const AIMetricsDashboard: React.FC<{
  totalRequests: number;
  avgLatency: number;
  successRate: number;
  activeModels: number;
}> = ({ totalRequests, avgLatency, successRate, activeModels }) => {
  const metrics = [
    { label: 'Total Requests', value: (totalRequests / 1000).toFixed(1) + 'K', icon: '📊', color: '#8B5CF6' },
    { label: 'Avg Latency', value: avgLatency + 'ms', icon: '⚡', color: '#3B82F6' },
    { label: 'Success Rate', value: successRate + '%', icon: '✅', color: '#10B981' },
    { label: 'Active Models', value: activeModels.toString(), icon: '🧠', color: '#EC4899' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {metrics.map((metric, index) => (
        <div
          key={index}
          style={{
            background: `linear-gradient(135deg, ${metric.color}20 0%, ${metric.color}10 100%)`,
            border: `1px solid ${metric.color}40`,
            borderRadius: '16px',
            padding: '20px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `0 8px 32px ${metric.color}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>{metric.icon}</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
            {metric.value}
          </div>
          <div style={{ color: '#888', fontSize: '13px' }}>{metric.label}</div>
        </div>
      ))}
    </div>
  );
};

export type { TrainingPipeline };
