// @ts-nocheck
export type NexusAgent = {
  name: string;
  status: 'active' | 'idle' | 'error' | 'restarting' | 'stopped';
  health: 'excellent' | 'good' | 'warning' | 'critical';
  cpu: string;
  memory: string;
};

// 26+ базових агентів ядра
export const CORE_AGENTS: NexusAgent[] = [
  { name: 'SelfHealingAgent', status: 'active', health: 'excellent', cpu: '6%', memory: '39%' },
  { name: 'AutoImproveAgent', status: 'active', health: 'good', cpu: '12%', memory: '41%' },
  { name: 'SelfDiagnosisAgent', status: 'active', health: 'excellent', cpu: '9%', memory: '33%' },
  { name: 'ContainerHealer', status: 'active', health: 'excellent', cpu: '7%', memory: '28%' },
  { name: 'SecurityAgent', status: 'active', health: 'good', cpu: '18%', memory: '52%' },
  { name: 'MonitoringAgent', status: 'idle', health: 'warning', cpu: '3%', memory: '21%' },
  { name: 'ETLOrchestrator', status: 'active', health: 'good', cpu: '14%', memory: '46%' },
  { name: 'OSINTCollector', status: 'active', health: 'good', cpu: '11%', memory: '38%' },
  { name: 'GraphBuilder', status: 'active', health: 'excellent', cpu: '10%', memory: '35%' },
  { name: 'ForecastEngine', status: 'active', health: 'good', cpu: '16%', memory: '49%' },
  { name: 'AnomalyDetector', status: 'active', health: 'excellent', cpu: '13%', memory: '44%' },
  { name: 'OpenSearchIndexer', status: 'idle', health: 'good', cpu: '4%', memory: '19%' },
  { name: 'QdrantVectorizer', status: 'active', health: 'good', cpu: '15%', memory: '47%' },
  { name: 'MinIOArchiver', status: 'active', health: 'excellent', cpu: '5%', memory: '22%' },
  { name: 'DataQualityGuard', status: 'active', health: 'good', cpu: '8%', memory: '31%' },
  { name: 'PerformanceOptimizer', status: 'active', health: 'good', cpu: '12%', memory: '40%' },
  { name: 'LoadBalancerTuner', status: 'idle', health: 'good', cpu: '2%', memory: '12%' },
  { name: 'KeycloakSSOAgent', status: 'active', health: 'excellent', cpu: '5%', memory: '18%' },
  { name: 'BackupManager', status: 'active', health: 'good', cpu: '4%', memory: '24%' },
  { name: 'LogIngestorLoki', status: 'active', health: 'good', cpu: '9%', memory: '29%' },
  { name: 'AlertRouter', status: 'active', health: 'good', cpu: '6%', memory: '27%' },
  { name: 'RealtimeStreamAgent', status: 'active', health: 'good', cpu: '17%', memory: '43%' },
  { name: 'PolicyEnforcer', status: 'active', health: 'good', cpu: '7%', memory: '25%' },
  { name: 'ThreatIntelAgent', status: 'idle', health: 'good', cpu: '3%', memory: '16%' },
  { name: 'CostOptimizer', status: 'active', health: 'good', cpu: '6%', memory: '23%' },
  { name: 'ExplainabilityAgent', status: 'active', health: 'excellent', cpu: '8%', memory: '28%' },
  { name: 'KPIDashboardAgent', status: 'active', health: 'good', cpu: '9%', memory: '26%' }
];


