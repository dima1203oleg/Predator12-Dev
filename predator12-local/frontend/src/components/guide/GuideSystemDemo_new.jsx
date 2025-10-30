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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const ContextualChat_1 = __importDefault(require("./ContextualChat"));
const GuideSystemDemo = ({ currentModule = 'dashboard', systemHealth = 'optimal', agentsData = [] }) => {
    const [chatVisible, setChatVisible] = (0, react_1.useState)(false);
    return (<material_1.Box sx={{ minHeight: '100vh', p: 2, background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})` }}>
      <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
        Guide System Demo
      </material_1.Typography>

      {/* Кнопка відкриття чату */}
      {!chatVisible && (<material_1.IconButton onClick={() => setChatVisible(true)} sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}80`,
                color: nexusTheme_1.nexusColors.frost,
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.quantum}B0`,
                    transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease',
                zIndex: 1000
            }} aria-label="Відкрити чат гіда">
          <icons_material_1.Chat />
        </material_1.IconButton>)}

      <ContextualChat_1.default visible={chatVisible} module={currentModule} systemHealth={systemHealth} agentsData={agentsData} onClose={() => setChatVisible(false)} closable={true}/>
    </material_1.Box>);
};
exports.default = GuideSystemDemo;
