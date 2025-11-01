import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return React.createElement('div', null,
    React.createElement('h1', null, 'Predator Frontend Test'),
    React.createElement('p', null, 'If you see this text, React is working!'),
    React.createElement('p', null, 'Time: ' + new Date().toLocaleString())
  );
};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
