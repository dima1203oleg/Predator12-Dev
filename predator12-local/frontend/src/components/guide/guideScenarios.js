// Сценарії та контекстні підказки AI Гіда для різних модулів системи Nexus Core
// Основні сценарії для різних модулів
export const guideScenarios = [
    // === DASHBOARD MODULE ===
    {
        id: 'dashboard-health-unknown',
        module: 'dashboard',
        context: 'system-health',
        trigger: {
            condition: 'systemHealth === "unknown"',
            priority: 'high',
            delay: 5
        },
        message: {
            ua: 'Система не передає метрики 5 хв. Причина: таймаут Prometheus. Спробувати Recheck або Відкрити логи?',
            en: 'System not sending metrics for 5 min. Cause: Prometheus timeout. Try Recheck or Open Logs?'
        },
        actions: [
            {
                label: { ua: 'Перевірити', en: 'Recheck' },
                action: 'healthCheck',
                type: 'primary'
            },
            {
                label: { ua: 'Відкрити логи', en: 'Open Logs' },
                action: 'openLogs',
                type: 'secondary',
                params: { module: 'prometheus' }
            }
        ],
        emotion: 'concerned',
        ttl: 30,
        repeatInterval: 120
    },
    {
        id: 'dashboard-health-critical',
        module: 'dashboard',
        context: 'system-health',
        trigger: {
            condition: 'systemHealth === "critical"',
            priority: 'critical',
            delay: 0
        },
        message: {
            ua: '🚨 КРИТИЧНО! Система потребує негайного втручання. Рекомендую перевірити логи та стан сервісів.',
            en: '🚨 CRITICAL! System requires immediate intervention. Recommend checking logs and service status.'
        },
        actions: [
            {
                label: { ua: 'Екстрена діагностика', en: 'Emergency Diagnostics' },
                action: 'emergencyCheck',
                type: 'danger'
            },
            {
                label: { ua: 'Відкрити логи', en: 'Open Logs' },
                action: 'openLogs',
                type: 'secondary'
            },
            {
                label: { ua: 'Зв\'язатися з адміном', en: 'Contact Admin' },
                action: 'contactAdmin',
                type: 'secondary'
            }
        ],
        emotion: 'alert',
        ttl: 60,
        repeatInterval: 180
    },
    {
        id: 'dashboard-high-load',
        module: 'dashboard',
        context: 'performance',
        trigger: {
            condition: 'cpuLoad > 0.9 || memoryUsage > 0.9',
            priority: 'medium',
            delay: 10
        },
        message: {
            ua: '⚠️ Високе навантаження системи. CPU: ${cpuLoad}%, RAM: ${memoryUsage}%. Рекомендується оптимізація.',
            en: '⚠️ High system load. CPU: ${cpuLoad}%, RAM: ${memoryUsage}%. Optimization recommended.'
        },
        actions: [
            {
                label: { ua: 'Показати метрики', en: 'Show Metrics' },
                action: 'navigate',
                type: 'primary',
                params: { module: 'dashboard', view: 'performance' }
            },
            {
                label: { ua: 'Масштабувати сервіси', en: 'Scale Services' },
                action: 'scaleServices',
                type: 'secondary'
            }
        ],
        emotion: 'concerned',
        ttl: 45
    },
    // === MAS MODULE ===
    {
        id: 'mas-agent-down',
        module: 'mas',
        context: 'agent-health',
        trigger: {
            condition: 'agents.some(agent => agent.status === "down")',
            priority: 'high',
            delay: 2
        },
        message: {
            ua: '🤖 Агент ${agentName} недоступний. Останній пінг: ${lastSeen}. Перезапустити або перевірити логи?',
            en: '🤖 Agent ${agentName} is down. Last ping: ${lastSeen}. Restart or check logs?'
        },
        actions: [
            {
                label: { ua: 'Перезапустити агент', en: 'Restart Agent' },
                action: 'restartAgent',
                type: 'primary',
                params: { agentId: '${agentId}' }
            },
            {
                label: { ua: 'Показати логи', en: 'Show Logs' },
                action: 'openLogs',
                type: 'secondary',
                params: { agent: '${agentId}' }
            }
        ],
        emotion: 'concerned',
        ttl: 30
    },
    {
        id: 'mas-degraded-performance',
        module: 'mas',
        context: 'agent-performance',
        trigger: {
            condition: 'agents.some(agent => agent.cpu > 0.9 || agent.memory > 0.9)',
            priority: 'medium',
            delay: 15
        },
        message: {
            ua: '📊 Агент ${agentName} з високим навантаженням. CPU: ${cpu}%, RAM: ${memory}%. Оптимізувати або масштабувати?',
            en: '📊 Agent ${agentName} under high load. CPU: ${cpu}%, RAM: ${memory}%. Optimize or scale?'
        },
        actions: [
            {
                label: { ua: 'Відкрити профіль', en: 'Open Profile' },
                action: 'openAgentProfile',
                type: 'primary',
                params: { agentId: '${agentId}' }
            },
            {
                label: { ua: 'Перезапустити задачу', en: 'Restart Task' },
                action: 'restartAgentTask',
                type: 'secondary',
                params: { agentId: '${agentId}' }
            }
        ],
        emotion: 'focused',
        ttl: 40
    },
    // === ETL MODULE ===
    {
        id: 'etl-queue-high',
        module: 'etl',
        context: 'queue-status',
        trigger: {
            condition: 'etlQueue > 1000',
            priority: 'medium',
            delay: 10
        },
        message: {
            ua: '📈 Черга ETL зросла до ${queueSize}. Потрібно масштабування? Відкрити налаштування конектора.',
            en: '📈 ETL queue grew to ${queueSize}. Scaling needed? Open connector settings.'
        },
        actions: [
            {
                label: { ua: 'Масштабувати воркери', en: 'Scale Workers' },
                action: 'scaleETLWorkers',
                type: 'primary'
            },
            {
                label: { ua: 'Налаштування конектора', en: 'Connector Settings' },
                action: 'openConnectorSettings',
                type: 'secondary'
            },
            {
                label: { ua: 'Пріоритизувати задачі', en: 'Prioritize Tasks' },
                action: 'prioritizeTasks',
                type: 'secondary'
            }
        ],
        emotion: 'focused',
        ttl: 50
    },
    {
        id: 'etl-pipeline-failed',
        module: 'etl',
        context: 'pipeline-status',
        trigger: {
            condition: 'pipelines.some(p => p.status === "failed")',
            priority: 'high',
            delay: 1
        },
        message: {
            ua: '💥 Пайплайн "${pipelineName}" завершився з помилкою. Перезапустити або перевірити конфігурацію?',
            en: '💥 Pipeline "${pipelineName}" failed. Restart or check configuration?'
        },
        actions: [
            {
                label: { ua: 'Перезапустити', en: 'Restart' },
                action: 'restartPipeline',
                type: 'primary',
                params: { pipelineId: '${pipelineId}' }
            },
            {
                label: { ua: 'Показати помилки', en: 'Show Errors' },
                action: 'showPipelineErrors',
                type: 'secondary',
                params: { pipelineId: '${pipelineId}' }
            },
            {
                label: { ua: 'Редагувати конфіг', en: 'Edit Config' },
                action: 'editPipelineConfig',
                type: 'secondary',
                params: { pipelineId: '${pipelineId}' }
            }
        ],
        emotion: 'alert',
        ttl: 30
    },
    // === CHRONO MODULE ===
    {
        id: 'chrono-anomaly-detected',
        module: 'chrono',
        context: 'anomaly-detection',
        trigger: {
            condition: 'anomalies.length > 0 && anomalies.some(a => a.severity === "high")',
            priority: 'medium',
            delay: 5
        },
        message: {
            ua: '🔍 Виявлено аномалії в даних за період ${timeRange}. Severity: ${severity}. Досліджувати?',
            en: '🔍 Anomalies detected in data for period ${timeRange}. Severity: ${severity}. Investigate?'
        },
        actions: [
            {
                label: { ua: 'Аналіз аномалій', en: 'Analyze Anomalies' },
                action: 'analyzeAnomalies',
                type: 'primary'
            },
            {
                label: { ua: 'Часова лінія', en: 'Timeline View' },
                action: 'openTimeline',
                type: 'secondary',
                params: { timeRange: '${timeRange}' }
            }
        ],
        emotion: 'focused',
        ttl: 60
    },
    // === OPENSEARCH MODULE ===
    {
        id: 'opensearch-connection-lost',
        module: 'opensearch',
        context: 'connection-status',
        trigger: {
            condition: 'opensearchStatus === "disconnected"',
            priority: 'high',
            delay: 3
        },
        message: {
            ua: '🔌 Втрачено зв\'язок з OpenSearch. Перевірити підключення або перезапустити сервіс?',
            en: '🔌 Lost connection to OpenSearch. Check connection or restart service?'
        },
        actions: [
            {
                label: { ua: 'Перевірити зв\'язок', en: 'Test Connection' },
                action: 'testOpenSearchConnection',
                type: 'primary'
            },
            {
                label: { ua: 'Перезапустити', en: 'Restart Service' },
                action: 'restartOpenSearch',
                type: 'secondary'
            }
        ],
        emotion: 'concerned',
        ttl: 25
    },
    // === SIMULATOR MODULE ===
    {
        id: 'simulator-scenario-completed',
        module: 'simulator',
        context: 'simulation-status',
        trigger: {
            condition: 'simulations.some(s => s.status === "completed")',
            priority: 'low',
            delay: 2
        },
        message: {
            ua: '✅ Сценарій "${scenarioName}" завершено. Результати готові для аналізу.',
            en: '✅ Scenario "${scenarioName}" completed. Results ready for analysis.'
        },
        actions: [
            {
                label: { ua: 'Переглянути результати', en: 'View Results' },
                action: 'viewSimulationResults',
                type: 'primary',
                params: { simulationId: '${simulationId}' }
            },
            {
                label: { ua: 'Експорт звіту', en: 'Export Report' },
                action: 'exportSimulationReport',
                type: 'secondary',
                params: { simulationId: '${simulationId}' }
            }
        ],
        emotion: 'happy',
        ttl: 120
    },
    // === ADMIN MODULE ===
    {
        id: 'admin-security-alert',
        module: 'admin',
        context: 'security',
        trigger: {
            condition: 'securityEvents.some(e => e.severity === "critical")',
            priority: 'critical',
            delay: 0
        },
        message: {
            ua: '🚨 БЕЗПЕКА: Виявлено підозрілу активність. Тип: ${eventType}. Негайно перевірити!',
            en: '🚨 SECURITY: Suspicious activity detected. Type: ${eventType}. Check immediately!'
        },
        actions: [
            {
                label: { ua: 'Журнал безпеки', en: 'Security Log' },
                action: 'openSecurityLog',
                type: 'danger'
            },
            {
                label: { ua: 'Блокувати IP', en: 'Block IP' },
                action: 'blockSuspiciousIP',
                type: 'danger',
                params: { ip: '${sourceIP}' }
            }
        ],
        emotion: 'alert',
        ttl: 300,
        repeatInterval: 60
    },
    // === ONBOARDING SCENARIOS ===
    {
        id: 'onboarding-first-visit',
        module: 'dashboard',
        context: 'first-visit',
        trigger: {
            condition: 'isFirstVisit === true',
            priority: 'low',
            delay: 2
        },
        message: {
            ua: '👋 Вітаємо в Nexus Core! Я ваш AI-гід. Хочете швидкий тур по системі?',
            en: '👋 Welcome to Nexus Core! I\'m your AI Guide. Want a quick system tour?'
        },
        actions: [
            {
                label: { ua: 'Почати тур', en: 'Start Tour' },
                action: 'startOnboardingTour',
                type: 'primary'
            },
            {
                label: { ua: 'Пропустити', en: 'Skip' },
                action: 'skipOnboarding',
                type: 'secondary'
            }
        ],
        emotion: 'happy',
        ttl: 180
    },
    // === NETWORK CONNECTIVITY ===
    {
        id: 'network-offline',
        module: '*', // Global scenario
        context: 'connectivity',
        trigger: {
            condition: 'navigator.onLine === false',
            priority: 'high',
            delay: 1
        },
        message: {
            ua: '📡 Зв\'язок втрачено. Працюю в офлайн-режимі. Перевірте мережеве підключення.',
            en: '📡 Connection lost. Working in offline mode. Check network connection.'
        },
        actions: [
            {
                label: { ua: 'Повторити', en: 'Retry' },
                action: 'retryConnection',
                type: 'primary'
            },
            {
                label: { ua: 'Офлайн режим', en: 'Offline Mode' },
                action: 'enterOfflineMode',
                type: 'secondary'
            }
        ],
        emotion: 'concerned',
        ttl: 20,
        repeatInterval: 30
    }
];
// Функція для оцінки умов тригерів
export const evaluateTrigger = (condition, context) => {
    try {
        // Простий evaluer для безпечної оцінки умов
        // В продакшені варто використовувати більш безпечну альтернативу
        return new Function(...Object.keys(context), `return ${condition}`)(...Object.values(context));
    }
    catch (error) {
        console.error('Error evaluating trigger condition:', condition, error);
        return false;
    }
};
// Функція для підстановки змінних у повідомлення
export const interpolateMessage = (message, context) => {
    return message.replace(/\$\{([^}]+)\}/g, (match, variable) => {
        return context[variable] || match;
    });
};
// Фільтрація сценаріїв за модулем та пріоритетом
export const getActiveScenarios = (module, context, minPriority = 'low') => {
    const priorityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
    return guideScenarios
        .filter(scenario => (scenario.module === module || scenario.module === '*') &&
        priorityLevels[scenario.trigger.priority] >= priorityLevels[minPriority] &&
        evaluateTrigger(scenario.trigger.condition, context))
        .sort((a, b) => priorityLevels[b.trigger.priority] - priorityLevels[a.trigger.priority]);
};
export default {
    scenarios: guideScenarios,
    evaluateTrigger,
    interpolateMessage,
    getActiveScenarios
};
