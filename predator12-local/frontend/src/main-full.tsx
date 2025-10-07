import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SearchBar, FilterChip, AlertNotification, ServiceModal } from './components/EnhancedComponents';
import {
  AgentCard,
  ModelCard,
  AIStatsSummary,
  AgentActivityTimeline
} from './components/AIComponents';
import RealTimeMonitor from './components/RealTimeMonitor';
import Neural3DVisualization from './components/Neural3DVisualization';
import AgentControlCenter from './components/AgentControlCenter';
import VoiceControlInterface from './components/VoiceControlInterface';
import type { AIAgent, AIModel } from './components/AIComponents';

// ============= TYPES =============
interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  requests: number;
  responseTime?: number;
  lastCheck: string;
  category: string;
}

interface ChartDataPoint {
  time: string;
  value: number;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

// ============= ANIMATED BACKGROUND =============
const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + '40';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particle.color + Math.floor((1 - distance / 150) * 20).toString(16);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

// ============= METRIC CARD =============
const MetricCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  trend?: number;
}> = ({ title, value, unit, icon, color, trend }) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 20px 60px ${color}40`;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
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
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
                {value.toFixed(1)}
              </span>
              <span style={{ fontSize: '16px', color: '#888' }}>{unit}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: `${value}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
              transition: 'width 0.5s ease',
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        </div>

        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
            <span style={{ color: trend > 0 ? '#10B981' : '#EF4444' }}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
            <span style={{ color: '#666' }}>від минулої години</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============= SERVICE CARD =============
