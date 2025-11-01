"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_i18next_1 = require("react-i18next");
const material_1 = require("@mui/material");
const BarChart_1 = __importDefault(require("@mui/icons-material/BarChart"));
const RestartAlt_1 = __importDefault(require("@mui/icons-material/RestartAlt"));
const PauseCircle_1 = __importDefault(require("@mui/icons-material/PauseCircle"));
const PlayCircle_1 = __importDefault(require("@mui/icons-material/PlayCircle"));
const agentStore_1 = __importDefault(require("@/stores/agentStore"));
const nexusTheme_1 = require("../../theme/nexusTheme");
function MASSupervisor() {
    const { t } = (0, react_i18next_1.useTranslation)();
    const agents = (0, agentStore_1.default)(state => state.agents);
    const statusColors = {
        active: '#00FF66',
        degraded: '#FFCC00',
        down: '#FF3300',
        starting: '#0A75FF'
    };
    return (<material_1.Box sx={{ p: 2, height: '100%' }}>
      <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            mb: 2,
            display: 'flex',
            alignItems: 'center'
        }}>
        <BarChart_1.default sx={{ mr: 1 }}/>
        {t('masSupervisor.title')}
      </material_1.Typography>

      <material_1.Grid container spacing={2}>
        {agents.map(agent => (<material_1.Grid item xs={12} sm={6} md={4} key={agent.id}>
            <material_1.Box sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(30, 40, 50, 0.5)',
                borderLeft: `3px solid ${statusColors[agent.status]}`
            }}>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <material_1.Typography sx={{
                color: nexusTheme_1.nexusColors.frost,
                fontWeight: 'bold'
            }}>
                  {agent.name}
                </material_1.Typography>
                <material_1.Box>
                  <material_1.Tooltip title={t('masSupervisor.restartTooltip')}>
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                      <RestartAlt_1.default fontSize="small"/>
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title={agent.status === 'active' ?
                t('masSupervisor.pauseTooltip') :
                t('masSupervisor.startTooltip')}>
                    <material_1.IconButton size="small" sx={{
                color: agent.status === 'active' ? nexusTheme_1.nexusColors.quantum : nexusTheme_1.nexusColors.frost
            }}>
                      {agent.status === 'active' ?
                <PauseCircle_1.default fontSize="small"/> :
                <PlayCircle_1.default fontSize="small"/>}
                    </material_1.IconButton>
                  </material_1.Tooltip>
                </material_1.Box>
              </material_1.Box>

              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.quantum, mt: 1 }}>
                {t('masSupervisor.agentType', { type: agent.type })}
              </material_1.Typography>

              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <material_1.CircularProgress variant="determinate" value={75} size={20} thickness={5} sx={{ color: statusColors[agent.status], mr: 1 }}/>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
                  {t('masSupervisor.cpuUsage', { usage: 75 })}
                </material_1.Typography>
              </material_1.Box>

              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <material_1.CircularProgress variant="determinate" value={50} size={20} thickness={5} sx={{ color: statusColors[agent.status], mr: 1 }}/>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
                  {t('masSupervisor.memoryUsage', { usage: 50 })}
                </material_1.Typography>
              </material_1.Box>
            </material_1.Box>
          </material_1.Grid>))}
      </material_1.Grid>
    </material_1.Box>);
}
exports.default = MASSupervisor;
