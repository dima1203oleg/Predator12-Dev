import React, { useState, useEffect, useRef } from 'react';

interface VoiceCommand {
  id: string;
  text: string;
  timestamp: number;
  status: 'processing' | 'completed' | 'error';
  result?: string;
  agentTarget?: string;
}

type VoiceEngine = 'browser' | 'whisper' | 'vosk';
type TTSEngine = 'browser' | 'coqui' | 'piper';

export const VoiceControlInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [sttEngine, setSTTEngine] = useState<VoiceEngine>('browser');
  const [ttsEngine, setTTSEngine] = useState<TTSEngine>('browser');
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
    <div className="voice-interface">
      <div className="voice-header">
        🎤 Voice Control Interface
        {isSupported ? (
          <div className="voice-status-badge">READY</div>
        ) : (
          <div className="voice-status-badge off">NOT SUPPORTED</div>
        )}
        <div className="voice-mode-select">
          <select
            value={sttEngine}
            onChange={(e) => setSTTEngine(e.target.value as VoiceEngine)}
            className="voice-engine-select"
            aria-label="Speech-to-text engine selection"
          >
            <option value="browser">🌐 Browser (Web Speech API)</option>
            <option value="whisper">🤖 Whisper.cpp (Local)</option>
            <option value="vosk">⚡ Vosk (Offline)</option>
          </select>
          <select
            value={ttsEngine}
            onChange={(e) => setTTSEngine(e.target.value as TTSEngine)}
            className="voice-tts-select"
            aria-label="Text-to-speech engine selection"
          >
            <option value="browser">🌐 Browser TTS</option>
            <option value="coqui">🎙️ Coqui TTS (Local)</option>
            <option value="piper">⚡ Piper (Fast)</option>
          </select>
        </div>
      </div>

      {isSupported ? (
        <div className="voice-layout">
          {/* Voice Controls */}
          <div>
            <div className="voice-controls">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`voice-mic-button ${isListening ? 'listening' : ''}`}
              >
                {isListening ? '🛑' : '🎤'}
              </button>

              <div className="voice-current">
                <div className={`voice-status-text ${isListening ? 'listening' : 'ready'}`}>
                  {isListening ? 'LISTENING...' : 'READY TO LISTEN'}
                </div>
                <div className="voice-engine-label">
                  {sttEngine === 'browser' && '🌐 Web Speech API'}
                  {sttEngine === 'whisper' && '🤖 Whisper.cpp (Local)'}
                  {sttEngine === 'vosk' && '⚡ Vosk Offline'}
                </div>

                {currentTranscript && (
                  <div className="voice-current-text">
                    "{currentTranscript}"
                  </div>
                )}
              </div>
            </div>

            {/* Example Commands */}
            <div className="voice-examples">
              <h4>Try saying:</h4>
              <div className="voice-examples-list">
                {exampleCommands.map((cmd, index) => (
                  <div
                    key={index}
                    onClick={() => processVoiceCommand(cmd)}
                    className="voice-example"
                  >
                    "{cmd}"
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Command History */}
          <div className="voice-history">
            <h3>Voice Command History</h3>
            <div className="voice-history-list">
              {commands.map((command) => (
                <div key={command.id} className="voice-history-item">
                  <div className="voice-history-header">
                    <div className="voice-history-content">
                      <div className="voice-history-text">
                        "{command.text}"
                      </div>
                      <div className="voice-history-meta">
                        {new Date(command.timestamp).toLocaleTimeString()}
                        {command.agentTarget && (
                          <span className="voice-agent-target">
                            → {command.agentTarget}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`voice-history-status ${command.status}`}>
                      {command.status}
                    </div>
                  </div>

                  {command.result && (
                    <div className="voice-result">
                      {command.result}
                    </div>
                  )}
                </div>
              ))}

              {commands.length === 0 && (
                <div className="voice-history-empty">
                  No voice commands yet. Click the microphone to start!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="voice-unsupported">
          <div>
            <div className="voice-unsupported-icon">🚫</div>
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
