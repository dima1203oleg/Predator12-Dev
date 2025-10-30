"use strict";
/**
 * Test import - verify components can be imported
 */
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
// Test direct imports
const Head3D_1 = __importDefault(require("./components/Head3D"));
const ChatPanel_1 = __importDefault(require("./components/ChatPanel"));
const NetworkPanel_1 = __importDefault(require("./components/NetworkPanel"));
const RiskBanner_1 = __importDefault(require("./components/RiskBanner"));
const MicStatus_1 = __importDefault(require("./components/MicStatus"));
// Test barrel export
const Components = __importStar(require("./components"));
console.log('Imports work!', Head3D_1.default, ChatPanel_1.default, NetworkPanel_1.default, RiskBanner_1.default, MicStatus_1.default, Components);
