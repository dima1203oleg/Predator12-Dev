# 🎮 Nexus Core - Unified Command Center (Пульт Керування)

**Єдиний веб-інтерфейс для повного контролю системи**

---

## 🎯 Концепція

**Command Center (Пульт Керування)** — це центральний веб-інтерфейс, який об'єднує всі функції системи Predator Analytics в одному місці. Користувач отримує повний контроль над даними, агентами, моделями та аналітикою без необхідності перемикатися між різними додатками.

### Філософія Дизайну

```
┌─────────────────────────────────────────────────────────────┐
│  "Один інтерфейс для керування всім: від завантаження даних │
│   до AI-аналізу, від моніторингу агентів до експорту        │
│   персоналізованих звітів"                                  │
└─────────────────────────────────────────────────────────────┘
```

### Ключові Принципи

1. **Єдина Точка Входу**: Всі функції доступні з одного інтерфейсу
2. **Контекстна Навігація**: Інтуїтивні переходи між модулями
3. **Real-Time Updates**: WebSocket для живих оновлень
4. **Адаптивний UI**: Підтримка 3D/2D, десктоп/мобайл
5. **Персоналізація**: Налаштування панелей під користувача
6. **Доступність**: WCAG 2.1 AA compliance

---

## 🏗️ Архітектура Інтерфейсу

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEXUS COMMAND CENTER                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Top Navigation Bar                                       │   │
│  │  [Logo] [Dashboard] [Data] [AI] [Analytics] [Admin] [👤] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────┬────────────────────────────────────────────┐   │
│  │             │                                            │   │
│  │  Sidebar    │          Main Content Area                │   │
│  │             │                                            │   │
│  │  • Overview │  ┌──────────────────────────────────────┐ │   │
│  │  • Upload   │  │                                      │ │   │
│  │  • Search   │  │      Module-Specific Content         │ │   │
│  │  • Agents   │  │                                      │ │   │
│  │  • Models   │  │  • 3D/2D Dashboard                   │ │   │
│  │  • Reports  │  │  • Data Feed                         │ │   │
│  │  • Settings │  │  • AI Terminal                       │ │   │
│  │             │  │  • Analytics Deck                    │ │   │
│  │             │  │  • Agent Map                         │ │   │
│  │             │  │                                      │ │   │
│  │             │  └──────────────────────────────────────┘ │   │
│  │             │                                            │   │
│  └─────────────┴────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Status Bar                                               │   │
│  │  🟢 30/30 Agents  |  58 Models Active  |  🔐 PII Locked   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Модулі Command Center

### 1. 🎨 3D/2D Dashboard (Головна Панель)

**Призначення**: Візуалізація даних у 3D/2D з можливістю взаємодії

```typescript
// frontend/components/Dashboard/Dashboard.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useStore } from '@/store/dashboardStore';

export function Dashboard() {
  const { mode, data, filters } = useStore();
  
  return (
    <div className="dashboard-container">
      {/* Header with Controls */}
      <DashboardHeader>
        <ViewToggle mode={mode} onChange={setMode} />
        <TimeRangeSelector />
        <FilterPanel />
        <ExportButton />
      </DashboardHeader>
      
      {/* Main Visualization */}
      {mode === '3d' ? (
        <Dashboard3D data={data} filters={filters} />
      ) : (
        <Dashboard2D data={data} filters={filters} />
      )}
      
      {/* Legend */}
      <Legend items={[
        { color: 'red', label: 'High Risk' },
        { color: 'yellow', label: 'Medium Risk' },
        { color: 'green', label: 'Low Risk' }
      ]} />
    </div>
  );
}
```

**Функції**:
- ✅ 3D візуалізація кластерів (Three.js)
- ✅ Fallback на 2D при відсутності WebGL
- ✅ Інтерактивні вузли (клік → деталі)
- ✅ Фільтри по часу, ризику, типу даних
- ✅ Експорт зображення (PNG/SVG)
- ✅ Анімація змін у real-time
- ✅ Легенда та контекстні підказки

---

### 2. 📰 Data Feed (Стрічка Аномалій)