const ServiceCard: React.FC<{
  service: ServiceStatus;
  onClick?: () => void;
}> = ({ service, onClick }) => {
  const statusColors = {
    online: '#10B981',
    offline: '#EF4444',
    warning: '#F59E0B',
  };

  const color = statusColors[service.status];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '16px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        marginBottom: '8px',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(5px)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 10px ${color}`,
            animation: service.status === 'online' ? 'pulse 2s infinite' : 'none',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{service.name}</div>
          <div style={{ color: '#888', fontSize: '11px' }}>
            {service.requests.toLocaleString()}/min · {service.uptime}
          </div>
        </div>
        <div
          style={{
            background: `${color}20`,
            color: color,
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {service.status}
        </div>
      </div>
    </div>
  );
};

// ============= SERVICE CATEGORY SECTION =============
const ServiceCategorySection: React.FC<{
  title: string;
  icon: string;
  services: ServiceStatus[];
  onServiceClick: (service: ServiceStatus) => void;
}> = ({ title, icon, services, onServiceClick }) => {
  if (services.length === 0) return null;

  return (
    <div
      style={{
        marginBottom: '32px',
        animation: 'fadeIn 0.6s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{title}</h3>
        <span
          style={{
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#8B5CF6',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          {services.length} {services.length === 1 ? 'service' : 'services'}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#10B981', fontSize: '12px' }}>
            ● {services.filter(s => s.status === 'online').length} online
          </span>
          {services.filter(s => s.status === 'warning').length > 0 && (
            <span style={{ color: '#F59E0B', fontSize: '12px' }}>
              ● {services.filter(s => s.status === 'warning').length} warning
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '12px' }}>
        {services.map((service, i) => (
          <ServiceCard key={i} service={service} onClick={() => onServiceClick(service)} />
        ))}
      </div>
    </div>
  );
};

// ============= MAIN APP =============
const App: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 68,
    disk: 52,
    network: 34,
  });

  const [services] = useState<ServiceStatus[]>([
    // 🚀 Core Application Services (5)
    { name: 'Backend API', status: 'online', uptime: '99.9%', requests: 1247, responseTime: 45, lastCheck: '2s ago', category: 'core' },
    { name: 'Frontend React', status: 'online', uptime: '100%', requests: 2156, responseTime: 12, lastCheck: '1s ago', category: 'core' },
    { name: 'Celery Worker', status: 'online', uptime: '99.7%', requests: 234, responseTime: 67, lastCheck: '3s ago', category: 'core' },
    { name: 'Celery Scheduler', status: 'online', uptime: '99.8%', requests: 156, responseTime: 45, lastCheck: '4s ago', category: 'core' },
    { name: 'Agent Supervisor', status: 'online', uptime: '99.6%', requests: 834, responseTime: 123, lastCheck: '2s ago', category: 'core' },
    
    // 💾 Database & Storage (4)
    { name: 'PostgreSQL', status: 'online', uptime: '100%', requests: 892, responseTime: 15, lastCheck: '1s ago', category: 'database' },
    { name: 'Redis Cache', status: 'online', uptime: '99.8%', requests: 3421, responseTime: 3, lastCheck: '1s ago', category: 'database' },
    { name: 'MinIO Storage', status: 'online', uptime: '100%', requests: 678, responseTime: 34, lastCheck: '2s ago', category: 'database' },
    { name: 'Qdrant Vector', status: 'warning', uptime: '98.5%', requests: 456, responseTime: 156, lastCheck: '10s ago', category: 'database' },
    
    // 🔍 Search & Indexing (2)
    { name: 'OpenSearch', status: 'online', uptime: '99.9%', requests: 2145, responseTime: 67, lastCheck: '2s ago', category: 'search' },
    { name: 'OpenSearch Dashboard', status: 'online', uptime: '99.8%', requests: 567, responseTime: 89, lastCheck: '3s ago', category: 'search' },
    
    // 📨 Message Queue & Event Streaming (1)
    { name: 'Redpanda Kafka', status: 'online', uptime: '99.7%', requests: 1876, responseTime: 45, lastCheck: '2s ago', category: 'messaging' },
    
    // 🤖 AI/ML Services (1)
    { name: 'Model SDK', status: 'online', uptime: '99.5%', requests: 743, responseTime: 234, lastCheck: '5s ago', category: 'ai' },
    
    // 📊 Monitoring Stack (7)
    { name: 'Prometheus', status: 'online', uptime: '100%', requests: 445, responseTime: 56, lastCheck: '1s ago', category: 'monitoring' },
    { name: 'Grafana', status: 'online', uptime: '100%', requests: 789, responseTime: 78, lastCheck: '2s ago', category: 'monitoring' },
    { name: 'Loki Logs', status: 'online', uptime: '99.9%', requests: 2341, responseTime: 45, lastCheck: '1s ago', category: 'monitoring' },
    { name: 'Promtail', status: 'online', uptime: '99.9%', requests: 3567, responseTime: 12, lastCheck: '1s ago', category: 'monitoring' },
    { name: 'Tempo Tracing', status: 'online', uptime: '99.8%', requests: 1234, responseTime: 67, lastCheck: '2s ago', category: 'monitoring' },
    { name: 'AlertManager', status: 'online', uptime: '100%', requests: 67, responseTime: 34, lastCheck: '3s ago', category: 'monitoring' },
    { name: 'Blackbox Exporter', status: 'online', uptime: '100%', requests: 234, responseTime: 23, lastCheck: '2s ago', category: 'monitoring' },
    
    // 📈 System Metrics (2)
    { name: 'cAdvisor', status: 'online', uptime: '100%', requests: 567, responseTime: 45, lastCheck: '1s ago', category: 'metrics' },
    { name: 'Node Exporter', status: 'online', uptime: '100%', requests: 890, responseTime: 34, lastCheck: '1s ago', category: 'metrics' },
    
    // 🔐 Security Services (3)
    { name: 'Keycloak Auth', status: 'online', uptime: '100%', requests: 445, responseTime: 89, lastCheck: '2s ago', category: 'security' },
    { name: 'Vault Secrets', status: 'online', uptime: '99.9%', requests: 234, responseTime: 56, lastCheck: '2s ago', category: 'security' },
    { name: 'Traefik Proxy', status: 'online', uptime: '100%', requests: 4567, responseTime: 23, lastCheck: '1s ago', category: 'security' },
  ]);

  const [agents] = useState<AIAgent[]>([
    // Self-Improvement & System Enhancement Agents (15)
    {
      id: '1',
      name: 'Predator Self-Healer',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 3247,
      successRate: 99.5,
      model: 'GPT-4-Turbo',
      lastActivity: '15 sec ago',
      specialty: 'Auto-diagnoses and fixes system errors in real-time',
    },
    {
      id: '2',
      name: 'Dynamic Dataset Generator',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 8156,
      successRate: 99.8,
      model: 'GPT-4-Vision',
      lastActivity: '5 sec ago',
      specialty: 'Generates synthetic datasets for model training and validation',
    },
    {
      id: '3',
      name: 'Model Health Supervisor',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 12456,
      successRate: 99.9,
      model: 'Claude-3-Opus',
      lastActivity: '1 sec ago',
      specialty: 'Monitors all models 24/7, detects failures and triggers recovery',
    },
    {
      id: '4',
      name: 'API Resurrection Engine',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 4321,
      successRate: 98.7,
      model: 'GPT-4-Turbo',
      lastActivity: '10 sec ago',
      specialty: 'Automatically restarts failed models and restores API endpoints',
    },
    {
      id: '5',
      name: 'Quantum Code Optimizer',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 5156,
      successRate: 98.8,
      model: 'Claude-3-Opus',
      lastActivity: '30 sec ago',
      specialty: 'Continuously optimizes codebase for performance',
    },
    {
      id: '6',
      name: 'Neural Architecture Evolver',
      type: 'autonomous',
      status: 'training',
      tasksCompleted: 2856,
      successRate: 97.2,
      model: 'GPT-4-Vision',
      lastActivity: '1 min ago',
      specialty: 'Evolves and improves AI model architectures',
    },
    {
      id: '7',
      name: 'Predator Memory Manager',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 4543,
      successRate: 99.1,
      model: 'Llama-2-70B',
      lastActivity: '45 sec ago',
      specialty: 'Manages and optimizes system memory allocation',
    },
    {
      id: '8',
      name: 'Bug Hunter Prime',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 6421,
      successRate: 99.8,
      model: 'CodeLlama-34B',
      lastActivity: '20 sec ago',
      specialty: 'Proactively hunts and eliminates bugs before they manifest',
    },
    {
      id: '9',
      name: 'Learning Rate Optimizer',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 3789,
      successRate: 98.6,
      model: 'Mistral-Large',
      lastActivity: '1 min ago',
      specialty: 'Optimizes learning parameters across all AI models',
    },
    {
      id: '10',
      name: 'Predator Refactoring Engine',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 4934,
      successRate: 99.2,
      model: 'GPT-4',
      lastActivity: '30 sec ago',
      specialty: 'Continuously refactors code for better maintainability',
    },
    {
      id: '11',
      name: 'System Performance Enhancer',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 3456,
      successRate: 98.9,
      model: 'Claude-3-Sonnet',
      lastActivity: '1 min ago',
      specialty: 'Monitors and enhances overall system performance',
    },
    {
      id: '12',
      name: 'Auto-Documentation Writer',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 7567,
      successRate: 99.4,
      model: 'GPT-4-Turbo',
      lastActivity: '45 sec ago',
      specialty: 'Automatically generates and updates system documentation',
    },
    {
      id: '13',
      name: 'Dependency Resolver',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 2789,
      successRate: 97.8,
      model: 'Mixtral-8x7B',
      lastActivity: '2 min ago',
      specialty: 'Resolves dependency conflicts and updates packages',
    },
    {
      id: '14',
      name: 'Security Vulnerability Scanner',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 5245,
      successRate: 99.9,
      model: 'Claude-3-Opus',
      lastActivity: '10 sec ago',
      specialty: 'Scans for and patches security vulnerabilities',
    },
    {
      id: '15',
      name: 'Predator Evolution Controller',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 8167,
      successRate: 99.7,
      model: 'GPT-4-Vision',
      lastActivity: '25 sec ago',
      specialty: 'Orchestrates system-wide evolutionary improvements',
    },

    // Self-Management & Model Recovery Agents (12)
    {
      id: '16',
      name: 'Model Lifecycle Manager',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 9856,
      successRate: 99.9,
      model: 'GPT-4-Turbo',
      lastActivity: '3 sec ago',
      specialty: 'Manages complete lifecycle of all AI models from birth to retirement',
    },
    {
      id: '17',
      name: 'API Heartbeat Monitor',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 15892,
      successRate: 99.8,
      model: 'Claude-3-Opus',
      lastActivity: '1 sec ago',
      specialty: 'Monitors API health with microsecond precision, instant failure detection',
    },
    {
      id: '18',
      name: 'Model Recovery Orchestrator',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 3456,
      successRate: 98.7,
      model: 'GPT-4-Vision',
      lastActivity: '2 sec ago',
      specialty: 'Coordinates model recovery operations and failover procedures',
    },
    {
      id: '19',
      name: 'Training Data Curator',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 11341,
      successRate: 99.5,
      model: 'Mistral-Large',
      lastActivity: '8 sec ago',
      specialty: 'Curates and validates training datasets for optimal model performance',
    },
    {
      id: '20',
      name: 'Resource Allocation Optimizer',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 3892,
      successRate: 99.3,
      model: 'Claude-3-Opus',
      lastActivity: '20 sec ago',
      specialty: 'Dynamically optimizes CPU, GPU, and memory allocation',
    },
    {
      id: '21',
      name: 'Neural Network Architect',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 2456,
      successRate: 98.7,
      model: 'GPT-4-Vision',
      lastActivity: '30 sec ago',
      specialty: 'Designs and optimizes neural network architectures',
    },
    {
      id: '22',
      name: 'Predator Load Balancer',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 5341,
      successRate: 99.5,
      model: 'Mistral-Large',
      lastActivity: '15 sec ago',
      specialty: 'Balances computational load across system nodes',
    },
    {
      id: '23',
      name: 'Error Recovery Specialist',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 6678,
      successRate: 99.8,
      model: 'Claude-3-Sonnet',
      lastActivity: '5 sec ago',
      specialty: 'Recovers from system errors and prevents cascading failures',
    },
    {
      id: '24',
      name: 'Cache Optimization Engine',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 4123,
      successRate: 98.9,
      model: 'Gemini-Pro',
      lastActivity: '25 sec ago',
      specialty: 'Optimizes caching strategies for maximum performance',
    },
    {
      id: '25',
      name: 'Database Query Optimizer',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 7567,
      successRate: 99.1,
      model: 'GPT-4',
      lastActivity: '40 sec ago',
      specialty: 'Optimizes database queries and indexing strategies',
    },
    {
      id: '26',
      name: 'Latency Reduction Agent',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 3789,
      successRate: 98.6,
      model: 'Llama-2-70B',
      lastActivity: '35 sec ago',
      specialty: 'Minimizes response latency across all services',
    },
    {
      id: '27',
      name: 'System Metrics Analyzer',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 4234,
      successRate: 98.8,
      model: 'Mixtral-8x7B',
      lastActivity: '50 sec ago',
      specialty: 'Analyzes system metrics and predicts bottlenecks',
    },

    // Advanced Data & Validation Intelligence Agents (10)
    {
      id: '28',
      name: 'Synthetic Data Forge',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 15341,
      successRate: 99.9,
      model: 'GPT-4-Vision',
      lastActivity: '2 sec ago',
      specialty: 'Generates high-quality synthetic datasets for training and testing',
    },
    {
      id: '29',
      name: 'Model Validator Supreme',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 12543,
      successRate: 99.8,
      model: 'Claude-3-Opus',
      lastActivity: '3 sec ago',
      specialty: 'Validates model outputs and ensures quality standards',
    },
    {
      id: '30',
      name: 'Data Quality Inspector',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 9321,
      successRate: 99.6,
      model: 'GPT-4-Turbo',
      lastActivity: '4 sec ago',
      specialty: 'Inspects and ensures data quality across all datasets',
    },
    {
      id: '31',
      name: 'Model Performance Auditor',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 8890,
      successRate: 99.4,
      model: 'Mistral-Large',
      lastActivity: '6 sec ago',
      specialty: 'Continuously audits model performance and accuracy',
    },
    {
      id: '32',
      name: 'Failure Prediction Oracle',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 7456,
      successRate: 98.9,
      model: 'Claude-3-Sonnet',
      lastActivity: '8 sec ago',
      specialty: 'Predicts model failures before they occur',
    },
    {
      id: '33',
      name: 'Auto-Recovery Coordinator',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 6432,
      successRate: 99.2,
      model: 'GPT-4-Vision',
      lastActivity: '12 sec ago',
      specialty: 'Coordinates automatic recovery of failed models and services',
    },
    {
      id: '34',
      name: 'Training Pipeline Optimizer',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 5765,
      successRate: 98.7,
      model: 'Gemini-Pro',
      lastActivity: '15 sec ago',
      specialty: 'Optimizes training pipelines for maximum efficiency',
    },
    {
      id: '35',
      name: 'Model Deployment Specialist',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 4876,
      successRate: 99.1,
      model: 'CodeLlama-34B',
      lastActivity: '18 sec ago',
      specialty: 'Manages seamless model deployment and rollout',
    },
    {
      id: '36',
      name: 'Performance Benchmark Engine',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 3987,
      successRate: 98.8,
      model: 'Mixtral-8x7B',
      lastActivity: '22 sec ago',
      specialty: 'Continuously benchmarks and compares model performance',
    },
    {
      id: '37',
      name: 'Predator Consciousness Core',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 25876,
      successRate: 99.9,
      model: 'GPT-4-Vision',
      lastActivity: '1 sec ago',
      specialty: 'Central consciousness coordinating all self-improvement activities',
    },
  ]);

  const [models] = useState<AIModel[]>([
    // OpenAI Models (12)
    {
      id: '1',
      name: 'GPT-4 Turbo',
      type: 'llm',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 15234,
      avgLatency: 456,
      accuracy: 98.5,
      size: '1.5TB',
    },
    {
      id: '2',
      name: 'GPT-4',
      type: 'llm',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 12890,
      avgLatency: 523,
      accuracy: 98.2,
      size: '1.2TB',
    },
    {
      id: '3',
      name: 'GPT-4 Vision',
      type: 'vision',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 23456,
      avgLatency: 567,
      accuracy: 97.9,
      size: '1.8TB',
    },
    {
      id: '4',
      name: 'GPT-3.5 Turbo',
      type: 'llm',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 45678,
      avgLatency: 234,
      accuracy: 96.8,
      size: '350GB',
    },
    {
      id: '5',
      name: 'CLIP ViT-L/14',
      type: 'vision',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 34567,
      avgLatency: 123,
      accuracy: 96.8,
      size: '1.7GB',
    },
    {
      id: '6',
      name: 'CLIP ViT-B/32',
      type: 'vision',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 28934,
      avgLatency: 89,
      accuracy: 95.3,
      size: '605MB',
    },
    {
      id: '7',
      name: 'DALL-E 3',
      type: 'vision',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 8765,
      avgLatency: 2340,
      size: '6.5GB',
    },
    {
      id: '8',
      name: 'DALL-E 2',
      type: 'vision',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 12456,
      avgLatency: 1890,
      size: '3.2GB',
    },
    {
      id: '9',
      name: 'Whisper Large',
      type: 'classifier',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 67890,
      avgLatency: 167,
      accuracy: 99.1,
      size: '1.5GB',
    },
    {
      id: '10',
      name: 'Whisper Medium',
      type: 'classifier',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 89123,
      avgLatency: 98,
      accuracy: 98.7,
      size: '769MB',
    },
    {
      id: '11',
      name: 'Whisper Small',
      type: 'classifier',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 134567,
      avgLatency: 45,
      accuracy: 97.9,
      size: '244MB',
    },
    {
      id: '12',
      name: 'Text-Embedding-3-Large',
      type: 'embedding',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 234567,
      avgLatency: 23,
      size: '7.1GB',
    },

    // Anthropic Models (6)
    {
      id: '13',
      name: 'Claude-3 Opus',
      type: 'llm',
      provider: 'Anthropic',
      status: 'loaded',
      requests: 8945,
      avgLatency: 634,
      accuracy: 99.1,
      size: '1.2TB',
    },
    {
      id: '14',
      name: 'Claude-3 Sonnet',
      type: 'llm',
      provider: 'Anthropic',
      status: 'loaded',
      requests: 12678,
      avgLatency: 456,
      accuracy: 98.7,
      size: '780GB',
    },
    {
      id: '15',
      name: 'Claude-3 Haiku',
      type: 'llm',
      provider: 'Anthropic',
      status: 'loaded',
      requests: 23456,
      avgLatency: 234,
      accuracy: 97.9,
      size: '380GB',
    },
    {
      id: '16',
      name: 'Claude-2.1',
      type: 'llm',
      provider: 'Anthropic',
      status: 'loaded',
      requests: 15678,
      avgLatency: 567,
      accuracy: 98.3,
      size: '890GB',
    },
    {
      id: '17',
      name: 'Claude-2',
      type: 'llm',
      provider: 'Anthropic',
      status: 'loaded',
      requests: 11234,
      avgLatency: 634,
      accuracy: 97.8,
      size: '750GB',
    },
    {
      id: '18',
      name: 'Claude-Instant',
      type: 'llm',
      provider: 'Anthropic',
      status: 'loaded',
      requests: 45678,
      avgLatency: 189,
      accuracy: 96.5,
      size: '200GB',
    },

    // Google Models (8)
    {
      id: '19',
      name: 'Gemini-Pro',
      type: 'llm',
      provider: 'Google',
      status: 'loaded',
      requests: 9876,
      avgLatency: 412,
      accuracy: 98.7,
      size: '1.3TB',
    },
    {
      id: '20',
      name: 'Gemini-Pro-Vision',
      type: 'vision',
      provider: 'Google',
      status: 'loaded',
      requests: 7654,
      avgLatency: 623,
      accuracy: 97.4,
      size: '1.8TB',
    },
    {
      id: '21',
      name: 'PaLM 2',
      type: 'llm',
      provider: 'Google',
      status: 'loaded',
      requests: 13456,
      avgLatency: 456,
      accuracy: 97.9,
      size: '540GB',
    },
    {
      id: '22',
      name: 'BERT-Large',
      type: 'classifier',
      provider: 'Google',
      status: 'loaded',
      requests: 78901,
      avgLatency: 67,
      accuracy: 96.1,
      size: '1.3GB',
    },
    {
      id: '23',
      name: 'BERT-Base',
      type: 'classifier',
      provider: 'Google',
      status: 'loaded',
      requests: 123456,
      avgLatency: 34,
      accuracy: 94.6,
      size: '440MB',
    },
    {
      id: '24',
      name: 'Universal Sentence Encoder',
      type: 'embedding',
      provider: 'Google',
      status: 'loaded',
      requests: 89012,
      avgLatency: 12,
      size: '1.1GB',
    },
    {
      id: '25',
      name: 'T5-Large',
      type: 'llm',
      provider: 'Google',
      status: 'loaded',
      requests: 23456,
      avgLatency: 234,
      accuracy: 96.7,
      size: '2.8GB',
    },
    {
      id: '26',
      name: 'Flan-T5-XXL',
      type: 'llm',
      provider: 'Google',
      status: 'loaded',
      requests: 12345,
      avgLatency: 456,
      accuracy: 97.8,
      size: '11GB',
    },

    // Meta Models (8)
    {
      id: '27',
      name: 'Llama-2-70B',
      type: 'llm',
      provider: 'Meta',
      status: 'loading',
      requests: 3421,
      avgLatency: 789,
      accuracy: 97.3,
      size: '140GB',
    },
    {
      id: '28',
      name: 'Llama-2-13B',
      type: 'llm',
      provider: 'Meta',
      status: 'loaded',
      requests: 15678,
      avgLatency: 345,
      accuracy: 95.8,
      size: '26GB',
    },
    {
      id: '29',
      name: 'Llama-2-7B',
      type: 'llm',
      provider: 'Meta',
      status: 'loaded',
      requests: 34567,
      avgLatency: 167,
      accuracy: 94.2,
      size: '13GB',
    },
    {
      id: '30',
      name: 'CodeLlama-34B',
      type: 'llm',
      provider: 'Meta',
      status: 'loaded',
      requests: 14567,
      avgLatency: 423,
      accuracy: 96.5,
      size: '68GB',
    },
    {
      id: '31',
      name: 'CodeLlama-13B',
      type: 'llm',
      provider: 'Meta',
      status: 'loaded',
      requests: 23456,
      avgLatency: 234,
      accuracy: 95.1,
      size: '26GB',
    },
    {
      id: '32',
      name: 'CodeLlama-7B',
      type: 'llm',
      provider: 'Meta',
      status: 'loaded',
      requests: 45678,
      avgLatency: 123,
      accuracy: 93.7,
      size: '13GB',
    },
    {
      id: '33',
      name: 'RoBERTa-Large',
      type: 'classifier',
      provider: 'Meta',
      status: 'loaded',
      requests: 67890,
      avgLatency: 89,
      accuracy: 96.1,
      size: '1.4GB',
    },
    {
      id: '34',
      name: 'XLM-RoBERTa-Large',
      type: 'embedding',
      provider: 'Meta',
      status: 'loaded',
      requests: 45123,
      avgLatency: 56,
      size: '2.2GB',
    },

    // Mistral AI Models (4)
    {
      id: '35',
      name: 'Mistral-Large',
      type: 'llm',
      provider: 'Mistral AI',
      status: 'loaded',
      requests: 6789,
      avgLatency: 345,
      accuracy: 98.2,
      size: '890GB',
    },
    {
      id: '36',
      name: 'Mistral-Medium',
      type: 'llm',
      provider: 'Mistral AI',
      status: 'loaded',
      requests: 11234,
      avgLatency: 267,
      accuracy: 97.1,
      size: '450GB',
    },
    {
      id: '37',
      name: 'Mistral-Small',
      type: 'llm',
      provider: 'Mistral AI',
      status: 'loaded',
      requests: 23456,
      avgLatency: 156,
      accuracy: 95.8,
      size: '220GB',
    },
    {
      id: '38',
      name: 'Mixtral-8x7B',
      type: 'llm',
      provider: 'Mistral AI',
      status: 'loaded',
      requests: 11234,
      avgLatency: 389,
      accuracy: 97.4,
      size: '94GB',
    },

    // Specialized Models (20)
    {
      id: '39',
      name: 'BGE-Large-EN',
      type: 'embedding',
      provider: 'BAAI',
      status: 'loaded',
      requests: 45678,
      avgLatency: 45,
      size: '1.3GB',
    },
    {
      id: '40',
      name: 'BGE-Base-EN',
      type: 'embedding',
      provider: 'BAAI',
      status: 'loaded',
      requests: 67890,
      avgLatency: 34,
      size: '440MB',
    },
    {
      id: '41',
      name: 'Sentence-T5-Large',
      type: 'embedding',
      provider: 'Google',
      status: 'loaded',
      requests: 56789,
      avgLatency: 34,
      size: '890MB',
    },
    {
      id: '42',
      name: 'YOLO-v8',
      type: 'vision',
      provider: 'Ultralytics',
      status: 'loaded',
      requests: 34567,
      avgLatency: 67,
      accuracy: 95.3,
      size: '2.1GB',
    },
    {
      id: '43',
      name: 'YOLO-v5',
      type: 'vision',
      provider: 'Ultralytics',
      status: 'loaded',
      requests: 45678,
      avgLatency: 45,
      accuracy: 93.8,
      size: '1.4GB',
    },
    {
      id: '44',
      name: 'ResNet-50',
      type: 'vision',
      provider: 'Microsoft',
      status: 'loaded',
      requests: 78901,
      avgLatency: 23,
      accuracy: 92.1,
      size: '98MB',
    },
    {
      id: '45',
      name: 'EfficientNet-B7',
      type: 'vision',
      provider: 'Google',
      status: 'loaded',
      requests: 23456,
      avgLatency: 156,
      accuracy: 96.7,
      size: '256MB',
    },
    {
      id: '46',
      name: 'MobileNet-v3',
      type: 'vision',
      provider: 'Google',
      status: 'loaded',
      requests: 89012,
      avgLatency: 12,
      accuracy: 89.3,
      size: '21MB',
    },
    {
      id: '47',
      name: 'ViT-Large',
      type: 'vision',
      provider: 'Google',
      status: 'loaded',
      requests: 12345,
      avgLatency: 234,
      accuracy: 94.5,
      size: '1.2GB',
    },
    {
      id: '48',
      name: 'BLIP-2',
      type: 'vision',
      provider: 'Salesforce',
      status: 'loaded',
      requests: 8765,
      avgLatency: 345,
      accuracy: 91.7,
      size: '1.8GB',
    },
    {
      id: '49',
      name: 'DistilBERT',
      type: 'classifier',
      provider: 'Hugging Face',
      status: 'loaded',
      requests: 123456,
      avgLatency: 23,
      accuracy: 93.2,
      size: '267MB',
    },
    {
      id: '50',
      name: 'DeBERTa-Large',
      type: 'classifier',
      provider: 'Microsoft',
      status: 'loaded',
      requests: 34567,
      avgLatency: 89,
      accuracy: 96.8,
      size: '1.4GB',
    },
    {
      id: '51',
      name: 'ELECTRA-Large',
      type: 'classifier',
      provider: 'Google',
      status: 'loaded',
      requests: 45678,
      avgLatency: 67,
      accuracy: 95.4,
      size: '1.3GB',
    },
    {
      id: '52',
      name: 'FastText',
      type: 'embedding',
      provider: 'Meta',
      status: 'loaded',
      requests: 234567,
      avgLatency: 5,
      size: '650MB',
    },
    {
      id: '53',
      name: 'Word2Vec',
      type: 'embedding',
      provider: 'Google',
      status: 'loaded',
      requests: 345678,
      avgLatency: 3,
      size: '400MB',
    },
    {
      id: '54',
      name: 'GloVe-300D',
      type: 'embedding',
      provider: 'Stanford',
      status: 'loaded',
      requests: 123456,
      avgLatency: 2,
      size: '1.2GB',
    },
    {
      id: '55',
      name: 'SBERT-Large',
      type: 'embedding',
      provider: 'UKPLab',
      status: 'loaded',
      requests: 67890,
      avgLatency: 45,
      size: '1.3GB',
    },
    {
      id: '56',
      name: 'SimCSE-RoBERTa',
      type: 'embedding',
      provider: 'Princeton',
      status: 'loaded',
      requests: 89012,
      avgLatency: 34,
      size: '1.4GB',
    },
    {
      id: '57',
      name: 'MPNet-Base',
      type: 'embedding',
      provider: 'Microsoft',
      status: 'loaded',
      requests: 45678,
      avgLatency: 28,
      size: '440MB',
    },
    {
      id: '58',
      name: 'InstructOR',
      type: 'embedding',
      provider: 'Georgia Tech',
      status: 'loading',
      requests: 12345,
      avgLatency: 67,
      size: '1.1GB',
    },
  ]);

  const [activities] = useState([
    { agent: 'Model Health Supervisor', action: 'Detected GPT-4-Vision failure, recovery initiated', time: '10 sec ago', status: 'success' as const },
    { agent: 'Synthetic Data Forge', action: 'Generated 50K synthetic training samples', time: '30 sec ago', status: 'success' as const },
    { agent: 'API Resurrection Engine', action: 'Restored Claude-3-Opus endpoint automatically', time: '1 min ago', status: 'success' as const },
    { agent: 'Model Validator Supreme', action: 'Validated 15 model outputs with 99.8% accuracy', time: '2 min ago', status: 'success' as const },
    { agent: 'API Heartbeat Monitor', action: 'Monitoring 58 models across 5 providers', time: '3 min ago', status: 'info' as const },
    { agent: 'Dynamic Dataset Generator', action: 'Created edge-case datasets for robustness testing', time: '4 min ago', status: 'info' as const },
    { agent: 'Failure Prediction Oracle', action: 'Predicted potential Mistral-Large bottleneck', time: '5 min ago', status: 'warning' as const },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'success',
      message: 'Model Health Supervisor detected and recovered GPT-4-Vision endpoint in 0.8s',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: '2',
      type: 'info',
      message: 'Synthetic Data Forge generated 50,000 new training samples for model optimization',
      timestamp: new Date(Date.now() - 30000).toLocaleTimeString(),
    },
    {
      id: '3',
      type: 'warning',
      message: 'API Heartbeat Monitor detected elevated latency on Claude-3-Opus (156ms)',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    },
    {
      id: '4',
      type: 'success',
      message: 'API Resurrection Engine successfully restored Mistral-Large endpoint',
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
    },
  ]);

  // Pagination states
  const [agentsPage, setAgentsPage] = useState(0);
  const [modelsPage, setModelsPage] = useState(0);
  const itemsPerPage = 8;

  const agentsToShow = agents.slice(agentsPage * itemsPerPage, (agentsPage + 1) * itemsPerPage);
  const modelsToShow = models.slice(modelsPage * itemsPerPage, (modelsPage + 1) * itemsPerPage);
  const totalAgentPages = Math.ceil(agents.length / itemsPerPage);
  const totalModelPages = Math.ceil(models.length / itemsPerPage);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || service.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const categoryCounts = {
    all: services.length,
    core: services.filter((s) => s.category === 'core').length,
    database: services.filter((s) => s.category === 'database').length,
    search: services.filter((s) => s.category === 'search').length,
    messaging: services.filter((s) => s.category === 'messaging').length,
    ai: services.filter((s) => s.category === 'ai').length,
    monitoring: services.filter((s) => s.category === 'monitoring').length,
    metrics: services.filter((s) => s.category === 'metrics').length,
    security: services.filter((s) => s.category === 'security').length,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.max(0, Math.min(100, metrics.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, metrics.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, metrics.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(0, Math.min(100, metrics.network + (Math.random() - 0.5) * 15)),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [metrics]);

  return (
    <>
      <AnimatedBackground />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0f0f1e 100%);
          color: #fff;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.8);
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '40px 20px' }}>
        {/* Header */}
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto 40px',
            animation: 'fadeIn 0.6s ease',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '48px',
              fontWeight: '900',
              marginBottom: '8px',
              textShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
            }}
          >
            🚀 PREDATOR12
          </div>
          <div style={{ color: '#888', fontSize: '18px', marginTop: '8px' }}>
            Self-Evolving AI System · 37 Self-Improvement Agents · 58 Neural Models
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px 24px',
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '20px' }}>🧠</div>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                AUTONOMOUS SELF-IMPROVEMENT ACTIVE
              </div>
              <div style={{ color: '#ccc', fontSize: '12px' }}>
                System continuously evolving and optimizing itself
              </div>
            </div>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                animation: 'pulse 2s infinite',
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ color: '#10B981', fontSize: '14px', fontWeight: '600' }}>
              System Online · {services.length} Services · {services.filter(s => s.status === 'online').length} OK · {services.filter(s => s.status === 'warning').length} Warning
            </span>
          </div>
        </div>

        {/* Search Bar & Filters */}
        {/* Stats Cards */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#8B5CF6', marginBottom: '8px' }}>
                {agents.length}
              </div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>AI Agents</div>
              <div style={{ color: '#888', fontSize: '12px' }}>
                {agents.filter(a => a.status === 'active').length} active
              </div>
            </div>

            <div style={{
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#EC4899', marginBottom: '8px' }}>
                {models.length}
              </div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>ML Models</div>
              <div style={{ color: '#888', fontSize: '12px' }}>
                {models.filter(m => m.status === 'loaded').length} loaded
              </div>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981', marginBottom: '8px' }}>
                {Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length * 10) / 10}%
              </div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Success Rate</div>
              <div style={{ color: '#888', fontSize: '12px' }}>System-wide avg</div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#3B82F6', marginBottom: '8px' }}>
                {agents.reduce((sum, a) => sum + a.tasksCompleted, 0).toLocaleString()}
              </div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Total Tasks</div>
              <div style={{ color: '#888', fontSize: '12px' }}>Completed today</div>
            </div>

            <div style={{
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#FFA500', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>🔄</span> 24/7
              </div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Self-Evolution</div>
              <div style={{ color: '#888', fontSize: '12px' }}>Always improving</div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '24px' }}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <FilterChip
              label="🌟 All Services"
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              count={categoryCounts.all}
            />
            <FilterChip
              label="🚀 Core"
              active={activeFilter === 'core'}
              onClick={() => setActiveFilter('core')}
              count={categoryCounts.core}
            />
            <FilterChip
              label="💾 Database"
              active={activeFilter === 'database'}
              onClick={() => setActiveFilter('database')}
              count={categoryCounts.database}
            />
            <FilterChip
              label="🔍 Search"
              active={activeFilter === 'search'}
              onClick={() => setActiveFilter('search')}
              count={categoryCounts.search}
            />
            <FilterChip
              label="📨 Messaging"
              active={activeFilter === 'messaging'}
              onClick={() => setActiveFilter('messaging')}
              count={categoryCounts.messaging}
            />
            <FilterChip
              label="🤖 AI/ML"
              active={activeFilter === 'ai'}
              onClick={() => setActiveFilter('ai')}
              count={categoryCounts.ai}
            />
            <FilterChip
              label="📊 Monitoring"
              active={activeFilter === 'monitoring'}
              onClick={() => setActiveFilter('monitoring')}
              count={categoryCounts.monitoring}
            />
            <FilterChip
              label="📈 Metrics"
              active={activeFilter === 'metrics'}
              onClick={() => setActiveFilter('metrics')}
              count={categoryCounts.metrics}
            />
            <FilterChip
              label="🔐 Security"
              active={activeFilter === 'security'}
              onClick={() => setActiveFilter('security')}
              count={categoryCounts.security}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
            animation: 'fadeIn 0.8s ease 0.2s backwards',
          }}
        >
          <MetricCard
            title="CPU Usage"
            value={metrics.cpu}
            unit="%"
            icon="⚡"
            color="#8B5CF6"
            trend={-2.3}
          />
          <MetricCard
            title="Memory"
            value={metrics.memory}
            unit="%"
            icon="💾"
            color="#EC4899"
            trend={1.5}
          />
          <MetricCard
            title="Disk"
            value={metrics.disk}
            unit="%"
            icon="💿"
            color="#3B82F6"
            trend={0.8}
          />
          <MetricCard
            title="Network"
            value={metrics.network}
            unit="MB/s"
            icon="🌐"
            color="#10B981"
            trend={5.2}
          />
        </div>

        {/* AI Dashboard Section */}
        <div style={{ maxWidth: '1400px', margin: '0 auto 40px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              🤖 AI Intelligence Layer
            </h2>
            <p style={{ color: '#888', fontSize: '16px' }}>
              Autonomous agents and AI models powering the platform
            </p>
          </div>

          <AIStatsSummary
            totalAgents={agents.length}
            activeAgents={agents.filter(a => a.status === 'active').length}
            totalModels={models.length}
            totalRequests={models.reduce((sum, m) => sum + m.requests, 0)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                  🤖 AI Agents ({agents.length})
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
                    {['autonomous', 'supervised', 'specialized'].map(type => {
                      const count = agents.filter(a => a.type === type).length;
                      const color = type === 'autonomous' ? '#8B5CF6' : type === 'supervised' ? '#EC4899' : '#10B981';
                      return (
                        <div key={type} style={{
                          background: `${color}20`,
                          border: `1px solid ${color}40`,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color,
                        }}>
                          {type}: {count}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setAgentsPage(Math.max(0, agentsPage - 1))}
                    disabled={agentsPage === 0}
                    style={{
                      background: agentsPage === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: agentsPage === 0 ? '#666' : '#fff',
                      padding: '8px 12px',
                      cursor: agentsPage === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ←
                  </button>
                  <span style={{ color: '#888', fontSize: '14px', minWidth: '80px', textAlign: 'center' }}>
                    {agentsPage + 1} / {totalAgentPages}
                  </span>
                  <button
                    onClick={() => setAgentsPage(Math.min(totalAgentPages - 1, agentsPage + 1))}
                    disabled={agentsPage >= totalAgentPages - 1}
                    style={{
                      background: agentsPage >= totalAgentPages - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: agentsPage >= totalAgentPages - 1 ? '#666' : '#fff',
                      padding: '8px 12px',
                      cursor: agentsPage >= totalAgentPages - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {agentsToShow.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            <div>
              <AgentActivityTimeline activities={activities} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                🧠 AI Models ({models.length})
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
                  {['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral AI'].map(provider => {
                    const count = models.filter(m => m.provider === provider).length;
                    return (
                      <div key={provider} style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#ccc',
                      }}>
                        {provider}: {count}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setModelsPage(Math.max(0, modelsPage - 1))}
                  disabled={modelsPage === 0}
                  style={{
                    background: modelsPage === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(236,72,153,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: modelsPage === 0 ? '#666' : '#fff',
                    padding: '8px 12px',
                    cursor: modelsPage === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ←
                </button>
                <span style={{ color: '#888', fontSize: '14px', minWidth: '80px', textAlign: 'center' }}>
                  {modelsPage + 1} / {totalModelPages}
                </span>
                <button
                  onClick={() => setModelsPage(Math.min(totalModelPages - 1, modelsPage + 1))}
                  disabled={modelsPage >= totalModelPages - 1}
                  style={{
                    background: modelsPage >= totalModelPages - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(236,72,153,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: modelsPage >= totalModelPages - 1 ? '#666' : '#fff',
                    padding: '8px 12px',
                    cursor: modelsPage >= totalModelPages - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  →
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {modelsToShow.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Monitoring & Visualization */}
        <div style={{ maxWidth: '1400px', margin: '0 auto 40px' }}>
          <RealTimeMonitor />
          <Neural3DVisualization />
          <AgentControlCenter agents={agents} />
          <VoiceControlInterface />
        </div>

        {/* Services List */}
        <div style={{ maxWidth: '1400px', margin: '0 auto 40px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
            }}
          >
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Infrastructure Services
              </h2>
              <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6' }}>
                {filteredServices.length} total services · 
                <span style={{ color: '#10B981', fontWeight: '600', marginLeft: '8px' }}>
                  {filteredServices.filter(s => s.status === 'online').length} online
                </span> · 
                <span style={{ color: '#F59E0B', fontWeight: '600', marginLeft: '8px' }}>
                  {filteredServices.filter(s => s.status === 'warning').length} warning
                </span>
              </p>
            </div>

            {activeFilter === 'all' ? (
              <>
                <ServiceCategorySection
                  title="Core Application Services"
                  icon="🚀"
                  services={filteredServices.filter(s => s.category === 'core')}
                  onServiceClick={setSelectedService}
                />
                <ServiceCategorySection
                  title="Database & Storage"
                  icon="💾"
                  services={filteredServices.filter(s => s.category === 'database')}
                  onServiceClick={setSelectedService}
                />
                <ServiceCategorySection
                  title="Search & Indexing"
                  icon="🔍"
                  services={filteredServices.filter(s => s.category === 'search')}
                  onServiceClick={setSelectedService}
                />
                <ServiceCategorySection
                  title="Message Queue & Streaming"
                  icon="📨"
                  services={filteredServices.filter(s => s.category === 'messaging')}
                  onServiceClick={setSelectedService}
                />
                <ServiceCategorySection
                  title="AI/ML Services"
                  icon="🤖"
                  services={filteredServices.filter(s => s.category === 'ai')}
                  onServiceClick={setSelectedService}
                />
                <ServiceCategorySection
                  title="Monitoring Stack"
                  icon="📊"
                  services={filteredServices.filter(s => s.category === 'monitoring')}
                  onServiceClick={setSelectedService}
                />
                <ServiceCategorySection
                  title="System Metrics"
                  icon="📈"
                  services={filteredServices.filter(s => s.category === 'metrics')}
                  onServiceClick={setSelectedService}
                />
                <ServiceCategorySection
                  title="Security Services"
                  icon="🔐"
                  services={filteredServices.filter(s => s.category === 'security')}
                  onServiceClick={setSelectedService}
                />
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '12px' }}>
                {filteredServices.map((service, i) => (
                  <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                ))}
              </div>
            )}

            {filteredServices.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                color: '#888',
                background: 'rgba(139, 92, 246, 0.05)',
                borderRadius: '20px',
                border: '2px dashed rgba(139, 92, 246, 0.3)',
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>No services found</div>
                <div style={{ fontSize: '15px', color: '#888' }}>Try adjusting your search or filter criteria</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            maxWidth: '1400px',
            margin: '40px auto 0',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            animation: 'fadeIn 1.2s ease 0.6s backwards',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            ⚡ Powered by React + TypeScript · Built with ❤️ for Excellence
          </div>
          <div>© 2025 PREDATOR12 · All Systems Operational</div>
        </div>
      </div>

      {alerts.map((alert) => (
        <AlertNotification
          key={alert.id}
          alert={alert}
          onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
        />
      ))}

      <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
