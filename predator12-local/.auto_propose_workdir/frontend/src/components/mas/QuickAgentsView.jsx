"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const modelRegistry_1 = require("../../services/modelRegistry");
const QuickAgentsView = ({ onAgentClick }) => {
    // Всі 26 агентів
    const allAgents = [
        // Core Agents (16)
        { id: 'ChiefOrchestrator', category: 'core', status: 'active', health: 95 },
        { id: 'QueryPlanner', category: 'core', status: 'active', health: 88 },
        { id: 'ModelRouter', category: 'core', status: 'active', health: 92 },
        { id: 'Arbiter', category: 'core', status: 'active', health: 89 },
        { id: 'NexusGuide', category: 'core', status: 'active', health: 94 },
        { id: 'DatasetIngest', category: 'core', status: 'active', health: 96 },
        { id: 'DataQuality', category: 'core', status: 'degraded', health: 71 },
        { id: 'SchemaMapper', category: 'core', status: 'active', health: 85 },
        { id: 'ETLOrchestrator', category: 'core', status: 'active', health: 91 },
        { id: 'Indexer', category: 'core', status: 'active', health: 93 },
        { id: 'Embedding', category: 'core', status: 'active', health: 97 },
        { id: 'OSINTCrawler', category: 'core', status: 'active', health: 82 },
        { id: 'GraphBuilder', category: 'core', status: 'active', health: 86 },
        { id: 'Anomaly', category: 'core', status: 'active', health: 90 },
        { id: 'Forecast', category: 'core', status: 'active', health: 88 },
        { id: 'Simulator', category: 'core', status: 'active', health: 84 },
        // Specialized Agents (10)
        { id: 'SyntheticData', category: 'specialized', status: 'paused', health: 0 },
        { id: 'ReportExport', category: 'specialized', status: 'active', health: 95 },
        { id: 'BillingGate', category: 'specialized', status: 'active', health: 98 },
        { id: 'PIIGuardian', category: 'specialized', status: 'active', health: 96 },
        { id: 'AutoHeal', category: 'specialized', status: 'active', health: 89 },
        { id: 'SelfDiagnosis', category: 'specialized', status: 'active', health: 87 },
        { id: 'SelfImprovement', category: 'specialized', status: 'degraded', health: 65 },
        { id: 'RedTeam', category: 'specialized', status: 'down', health: 0 },
        { id: 'ComplianceMonitor', category: 'specialized', status: 'active', health: 93 },
        { id: 'PerformanceOptimizer', category: 'specialized', status: 'active', health: 91 }
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return nexusTheme_1.nexusColors.emerald;
            case 'degraded': return nexusTheme_1.nexusColors.warning;
            case 'paused': return nexusTheme_1.nexusColors.shadow;
            case 'down': return nexusTheme_1.nexusColors.crimson;
            default: return nexusTheme_1.nexusColors.shadow;
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'active': return '🟢';
            case 'degraded': return '🟡';
            case 'paused': return '⏸️';
            case 'down': return '🔴';
            default: return '⚪';
        }
    };
    const getCategoryEmoji = (category) => {
        return category === 'core' ? '🎯' : '🔧';
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h5" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.frost,
            textAlign: 'center',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.sapphire})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
        🤖 Всі {allAgents.length} агентів системи
      </material_1.Typography>

      <material_1.Grid container spacing={2}>
        {allAgents.map((agent) => (<material_1.Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
            <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}CC, ${nexusTheme_1.nexusColors.darkMatter}AA)`,
                border: `1px solid ${getStatusColor(agent.status)}40`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${getStatusColor(agent.status)}30`,
                    border: `1px solid ${getStatusColor(agent.status)}80`
                }
            }} onClick={() => onAgentClick === null || onAgentClick === void 0 ? void 0 : onAgentClick(agent.id)}>
              <material_1.CardContent sx={{ p: 2 }}>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <material_1.Typography sx={{ fontSize: '0.9rem' }}>
                    {getCategoryEmoji(agent.category)} {getStatusEmoji(agent.status)}
                  </material_1.Typography>
                  <material_1.Typography variant="body2" sx={{
                ml: 1,
                fontWeight: 600,
                color: nexusTheme_1.nexusColors.frost,
                fontSize: '0.8rem'
            }}>
                    {agent.id}
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <material_1.Chip size="small" label={agent.status} sx={{
                backgroundColor: `${getStatusColor(agent.status)}20`,
                color: getStatusColor(agent.status),
                fontSize: '0.7rem',
                height: 20
            }}/>
                  <material_1.Typography variant="caption" sx={{
                color: agent.health > 80 ? nexusTheme_1.nexusColors.emerald :
                    agent.health > 50 ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.crimson,
                fontWeight: 600
            }}>
                    {agent.health}%
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.shadow,
                display: 'block',
                mt: 1,
                fontSize: '0.7rem'
            }}>
                  {modelRegistry_1.AGENT_MODEL_ASSIGNMENTS[agent.id] || 'No model assigned'}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>))}
      </material_1.Grid>

      <material_1.Box sx={{ mt: 3, textAlign: 'center' }}>
        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
          Core: {allAgents.filter(a => a.category === 'core').length} |
          Specialized: {allAgents.filter(a => a.category === 'specialized').length} |
          Active: {allAgents.filter(a => a.status === 'active').length}
        </material_1.Typography>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = QuickAgentsView;