**Призначення**: Instagram-style стрічка виявлених аномалій у реальному часі

```typescript
// frontend/components/Feed/DataFeed.tsx
import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AnomalyCard } from './AnomalyCard';

export function DataFeed() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const socket = useWebSocket('/ws/feed');
  
  useEffect(() => {
    socket.on('anomaly:new', (anomaly: Anomaly) => {
      setAnomalies(prev => [anomaly, ...prev].slice(0, 100));
    });
    
    socket.on('anomaly:updated', (update) => {
      setAnomalies(prev => 
        prev.map(a => a.id === update.id ? { ...a, ...update } : a)
      );
    });
  }, [socket]);
  
  return (
    <div className="feed-container infinite-scroll">
      {anomalies.map(anomaly => (
        <AnomalyCard
          key={anomaly.id}
          anomaly={anomaly}
          onDrillDown={() => openDetails(anomaly)}
          onDismiss={() => dismissAnomaly(anomaly.id)}
          onEscalate={() => escalate(anomaly)}
        />
      ))}
    </div>
  );
}

// AnomalyCard Component
function AnomalyCard({ anomaly, onDrillDown, onDismiss, onEscalate }) {
  return (
    <div className={`anomaly-card risk-${anomaly.riskLevel}`}>
      {/* Header */}
      <div className="card-header">
        <span className="timestamp">{formatTime(anomaly.timestamp)}</span>
        <span className="agent-badge">{anomaly.detectedBy}</span>
        <span className={`risk-badge ${anomaly.riskLevel}`}>
          {anomaly.riskLevel}
        </span>
      </div>
      
      {/* Content */}
      <h3>{anomaly.title}</h3>
      <p>{anomaly.description}</p>
      
      {/* Evidence Chips */}
      <div className="evidence-chips">
        {anomaly.evidence.map(e => (
          <Chip key={e.id} label={e.type} onClick={() => viewEvidence(e)} />
        ))}
      </div>
      
      {/* Actions */}
      <div className="card-actions">
        <Button onClick={onDrillDown}>🔍 Drill Down</Button>
        <Button onClick={onDismiss}>✖️ Dismiss</Button>
        <Button onClick={onEscalate}>⚠️ Escalate</Button>
      </div>
      
      {/* Stats */}
      <div className="stats">
        <span>Confidence: {anomaly.confidence}%</span>
        <span>Impact: {anomaly.impact}</span>
      </div>
    </div>
  );
}
```

**Функції**:
- ✅ Real-time streaming через WebSocket
- ✅ Infinite scroll з lazy loading
- ✅ Кольорове кодування за рівнем ризику
- ✅ Drill-down у деталі аномалії
- ✅ Dismiss/Escalate actions
- ✅ Фільтри по агенту, ризику, типу
- ✅ Search по тексту

---

### 3. 🤖 AI Terminal (Чат-Інтерфейс)

**Призначення**: Natural language queries з RAG та підтримкою файлів

```typescript
// frontend/components/AITerminal/Terminal.tsx
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { FileUpload } from './FileUpload';

export function AITerminal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, uploadFile } = useChat();
  
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await sendMessage({
        query: input,
        context: 'nexus',
        rag_enabled: true,
        history: messages.slice(-5)
      });
      
      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        sources: response.sources,
        visualizations: response.visualizations
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      const result = await uploadFile(file);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `✅ File uploaded: ${file.name}. You can now ask questions about it.`
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: `❌ Failed to upload ${file.name}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="ai-terminal">
      {/* Message History */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="input-area">
        <FileUpload onUpload={handleFileUpload} />
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask me anything... (e.g., Show import schemes from Poland 2023)"
          rows={3}
        />
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? '⏳' : '📤'} Send
        </button>
      </div>
      
      {/* Suggestions */}
      <div className="suggestions">
        <button onClick={() => setInput('Show top anomalies this week')}>
          📊 Top Anomalies
        </button>
        <button onClick={() => setInput('Analyze customs data from Poland')}>
          🔍 Poland Analysis
        </button>
        <button onClick={() => setInput('Generate morning report')}>
          📰 Morning Report
        </button>
      </div>
    </div>
  );
}

