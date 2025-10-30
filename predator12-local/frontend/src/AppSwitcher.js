"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const store_1 = require("./store");
const App_1 = __importDefault(require("./App"));
const TestApp_1 = __importDefault(require("./TestApp"));
const MinimalApp_1 = __importDefault(require("./MinimalApp"));
function AppSwitcher() {
    const [mode, setMode] = (0, react_1.useState)('minimal');
    const handleModeChange = (newMode) => {
        console.log(`🔄 Переключение на режим: ${newMode}`);
        setMode(newMode);
    };
    return (<react_redux_1.Provider store={store_1.store}>
      {/* Debug Controls */}
      <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #38BDF8'
        }}>
        <div style={{ color: '#38BDF8', fontSize: '12px', marginBottom: '8px' }}>
          DEBUG MODE: {mode.toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => handleModeChange('test')} style={{
            padding: '5px 10px',
            background: mode === 'test' ? '#38BDF8' : 'transparent',
            color: mode === 'test' ? '#000' : '#38BDF8',
            border: '1px solid #38BDF8',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
        }}>
            TEST
          </button>
          <button onClick={() => handleModeChange('minimal')} style={{
            padding: '5px 10px',
            background: mode === 'minimal' ? '#06B6D4' : 'transparent',
            color: mode === 'minimal' ? '#000' : '#06B6D4',
            border: '1px solid #06B6D4',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
        }}>
            MINIMAL
          </button>
          <button onClick={() => handleModeChange('full')} style={{
            padding: '5px 10px',
            background: mode === 'full' ? '#10B981' : 'transparent',
            color: mode === 'full' ? '#000' : '#10B981',
            border: '1px solid #10B981',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
        }}>
            FULL
          </button>
        </div>
      </div>

      {/* App Content */}
      {mode === 'test' && <TestApp_1.default />}
      {mode === 'minimal' && <MinimalApp_1.default />}
      {mode === 'full' && <App_1.default />}
    </react_redux_1.Provider>);
}
exports.default = AppSwitcher;
