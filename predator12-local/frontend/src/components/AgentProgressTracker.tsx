import React, { useState, useEffect } from 'react';

interface AgentTask {
  agentId: string;
  agentName: string;
  task: string;
  progress: number;
  status: 'ok' | 'busy' | 'error';
  eta?: string;
}

const AgentProgressTracker: React.FC = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([
    {
      agentId: '1',
      agentName: 'Predator Self-Healer',
      task: 'Running system diagnostics and repair protocols',
      progress: 67,
      status: 'busy',
      eta: '45s'
    },
    {
      agentId: '2',
      agentName: 'Dynamic Dataset Generator',
      task: 'Generating 10,000 synthetic training samples',
      progress: 89,
      status: 'busy',
      eta: '12s'
    },
    {
      agentId: '3',
      agentName: 'Model Health Supervisor',
      task: 'Monitoring 58 models across 5 providers',
      progress: 100,
      status: 'ok'
    },
    {
      agentId: '4',
      agentName: 'Quantum Code Optimizer',
      task: 'Optimizing codebase for performance',
      progress: 45,
      status: 'busy',
      eta: '2m 15s'
    },
    {
      agentId: '5',
      agentName: 'Security Vulnerability Scanner',
      task: 'Scanning for security vulnerabilities',
      progress: 100,
      status: 'ok'
    },
    {
      agentId: '6',
      agentName: 'Bug Hunter Prime',
      task: 'Proactively hunting and eliminating bugs',
      progress: 34,
      status: 'busy',
      eta: '3m 45s'
    },
    {
      agentId: '7',
      agentName: 'Neural Architecture Evolver',
      task: 'Analyzing and evolving neural network architectures',
      progress: 78,
      status: 'busy',
      eta: '1m 30s'
    },
    {
      agentId: '8',
      agentName: 'Auto-Documentation Writer',
      task: 'Generating and updating system documentation',
      progress: 92,
      status: 'busy',
      eta: '23s'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.status === 'busy' && task.progress < 100) {
          const increment = Math.random() * 5;
          const newProgress = Math.min(100, task.progress + increment);
          
          if (newProgress >= 100) {
            return { ...task, progress: 100, status: 'ok' as const, eta: undefined };
          }
          
          return { ...task, progress: newProgress };
        }
        return task;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="agent-progress-section">
      <h2 className="app-header-title section-title-md">Agent Activity Monitor</h2>
      <div className="subtitle-dim section-subtitle">
        Real-time progress tracking · Self-improvement · Auto-healing
      </div>
      
      <div className="agent-progress-grid">
        {tasks.map(task => (
          <div key={task.agentId} className="agent-progress-card">
            <div className="agent-progress-header">
              <div className="agent-progress-name">{task.agentName}</div>
              <div className={`agent-progress-status ${task.status}`}>
                {task.status === 'ok' ? '✓' : task.status === 'busy' ? '⚡' : '⚠'}
              </div>
            </div>
            <div className="agent-progress-task">{task.task}</div>
            <div className="agent-progress-bar">
              <span style={{ width: `${task.progress}%` }} aria-label={`Progress: ${Math.round(task.progress)}%`} />
            </div>
            <div className="agent-progress-meta">
              <span>{Math.round(task.progress)}%</span>
              {task.eta && <span>ETA: {task.eta}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentProgressTracker;
