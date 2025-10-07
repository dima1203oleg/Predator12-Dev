import React from 'react';

// ============= SEARCH BAR =============
export const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: '400px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '18px',
          color: '#888',
          pointerEvents: 'none',
        }}
      >
        🔍
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search services..."
        style={{
          width: '100%',
          padding: '16px 16px 16px 50px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          color: '#fff',
          fontSize: '16px',
          outline: 'none',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#8B5CF6';
          e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
};

// ============= FILTER CHIP =============
export const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}> = ({ label, active, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
          : 'rgba(255, 255, 255, 0.05)',
        border: active
          ? '1px solid transparent'
          : '1px solid rgba(255, 255, 255, 0.1)',
        color: active ? '#fff' : '#888',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#fff';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = '#888';
        }
      }}
    >
      {label}
      {count !== undefined && (
        <span
          style={{
            background: active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(139, 92, 246, 0.2)',
            color: active ? '#fff' : '#8B5CF6',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '700',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// ============= ALERT NOTIFICATION =============
export const AlertNotification: React.FC<{
  alert: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
  };
  onClose: () => void;
}> = ({ alert, onClose }) => {
  const colors = {
    info: '#3B82F6',
    warning: '#F59E0B',
    error: '#EF4444',
    success: '#10B981',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
    success: '✅',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors[alert.type]}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '300px',
        zIndex: 1000,
        animation: 'slideInRight 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '20px' }}>{icons[alert.type]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
            {alert.message}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>{alert.timestamp}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// ============= SERVICE MODAL =============
export const ServiceModal: React.FC<{
  service: {
    name: string;
    status: string;
    uptime: string;
    requests: number;
    responseTime?: number;
    lastCheck: string;
    category: string;
  } | null;
  onClose: () => void;
}> = ({ service, onClose }) => {
  if (!service) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '700' }}>{service.name}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '0',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Status</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{service.status}</div>
          </div>

          <div>
            <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Category</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{service.category}</div>
          </div>

          <div>
            <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Uptime</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{service.uptime}</div>
          </div>

          <div>
            <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Requests per minute</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{service.requests.toLocaleString()}</div>
          </div>

          {service.responseTime && (
            <div>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Response time</div>
              <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{service.responseTime}ms</div>
            </div>
          )}

          <div>
            <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Last check</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{service.lastCheck}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
