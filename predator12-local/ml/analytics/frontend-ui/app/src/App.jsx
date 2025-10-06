import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { ToastProvider } from './components/Notifications/ToastProvider';

// Lazy loaded components
const NexusCoreDashboard = lazy(() => import('./pages/NexusCoreDashboard'));
const ChronoSpatialMap = lazy(() => import('./components/nexus_visuals/ChronoSpatialMap'));
const RealitySimulatorUI = lazy(() => import('./components/nexus_visuals/RealitySimulatorUI'));
const OpenSearchWrapper = lazy(() => import('./components/OpenSearchWrapper'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const LobbyingInfluencePanel = lazy(() => import('./components/LobbyingInfluencePanel'));
const CustomsSchemesPanel = lazy(() => import('./components/CustomsSchemesPanel'));
const AnalysisPanel = lazy(() => import('./components/AnalysisPanel'));
const WebSocketMonitor = lazy(() => import('./components/admin/WebSocketMonitor'));
const ToastDemoPage = lazy(() => import('./pages/ToastDemoPage'));

const App = () => {
  return (
    <WebSocketProvider>
      <ToastProvider 
        position="top-right" 
        autoCloseDelay={5000} 
        pauseOnHover={true} 
        maxToasts={3}
        animationStyle="slide-right"
        theme="cyberpunk"
      >
        <Router>
          <Suspense fallback={<div className="bg-black text-white h-screen flex items-center justify-center">Завантаження...</div>}>
            <Routes>
              <Route path="/dashboard" element={<NexusCoreDashboard />} />
              <Route path="/chrono-spatial" element={<ChronoSpatialMapPage />} />
              <Route path="/reality-simulator" element={<RealitySimulatorPage />} />
              <Route path="/opensearch" element={<OpenSearchPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/websocket-monitor" element={<WebSocketMonitorPage />} />
              <Route path="/lobbying" element={<LobbyingInfluencePanel />} />
              <Route path="/customs" element={<CustomsSchemesPanel />} />
              <Route path="/general" element={<AnalysisPanel />} />
              <Route path="/notification-demo" element={<ToastDemoPage />} />
              <Route path="/ai-supervisor" element={<PlaceholderPage title="Вулик ШІ" />} />
              <Route path="/data-ops" element={<PlaceholderPage title="Фабрика Даних" />} />
              <Route path="/intelligence-feed" element={<PlaceholderPage title="Потік Оракула" />} />
              <Route path="/network-intelligence" element={<PlaceholderPage title="Нейронна Карта" />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </WebSocketProvider>
  );
};

const ChronoSpatialMapPage = () => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
        <Header />
        <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Хроно-Просторовий Аналіз</h2>
          <ChronoSpatialMap />
        </main>
      </div>
    </div>
  );
};

const RealitySimulatorPage = () => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
        <Header />
        <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Симулятор Реальностей</h2>
          <RealitySimulatorUI />
        </main>
      </div>
    </div>
  );
};

const OpenSearchPage = () => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
        <Header />
        <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
          <OpenSearchWrapper />
        </main>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
        <Header />
        <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">{title}</h2>
          <div className="bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-700 text-center text-gray-300">
            <p>Цей модуль знаходиться в розробці. Очікуйте оновлення незабаром.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

const WebSocketMonitorPage = () => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 relative z-10 overflow-auto">
        <Header />
        <main className="flex-1 p-6 mt-16 bg-gray-900 bg-opacity-80 rounded-tl-lg shadow-lg border-t border-l border-gray-700 overflow-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">WebSocket Моніторинг</h2>
          <WebSocketMonitor />
        </main>
      </div>
    </div>
  );
};

import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default App; 