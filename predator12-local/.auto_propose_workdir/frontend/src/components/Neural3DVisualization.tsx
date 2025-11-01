import React, { useEffect, useRef, useState } from 'react';

interface NeuralNode {
  id: string;
  x: number;
  y: number;
  z: number;
  activation: number;
  type: 'input' | 'hidden' | 'output';
  connections: string[];
}

interface NetworkData {
  nodes: NeuralNode[];
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    active: boolean;
  }>;
}

export const Neural3DVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [networkData, setNetworkData] = useState<NetworkData>({
    nodes: [],
    connections: []
  });

  // Генерация 3D нейронной сети
  useEffect(() => {
    const layers = [8, 16, 12, 8, 4]; // Архитектура сети
    const nodes: NeuralNode[] = [];
    const connections: NetworkData['connections'] = [];

    let nodeId = 0;
    layers.forEach((layerSize, layerIndex) => {
      for (let i = 0; i < layerSize; i++) {
        const node: NeuralNode = {
          id: `node_${nodeId}`,
          x: layerIndex * 150 - (layers.length * 75),
          y: (i - layerSize / 2) * 80,
          z: Math.sin(layerIndex + i) * 30,
          activation: Math.random(),
          type: layerIndex === 0 ? 'input' :
                layerIndex === layers.length - 1 ? 'output' : 'hidden',
          connections: []
        };
        nodes.push(node);

        // Создаем связи с предыдущим слоем
        if (layerIndex > 0) {
          const prevLayerStart = layers.slice(0, layerIndex).reduce((sum, size) => sum + size, 0);
          const prevLayerSize = layers[layerIndex - 1];

          for (let j = 0; j < prevLayerSize; j++) {
            const fromNodeId = `node_${prevLayerStart + j}`;
            const weight = Math.random() * 2 - 1;

            connections.push({
              from: fromNodeId,
              to: node.id,
              weight,
              active: Math.random() > 0.3
            });

            node.connections.push(fromNodeId);
          }
        }

        nodeId++;
      }
    });

    setNetworkData({ nodes, connections });
  }, []);

  // Анимация и рендеринг 3D сети
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || networkData.nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      if (!isPlaying) return;

      time += 0.02;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Очищаем canvas
      ctx.fillStyle = 'rgba(5, 5, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const rotationY = time * 0.5;

      // Обновляем активацию узлов
      setNetworkData(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => ({
          ...node,
          activation: Math.max(0, Math.min(1, node.activation + (Math.random() - 0.5) * 0.1))
        })),
        connections: prev.connections.map(conn => ({
          ...conn,
          active: Math.random() > 0.7 ? !conn.active : conn.active
        }))
      }));

      // Функция для 3D проекции
      const project3D = (x: number, y: number, z: number) => {
        const rotatedX = x * Math.cos(rotationY) - z * Math.sin(rotationY);
        const rotatedZ = x * Math.sin(rotationY) + z * Math.cos(rotationY);

        const scale = 300 / (300 + rotatedZ);
        return {
          x: centerX + rotatedX * scale,
          y: centerY + y * scale,
          z: rotatedZ,
          scale
        };
      };

      // Рисуем соединения
      networkData.connections.forEach(connection => {
        const fromNode = networkData.nodes.find(n => n.id === connection.from);
        const toNode = networkData.nodes.find(n => n.id === connection.to);

        if (!fromNode || !toNode) return;

        const from3D = project3D(fromNode.x, fromNode.y, fromNode.z);
        const to3D = project3D(toNode.x, toNode.y, toNode.z);

        if (connection.active) {
          const gradient = ctx.createLinearGradient(from3D.x, from3D.y, to3D.x, to3D.y);
          gradient.addColorStop(0, `rgba(139, 92, 246, ${fromNode.activation * 0.8})`);
          gradient.addColorStop(1, `rgba(236, 72, 153, ${toNode.activation * 0.8})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.abs(connection.weight) * 2;
          ctx.beginPath();
          ctx.moveTo(from3D.x, from3D.y);
          ctx.lineTo(to3D.x, to3D.y);
          ctx.stroke();

          // Пульсирующий эффект для активных соединений
          ctx.shadowColor = '#8B5CF6';
          ctx.shadowBlur = 5;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // Рисуем узлы
      networkData.nodes.forEach(node => {
        const projected = project3D(node.x, node.y, node.z);

        const radius = (10 + node.activation * 15) * projected.scale;
        const alpha = node.activation * 0.9 + 0.1;

        // Цвет в зависимости от типа узла
        let color: string;
        switch (node.type) {
          case 'input': color = `rgba(16, 185, 129, ${alpha})`; break;
          case 'output': color = `rgba(239, 68, 68, ${alpha})`; break;
          default: color = `rgba(139, 92, 246, ${alpha})`;
        }

        // Рисуем узел с градиентом
        const gradient = ctx.createRadialGradient(
          projected.x, projected.y, 0,
          projected.x, projected.y, radius
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Светящийся эффект для активных узлов
        if (node.activation > 0.7) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Числовое значение активации
        if (projected.scale > 0.5) {
          ctx.fillStyle = '#fff';
          ctx.font = `${Math.max(10, 12 * projected.scale)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(
            node.activation.toFixed(2),
            projected.x,
            projected.y + 4
          );
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [networkData, isPlaying]);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '24px',
      margin: '20px 0',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: '24px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          🧠 3D Neural Network Visualization
        </h2>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
              border: `1px solid ${isPlaying ? '#EF4444' : '#10B981'}`,
              borderRadius: '8px',
              color: '#fff',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>

          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#888',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              Input Layer
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
              Hidden Layers
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
              Output Layer
            </div>
          </div>
        </div>
      </div>

      <div style={{
        height: '500px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          color: '#888',
          fontSize: '12px',
        }}>
          Nodes: {networkData.nodes.length} | Connections: {networkData.connections.length}
        </div>

        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          color: '#888',
          fontSize: '12px',
        }}>
          Active: {networkData.connections.filter(c => c.active).length} connections
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#10B981', fontSize: '18px', fontWeight: '700' }}>
            {networkData.nodes.filter(n => n.type === 'input').length}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>Input Neurons</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8B5CF6', fontSize: '18px', fontWeight: '700' }}>
            {networkData.nodes.filter(n => n.type === 'hidden').length}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>Hidden Neurons</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#EF4444', fontSize: '18px', fontWeight: '700' }}>
            {networkData.nodes.filter(n => n.type === 'output').length}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>Output Neurons</div>
        </div>
      </div>
    </div>
  );
};

export default Neural3DVisualization;
