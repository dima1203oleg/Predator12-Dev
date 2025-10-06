// @ts-nocheck
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState({
    uptime: 0,
    requests: 0,
    status: 'online',
    cpu: 45,
    memory: 62,
    activeUsers: 127
  });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setStats(prev => ({
        ...prev,
        uptime: prev.uptime + 1,
        requests: prev.requests + Math.floor(Math.random() * 5),
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(40, Math.min(85, prev.memory + (Math.random() - 0.5) * 5)),
        activeUsers: Math.max(100, Math.min(200, prev.activeUsers + Math.floor(Math.random() * 10 - 5)))
      }));
    }, 1000);

    // Generate particles for background
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10
    }));
    setParticles(newParticles);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  const GlassCard = ({ children, delay = 0 }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '25px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      transition: 'all 0.3s ease',
      animation: `slideUp 0.6s ease-out ${delay}s both`,
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 15px 45px 0 rgba(31, 38, 135, 0.5)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
    }}>
      {children}
    </div>
  );

  const MetricCard = ({ icon, title, value, subtitle, color, trend, delay }) => (
    <GlassCard delay={delay}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '10px',
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
          }}>
            {icon}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '600'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: color,
            textShadow: `0 0 20px ${color}`,
            marginBottom: '5px'
          }}>
            {value}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            {subtitle}
          </div>
        </div>
        {trend && (
          <div style={{
            fontSize: '24px',
            color: trend > 0 ? '#4ade80' : '#f87171',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            {trend > 0 ? '↗' : '↘'}
          </div>
        )}
      </div>
    </GlassCard>
  );

  const ProgressRing = ({ progress, color, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            fill: color,
            transform: 'rotate(90deg)',
            transformOrigin: 'center'
          }}
        >
          {Math.round(progress)}%
        </text>
      </svg>
    );
  };

  const SystemStatusBar = ({ label, value, max, color }) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        <span>{label}</span>
        <span>{value}{max ? `/${max}` : '%'}</span>
      </div>
      <div style={{
        height: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${(value / max) * 100}%`,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          borderRadius: '10px',
          transition: 'width 0.5s ease',
          boxShadow: `0 0 10px ${color}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 2s infinite'
          }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
          50% { filter: drop-shadow(0 0 20px currentColor); }
        }

        @keyframes particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .neon-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
                       0 0 20px rgba(255, 255, 255, 0.6),
                       0 0 30px rgba(102, 126, 234, 0.8);
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        padding: '30px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: `particle ${particle.duration}s linear infinite`,
              animationDelay: `${particle.id * 0.5}s`,
              pointerEvents: 'none'
            }}
          />
        ))}

        {/* Header with Mega Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          animation: 'fadeIn 1s ease-in'
        }}>
          <h1 className="gradient-text neon-glow" style={{
            fontSize: '72px',
            fontWeight: '900',
            marginBottom: '10px',
            letterSpacing: '-2px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            🚀 PREDATOR AI
          </h1>
          <p style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '300',
            letterSpacing: '4px',
            textTransform: 'uppercase'
          }}>
            Enterprise-Grade Intelligence Platform
          </p>
          <div style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: 'rgba(76, 222, 128, 0.2)',
            border: '2px solid #4ade80',
            borderRadius: '25px',
            display: 'inline-block',
            color: '#4ade80',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 0 20px rgba(76, 222, 128, 0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            ✓ ALL SYSTEMS OPERATIONAL
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '1400px',
          margin: '0 auto 40px'
        }}>
          <MetricCard
            icon="🤖"
            title="AI Models"
            value="120+"
            subtitle="Active models ready"
            color="#60a5fa"
            trend={1}
            delay={0}
          />
          <MetricCard
            icon="⚡"
            title="Requests"
            value={stats.requests}
            subtitle="Total processed"
            color="#fbbf24"
            trend={1}
            delay={0.1}
          />
          <MetricCard
            icon="👥"
            title="Active Users"
            value={stats.activeUsers}
            subtitle="Online now"
            color="#a78bfa"
            trend={stats.activeUsers > 150 ? 1 : -1}
            delay={0.2}
          />
          <MetricCard
            icon="⏱️"
            title="Uptime"
            value={formatUptime(stats.uptime)}
            subtitle="System reliability"
            color="#34d399"
            trend={1}
            delay={0.3}
          />
        </div>

        {/* System Performance Dashboard */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Resource Usage */}
          <GlassCard delay={0.4}>
            <h3 style={{
              color: 'white',
              fontSize: '24px',
              marginBottom: '25px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              📊 System Resources
            </h3>
            <SystemStatusBar
              label="CPU Usage"
              value={stats.cpu}
              max={100}
              color="#3b82f6"
            />
            <SystemStatusBar
              label="Memory"
              value={stats.memory}
              max={100}
              color="#8b5cf6"
            />
            <SystemStatusBar
              label="Storage"
              value={45}
              max={100}
              color="#ec4899"
            />
            <SystemStatusBar
              label="Network I/O"
              value={67}
              max={100}
              color="#14b8a6"
            />
          </GlassCard>

          {/* Performance Rings */}
          <GlassCard delay={0.5}>
            <h3 style={{
              color: 'white',
              fontSize: '24px',
              marginBottom: '25px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              🎯 Performance Metrics
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <ProgressRing progress={stats.cpu} color="#3b82f6" />
                <div style={{ color: 'white', marginTop: '10px', fontWeight: '600' }}>CPU</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <ProgressRing progress={stats.memory} color="#8b5cf6" />
                <div style={{ color: 'white', marginTop: '10px', fontWeight: '600' }}>Memory</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <ProgressRing progress={98.5} color="#10b981" />
                <div style={{ color: 'white', marginTop: '10px', fontWeight: '600' }}>Success</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Feature Showcase */}
        <GlassCard delay={0.6}>
          <h3 style={{
            color: 'white',
            fontSize: '28px',
            marginBottom: '30px',
            fontWeight: '700',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            ✨ Platform Capabilities
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {[
              { icon: '🧠', title: 'Machine Learning', desc: 'Advanced AI models' },
              { icon: '🔒', title: 'Security', desc: 'Enterprise-grade' },
              { icon: '📈', title: 'Analytics', desc: 'Real-time insights' },
              { icon: '🚀', title: 'Performance', desc: 'Lightning fast' },
              { icon: '🔄', title: 'Auto-scaling', desc: 'Dynamic resources' },
              { icon: '🌐', title: 'Multi-cloud', desc: 'Hybrid deployment' }
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  animation: `slideUp 0.6s ease-out ${0.7 + i * 0.1}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '10px',
                  animation: 'glow 2s ease-in-out infinite'
                }}>
                  {feature.icon}
                </div>
                <div style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '5px'
                }}>
                  {feature.title}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '13px'
                }}>
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Live Status Footer */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          animation: 'fadeIn 1.5s ease-in'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '15px 30px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <span style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Live • {time.toLocaleTimeString('uk-UA')}
            </span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px'
            }}>
              27/27 services online
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
