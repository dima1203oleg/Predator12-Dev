import React, { useState, useEffect, useRef } from 'react';

interface VoiceCommand {
  id: string;
  text: string;
  timestamp: number;
  status: 'processing' | 'completed' | 'error';
  result?: string;
  agentTarget?: string;
}

export const VoiceControlInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Проверяем поддержку Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(interimTranscript);

        if (finalTranscript.trim()) {
          processVoiceCommand(finalTranscript.trim());
          setCurrentTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const processVoiceCommand = (text: string) => {
    const command: VoiceCommand = {
      id: `voice_${Date.now()}`,
      text,
      timestamp: Date.now(),
      status: 'processing'
    };

    setCommands(prev => [command, ...prev]);

    // Симуляция обработки команды
    setTimeout(() => {
      const result = interpretCommand(text);
      setCommands(prev => prev.map(cmd =>
        cmd.id === command.id
          ? { ...cmd, status: 'completed', result: result.message, agentTarget: result.agent }
          : cmd
      ));
    }, 1500);
  };

  const interpretCommand = (text: string): { message: string; agent?: string } => {
    const lowerText = text.toLowerCase();

    // Команды для конкретных агентов
    if (lowerText.includes('self healer') || lowerText.includes('heal')) {
      return {
        message: 'Predator Self-Healer activated: Running system diagnostics and repair protocols',
        agent: 'Predator Self-Healer'
      };
    }

    if (lowerText.includes('dataset') || lowerText.includes('generate data')) {
      return {
        message: 'Dynamic Dataset Generator started: Creating 10,000 synthetic training samples',
        agent: 'Dynamic Dataset Generator'
      };
    }

    if (lowerText.includes('model health') || lowerText.includes('check models')) {
      return {
        message: 'Model Health Supervisor report: All 58 models operational, 2 models optimized',
        agent: 'Model Health Supervisor'
      };
    }

    if (lowerText.includes('optimize') || lowerText.includes('performance')) {
      return {
        message: 'Quantum Code Optimizer engaged: Performance increased by 12.4%',
        agent: 'Quantum Code Optimizer'
      };
    }

    if (lowerText.includes('security') || lowerText.includes('scan')) {
      return {
        message: 'Security Vulnerability Scanner completed: No threats detected, all systems secure',
        agent: 'Security Vulnerability Scanner'
      };
    }

    if (lowerText.includes('bug') || lowerText.includes('debug')) {
      return {
        message: 'Bug Hunter Prime deployed: 3 potential issues identified and resolved',
        agent: 'Bug Hunter Prime'
      };
    }

    if (lowerText.includes('status') || lowerText.includes('report')) {
      return {
        message: 'System status: 37 agents active, 58 models loaded, performance optimal'
      };
    }

    if (lowerText.includes('neural') || lowerText.includes('architecture')) {
      return {
        message: 'Neural Architecture Evolver analyzing: 3 optimization opportunities found',
        agent: 'Neural Architecture Evolver'
      };
    }

    // Общие команды
    return {
      message: `Command processed: "${text}" - All systems responding normally`
    };
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const exampleCommands = [
    "Activate self healer",
    "Generate new dataset",
    "Check model health",
    "Optimize performance",
    "Run security scan",
    "System status report",
    "Debug and fix issues",
    "Evolve neural architecture"
  ];

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
        🎤 Voice Control Interface
        {isSupported ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10B981',
            borderRadius: '8px',
            color: '#10B981',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            READY
          </div>
        ) : (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            color: '#EF4444',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            NOT SUPPORTED
          </div>
        )}
      </h2>

      {isSupported ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Voice Controls */}
          <div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
            }}>
              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: `4px solid ${isListening ? '#EF4444' : '#10B981'}`,
                  background: isListening
                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)'
                    : 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '48px',
                  transition: 'all 0.3s ease',
                  transform: isListening ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isListening ? `0 0 30px ${isListening ? '#EF4444' : '#10B981'}50` : 'none',
                  animation: isListening ? 'pulse 2s infinite' : 'none',
                }}
              >
                {isListening ? '🛑' : '🎤'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: isListening ? '#EF4444' : '#10B981',
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  {isListening ? 'LISTENING...' : 'READY TO LISTEN'}
                </div>

                {currentTranscript && (
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#8B5CF6',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    minHeight: '20px',
                  }}>
                    "{currentTranscript}"
                  </div>
                )}
              </div>
            </div>

            {/* Example Commands */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Try saying:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {exampleCommands.map((cmd, index) => (
                  <div
                    key={index}
                    onClick={() => processVoiceCommand(cmd)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ccc',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                      e.currentTarget.style.color = '#8B5CF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#ccc';
                    }}
                  >
                    "{cmd}"
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Command History */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Voice Command History
            </h3>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {commands.map((command) => (
                <div
                  key={command.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                        "{command.text}"
                      </div>
                      <div style={{ color: '#888', fontSize: '12px' }}>
                        {new Date(command.timestamp).toLocaleTimeString()}
                        {command.agentTarget && (
                          <span style={{ color: '#8B5CF6', marginLeft: '8px' }}>
                            → {command.agentTarget}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      background: command.status === 'processing' ? 'rgba(249, 158, 11, 0.2)' :
                                 command.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: command.status === 'processing' ? '#F59E0B' :
                             command.status === 'completed' ? '#10B981' : '#EF4444',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {command.status}
                    </div>
                  </div>

                  {command.result && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#10B981',
                      fontSize: '12px',
                      lineHeight: '1.4',
                    }}>
                      {command.result}
                    </div>
                  )}
                </div>
              ))}

              {commands.length === 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  color: '#888',
                  fontSize: '16px',
                }}>
                  No voice commands yet. Click the microphone to start!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: '#888',
          fontSize: '16px',
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
            Voice control is not supported in your browser.
            <br />
            Try using Chrome or Edge for voice commands.
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControlInterface;
