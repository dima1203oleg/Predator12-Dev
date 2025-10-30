"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const HolographicGuide_1 = __importDefault(require("@/components/guide/HolographicGuide"));
const VoiceInterface_1 = __importDefault(require("@/components/guide_voice/VoiceInterface"));
const DataFlowMap_1 = __importDefault(require("@/components/flowmap/DataFlowMap"));
const MASSupervisor_1 = __importDefault(require("@/components/mas_supervisor/MASSupervisor"));
const DashboardPage = () => {
    const { isListening, transcript, startListening, stopListening } = (0, VoiceInterface_1.default)();
    return (<div className="dashboard-container">
      <div className="cyber-face-container">
        <HolographicGuide_1.default />
      </div>

      <div className="flowmap-container">
        <DataFlowMap_1.default />
      </div>

      <div className="mas-container">
        <MASSupervisor_1.default />
      </div>

      <div className="voice-controls">
        <button onClick={isListening ? stopListening : startListening} style={{ backgroundColor: isListening ? '#FF0000' : '#00FF66' }}>
          {isListening ? 'Stop Listening' : 'Start Voice Control'}
        </button>
        <p>Transcript: {transcript}</p>
      </div>
    </div>);
};
exports.default = DashboardPage;
