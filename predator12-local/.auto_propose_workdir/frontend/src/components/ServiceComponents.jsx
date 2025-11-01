"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCategorySection = exports.ServiceCard = void 0;
const react_1 = __importDefault(require("react"));
const ServiceCard = ({ service, onClick }) => {
    return (<div className="service-card" data-status={service.status} onClick={onClick} tabIndex={0} role="button" aria-label={`${service.name} status ${service.status}, ${service.requests} requests per minute, uptime ${service.uptime}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick === null || onClick === void 0 ? void 0 : onClick();
    } }}>
      <div className="service-card-line1">
        <span className="service-card-status" aria-hidden="true"/>
        <span className="service-card-name">{service.name}</span>
        <span className="service-badge" data-status={service.status}>{service.status}</span>
      </div>
      <div className="service-card-sub">{service.requests.toLocaleString()} / min · {service.uptime}</div>
    </div>);
};
exports.ServiceCard = ServiceCard;
const ServiceCategorySection = ({ id, title, icon, services, onServiceClick, collapsed, onToggle, active, }) => {
    if (!services.length)
        return null;
    return (<section id={id} className={`category-section ${collapsed ? 'collapsed' : ''}`} data-active={active || undefined} aria-labelledby={`${id}-label`}>
      <div className="category-header">
        <button id={`${id}-label`} className="category-toggle-btn" aria-expanded={!collapsed} aria-controls={`${id}-body`} onClick={onToggle}>
          <span className="category-icon" aria-hidden="true">{icon}</span>
          <span>{title}</span>
          <span className="category-count">{services.length}</span>
          <span className="chevron" aria-hidden="true"/>
        </button>
        <div className="category-meta" aria-hidden="true">
          <span className="ok">● {services.filter(s => s.status === 'online').length} OK</span>
          {services.some(s => s.status === 'warning') && <span className="warn">● {services.filter(s => s.status === 'warning').length} Warn</span>}
        </div>
      </div>
      <div id={`${id}-body`} className="service-grid" hidden={collapsed}>
        {services.map((srv, i) => (<exports.ServiceCard key={i} service={srv} onClick={() => onServiceClick(srv)}/>))}
      </div>
    </section>);
};
exports.ServiceCategorySection = ServiceCategorySection;
