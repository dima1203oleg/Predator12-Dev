import React from 'react';
import type { CSSProperties } from 'react';

export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  requests: number;
  responseTime?: number;
  lastCheck: string;
  category: string;
}

interface ServiceCardProps {
  service: ServiceStatus;
  onClick?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <div
      className="service-card"
      data-status={service.status}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`${service.name} status ${service.status}, ${service.requests} requests per minute, uptime ${service.uptime}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    >
      <div className="service-card-line1">
        <span className="service-card-status" aria-hidden="true" />
        <span className="service-card-name">{service.name}</span>
        <span className="service-badge" data-status={service.status}>{service.status}</span>
      </div>
      <div className="service-card-sub">{service.requests.toLocaleString()} / min · {service.uptime}</div>
    </div>
  );
};

interface ServiceCategorySectionProps {
  id: string;
  title: string;
  icon: string;
  services: ServiceStatus[];
  onServiceClick: (s: ServiceStatus) => void;
  collapsed: boolean;
  onToggle: () => void;
  active?: boolean;
}

export const ServiceCategorySection: React.FC<ServiceCategorySectionProps> = ({
  id,
  title,
  icon,
  services,
  onServiceClick,
  collapsed,
  onToggle,
  active,
}) => {
  if (!services.length) return null;
  return (
    <section id={id} className={`category-section ${collapsed ? 'collapsed' : ''}`} data-active={active || undefined} aria-labelledby={`${id}-label`}>
      <div className="category-header">
        <button
          id={`${id}-label`}
          className="category-toggle-btn"
          aria-expanded={!collapsed}
          aria-controls={`${id}-body`}
          onClick={onToggle}
        >
          <span className="category-icon" aria-hidden="true">{icon}</span>
          <span>{title}</span>
          <span className="category-count">{services.length}</span>
          <span className="chevron" aria-hidden="true" />
        </button>
        <div className="category-meta" aria-hidden="true">
          <span className="ok">● {services.filter(s=>s.status==='online').length} OK</span>
          {services.some(s=>s.status==='warning') && <span className="warn">● {services.filter(s=>s.status==='warning').length} Warn</span>}
        </div>
      </div>
      <div id={`${id}-body`} className="service-grid" hidden={collapsed}>
        {services.map((srv,i)=>(<ServiceCard key={i} service={srv} onClick={()=>onServiceClick(srv)} />))}
      </div>
    </section>
  );
};
