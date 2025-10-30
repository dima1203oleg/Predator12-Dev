"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
// Простий тестовий компонент для діагностики
function TestApp() {
    console.log('🟢 TestApp компонент завантажений');
    return (<div style={{
            background: '#0a0a0a',
            color: '#00ff00',
            padding: '20px',
            fontFamily: 'monospace',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
      <h1>🟢 PREDATOR11 TEST APP</h1>
      <p>Якщо ви бачите це повідомлення - React працює!</p>
      <p>Час: {new Date().toLocaleTimeString()}</p>

      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #00ff00' }}>
        <h3>Діагностична інформація:</h3>
        <ul style={{ textAlign: 'left', marginTop: '10px' }}>
          <li>✅ React: {react_1.default.version}</li>
          <li>✅ JavaScript: Активний</li>
          <li>✅ DOM: Завантажено</li>
          <li>✅ CSS: Застосовано</li>
        </ul>
      </div>

      <button onClick={() => alert('React події працюють!')} style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        }}>
        Тест події
      </button>
    </div>);
}
exports.default = TestApp;
