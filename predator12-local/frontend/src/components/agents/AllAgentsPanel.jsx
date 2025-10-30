"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const InteractiveAgentsGrid_1 = require("./InteractiveAgentsGrid");
const agentsRegistry_1 = require("./agentsRegistry");
const AllAgentsPanel = () => {
    return (<material_1.Box sx={{ p: 2 }}>
      <InteractiveAgentsGrid_1.InteractiveAgentsGrid agents={agentsRegistry_1.CORE_AGENTS} onAgentSelect={() => { }}/>
    </material_1.Box>);
};
exports.default = AllAgentsPanel;
