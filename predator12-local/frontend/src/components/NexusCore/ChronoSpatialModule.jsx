"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const ChronoSpatialMap_1 = __importDefault(require("../nexus_visuals/ChronoSpatialMap"));
const ChronoSpatialModule = () => {
    return (<div style={{ width: '100%', height: '100%' }}>
      <ChronoSpatialMap_1.default />
    </div>);
};
exports.default = ChronoSpatialModule;
