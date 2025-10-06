import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import TestApp from './TestApp';
import MinimalApp from './MinimalApp';

type AppMode = 'test' | 'minimal' | 'full';

function AppSwitcher() {
  const [mode, setMode] = useState<AppMode>('minimal');
  
  const handleModeChange = (newMode: AppMode) => {
    console.log(`🔄 Переключение на режим: ${newMode}`);
    setMode(newMode);
  };
  
  return (
    <Provider store={store}>
      {/* Debug Controls */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.9)',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #38BDF8'
      }}>
        <div style={{ color: '#38BDF8', fontSize: '12px', marginBottom: '8px' }}>
          DEBUG MODE: {mode.toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={() => handleModeChange('test')}
            style={{
              padding: '5px 10px',
              background: mode === 'test' ? '#38BDF8' : 'transparent',
              color: mode === 'test' ? '#000' : '#38BDF8',
              border: '1px solid #38BDF8',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            TEST
          </button>
          <button 
            onClick={() => handleModeChange('minimal')}
            style={{
              padding: '5px 10px',
              background: mode === 'minimal' ? '#06B6D4' : 'transparent',
              color: mode === 'minimal' ? '#000' : '#06B6D4',
              border: '1px solid #06B6D4',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            MINIMAL
          </button>
          <button 
            onClick={() => handleModeChange('full')}
            style={{
              padding: '5px 10px',
              background: mode === 'full' ? '#10B981' : 'transparent',
              color: mode === 'full' ? '#000' : '#10B981',
              border: '1px solid #10B981',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            FULL
          </button>
        </div>
      </div>
      
      {/* App Content */}
      {mode === 'test' && <TestApp />}
      {mode === 'minimal' && <MinimalApp />}
      {mode === 'full' && <App />}
    </Provider>
  );
}

export default AppSwitcher;
