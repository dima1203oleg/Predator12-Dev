"use strict";
// 🤖 AI Agents & Models Section
// Integrated dashboard for 30+ agents and 58+ models
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentsSection = void 0;
const react_1 = __importStar(require("react"));
const AIAgentsModelsData_1 = require("../../data/AIAgentsModelsData");
// ============= AI AGENTS SECTION =============
const AIAgentsSection = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('agents');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    // Filter agents
    const filteredAgents = AIAgentsModelsData_1.aiAgents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    // Filter models
    const filteredModels = AIAgentsModelsData_1.aiModels.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.provider.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    // Stats
    const activeAgents = AIAgentsModelsData_1.aiAgents.filter(a => a.status === 'active').length;
    const onlineModels = AIAgentsModelsData_1.aiModels.filter(m => m.status === 'online').length;
    const criticalAgents = AIAgentsModelsData_1.aiAgents.filter(a => a.priority === 'critical').length;
    return (<div style={{
            marginTop: '40px',
            padding: '30px',
            background: 'rgba(0, 10, 20, 0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 242, 255, 0.2)',
            borderRadius: '24px',
        }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00f2ff 0%, #ff006e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
        }}>
          🤖 AI Agents & Models Control Center
        </h2>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Managing {AIAgentsModelsData_1.aiAgents.length}+ AI agents and {AIAgentsModelsData_1.aiModels.length}+ free models
        </p>
      </div>

      {/* Stats Summary */}
      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
        }}>
        <StatCard icon="🤖" label="AI Agents" value={`${activeAgents}/${AIAgentsModelsData_1.aiAgents.length}`} status="active" color="#00ff88"/>
        <StatCard icon="🌟" label="AI Models" value={`${onlineModels}/${AIAgentsModelsData_1.aiModels.length}`} status="online" color="#00f2ff"/>
        <StatCard icon="⚠️" label="Critical Agents" value={criticalAgents.toString()} status="critical" color="#ff006e"/>
        <StatCard icon="💰" label="Total Cost" value="$0.00" status="free" color="#ffaa00"/>
      </div>

      {/* Tabs */}
      <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '30px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '12px',
        }}>
        <TabButton active={activeTab === 'agents'} onClick={() => setActiveTab('agents')}>
          🤖 Agents ({AIAgentsModelsData_1.aiAgents.length})
        </TabButton>
        <TabButton active={activeTab === 'models'} onClick={() => setActiveTab('models')}>
          🌟 Models ({AIAgentsModelsData_1.aiModels.length})
        </TabButton>
        <TabButton active={activeTab === 'competition'} onClick={() => setActiveTab('competition')}>
          🏆 Competition
        </TabButton>
      </div>

      {/* Search and Filters */}
      <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '30px',
            flexWrap: 'wrap',
        }}>
        <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{
            flex: 1,
            minWidth: '250px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
        }}/>
        <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
          All
        </FilterButton>
        <FilterButton active={filterStatus === 'active'} onClick={() => setFilterStatus('active')}>
          Active
        </FilterButton>
        <FilterButton active={filterStatus === 'online'} onClick={() => setFilterStatus('online')}>
          Online
        </FilterButton>
        <FilterButton active={filterStatus === 'critical'} onClick={() => setFilterStatus('critical')}>
          Critical
        </FilterButton>
      </div>

      {/* Content */}
      {activeTab === 'agents' && (<AgentsGrid agents={filteredAgents}/>)}
      {activeTab === 'models' && (<ModelsGrid models={filteredModels}/>)}
      {activeTab === 'competition' && (<CompetitionView />)}
    </div>);
};
exports.AIAgentsSection = AIAgentsSection;
const StatCard = ({ icon, label, value, status, color }) => {
    return (<div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            transition: 'all 0.3s ease',
        }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: color,
            marginBottom: '8px',
        }}>
        {value}
      </div>
      <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: `${color}20`,
            color: color,
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
        }}>
        {status}
      </div>
    </div>);
};
const TabButton = ({ active, onClick, children }) => {
    return (<button onClick={onClick} style={{
            padding: '12px 24px',
            background: active ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
            border: active ? '1px solid rgba(0, 242, 255, 0.5)' : '1px solid transparent',
            borderRadius: '12px',
            color: active ? '#00f2ff' : '#888',
            fontSize: '14px',
            fontWeight: active ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        }} onMouseEnter={(e) => {
            if (!active) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#fff';
            }
        }} onMouseLeave={(e) => {
            if (!active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#888';
            }
        }}>
      {children}
    </button>);
};
const FilterButton = ({ active, onClick, children }) => {
    return (<button onClick={onClick} style={{
            padding: '10px 20px',
            background: active ? 'rgba(0, 242, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: active ? '#00f2ff' : '#888',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00f2ff';
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}>
      {children}
    </button>);
};
const AgentsGrid = ({ agents }) => {
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    if (agents.length === 0) {
        return (<div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
            }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <div style={{ fontSize: '18px' }}>No agents found</div>
      </div>);
    }
    return (<>
      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
        }}>
        {agents.map(agent => (<AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)}/>))}
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (<AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)}/>)}
    </>);
};
const AgentCard = ({ agent, onClick }) => {
    const statusColors = {
        active: '#00ff88',
        idle: '#ffaa00',
        training: '#00f2ff',
        offline: '#666',
    };
    const priorityColors = {
        critical: '#ff006e',
        normal: '#00f2ff',
    };
    const statusColor = statusColors[agent.status];
    const priorityColor = priorityColors[agent.priority];
    return (<div onClick={onClick} style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = statusColor;
            e.currentTarget.style.boxShadow = `0 8px 32px ${statusColor}30`;
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
        }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '4px',
        }}>
            {agent.name}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            {agent.category}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{
            padding: '4px 10px',
            background: `${statusColor}20`,
            color: statusColor,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
        }}>
            {agent.status}
          </div>
          <div style={{
            padding: '4px 10px',
            background: `${priorityColor}20`,
            color: priorityColor,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
        }}>
            {agent.priority}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{
            color: '#aaa',
            fontSize: '13px',
            marginBottom: '16px',
            lineHeight: '1.5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
        }}>
        {agent.description}
      </div>

      {/* Current Model */}
      <div style={{
            padding: '12px',
            background: 'rgba(0, 242, 255, 0.05)',
            border: '1px solid rgba(0, 242, 255, 0.2)',
            borderRadius: '10px',
            marginBottom: '16px',
        }}>
        <div style={{ color: '#00f2ff', fontSize: '11px', marginBottom: '4px' }}>
          🤖 ARBITER MODEL
        </div>
        <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
          {agent.arbiterModel}
        </div>
      </div>

      {/* Metrics */}
      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '16px',
        }}>
        <MetricBox label="Tasks" value={agent.metrics.tasksCompleted.toLocaleString()} icon="📊"/>
        <MetricBox label="Success" value={`${agent.metrics.successRate}%`} icon="✅" color={agent.metrics.successRate > 95 ? '#00ff88' : '#ffaa00'}/>
        <MetricBox label="Response" value={`${agent.metrics.avgResponseTime}ms`} icon="⚡"/>
        <MetricBox label="Uptime" value={agent.metrics.uptime} icon="🔥"/>
      </div>

      {/* Model Pools */}
      <div style={{
            display: 'flex',
            gap: '8px',
            fontSize: '12px',
            color: '#888',
        }}>
        <div>🏆 {agent.competitionModels.length}</div>
        <div>⬇️ {agent.fallbackChain.length}</div>
        <div>🚨 {agent.emergencyPool.length}</div>
        {agent.thermalProtection && <div>🌡️ Thermal</div>}
      </div>
    </div>);
};
const MetricBox = ({ label, value, icon, color = '#00f2ff' }) => {
    return (<div style={{
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
        }}>
      <div style={{
            color: '#666',
            fontSize: '10px',
            marginBottom: '4px',
        }}>
        {icon} {label}
      </div>
      <div style={{
            color: color,
            fontSize: '14px',
            fontWeight: '600',
        }}>
        {value}
      </div>
    </div>);
};
const AgentModal = ({ agent, onClose }) => {
    return (<div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
        }} onClick={onClose}>
      <div style={{
            background: 'rgba(10, 20, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 242, 255, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
        }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
        }}>
              {agent.name}
            </h2>
            <p style={{ color: '#888', fontSize: '14px' }}>
              {agent.description}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255, 0, 110, 0.2)',
            border: '1px solid rgba(255, 0, 110, 0.5)',
            borderRadius: '10px',
            color: '#ff006e',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
        }}>
            ✕
          </button>
        </div>

        {/* Configuration Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#00f2ff', fontSize: '16px', marginBottom: '12px' }}>
            ⚙️ Configuration
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
        }}>
            <ConfigRow label="LLM Profile" value={agent.llmProfile}/>
            <ConfigRow label="Load Balancing" value={agent.loadBalancing}/>
            <ConfigRow label="Max Concurrent" value={agent.maxConcurrent.toString()}/>
            <ConfigRow label="Thermal Protection" value={agent.thermalProtection ? 'Enabled ✅' : 'Disabled'}/>
          </div>
        </div>

        {/* Competition Models */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#00f2ff', fontSize: '16px', marginBottom: '12px' }}>
            🏆 Competition Models
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agent.competitionModels.map((model, idx) => (<div key={idx} style={{
                background: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '10px',
                padding: '12px',
                color: '#00ff88',
                fontSize: '13px',
            }}>
                {idx + 1}. {model}
              </div>))}
          </div>
        </div>

        {/* Fallback Chain */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#00f2ff', fontSize: '16px', marginBottom: '12px' }}>
            ⬇️ Fallback Chain
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agent.fallbackChain.map((model, idx) => (<div key={idx} style={{
                background: 'rgba(255, 170, 0, 0.05)',
                border: '1px solid rgba(255, 170, 0, 0.2)',
                borderRadius: '10px',
                padding: '12px',
                color: '#ffaa00',
                fontSize: '13px',
            }}>
                {idx + 1}. {model}
              </div>))}
          </div>
        </div>

        {/* Emergency Pool */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#00f2ff', fontSize: '16px', marginBottom: '12px' }}>
            🚨 Emergency Pool
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agent.emergencyPool.map((model, idx) => (<div key={idx} style={{
                background: 'rgba(255, 0, 110, 0.05)',
                border: '1px solid rgba(255, 0, 110, 0.2)',
                borderRadius: '10px',
                padding: '12px',
                color: '#ff006e',
                fontSize: '13px',
            }}>
                • {model}
              </div>))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button style={{
            flex: 1,
            padding: '14px',
            background: 'linear-gradient(135deg, #00f2ff 0%, #00ff88 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
        }}>
            ▶️ Execute Task
          </button>
          <button style={{
            flex: 1,
            padding: '14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
        }}>
            📊 View Logs
          </button>
        </div>
      </div>
    </div>);
};
const ConfigRow = ({ label, value }) => {
    return (<div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
      <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
      <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{value}</span>
    </div>);
};
const ModelsGrid = ({ models }) => {
    if (models.length === 0) {
        return (<div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
            }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <div style={{ fontSize: '18px' }}>No models found</div>
      </div>);
    }
    // Group by provider
    const modelsByProvider = {};
    models.forEach(model => {
        if (!modelsByProvider[model.provider]) {
            modelsByProvider[model.provider] = [];
        }
        modelsByProvider[model.provider].push(model);
    });
    return (<div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {Object.entries(modelsByProvider).map(([provider, providerModels]) => (<div key={provider}>
          <h3 style={{
                color: '#00f2ff',
                fontSize: '18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
            <span>{getProviderIcon(provider)}</span>
            <span>{provider}</span>
            <span style={{
                color: '#666',
                fontSize: '14px',
                fontWeight: 'normal',
            }}>
              ({providerModels.length} models)
            </span>
          </h3>
          <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
            }}>
            {providerModels.map(model => (<ModelCard key={model.id} model={model}/>))}
          </div>
        </div>))}
    </div>);
};
const ModelCard = ({ model }) => {
    const statusColors = {
        online: '#00ff88',
        offline: '#666',
        loading: '#ffaa00',
    };
    const speedIcons = {
        fast: '⚡⚡⚡',
        medium: '⚡⚡',
        slow: '⚡',
    };
    const qualityIcons = {
        high: '⭐⭐⭐⭐⭐',
        medium: '⭐⭐⭐',
        low: '⭐⭐',
    };
    return (<div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.3s ease',
        }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = statusColors[model.status];
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
          {model.name}
        </div>
        <div style={{
            padding: '3px 8px',
            background: `${statusColors[model.status]}20`,
            color: statusColors[model.status],
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase',
        }}>
          {model.status}
        </div>
      </div>

      <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px',
            fontSize: '12px',
        }}>
        <div style={{ color: '#888' }}>
          Speed: <span style={{ color: '#fff' }}>{speedIcons[model.speed]}</span>
        </div>
        <div style={{ color: '#888' }}>
          Quality: <span style={{ color: '#fff' }}>{qualityIcons[model.quality]}</span>
        </div>
      </div>

      <div style={{
            display: 'flex',
            gap: '8px',
            fontSize: '11px',
            color: '#666',
            marginBottom: '12px',
        }}>
        <div>📋 {model.category}</div>
        <div>🪟 {(model.contextWindow / 1000).toFixed(0)}K</div>
      </div>

      <div style={{
            padding: '8px',
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: '8px',
            color: '#00ff88',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
        }}>
        💰 FREE ($0.00)
      </div>
    </div>);
};
// ============= HELPER: GET PROVIDER ICON =============
function getProviderIcon(provider) {
    const icons = {
        'OpenAI': '🤖',
        'Microsoft': '🔷',
        'DeepSeek': '🧠',
        'Meta': '🦙',
        'Mistral': '🌀',
        'Cohere': '🎯',
        'xAI': '🌟',
        'AI21': '🔮',
        'Qwen': '🌐',
        'Google': '💎',
    };
    return icons[provider] || '🤖';
}
// ============= COMPETITION VIEW =============
const CompetitionView = () => {
    return (<div style={{
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
        }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</div>
      <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '12px' }}>
        Model Competition Viewer
      </h3>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
        Live model competitions will appear here
      </p>
      <div style={{
            padding: '20px',
            background: 'rgba(0, 242, 255, 0.05)',
            border: '1px solid rgba(0, 242, 255, 0.2)',
            borderRadius: '12px',
            color: '#00f2ff',
        }}>
        Coming in Phase 3: Advanced Visualization
      </div>
    </div>);
};
exports.default = exports.AIAgentsSection;
