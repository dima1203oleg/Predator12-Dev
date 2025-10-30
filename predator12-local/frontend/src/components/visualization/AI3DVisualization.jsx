"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const fiber_1 = require("@react-three/fiber");
const AI3DVisualization = () => (<fiber_1.Canvas>
    <ambientLight intensity={0.5}/>
    <pointLight position={[10, 10, 10]}/>
    <mesh>
      <boxGeometry args={[1, 1, 1]}/>
      <meshStandardMaterial color="orange"/>
    </mesh>
  </fiber_1.Canvas>);
exports.default = AI3DVisualization;
