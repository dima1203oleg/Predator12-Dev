"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexusSidebar = void 0;
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const NexusSidebar = ({ open, modules, activeModule, onModuleSelect }) => {
    const drawerWidth = open ? 280 : 80;
    return (<material_1.Drawer variant="permanent" sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                background: `linear-gradient(180deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E6)`,
                backdropFilter: 'blur(20px)',
                borderRight: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                boxShadow: `4px 0 20px ${nexusTheme_1.nexusColors.quantum}30`,
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                mt: 8 // Account for AppBar
            },
        }}>
      <material_1.Box sx={{ p: 2, textAlign: 'center' }}>
        {open && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <material_1.Typography variant="h6" sx={{
                fontFamily: 'Orbitron',
                color: nexusTheme_1.nexusColors.emerald,
                textShadow: `0 0 10px ${nexusTheme_1.nexusColors.emerald}`,
                mb: 1
            }}>
              NEXUS MODULES
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{
                color: nexusTheme_1.nexusColors.nebula,
                fontSize: '0.75rem'
            }}>
              Galactic Command Interface
            </material_1.Typography>
          </framer_motion_1.motion.div>)}
      </material_1.Box>

      <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mx: 1 }}/>

      <material_1.List sx={{ px: 1, py: 2 }}>
        {modules.map((module, index) => (<framer_motion_1.motion.div key={module.id} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.1 }}>
            <material_1.Tooltip title={open ? '' : `${module.label} - ${module.description}`} placement="right" arrow>
              <material_1.ListItem disablePadding sx={{ mb: 1 }}>
                <material_1.ListItemButton selected={activeModule === module.id} onClick={() => onModuleSelect(module.id)} sx={{
                borderRadius: '12px',
                border: activeModule === module.id
                    ? `2px solid ${module.color}`
                    : `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                background: activeModule === module.id
                    ? `linear-gradient(45deg, ${module.color}20, transparent)`
                    : 'transparent',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    background: `linear-gradient(45deg, ${module.color}30, transparent)`,
                    border: `1px solid ${module.color}80`,
                    boxShadow: `0 0 20px ${module.color}40`,
                    transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                    boxShadow: `0 0 25px ${module.color}60`,
                    '&:hover': {
                        background: `linear-gradient(45deg, ${module.color}30, transparent)`,
                    }
                }
            }}>
                  <material_1.ListItemIcon sx={{
                color: activeModule === module.id ? module.color : nexusTheme_1.nexusColors.nebula,
                minWidth: open ? 40 : 'auto',
                justifyContent: 'center',
                transition: 'color 0.3s ease',
                filter: activeModule === module.id
                    ? `drop-shadow(0 0 8px ${module.color})`
                    : 'none'
            }}>
                    {module.icon}
                  </material_1.ListItemIcon>

                  {open && (<material_1.ListItemText primary={<material_1.Typography variant="body2" sx={{
                        fontFamily: 'Orbitron',
                        fontWeight: activeModule === module.id ? 600 : 400,
                        color: activeModule === module.id ? module.color : nexusTheme_1.nexusColors.frost,
                        fontSize: '0.85rem',
                        textShadow: activeModule === module.id
                            ? `0 0 6px ${module.color}80`
                            : 'none'
                    }}>
                          {module.label}
                        </material_1.Typography>} secondary={<material_1.Typography variant="caption" sx={{
                        color: nexusTheme_1.nexusColors.shadow,
                        fontSize: '0.7rem',
                        fontFamily: 'Fira Code'
                    }}>
                          {module.description}
                        </material_1.Typography>}/>)}
                </material_1.ListItemButton>
              </material_1.ListItem>
            </material_1.Tooltip>
          </framer_motion_1.motion.div>))}
      </material_1.List>

      {/* Status Panel */}
      <material_1.Box sx={{ mt: 'auto', p: 2 }}>
        <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

        {open && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.shadow,
                fontFamily: 'Fira Code',
                display: 'block',
                mb: 1
            }}>
              SYSTEM STATUS
            </material_1.Typography>

            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <material_1.Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: nexusTheme_1.nexusColors.success,
                boxShadow: `0 0 8px ${nexusTheme_1.nexusColors.success}`,
                animation: 'pulse 2s infinite'
            }}/>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, fontSize: '0.7rem' }}>
                All Systems Operational
              </material_1.Typography>
            </material_1.Box>

            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <material_1.Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: nexusTheme_1.nexusColors.sapphire,
                boxShadow: `0 0 8px ${nexusTheme_1.nexusColors.sapphire}`,
                animation: 'pulse 1.5s infinite'
            }}/>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, fontSize: '0.7rem' }}>
                Neural Network Active
              </material_1.Typography>
            </material_1.Box>
          </framer_motion_1.motion.div>)}
      </material_1.Box>
    </material_1.Drawer>);
};
exports.NexusSidebar = NexusSidebar;
