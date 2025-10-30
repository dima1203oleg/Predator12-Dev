"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = require("react");
const agentStore_1 = __importDefault(require("@/stores/agentStore"));
const react_i18next_1 = require("react-i18next");
const material_1 = require("@mui/material");
function AgentMonitor() {
    const agents = (0, agentStore_1.default)(state => state.agents);
    const { t } = (0, react_i18next_1.useTranslation)();
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const fetchAgents = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield agentsAPI.getAllAgentsStatus();
            agentStore_1.default.getState().updateAgents(data);
        });
        const interval = setInterval(fetchAgents, 5000);
        fetchAgents(); // Первинне завантаження
        return () => clearInterval(interval);
    }, []);
    const filteredAgents = agents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.status.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<material_1.Box sx={{ p: 2 }}>
      <material_1.TextField fullWidth size="small" placeholder={t('agentMonitor.searchAgents')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>

      {filteredAgents.length === 0 && (<material_1.Typography sx={{ mt: 2 }}>
          {t('agentMonitor.noAgentsFound')}
        </material_1.Typography>)}

      {filteredAgents.length > 0 && (<material_1.Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, mt: 2 }}>
          {filteredAgents.map(agent => (<material_1.Box key={agent.id} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1.5,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(30, 40, 50, 0.4)',
                    borderLeft: `3px solid ${statusColors[agent.status]}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'translateX(-3px)',
                        bgcolor: 'rgba(40, 50, 60, 0.6)'
                    }
                }}>
              <material_1.Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: statusColors[agent.status],
                    mr: 2,
                    flexShrink: 0
                }}/>
              <material_1.Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <material_1.Typography sx={{
                    color: nexusColors.frost,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                  {agent.name}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{
                    color: nexusColors.quantum,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                  {t('agentMonitor.agentStatus', {
                    status: agent.type,
                    time: agent.lastActive.toLocaleTimeString()
                })}
                </material_1.Typography>
              </material_1.Box>
              <IconButton size="small" sx={{ color: nexusColors.quantum }}>
                <MoreVertIcon />
              </IconButton>
            </material_1.Box>))}
        </material_1.Box>)}
    </material_1.Box>);
}
exports.default = AgentMonitor;
