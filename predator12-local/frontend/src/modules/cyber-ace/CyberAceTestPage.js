"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberAceTestPage = void 0;
const react_1 = __importDefault(require("react"));
/**
 * Простий тестовий компонент для діагностики
 */
const CyberAceTestPage = () => {
    return (<div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
            color: '#ffffff',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
      <h1 style={{ color: '#00ffff', marginBottom: '1rem' }}>
        🤖 CYBER-ACE Test Page
      </h1>
      <p>Якщо ви бачите це повідомлення, базова структура працює.</p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,255,255,0.1)', borderRadius: '10px' }}>
        <h2>Діагностика:</h2>
        <ul>
          <li>✅ React працює</li>
          <li>✅ Стилі завантажуються</li>
          <li>✅ Компонент рендериться</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => console.log('Test button clicked')} style={{
            padding: '1rem 2rem',
            background: '#00ffff',
            border: 'none',
            borderRadius: '10px',
            color: '#0a0e27',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>);
};
exports.CyberAceTestPage = CyberAceTestPage;
exports.default = exports.CyberAceTestPage;
