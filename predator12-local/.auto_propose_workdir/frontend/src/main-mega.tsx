import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

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
}

interface ChartDataPoint {
  time: string;
  value: number;
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
const ServiceCard: React.FC<{ service: ServiceStatus }> = ({ service }) => {
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
    { name: 'Backend API', status: 'online', uptime: '99.9%', requests: 1247 },
    { name: 'PostgreSQL', status: 'online', uptime: '100%', requests: 892 },
    { name: 'Redis Cache', status: 'online', uptime: '99.8%', requests: 3421 },
    { name: 'Qdrant Vector', status: 'warning', uptime: '98.5%', requests: 456 },
    { name: 'Celery Worker', status: 'online', uptime: '99.7%', requests: 234 },
    { name: 'MinIO Storage', status: 'online', uptime: '100%', requests: 678 },
  ]);

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
              System Online · All Services Operational
            </span>
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
              <p style={{ color: '#888', fontSize: '14px' }}>6 services · 5 online</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {services.map((service, i) => (
                <ServiceCard key={i} service={service} />
              ))}
            </div>
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
          <div>© 2024 PREDATOR12 · All Systems Operational</div>
        </div>
      </div>
    </>
  );
};

// Mount
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
