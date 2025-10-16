import React from 'react';

// ============= SEARCH BAR (Refactored) =============
export const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
}> = ({ value, onChange, label = 'Search services', id = 'service-search' }) => {
  return (
    <div className="search-bar-wrapper">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <span className="search-bar-icon" aria-hidden="true">
        🔍
      </span>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label + '...'}
        aria-label={label}
        className="search-input"
      />
    </div>
  );
};

// ============= FILTER CHIP (Refactored) =============
export const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}> = ({ label, active, onClick, count }) => {
  return (
    <button
      type="button"
      className="filter-chip"
      data-active={active || undefined}
      aria-pressed={active ? 'true' : 'false'}
      onClick={onClick}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className="filter-chip-badge"
          aria-label={`${count} services`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// ============= ALERT NOTIFICATION (Refactored) =============
export const AlertNotification: React.FC<{
  alert: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
  };
  onClose: () => void;
}> = ({ alert, onClose }) => {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
    success: '✅',
  };
  return (
    <div
      className="alert"
      role="alert"
      data-type={alert.type}
      aria-live="assertive"
    >
      <div className="alert-icon" aria-hidden="true">
        {icons[alert.type]}
      </div>
      <div className="alert-body">
        <div className="alert-msg">{alert.message}</div>
        <div className="alert-time">{alert.timestamp}</div>
      </div>
      <button
        className="alert-close"
        onClick={onClose}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
};

// ============= SERVICE MODAL (Refactored) =============
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
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        className="modal-panel"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 id="service-modal-title" className="modal-title">{service.name}</h2>
        <div className="modal-grid">
          <div>
            <div className="modal-field-label">Status</div>
            <div className="modal-field-value">{service.status}</div>
          </div>
          <div>
            <div className="modal-field-label">Category</div>
            <div className="modal-field-value">{service.category}</div>
          </div>
          <div>
            <div className="modal-field-label">Uptime</div>
            <div className="modal-field-value">{service.uptime}</div>
          </div>
          <div>
            <div className="modal-field-label">Requests / min</div>
            <div className="modal-field-value">
              {service.requests.toLocaleString()}
            </div>
          </div>
          {service.responseTime && (
            <div>
              <div className="modal-field-label">Response time</div>
              <div className="modal-field-value">{service.responseTime}ms</div>
            </div>
          )}
          <div>
            <div className="modal-field-label">Last check</div>
            <div className="modal-field-value">{service.lastCheck}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
