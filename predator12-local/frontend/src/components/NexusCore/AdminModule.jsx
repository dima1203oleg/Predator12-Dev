"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AdminModule = () => {
    return (<material_1.Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: nexusTheme_1.nexusColors.crimson,
        }}>
      <material_1.Typography variant="h3" sx={{ mb: 2 }}>
        Святилище Архітектора
      </material_1.Typography>
      <material_1.Typography variant="body1">
        Панель адміністрування у розробці...
      </material_1.Typography>
    </material_1.Box>);
};
exports.default = AdminModule;
