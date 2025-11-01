// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';

const SimpleApp = () => {
  return (
    <div style={{
      backgroundColor: 'white',
      color: 'black',
      padding: '20px',
      fontSize: '24px',
      fontFamily: 'Arial'
    }}>
      <h1>🚀 Predator Frontend Test</h1>
      <p>Якщо ви бачите цей текст, React працює!</p>
      <p>Час: {new Date().toLocaleString()}</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<SimpleApp />);
