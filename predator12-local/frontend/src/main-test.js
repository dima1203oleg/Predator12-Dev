"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const SimpleApp = () => {
    return (<div style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '20px',
            fontSize: '24px',
            fontFamily: 'Arial'
        }}>
      <h1>🚀 Predator Frontend Test</h1>
      <p>Якщо ви бачите цей текст, React працює!</p>
      <p>Час: {new Date().toLocaleString()}</p>
    </div>);
};
client_1.default.createRoot(document.getElementById('root')).render(<SimpleApp />);
