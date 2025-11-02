import React from 'react';
import ReactDOM from 'react-dom/client';

const SimpleApp = () => {
  return (
    <div>
      <h1>Predator Frontend Test</h1>
      <p>If you see this text, React is working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<SimpleApp />);
