"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught an error:', error, info);
    }
    render() {
        var _a;
        if (this.state.hasError) {
            return (<div style={{
                    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#0a0f1a', color: '#00ffc6', padding: 24, textAlign: 'center'
                }}>
          <div>
            <h1 style={{ marginBottom: 8 }}>⚠️ Помилка інтерфейсу</h1>
            <p style={{ opacity: 0.8 }}>Ми перехопили виняток, щоб уникнути білого екрану. Оновіть сторінку або перевірте консоль.</p>
            {this.state.error && (<pre style={{ textAlign: 'left', marginTop: 16, background: '#0f1522', padding: 12, borderRadius: 8, overflow: 'auto' }}>
                {String(((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || this.state.error)}
              </pre>)}
          </div>
        </div>);
        }
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
