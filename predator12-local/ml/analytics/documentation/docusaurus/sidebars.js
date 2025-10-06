module.exports = {
  nexusSidebar: [
    {
      type: 'category',
      label: 'Nexus Core',
      items: [
        'nexus-core/overview',
        'nexus-core/architecture',
        'nexus-core/installation',
        'nexus-core/websocket-health-check',
        'nexus-core/websocket-monitoring',
        'nexus-core/websocket-status-component',
        'nexus-core/usewebsocket-hook',
        'nexus-core/websocket-context',
        'nexus-core/websocket-monitor',
      ],
    },
    {
      type: 'category',
      label: 'API Documentation',
      items: [
        'api/overview',
        'api/endpoints',
      ],
    },
    {
      type: 'category',
      label: 'Monitoring & Observability',
      items: [
        'monitoring/overview',
        'monitoring/prometheus',
        'monitoring/grafana',
      ],
    },
  ],
}; 