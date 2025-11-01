"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const NexusCore_1 = __importDefault(require("./components/nexus/NexusCore"));
// Функція для поступового завантаження
const loadNexusCore = () => {
    client_1.default.createRoot(document.getElementById('root')).render(<react_1.default.StrictMode>
      <NexusCore_1.default />
    </react_1.default.StrictMode>);
};
// Простий тестовий компонент
const TestApp = () => {
    return (<div style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)',
            color: '#00ff88',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Arial, sans-serif'
        }}>
      <h1 style={{ fontSize: '3em', marginBottom: '20px', textShadow: '0 0 20px #00ff88' }}>
        🎯 Predator Nexus
      </h1>
      <h2 style={{ fontSize: '1.5em', marginBottom: '30px', color: '#0088ff' }}>
        Кібер-інтерфейс загружається...
      </h2>
      <div style={{
            padding: '20px',
            border: '2px solid #00ff88',
            borderRadius: '10px',
            background: 'rgba(0, 255, 136, 0.1)',
            maxWidth: '600px',
            textAlign: 'center'
        }}>
        <p style={{ marginBottom: '15px' }}>
          ✅ React додаток працює<br />
          ✅ Vite dev сервер активний<br />
          ✅ Порт 5173 доступний
        </p>
        <button style={{
            background: 'linear-gradient(45deg, #00ff88, #0088ff)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            color: '#0a0f1a',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
        }} onClick={loadNexusCore}>
          🚀 Завантажити Nexus Core
        </button>
        <button style={{
            background: 'rgba(0, 136, 255, 0.2)',
            border: '2px solid #0088ff',
            padding: '12px 24px',
            borderRadius: '8px',
            color: '#0088ff',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
        }} onClick={() => window.open('file:///Users/dima/Documents/Predator12/predator12-local/🎮_NEXUS_INTERACTIVE_DEMO.html', '_blank')}>
          📱 Відкрити Демо
        </button>
      </div>
      <div style={{
            marginTop: '30px',
            padding: '15px',
            background: 'rgba(0, 136, 255, 0.1)',
            border: '1px solid #0088ff',
            borderRadius: '8px',
            maxWidth: '500px'
        }}>
        <h3 style={{ color: '#0088ff', marginBottom: '10px' }}>🎨 Доступні компоненти:</h3>
        <ul style={{ textAlign: 'left', color: '#b0c4de' }}>
          <li>🤖 HolographicGuide - 3D AI помічник</li>
          <li>🌌 DataFlowMap - 3D візуалізація даних</li>
          <li>🔥 MASupervisor - 3D вулик агентів</li>
          <li>⚡ NexusCore Dashboard - головний інтерфейс</li>
        </ul>
      </div>
    </div>);
};
client_1.default.createRoot(document.getElementById('root')).render(<react_1.default.StrictMode>
    <TestApp />
  </react_1.default.StrictMode>);
