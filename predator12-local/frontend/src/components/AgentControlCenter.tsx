import React, { useState, useEffect } from 'react';

interface AgentControlProps {
  agents: Array<{
    id: string;
    name: string;
    status: string;
    type: string;
    specialty?: string;
  }>;
}

interface AgentCommand {
  id: string;
  agentId: string;
  command: string;
  parameters: any;
  timestamp: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
}

export const AgentControlCenter: React.FC<AgentControlProps> = ({ agents }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [commands, setCommands] = useState<AgentCommand[]>([]);
  const [commandHistory, setCommandHistory] = useState<AgentCommand[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');

  // Симуляция выполнения команд
  useEffect(() => {
    const interval = setInterval(() => {
      setCommands(prev => prev.map(cmd => {
        if (cmd.status === 'pending') {
          return { ...cmd, status: 'executing' };
        } else if (cmd.status === 'executing' && Math.random() > 0.7) {
          const result = generateCommandResult(cmd.command);
          const completedCommand = { ...cmd, status: 'completed' as const, result };
          setCommandHistory(prev => [completedCommand, ...prev.slice(0, 49)]);
          return completedCommand;
        }
        return cmd;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateCommandResult = (command: string): string => {
    const results = {
      'optimize': 'Performance improved by 15.3%',
      'diagnose': 'System status: Healthy | 3 minor warnings detected',
      'analyze': 'Analysis completed: 1,247 data points processed',
      'recover': 'Recovery successful: All services restored',
      'scan': 'Security scan: No vulnerabilities found',
      'generate': 'Dataset generation: 50,000 samples created',
      'validate': 'Validation completed: 99.8% accuracy confirmed',
      'monitor': 'Monitoring active: All systems operational',
    };

    const commandType = Object.keys(results).find(key => command.toLowerCase().includes(key));
    return commandType ? results[commandType as keyof typeof results] : 'Command executed successfully';
  };

  const executeCommand = (agentId: string, command: string, parameters: any = {}) => {
    const newCommand: AgentCommand = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      command,
      parameters,
      timestamp: Date.now(),
      status: 'pending'
    };

    setCommands(prev => [newCommand, ...prev]);
  };

  const quickCommands = [
    { label: 'Optimize Performance', command: 'optimize', icon: '⚡', color: '#10B981' },
    { label: 'System Diagnosis', command: 'diagnose', icon: '🔍', color: '#3B82F6' },
    { label: 'Generate Dataset', command: 'generate', icon: '📊', color: '#8B5CF6' },
    { label: 'Security Scan', command: 'scan', icon: '🛡️', color: '#EF4444' },
    { label: 'Validate Models', command: 'validate', icon: '✅', color: '#F59E0B' },
    { label: 'Recovery Mode', command: 'recover', icon: '🔄', color: '#EC4899' },
  ];

  const selectedAgentData = agents.find(a => a.id === selectedAgent);

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
        🎮 Agent Control Center
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10B981',
          borderRadius: '8px',
          color: '#10B981',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {commands.filter(c => c.status === 'executing').length} ACTIVE
        </div>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Agent Selection */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Select Agent
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                style={{
                  background: selectedAgent === agent.id ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedAgent === agent.id ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {agent.name}
                    </div>
                    <div style={{ color: '#888', fontSize: '12px', textTransform: 'capitalize' }}>
                      {agent.type} • {agent.status}
                    </div>
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: agent.status === 'active' ? '#10B981' :
                               agent.status === 'training' ? '#F59E0B' : '#6B7280',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Panel */}
        <div>
          {selectedAgentData ? (
            <>
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {selectedAgentData.name}
                </h3>
                {selectedAgentData.specialty && (
                  <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.4' }}>
                    {selectedAgentData.specialty}
                  </p>
                )}
              </div>

              {/* Quick Commands */}
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Quick Commands
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {quickCommands.map((cmd) => (
                  <button
                    key={cmd.command}
                    onClick={() => executeCommand(selectedAgent!, cmd.command)}
                    style={{
                      background: `${cmd.color}20`,
                      border: `1px solid ${cmd.color}40`,
                      borderRadius: '8px',
                      color: cmd.color,
                      padding: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${cmd.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${cmd.color}20`;
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{cmd.icon}</span>
                    {cmd.label}
                  </button>
                ))}
              </div>

              {/* Terminal */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>
                    Agent Terminal
                  </span>
                  <button
                    onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {isTerminalOpen ? '▼' : '▶'}
                  </button>
                </div>

                {isTerminalOpen && (
                  <div style={{ padding: '16px' }}>
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      marginBottom: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}>
                      {commandHistory.slice(0, 10).map((cmd) => (
                        <div key={cmd.id} style={{ marginBottom: '8px' }}>
                          <div style={{ color: '#888' }}>
                            [{new Date(cmd.timestamp).toLocaleTimeString()}]
                            {agents.find(a => a.id === cmd.agentId)?.name}
                          </div>
                          <div style={{ color: '#8B5CF6' }}>
                            $ {cmd.command}
                          </div>
                          {cmd.result && (
                            <div style={{ color: '#10B981', marginLeft: '8px' }}>
                              {cmd.result}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && terminalInput.trim()) {
                            executeCommand(selectedAgent!, terminalInput);
                            setTerminalInput('');
                          }
                        }}
                        placeholder="Enter custom command..."
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          color: '#fff',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <button
                        onClick={() => {
                          if (terminalInput.trim()) {
                            executeCommand(selectedAgent!, terminalInput);
                            setTerminalInput('');
                          }
                        }}
                        style={{
                          background: 'rgba(139, 92, 246, 0.3)',
                          border: '1px solid #8B5CF6',
                          borderRadius: '4px',
                          color: '#fff',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: '#888',
              fontSize: '16px',
            }}>
              Select an agent to control
            </div>
          )}
        </div>
      </div>

      {/* Active Commands */}
      {commands.length > 0 && (
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Active Commands ({commands.filter(c => c.status !== 'completed').length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
            {commands.filter(c => c.status !== 'completed').map((cmd) => (
              <div
                key={cmd.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                    {agents.find(a => a.id === cmd.agentId)?.name} • {cmd.command}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    {new Date(cmd.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{
                  background: cmd.status === 'pending' ? 'rgba(249, 158, 11, 0.2)' :
                             cmd.status === 'executing' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: cmd.status === 'pending' ? '#F59E0B' :
                         cmd.status === 'executing' ? '#3B82F6' : '#10B981',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  {cmd.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentControlCenter;
