import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SearchBar, FilterChip, AlertNotification, ServiceModal } from './components/EnhancedComponents';
import {
  AgentCard,
  ModelCard,
  AIStatsSummary,
  AgentActivityTimeline,
  TrainingPipelineCard,
  ModelComparisonTable,
  AgentControlPanel,
  AIMetricsDashboard
} from './components/AIComponents';
import type { AIAgent, AIModel, TrainingPipeline } from './components/AIComponents';
import { AIAgentsSection } from './components/ai/AIAgentsSection';

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
  lastCheck?: string;
  category?: string;
}

interface ChartDataPoint {
  time: string;
  value: number;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

interface AIAgent {
  id: string;
  name: string;
  type: 'autonomous' | 'supervised' | 'specialized';
  status: 'active' | 'idle' | 'training';
  tasksCompleted: number;
  successRate: number;
  model: string;
  lastActivity: string;
}

interface AIModel {
  id: string;
  name: string;
  type: 'llm' | 'vision' | 'embedding' | 'classifier';
  provider: string;
  status: 'loaded' | 'loading' | 'error';
  requests: number;
  avgLatency: number;
  accuracy?: number;
  size: string;
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

    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

    // Create particles
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

        // Connect nearby particles
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
      {/* Gradient Background */}
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

        {/* Progress Bar */}
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