// MessageBubble Component
function MessageBubble({ message }) {
  return (
    <div className={`message ${message.role}`}>
      <div className="message-content">
        <ReactMarkdown>{message.content}</ReactMarkdown>
        
        {/* Visualizations */}
        {message.visualizations?.map(viz => (
          <PlotlyChart key={viz.id} data={viz.data} layout={viz.layout} />
        ))}
        
        {/* Sources */}
        {message.sources && (
          <div className="sources">
            <strong>Sources:</strong>
            {message.sources.map(s => (
              <a key={s.id} href={s.url} target="_blank">
                {s.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Функції**:
- ✅ Natural language queries
- ✅ RAG з Qdrant/PG/OpenSearch
- ✅ File upload (PDF/Excel/CSV)
- ✅ Markdown rendering
- ✅ Plotly visualizations у відповідях
- ✅ Source citations
- ✅ Conversation history
- ✅ Quick suggestion buttons

---

### 4. 📈 Analytics Deck (OpenSearch Dashboard)

**Призначення**: Kibana-style аналітика з iframes

```typescript
// frontend/components/Analytics/AnalyticsDeck.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AnalyticsDeck() {
  const { user, hasRole } = useAuth();
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    loadDashboards();
  }, []);
  
  const loadDashboards = async () => {
    const response = await fetch('/api/v1/analytics/dashboards');
    const data = await response.json();
    setDashboards(data.dashboards);
    setSelectedDashboard(data.dashboards[0]);
  };
  
  const embedUrl = selectedDashboard 
    ? `${process.env.OPENSEARCH_URL}/app/dashboards#/view/${selectedDashboard.id}?embed=true&_g=${encodeFilters(filters)}`
    : null;
  
  return (
    <div className="analytics-deck">
      {/* Dashboard Selector */}
      <div className="dashboard-selector">
        {dashboards.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDashboard(d)}
            className={d.id === selectedDashboard?.id ? 'active' : ''}
          >
            {d.name}
          </button>
        ))}
      </div>
      
      {/* Filters */}
      <div className="filters-panel">
        <DateRangePicker 
          value={filters.timeRange} 
          onChange={range => setFilters({ ...filters, timeRange: range })}
        />
        <AgentFilter 
          value={filters.agent}
          onChange={agent => setFilters({ ...filters, agent })}
        />
        <RiskLevelFilter 
          value={filters.riskLevel}
          onChange={level => setFilters({ ...filters, riskLevel: level })}
        />
      </div>
      
      {/* Embedded Dashboard */}
      {embedUrl && (
        <iframe
          src={embedUrl}
          className="opensearch-iframe"
          title={selectedDashboard.name}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      )}
      
      {/* Raw Mode (Pro Only) */}
      {hasRole('pro') && (
        <div className="raw-mode-toggle">
          <button onClick={() => openRawMode()}>
            🔧 Raw Mode
          </button>
        </div>
      )}
    </div>
  );
}
```

**Функції**:
- ✅ Embedded OpenSearch Dashboards
- ✅ Multiple pre-built dashboards
- ✅ Filter synchronization
- ✅ Saved views
- ✅ Raw mode for Pro users
- ✅ Export to PDF/PNG
- ✅ Share dashboard links

---

### 5. 🗺️ Agent Map (Карта Агентів)

**Призначення**: Real-time візуалізація роботи агентів

```typescript
// frontend/components/Agents/AgentMap.tsx
import { useEffect, useState } from 'react';
import { Network } from 'vis-network';
import { useWebSocket } from '@/hooks/useWebSocket';

export function AgentMap() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const socket = useWebSocket('/ws/agents');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize network
    const network = new Network(
      containerRef.current,
      { nodes, edges },
      {
        nodes: {
          shape: 'dot',
          scaling: {
            min: 10,
            max: 30
          }
        },
        edges: {
          arrows: 'to',
          smooth: true
        },
        physics: {
          stabilization: false,
          barnesHut: {
            gravitationalConstant: -80000,
            springConstant: 0.001,
            springLength: 200
          }
        }
      }
    );
    
    // WebSocket updates
    socket.on('agent:status', (update) => {
      setNodes(prev => prev.map(n => 
        n.id === update.agent_id 
          ? { ...n, color: getStatusColor(update.status) }
          : n
      ));
    });
    
    socket.on('agent:task', (task) => {
      // Add temporary edge for task flow
      setEdges(prev => [...prev, {
        from: task.from_agent,
        to: task.to_agent,
        label: task.type,
        color: { color: 'blue', opacity: 0.5 }
      }]);
      
      // Remove after 2 seconds
      setTimeout(() => {
        setEdges(prev => prev.filter(e => 
          e.from !== task.from_agent || e.to !== task.to_agent
        ));
      }, 2000);
    });
    
    return () => {
      network.destroy();
    };
  }, [nodes, edges, socket]);
  
  return (
    <div className="agent-map-container">
      {/* Legend */}
      <div className="legend">
        <span><div className="dot green" /> Active</span>
        <span><div className="dot yellow" /> Busy</span>
        <span><div className="dot red" /> Error</span>
        <span><div className="dot gray" /> Idle</span>
      </div>
      
      {/* Network Visualization */}
      <div ref={containerRef} className="network" />
      
      {/* Stats */}
      <div className="stats-panel">
        <div className="stat">
          <strong>30</strong>
          <span>Total Agents</span>
        </div>
        <div className="stat">
          <strong>{nodes.filter(n => n.status === 'active').length}</strong>
          <span>Active Now</span>
        </div>
        <div className="stat">
          <strong>{edges.length}</strong>
          <span>Tasks Running</span>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors = {
    active: '#4ade80',
    busy: '#fbbf24',
    error: '#f87171',
    idle: '#9ca3af'
  };
  return colors[status] || colors.idle;
}
```

**Функції**:
- ✅ Real-time agent status
- ✅ Task flow visualization
- ✅ Interactive nodes (click → details)
- ✅ Auto-layout з physics
- ✅ Color-coded by status
- ✅ Stats dashboard
- ✅ Filter by category/status

---

### 6. 📤 Upload Manager (Менеджер Завантажень)

**Призначення**: Drag-drop завантаження файлів з прогресом

```typescript
// frontend/components/Upload/UploadManager.tsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useWebSocket } from '@/hooks/useWebSocket';

export function UploadManager() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const socket = useWebSocket('/ws/upload');
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const uploadId = crypto.randomUUID();
      
      // Add to uploads list
      setUploads(prev => [...prev, {
        id: uploadId,
        file,
        progress: 0,
        status: 'uploading'
      }]);
      
      // Start upload
      await uploadFile(file, uploadId);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf']
    },
    maxSize: 700 * 1024 * 1024  // 700MB
  });
  
  useEffect(() => {
    socket.on('upload:progress', (data) => {
      setUploads(prev => prev.map(u =>
        u.id === data.upload_id
          ? { ...u, progress: data.progress }
          : u
      ));
    });
    
    socket.on('upload:complete', (data) => {
      setUploads(prev => prev.map(u =>
        u.id === data.upload_id
          ? { ...u, status: 'complete', result: data.result }
          : u
      ));
    });
    
    socket.on('upload:error', (data) => {
      setUploads(prev => prev.map(u =>
        u.id === data.upload_id
          ? { ...u, status: 'error', error: data.error }
          : u
      ));
    });
  }, [socket]);
  
  const uploadFile = async (file: File, uploadId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_id', uploadId);
    
    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  return (
    <div className="upload-manager">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>📥 Drop files here...</p>
        ) : (
          <div className="dropzone-content">
            <p>📂 Drag & drop files here, or click to select</p>
            <p className="hint">
              Supported: CSV, Excel, PDF (max 700MB)
            </p>
          </div>
        )}
      </div>
      
      {/* Upload List */}
      <div className="uploads-list">
        {uploads.map(upload => (
          <UploadCard key={upload.id} upload={upload} />
        ))}
      </div>
    </div>
  );
}

