import React from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0f0f1e 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px'
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
          fontSize: '24px',
          marginBottom: '24px',
          color: '#fff'
        }}>
          AI Dashboard Successfully Loaded!
        </div>

        <div style={{
          fontSize: '16px',
          color: '#888',
          marginBottom: '32px'
        }}>
          System is operational and ready for testing
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '32px'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>30+</div>
            <div style={{ fontSize: '12px', color: '#888' }}>AI Agents</div>
          </div>

          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#8B5CF6' }}>58+</div>
            <div style={{ fontSize: '12px', color: '#888' }}>AI Models</div>
          </div>

          <div style={{
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#EC4899' }}>25</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Services</div>
          </div>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', color: '#3B82F6', fontWeight: '600' }}>✅ System Status</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            All components loaded successfully. Ready for full dashboard deployment.
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
