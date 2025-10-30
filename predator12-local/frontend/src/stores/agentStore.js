"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setExpectedAgents = exports.setAgents = void 0;
const zustand_1 = __importDefault(require("zustand"));
const useAgentStore = (0, zustand_1.default)((set) => ({
    agents: [],
    expectedAgents: 8,
    setAgents: (agents) => set({ agents }),
    setExpectedAgents: (expectedAgents) => set({ expectedAgents }),
}));
const setAgents = (agents) => {
    useAgentStore.getState().setAgents(agents);
};
exports.setAgents = setAgents;
const setExpectedAgents = (expectedAgents) => {
    useAgentStore.getState().setExpectedAgents(expectedAgents);
};
exports.setExpectedAgents = setExpectedAgents;
exports.default = useAgentStore;
