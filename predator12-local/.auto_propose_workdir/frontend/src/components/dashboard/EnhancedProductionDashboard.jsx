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
const react_1 = __importDefault(require("react"));
const SuperEnhancedDashboard_1 = __importDefault(require("./SuperEnhancedDashboard"));
const AllAgentsPanel_1 = __importDefault(require("../agents/AllAgentsPanel"));
const OpenSearchPanel_1 = __importDefault(require("../opensearch/OpenSearchPanel"));
const NexusNavigation_1 = __importStar(require("../nexus/NexusNavigation"));
const material_1 = require("@mui/material");
const EnhancedProductionDashboard = () => {
    return (<NexusNavigation_1.NexusProvider>
      <material_1.Box className="enhanced-card fade-in" sx={{
            display: 'flex',
            minHeight: '100vh',
            position: 'relative',
            '& .MuiCard-root': {
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                boxShadow: `
              0 4px 15px rgba(0, 0, 0, 0.2),
              0 0 20px rgba(56, 189, 248, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: 'rgba(56, 189, 248, 0.6)',
                    boxShadow: `
                0 8px 25px rgba(0, 0, 0, 0.3),
                0 0 30px rgba(56, 189, 248, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
                    transform: 'translateY(-2px)'
                }
            },
            '& .MuiButton-root': {
                background: 'linear-gradient(45deg, rgba(56, 189, 248, 0.1), rgba(168, 85, 247, 0.1))',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.2), transparent)',
                    transition: 'left 0.5s'
                },
                '&:hover::before': {
                    left: '100%'
                },
                '&:hover': {
                    background: 'linear-gradient(45deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                    borderColor: 'rgba(56, 189, 248, 0.8)',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
                    transform: 'scale(1.02)'
                }
            },
            '& .MuiTypography-h4': {
                textShadow: '0 0 10px rgba(56, 189, 248, 0.8), 0 0 20px rgba(56, 189, 248, 0.6)',
                animation: 'cyber-pulse 2s ease-in-out infinite alternate'
            },
            '& .MuiLinearProgress-root': {
                height: '8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #38BDF8, #A855F7)',
                    borderRadius: '4px',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                        animation: 'progress-shine 2s linear infinite'
                    }
                }
            }
        }}>
        {/* Бічна панель */}
        <NexusNavigation_1.default />
        {/* Контент */}
        <material_1.Box sx={{ flex: 1, p: 3 }}>
          <SuperEnhancedDashboard_1.default />
          <AllAgentsPanel_1.default />
          <OpenSearchPanel_1.default />
        </material_1.Box>
      </material_1.Box>
    </NexusNavigation_1.NexusProvider>);
};
exports.default = EnhancedProductionDashboard;