function UploadCard({ upload }) {
  return (
    <div className={`upload-card ${upload.status}`}>
      <div className="file-info">
        <span className="filename">{upload.file.name}</span>
        <span className="filesize">{formatSize(upload.file.size)}</span>
      </div>
      
      {upload.status === 'uploading' && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${upload.progress}%` }}
          />
          <span className="progress-text">{upload.progress}%</span>
        </div>
      )}
      
      {upload.status === 'complete' && (
        <div className="result">
          ✅ {upload.result.rows_imported} rows imported
          <button onClick={() => viewDataset(upload.result.dataset_id)}>
            View Dataset
          </button>
        </div>
      )}
      
      {upload.status === 'error' && (
        <div className="error">
          ❌ {upload.error}
          <button onClick={() => retry(upload.id)}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

**Функції**:
- ✅ Drag-drop interface
- ✅ Multi-file upload
- ✅ Real-time progress (WebSocket)
- ✅ Chunked upload (великі файли)
- ✅ Validation (type, size)
- ✅ Error handling з retry
- ✅ Success actions (view dataset)

---

### 7. 🔐 PII Toggle (Керування Доступом)

**Призначення**: Unlock/lock PII даних з аудитом

```typescript
// frontend/components/Billing/PIIToggle.tsx
export function PIIToggle() {
  const { user, hasRole } = useAuth();
  const [piiUnlocked, setPiiUnlocked] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleToggle = async () => {
    if (!hasRole('view_pii')) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (piiUnlocked) {
      // Lock PII
      setPiiUnlocked(false);
      store.setState({ maskPII: true });
    } else {
      // Unlock PII (audit log)
      await fetch('/api/v1/audit/pii-disclosure', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          timestamp: new Date().toISOString(),
          reason: 'manual_unlock'
        })
      });
      
      setPiiUnlocked(true);
      store.setState({ maskPII: false });
    }
  };
  
  return (
    <div className="pii-toggle-container">
      <button
        onClick={handleToggle}
        className={`toggle-btn ${piiUnlocked ? 'unlocked' : 'locked'}`}
      >
        {piiUnlocked ? '🔓 PII Unlocked' : '🔒 Unlock PII'}
      </button>
      
      {piiUnlocked && (
        <div className="warning">
          ⚠️ PII is now visible. All actions are audited.
        </div>
      )}
      
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
```

---

## 🎨 Стилізація та Тема

```css
/* frontend/styles/command-center.css */

:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-secondary: #94a3b8;
}

.command-center {
  display: grid;
  grid-template-rows: 60px 1fr 40px;
  height: 100vh;
  background: var(--background);
  color: var(--text);
}

.top-nav {
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: var(--surface);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.main-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  overflow: hidden;
}

.sidebar {
  background: var(--surface);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

.content-area {
  overflow-y: auto;
  padding: 20px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: var(--surface);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    left: -250px;
    transition: left 0.3s;
    z-index: 100;
  }
  
  .sidebar.open {
    left: 0;
  }
}
```

---

## 🚀 Швидкий Старт

```bash
# 1. Clone and setup
git clone <repo>
cd predator-analytics
make bootstrap

# 2. Start all services
make start

# 3. Open browser
open http://localhost:3000

# 4. Login with demo credentials
# Email: demo@predator.ai
# Password: demo123

# 5. Start exploring!
```

---

## 📊 Метрики Успіху

- ✅ **Time to First Insight**: < 5 хвилин від входу до першого інсайту
- ✅ **UI Response Time**: < 200ms для всіх інтерактивних елементів
- ✅ **3D FPS**: ≥ 30 FPS на рекомендованому обладнанні
- ✅ **WebSocket Latency**: < 100ms для real-time оновлень
- ✅ **Mobile Usability**: Повна функціональність на мобільних
- ✅ **Accessibility**: WCAG 2.1 AA compliance

---

**Document Version**: 11.0  
**Last Updated**: 2025-01-06  
**Status**: ✅ **READY FOR IMPLEMENTATION**

