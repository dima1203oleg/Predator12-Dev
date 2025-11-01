import React, { useState, useEffect, useRef } from 'react';

interface SystemMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  gpu: number;
  network: number;
  modelInferences: number;
  agentTasks: number;
}

interface ModelStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'recovering';
  load: number;
  responseTime: number;
  errorRate: number;
}

export const RealTimeMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([
    { id: '1', name: 'GPT-4-Turbo', status: 'active', load: 85, responseTime: 456, errorRate: 0.2 },
    { id: '2', name: 'Claude-3-Opus', status: 'active', load: 72, responseTime: 634, errorRate: 0.1 },
    { id: '3', name: 'Gemini-Pro', status: 'active', load: 63, responseTime: 412, errorRate: 0.3 },
    { id: '4', name: 'Mistral-Large', status: 'idle', load: 15, responseTime: 345, errorRate: 0.0 },
    { id: '5', name: 'CodeLlama-34B', status: 'recovering', load: 95, responseTime: 1200, errorRate: 2.1 },
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Симуляція живих метрик
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetric: SystemMetrics = {
        timestamp: Date.now(),
        cpu: Math.max(0, Math.min(100, 65 + Math.random() * 30 - 15)),
        memory: Math.max(0, Math.min(100, 78 + Math.random() * 20 - 10)),
        gpu: Math.max(0, Math.min(100, 82 + Math.random() * 25 - 12)),
        network: Math.max(0, Math.min(100, 45 + Math.random() * 40 - 20)),
        modelInferences: Math.floor(1000 + Math.random() * 500),
        agentTasks: Math.floor(50 + Math.random() * 30),
      };

      setMetrics(prev => [...prev.slice(-29), newMetric]);

      // Обновляем статусы моделей
      setModelStatuses(prev => prev.map(model => ({
        ...model,
        load: Math.max(0, Math.min(100, model.load + Math.random() * 20 - 10)),
        responseTime: Math.max(50, model.responseTime + Math.random() * 200 - 100),
        errorRate: Math.max(0, model.errorRate + Math.random() * 1 - 0.5),
        status: model.status === 'recovering' && Math.random() > 0.7 ? 'active' :
               model.status === 'active' && Math.random() > 0.95 ? 'error' :
               model.status === 'error' && Math.random() > 0.8 ? 'recovering' : model.status
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 3D графік на canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || metrics.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Очищаем canvas
    ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем сетку
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Рисуем графики метрик
    const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    const metricKeys = ['cpu', 'memory', 'gpu', 'network'];

    metricKeys.forEach((key, index) => {
      ctx.strokeStyle = colors[index];
      ctx.lineWidth = 2;
      ctx.beginPath();

      metrics.forEach((metric, i) => {
        const x = (canvas.width / (metrics.length - 1)) * i;
        const y = canvas.height - (metric[key as keyof SystemMetrics] as number / 100) * canvas.height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Добавляем свечение
      ctx.shadowColor = colors[index];
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'idle': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'recovering': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const currentMetrics = metrics[metrics.length - 1];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '24px',
      margin: '20px 0',
    }}>
      <h2 style={{
        color: '#fff',
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        📊 Real-Time System Monitor
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#10B981',
          animation: 'pulse 2s infinite',
        }} />
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Live Graphs */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Performance Metrics
          </h3>
          <div style={{ position: 'relative', height: '300px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden' }}>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {['CPU', 'Memory', 'GPU', 'Network'].map((label, index) => {
                const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
                const values = currentMetrics ? [currentMetrics.cpu, currentMetrics.memory, currentMetrics.gpu, currentMetrics.network] : [0, 0, 0, 0];
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: colors[index],
                    }} />
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>
                      {label}: {Math.round(values[index])}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Model Status */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Model Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {modelStatuses.map((model) => (
              <div key={model.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${getStatusColor(model.status)}40`,
                borderRadius: '12px',
                padding: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                    {model.name}
                  </span>
                  <div style={{
                    background: `${getStatusColor(model.status)}20`,
                    color: getStatusColor(model.status),
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    {model.status}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#888' }}>Load: </span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{Math.round(model.load)}%</span>
                  </div>
                  <div>
                    <span style={{ color: '#888' }}>RT: </span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{Math.round(model.responseTime)}ms</span>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  height: '4px',
                  marginTop: '8px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    background: getStatusColor(model.status),
                    height: '100%',
                    width: `${model.load}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      {currentMetrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8B5CF6', fontSize: '24px', fontWeight: '700' }}>
              {currentMetrics.modelInferences}
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>Inferences/min</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#EC4899', fontSize: '24px', fontWeight: '700' }}>
              {currentMetrics.agentTasks}
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>Agent Tasks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#10B981', fontSize: '24px', fontWeight: '700' }}>
              {modelStatuses.filter(m => m.status === 'active').length}/{modelStatuses.length}
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>Models Online</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#F59E0B', fontSize: '24px', fontWeight: '700' }}>
              {Math.round(modelStatuses.reduce((sum, m) => sum + m.responseTime, 0) / modelStatuses.length)}ms
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>Avg Response</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeMonitor;