        {/* Trend */}
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
const CategoryHeader: React.FC<{ title: string; icon: string; count: number }> = ({ title, icon, count }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginTop: '24px',
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', flex: 1 }}>
        {title}
      </h3>
      <span style={{
        background: 'rgba(139, 92, 246, 0.2)',
        color: '#8B5CF6',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {count}
      </span>
    </div>
  );
};

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
        padding: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 15px ${color}`,
            animation: service.status === 'online' ? 'pulse 2s infinite' : 'none',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>{service.name}</div>
          <div style={{ color: '#888', fontSize: '12px' }}>Uptime: {service.uptime}</div>
        </div>
        <div
          style={{
            background: `${color}20`,
            color: color,
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {service.status}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px' }}>
        <span>Requests</span>
        <span style={{ color: '#fff', fontWeight: '600' }}>
          {service.requests.toLocaleString()}/min
        </span>
      </div>
    </div>
  );
};

// ============= MINI CHART =============
const MiniChart: React.FC<{ data: ChartDataPoint[]; color: string }> = ({ data, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...data.map((d) => d.value));
    const min = Math.min(...data.map((d) => d.value));
    const range = max - min || 1;

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((point.value - min) / range) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((point.value - min) / range) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [data, color]);

  return <canvas ref={canvasRef} width={300} height={80} style={{ width: '100%', height: '80px' }} />;
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
    // Core Application Services (5)
    { name: 'Backend API', status: 'online', uptime: '99.9%', requests: 1247, responseTime: 45, lastCheck: '2s ago', category: 'core' },
    { name: 'Frontend React', status: 'online', uptime: '100%', requests: 2156, responseTime: 12, lastCheck: '1s ago', category: 'core' },
    { name: 'Celery Worker', status: 'online', uptime: '99.7%', requests: 234, responseTime: 78, lastCheck: '3s ago', category: 'core' },
    { name: 'Celery Scheduler', status: 'online', uptime: '99.8%', requests: 156, responseTime: 23, lastCheck: '5s ago', category: 'core' },
    { name: 'Agent Supervisor', status: 'online', uptime: '99.6%', requests: 834, responseTime: 56, lastCheck: '2s ago', category: 'core' },

    // Database & Storage (4)
    { name: 'PostgreSQL', status: 'online', uptime: '100%', requests: 892, responseTime: 15, lastCheck: '1s ago', category: 'database' },
    { name: 'Redis Cache', status: 'online', uptime: '99.8%', requests: 3421, responseTime: 3, lastCheck: '1s ago', category: 'database' },
    { name: 'MinIO Storage', status: 'online', uptime: '100%', requests: 678, responseTime: 89, lastCheck: '4s ago', category: 'database' },
    { name: 'Qdrant Vector', status: 'warning', uptime: '98.5%', requests: 456, responseTime: 156, lastCheck: '10s ago', category: 'database' },

    // Search & Indexing (2)
    { name: 'OpenSearch', status: 'online', uptime: '99.9%', requests: 2145, responseTime: 67, lastCheck: '2s ago', category: 'search' },
    { name: 'OpenSearch Dashboard', status: 'online', uptime: '99.8%', requests: 567, responseTime: 123, lastCheck: '3s ago', category: 'search' },

    // Message Queue & Event Streaming (1)
    { name: 'Redpanda Kafka', status: 'online', uptime: '99.7%', requests: 1876, responseTime: 34, lastCheck: '2s ago', category: 'queue' },

    // AI/ML Services (1)
    { name: 'Model SDK', status: 'online', uptime: '99.5%', requests: 743, responseTime: 234, lastCheck: '5s ago', category: 'ai' },

    // Monitoring Stack (7)
    { name: 'Prometheus', status: 'online', uptime: '100%', requests: 445, responseTime: 56, lastCheck: '1s ago', category: 'monitoring' },
    { name: 'Grafana', status: 'online', uptime: '100%', requests: 789, responseTime: 78, lastCheck: '2s ago', category: 'monitoring' },
    { name: 'Loki Logs', status: 'online', uptime: '99.9%', requests: 2341, responseTime: 43, lastCheck: '1s ago', category: 'monitoring' },
    { name: 'Promtail', status: 'online', uptime: '99.9%', requests: 3567, responseTime: 23, lastCheck: '1s ago', category: 'monitoring' },
    { name: 'Tempo Tracing', status: 'online', uptime: '99.8%', requests: 1234, responseTime: 67, lastCheck: '2s ago', category: 'monitoring' },
    { name: 'AlertManager', status: 'online', uptime: '100%', requests: 67, responseTime: 45, lastCheck: '3s ago', category: 'monitoring' },
    { name: 'Blackbox Exporter', status: 'online', uptime: '100%', requests: 234, responseTime: 12, lastCheck: '1s ago', category: 'monitoring' },

    // System Metrics (2)
    { name: 'cAdvisor', status: 'online', uptime: '100%', requests: 567, responseTime: 34, lastCheck: '1s ago', category: 'system' },
    { name: 'Node Exporter', status: 'online', uptime: '100%', requests: 890, responseTime: 23, lastCheck: '1s ago', category: 'system' },

    // Security & Auth (1)
    { name: 'Keycloak Auth', status: 'online', uptime: '100%', requests: 445, responseTime: 89, lastCheck: '2s ago', category: 'security' },
  ]);

  // AI Agents Data - EXPANDED TO 12 AGENTS
  const [agents] = useState<AIAgent[]>([
    {
      id: '1',
      name: 'Alpha Agent',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 1247,
      successRate: 98.5,
      model: 'GPT-4',
      lastActivity: '2 min ago',
    },
    {
      id: '2',
      name: 'Beta Supervisor',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 856,
      successRate: 99.2,
      model: 'Claude-3',
      lastActivity: '5 min ago',
    },
    {
      id: '3',
      name: 'Gamma Specialist',
      type: 'specialized',
      status: 'idle',
      tasksCompleted: 2341,
      successRate: 97.8,
      model: 'GPT-4',
      lastActivity: '15 min ago',
    },
    {
      id: '4',
      name: 'Delta Analyzer',
      type: 'autonomous',
      status: 'training',
      tasksCompleted: 543,
      successRate: 96.5,
      model: 'Llama-2-70B',
      lastActivity: '1 min ago',
    },
    {
      id: '5',
      name: 'Epsilon Coordinator',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 1892,
      successRate: 99.7,
      model: 'GPT-4-Turbo',
      lastActivity: '30 sec ago',
    },
    {
      id: '6',
      name: 'Zeta Vision Agent',
      type: 'specialized',
      status: 'active',
      tasksCompleted: 3456,
      successRate: 99.1,
      model: 'GPT-4-Vision',
      lastActivity: '1 min ago',
    },
    {
      id: '7',
      name: 'Eta Code Assistant',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 5678,
      successRate: 97.3,
      model: 'CodeLlama-34B',
      lastActivity: '45 sec ago',
    },
    {
      id: '8',
      name: 'Theta Researcher',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 2890,
      successRate: 98.9,
      model: 'Claude-3-Opus',
      lastActivity: '3 min ago',
    },
    {
      id: '9',
      name: 'Iota Data Miner',
      type: 'specialized',
      status: 'training',
      tasksCompleted: 4123,
      successRate: 96.7,
      model: 'Mistral-Large',
      lastActivity: '2 min ago',
    },
    {
      id: '10',
      name: 'Kappa Security Bot',
      type: 'autonomous',
      status: 'active',
      tasksCompleted: 6789,
      successRate: 99.5,
      model: 'GPT-4',
      lastActivity: '20 sec ago',
    },
    {
      id: '11',
      name: 'Lambda Translator',
      type: 'specialized',
      status: 'idle',
      tasksCompleted: 1567,
      successRate: 98.2,
      model: 'Mixtral-8x7B',
      lastActivity: '10 min ago',
    },
    {
      id: '12',
      name: 'Mu Optimizer',
      type: 'supervised',
      status: 'active',
      tasksCompleted: 3234,
      successRate: 97.6,
      model: 'Gemini-Pro',
      lastActivity: '1 min ago',
    },
  ]);

  // AI Models Data - EXPANDED TO 15 MODELS
  const [models] = useState<AIModel[]>([
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
      name: 'Claude-3 Opus',
      type: 'llm',
      provider: 'Anthropic',
      status: 'loaded',
      requests: 8945,
      avgLatency: 523,
      accuracy: 99.1,
      size: '1.2TB',
    },
    {
      id: '3',
      name: 'CLIP ViT-L/14',
      type: 'vision',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 23456,
      avgLatency: 123,
      accuracy: 96.8,
      size: '1.7GB',
    },
    {
      id: '4',
      name: 'BGE-Large-EN',
      type: 'embedding',
      provider: 'BAAI',
      status: 'loaded',
      requests: 45678,
      avgLatency: 45,
      size: '1.3GB',
    },
    {
      id: '5',
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
      id: '6',
      name: 'BERT-Classifier',
      type: 'classifier',
      provider: 'Google',
      status: 'loaded',
      requests: 12345,
      avgLatency: 78,
      accuracy: 94.6,
      size: '440MB',
    },
    {
      id: '7',
      name: 'GPT-4 Vision',
      type: 'vision',
      provider: 'OpenAI',
      status: 'loaded',
      requests: 18934,
      avgLatency: 567,
      accuracy: 97.9,
      size: '1.8TB',
    },
    {
      id: '8',
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
      id: '9',
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
      id: '10',
      name: 'Sentence-T5',
      type: 'embedding',
      provider: 'Google',
      status: 'loaded',
      requests: 56789,
      avgLatency: 34,
      size: '890MB',
    },
    {
      id: '11',
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
      id: '12',
      name: 'RoBERTa-Large',
      type: 'classifier',
      provider: 'Facebook',
      status: 'loaded',
      requests: 23456,
      avgLatency: 89,
      accuracy: 96.1,
      size: '1.4GB',
    },
    {
      id: '13',
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
      id: '14',
      name: 'Mixtral-8x7B',
      type: 'llm',
      provider: 'Mistral AI',
      status: 'loaded',
      requests: 11234,
      avgLatency: 389,
      accuracy: 97.4,
      size: '94GB',
    },
    {
      id: '15',
      name: 'XLM-RoBERTa',
      type: 'embedding',
      provider: 'Facebook',
      status: 'loaded',
      requests: 45123,
      avgLatency: 56,
      size: '2.2GB',
    },
  ]);

  // Agent Activity
  const [activities] = useState([
    { agent: 'Alpha Agent', action: 'Completed data analysis task', time: '2 min ago', status: 'success' as const },
    { agent: 'Epsilon Coordinator', action: 'Coordinated 5 agents successfully', time: '5 min ago', status: 'success' as const },
    { agent: 'Delta Analyzer', action: 'Started training on new dataset', time: '8 min ago', status: 'info' as const },
    { agent: 'Beta Supervisor', action: 'Reviewed 23 tasks', time: '12 min ago', status: 'success' as const },
    { agent: 'Gamma Specialist', action: 'Failed to process image batch', time: '15 min ago', status: 'error' as const },
    { agent: 'Alpha Agent', action: 'Generated report successfully', time: '18 min ago', status: 'success' as const },
  ]);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Qdrant Vector DB experiencing high response times (156ms)',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Filter services based on search and category
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || service.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Category counts
  const categoryCounts = {
    all: services.length,
    core: services.filter((s) => s.category === 'core').length,
    database: services.filter((s) => s.category === 'database').length,
    search: services.filter((s) => s.category === 'search').length,
    queue: services.filter((s) => s.category === 'queue').length,
    ai: services.filter((s) => s.category === 'ai').length,
    monitoring: services.filter((s) => s.category === 'monitoring').length,
    system: services.filter((s) => s.category === 'system').length,
    security: services.filter((s) => s.category === 'security').length,
  };

  const [chartData] = useState<ChartDataPoint[]>(
    Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      value: Math.random() * 100,
    }))
  );

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.max(0, Math.min(100, metrics.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, metrics.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, metrics.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(0, Math.min(100, metrics.network + (Math.random() - 0.5) * 15)),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [metrics]);

  return (
    <>
      <AnimatedBackground />

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
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
            Ultra-Modern AI System Dashboard · Real-Time Monitoring
          </div>

          {/* Live Status Badge */}
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
              System Online · 25 Services · 24 OK · 1 Warning (Qdrant)
            </span>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '24px' }}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <FilterChip
              label="All Services"
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              count={categoryCounts.all}
            />
            <FilterChip
              label="Core"
              active={activeFilter === 'core'}
              onClick={() => setActiveFilter('core')}
              count={categoryCounts.core}
            />
            <FilterChip
              label="Database"
              active={activeFilter === 'database'}
              onClick={() => setActiveFilter('database')}
              count={categoryCounts.database}
            />
            <FilterChip
              label="Search"
              active={activeFilter === 'search'}
              onClick={() => setActiveFilter('search')}
              count={categoryCounts.search}
            />
            <FilterChip
              label="AI/ML"
              active={activeFilter === 'ai'}
              onClick={() => setActiveFilter('ai')}
              count={categoryCounts.ai}
            />
            <FilterChip
              label="Monitoring"
              active={activeFilter === 'monitoring'}
              onClick={() => setActiveFilter('monitoring')}
              count={categoryCounts.monitoring}
            />
            <FilterChip
              label="Security"
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
            {/* AI Agents */}
            <div>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
                🤖 AI Agents ({agents.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <AgentActivityTimeline activities={activities} />
            </div>
          </div>

          {/* AI Models */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              🧠 AI Models ({models.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {models.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            animation: 'fadeIn 1s ease 0.4s backwards',
          }}
        >
          {/* Chart Section */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                System Performance
              </h2>
              <p style={{ color: '#888', fontSize: '14px' }}>Real-time monitoring · Last 24 hours</p>
            </div>
            <MiniChart data={chartData} color="#8B5CF6" />

            {/* Quick Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginTop: '24px',
              }}
            >
              {[
                { label: 'Requests', value: '12.4K', change: '+12%' },
                { label: 'Avg Response', value: '45ms', change: '-8%' },
                { label: 'Error Rate', value: '0.02%', change: '-15%' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: stat.change.startsWith('+') ? '#10B981' : '#EF4444',
                    }}
                  >
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services List */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                Service Status
              </h2>
              <p style={{ color: '#888', fontSize: '14px' }}>
                {filteredServices.length} services · {filteredServices.filter(s => s.status === 'online').length} online · {filteredServices.filter(s => s.status === 'warning').length} warning
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeFilter === 'all' || activeFilter === 'core' ? (
                <>
                  <CategoryHeader title="Core Application Services" icon="⚙️" count={filteredServices.filter(s => s.category === 'core').length} />
                  {filteredServices.filter(s => s.category === 'core').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {activeFilter === 'all' || activeFilter === 'database' ? (
                <>
                  <CategoryHeader title="Database & Storage" icon="🗄️" count={filteredServices.filter(s => s.category === 'database').length} />
                  {filteredServices.filter(s => s.category === 'database').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {activeFilter === 'all' || activeFilter === 'search' ? (
                <>
                  <CategoryHeader title="Search & Indexing" icon="🔍" count={filteredServices.filter(s => s.category === 'search').length} />
                  {filteredServices.filter(s => s.category === 'search').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {activeFilter === 'all' || activeFilter === 'queue' ? (
                <>
                  <CategoryHeader title="Message Queue & Event Streaming" icon="📦" count={filteredServices.filter(s => s.category === 'queue').length} />
                  {filteredServices.filter(s => s.category === 'queue').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {activeFilter === 'all' || activeFilter === 'ai' ? (
                <>
                  <CategoryHeader title="AI/ML Services" icon="🤖" count={filteredServices.filter(s => s.category === 'ai').length} />
                  {filteredServices.filter(s => s.category === 'ai').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {activeFilter === 'all' || activeFilter === 'monitoring' ? (
                <>
                  <CategoryHeader title="Monitoring Stack" icon="📊" count={filteredServices.filter(s => s.category === 'monitoring').length} />
                  {filteredServices.filter(s => s.category === 'monitoring').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {activeFilter === 'all' || activeFilter === 'system' ? (
                <>
                  <CategoryHeader title="System Metrics" icon="📈" count={filteredServices.filter(s => s.category === 'system').length} />
                  {filteredServices.filter(s => s.category === 'system').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {activeFilter === 'all' || activeFilter === 'security' ? (
                <>
                  <CategoryHeader title="Security & Auth" icon="🔒" count={filteredServices.filter(s => s.category === 'security').length} />
                  {filteredServices.filter(s => s.category === 'security').map((service, i) => (
                    <ServiceCard key={i} service={service} onClick={() => setSelectedService(service)} />
                  ))}
                </>
              ) : null}

              {filteredServices.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#888',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No services found</div>
                  <div style={{ fontSize: '14px' }}>Try adjusting your search or filter criteria</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Agents & Models Section */}
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <AIAgentsSection />
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
          <div>© 2024 PREDATOR12 · All Systems Operational</div>
        </div>
      </div>

      {/* Alert Notifications */}
      {alerts.map((alert) => (
        <AlertNotification
          key={alert.id}
          alert={alert}
          onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
        />
      ))}

      {/* Service Details Modal */}
      <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
    </>
  );
};

// Mount
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
