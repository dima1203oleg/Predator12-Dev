"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantFAB = void 0;
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AIAssistantFAB = ({ onClick, hasNotifications = false, isActive = false }) => {
    return (<framer_motion_1.motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1300
        }}>
      <material_1.Tooltip title="Nexus AI Assistant" placement="left">
        <material_1.Badge badgeContent={hasNotifications ? '!' : 0} color="error" sx={{
            '& .MuiBadge-badge': {
                backgroundColor: nexusTheme_1.nexusColors.crimson,
                color: nexusTheme_1.nexusColors.frost,
                animation: hasNotifications ? 'pulse 2s infinite' : 'none'
            }
        }}>
          <material_1.Fab onClick={onClick} sx={{
            background: isActive
                ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`
                : `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}80, ${nexusTheme_1.nexusColors.sapphire}80)`,
            color: nexusTheme_1.nexusColors.frost,
            border: `2px solid ${nexusTheme_1.nexusColors.quantum}`,
            boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.emerald}40`,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`,
                boxShadow: `0 0 30px ${nexusTheme_1.nexusColors.emerald}60`,
                transform: 'translateY(-2px)'
            },
            '&:active': {
                transform: 'translateY(0px)'
            },
            transition: 'all 0.3s ease'
        }}>
            <framer_motion_1.motion.div animate={isActive ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.5 }}>
              <icons_material_1.Psychology sx={{ fontSize: 28 }}/>
            </framer_motion_1.motion.div>
          </material_1.Fab>
        </material_1.Badge>
      </material_1.Tooltip>
    </framer_motion_1.motion.div>);
};
exports.AIAssistantFAB = AIAssistantFAB;
