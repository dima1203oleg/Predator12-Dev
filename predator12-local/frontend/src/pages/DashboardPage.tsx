import React from 'react';
import HolographicGuide from '@/components/guide/HolographicGuide';
import useVoiceInterface from '@/components/guide_voice/VoiceInterface';
import DataFlowMap from '@/components/flowmap/DataFlowMap';
import MASSupervisor from '@/components/mas_supervisor/MASSupervisor';

const DashboardPage = () => {
  const { isListening, transcript, startListening, stopListening } = useVoiceInterface();

  return (
    <div className="dashboard-container">
      <div className="cyber-face-container">
        <HolographicGuide />
      </div>
      
      <div className="flowmap-container">
        <DataFlowMap />
      </div>
      
      <div className="mas-container">
        <MASSupervisor />
      </div>
      
      <div className="voice-controls">
        <button 
          onClick={isListening ? stopListening : startListening}
          style={{ backgroundColor: isListening ? '#FF0000' : '#00FF66' }}
        >
          {isListening ? 'Stop Listening' : 'Start Voice Control'}
        </button>
        <p>Transcript: {transcript}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
