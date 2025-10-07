import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SearchBar, FilterChip, AlertNotification, ServiceModal } from './components/EnhancedComponents';
import {
  AgentCard,
  ModelCard,
  AIStatsSummary,
  AgentActivityTimeline
} from './components/AIComponents';
import type { AIAgent, AIModel } from './components/AIComponents';

// ============= SIMPLE APP =============
const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0f0f1e 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <div style={{ fontSize: '24px', color: '#667eea' }}>
            Loading Predator12 AI Platform...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
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

      <div style={{
        minHeight: '100vh',
        padding: '40px 20px',
        animation: 'fadeIn 0.6s ease'
      }}>
        {/* Header */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto 40px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            🚀 PREDATOR12
          </div>
          <div style={{
            color: '#888',
            fontSize: '18px',
            marginBottom: '32px'
          }}>
            Ultra-Modern AI System Dashboard · Real-Time Monitoring
          </div>
        </div>

        {/* Status Cards */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* CPU Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '12px'
              }}>
                ⚡
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
                  CPU Usage
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px'
                }}>
                  <span>45.2</span>
                  <span style={{ fontSize: '16px', color: '#888' }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Memory Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(236, 72, 153, 0.2)',
                borderRadius: '12px'
              }}>
                💾
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
                  Memory
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px'
                }}>
                  <span>68.5</span>
                  <span style={{ fontSize: '16px', color: '#888' }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Agents Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '12px'
              }}>
                🤖
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
                  AI Agents
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px'
                }}>
                  <span>30</span>
                  <span style={{ fontSize: '16px', color: '#888' }}>active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Models Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '12px'
              }}>
                🧠
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
                  AI Models
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px'
                }}>
                  <span>58</span>
                  <span style={{ fontSize: '16px', color: '#888' }}>loaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px'
        }}>
          {/* Main Dashboard */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '24px',
              color: '#fff'
            }}>
              🎯 System Status
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { name: 'Backend API', status: 'online', requests: '1.2K/min', color: '#10B981' },
                { name: 'Frontend React', status: 'online', requests: '2.1K/min', color: '#10B981' },
                { name: 'AI Model Server', status: 'online', requests: '743/min', color: '#10B981' },
                { name: 'Qdrant Vector DB', status: 'warning', requests: '456/min', color: '#F59E0B' },
                { name: 'PostgreSQL', status: 'online', requests: '892/min', color: '#10B981' },
              ].map((service, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: service.color,
                    boxShadow: `0 0 10px ${service.color}`,
                    animation: service.status === 'online' ? 'pulse 2s infinite' : 'none'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {service.name}
                    </div>
                    <div style={{ color: '#888', fontSize: '12px' }}>
                      {service.requests}
                    </div>
                  </div>
                  <div style={{
                    background: `${service.color}20`,
                    color: service.color,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {service.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '24px',
              color: '#fff'
            }}>
              🎮 Quick Actions
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { label: 'Load Full Dashboard', icon: '🚀', color: '#8B5CF6' },
                { label: 'AI Agents Panel', icon: '🤖', color: '#10B981' },
                { label: 'Models Manager', icon: '🧠', color: '#EC4899' },
                { label: 'System Monitor', icon: '📊', color: '#3B82F6' },
              ].map((action, i) => (
                <button
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: `${action.color}20`,
                    border: `1px solid ${action.color}30`,
                    borderRadius: '12px',
                    color: action.color,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onClick={() => {
                    console.log(`Loading ${action.label}...`);
                    // Here we could load the full dashboard
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${action.color}30`;
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${action.color}20`;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#10B981',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                ✅ System Ready
              </div>
              <div style={{
                fontSize: '12px',
                color: '#888'
              }}>
                All components operational
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          maxWidth: '1400px',
          margin: '40px auto 0',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          ⚡ Powered by React + TypeScript · PREDATOR12 © 2024
        </div>
      </div>
    </>
  );
};

// Mount
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
