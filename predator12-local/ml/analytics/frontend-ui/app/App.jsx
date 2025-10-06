import React, { lazy, Suspense } from 'react';

// Лініве завантаження компонентів
const Dashboard = lazy(() => import('./components/Dashboard'));
const Analytics = lazy(() => import('./components/Analytics'));
const Workspace = lazy(() => import('./components/Workspace'));

function App() {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
        <Analytics />
        <Workspace />
      </Suspense>
    </div>
  );
}

export default App; 