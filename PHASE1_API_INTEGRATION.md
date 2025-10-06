# Phase 1: API Integration - Детальний План

**Timeline:** 2-3 дні  
**Priority:** HIGH ⚡  
**Status:** 🟡 Ready to Start

---

## 📋 Overview

Інтегрувати frontend з backend API для отримання реальних даних замість mock-даних.

---

## 🎯 Goals

1. ✅ Створити backend endpoints для dashboard
2. ✅ Оновити frontend для використання реальних даних
3. ✅ Додати error handling
4. ✅ Додати loading states
5. ✅ Перевірити інтеграцію

---

## 📁 Backend Implementation

### Step 1: Create Dashboard Endpoint

**File:** `predator12-local/backend/app/api/v1/endpoints/dashboard.py`

```python
"""
Dashboard API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import psutil

from app.db.session import get_db
from app.schemas.dashboard import DashboardStats, SystemStatus
from app.core.cache import cache_response

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
@cache_response(expire=30)  # Cache for 30 seconds
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db)
):
    """
    Get dashboard statistics
    
    Returns:
        - total_models: Total number of AI models
        - active_requests: Current active requests
        - uptime_seconds: System uptime
        - total_requests: Total requests processed
        - success_rate: Success rate percentage
    """
    # Get models count
    from app.models.model import AIModel
    models_count = await db.execute(
        "SELECT COUNT(*) FROM ai_models WHERE is_active = true"
    )
    total_models = models_count.scalar_one()
    
    # Get requests stats
    from app.models.request import RequestLog
    
    # Active requests (last 5 minutes)
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
    active_requests_count = await db.execute(
        "SELECT COUNT(*) FROM request_logs WHERE created_at > :time AND status = 'processing'",
        {"time": five_minutes_ago}
    )
    active_requests = active_requests_count.scalar_one()
    
    # Total requests (last 24 hours)
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    total_requests_count = await db.execute(
        "SELECT COUNT(*) FROM request_logs WHERE created_at > :time",
        {"time": twenty_four_hours_ago}
    )
    total_requests = total_requests_count.scalar_one()
    
    # Success rate
    success_requests_count = await db.execute(
        "SELECT COUNT(*) FROM request_logs WHERE created_at > :time AND status = 'success'",
        {"time": twenty_four_hours_ago}
    )
    success_requests = success_requests_count.scalar_one()
    success_rate = (success_requests / total_requests * 100) if total_requests > 0 else 100
    
    # System uptime
    from app.core.config import settings
    uptime_seconds = int((datetime.utcnow() - settings.START_TIME).total_seconds())
    
    return DashboardStats(
        total_models=total_models,
        active_requests=active_requests,
        uptime_seconds=uptime_seconds,
        total_requests=total_requests,
        success_rate=round(success_rate, 2)
    )


@router.get("/system-status", response_model=SystemStatus)
@cache_response(expire=10)
async def get_system_status():
    """
    Get system status information
    
    Returns:
        - services: Status of all services
        - resources: CPU, Memory, Disk usage
    """
    # Check services
    services = {
        "backend": "online",
        "database": await check_database(),
        "redis": await check_redis(),
        "qdrant": await check_qdrant(),
        "keycloak": await check_keycloak(),
    }
    
    # System resources
    cpu_usage = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    resources = {
        "cpu_usage": cpu_usage,
        "memory_used": memory.percent,
        "disk_used": disk.percent
    }
    
    return SystemStatus(
        services=services,
        resources=resources
    )


async def check_database() -> str:
    """Check PostgreSQL connection"""
    try:
        from app.db.session import engine
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        return "online"
    except:
        return "offline"


async def check_redis() -> str:
    """Check Redis connection"""
    try:
        from app.core.cache import redis_client
        await redis_client.ping()
        return "online"
    except:
        return "offline"


async def check_qdrant() -> str:
    """Check Qdrant connection"""
    try:
        from qdrant_client import QdrantClient
        client = QdrantClient(url="http://qdrant:6333")
        client.get_collections()
        return "online"
    except:
        return "offline"


async def check_keycloak() -> str:
    """Check Keycloak connection"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get("http://keycloak:8080/health")
            return "online" if response.status_code == 200 else "offline"
    except:
        return "offline"
```

### Step 2: Create Schemas

**File:** `predator12-local/backend/app/schemas/dashboard.py`

```python
"""
Dashboard schemas
"""
from pydantic import BaseModel, Field
from typing import Dict


class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_models: int = Field(..., description="Total number of AI models")
    active_requests: int = Field(..., description="Current active requests")
    uptime_seconds: int = Field(..., description="System uptime in seconds")
    total_requests: int = Field(..., description="Total requests in last 24h")
    success_rate: float = Field(..., description="Success rate percentage")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_models": 120,
                "active_requests": 15,
                "uptime_seconds": 86400,
                "total_requests": 1500,
                "success_rate": 98.5
            }
        }


class SystemStatus(BaseModel):
    """System status"""
    services: Dict[str, str] = Field(..., description="Status of services")
    resources: Dict[str, float] = Field(..., description="System resources")
    
    class Config:
        json_schema_extra = {
            "example": {
                "services": {
                    "backend": "online",
                    "database": "online",
                    "redis": "online",
                    "qdrant": "online",
                    "keycloak": "online"
                },
                "resources": {
                    "cpu_usage": 45.2,
                    "memory_used": 60.5,
                    "disk_used": 35.8
                }
            }
        }
```

### Step 3: Register Router

**File:** `predator12-local/backend/app/api/v1/api.py`

```python
from fastapi import APIRouter
from app.api.v1.endpoints import dashboard, models, analytics

api_router = APIRouter()

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"]
)

api_router.include_router(
    models.router,
    prefix="/models",
    tags=["models"]
)

api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["analytics"]
)
```

### Step 4: Add Cache Layer

**File:** `predator12-local/backend/app/core/cache.py`

```python
"""
Redis cache utilities
"""
from functools import wraps
from typing import Optional
import json
import hashlib

from redis.asyncio import Redis
from app.core.config import settings

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True
)


def cache_response(expire: int = 60):
    """
    Cache decorator for API responses
    
    Args:
        expire: Cache expiration in seconds
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__module__}:{func.__name__}:{hashlib.md5(str(kwargs).encode()).hexdigest()}"
            
            # Try to get from cache
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Save to cache
            await redis_client.setex(
                cache_key,
                expire,
                json.dumps(result.dict() if hasattr(result, 'dict') else result)
            )
            
            return result
        return wrapper
    return decorator
```

---

## 🎨 Frontend Implementation

### Step 1: Update API Client

**File:** `predator12-local/frontend/src/api/client.ts`

```typescript
/**
 * API Client for Predator12 Platform
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DashboardStats {
  total_models: number;
  active_requests: number;
  uptime_seconds: number;
  total_requests: number;
  success_rate: number;
}

interface SystemStatus {
  services: Record<string, string>;
  resources: Record<string, number>;
}

interface APIError {
  detail: string;
  status: number;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error: APIError = {
          detail: await response.text(),
          status: response.status,
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/v1/dashboard/stats');
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/api/v1/dashboard/system-status');
  }

  // Health check
  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new APIClient();
export type { DashboardStats, SystemStatus, APIError };
```

### Step 2: Update Hooks

**File:** `predator12-local/frontend/src/hooks/useAPI.ts`

```typescript
/**
 * Custom hooks for API integration
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient, DashboardStats, SystemStatus } from '../api/client';

/**
 * Fetch dashboard statistics
 */
export function useStats(): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 3000,
    retry: 3,
  });
}

/**
 * Fetch system status
 */
export function useSystemStatus(): UseQueryResult<SystemStatus, Error> {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: () => apiClient.getSystemStatus(),
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
    retry: 3,
  });
}

/**
 * Health check
 */
export function useHealth(): UseQueryResult<{ status: string }, Error> {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.checkHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
  });
}
```

### Step 3: Update Main App

**File:** `predator12-local/frontend/src/main.tsx`

```typescript
// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStats, useSystemStatus } from './hooks/useAPI';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

const App = () => {
  // Fetch real data from API
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats();
  const { data: systemStatus, isLoading: statusLoading } = useSystemStatus();

  // Loading state
  if (statsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading Predator AI...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            Connection Error
          </div>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>
            Unable to connect to backend API
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              fontSize: '16px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate uptime display
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        color: 'white',
        marginBottom: '50px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          🚀 Predator AI Platform
        </h1>
        <p style={{
          fontSize: '20px',
          opacity: 0.9
        }}>
          Enterprise-Grade AI Infrastructure
        </p>
        
        {/* Success Rate Badge */}
        <div style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '8px 20px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          ✅ Success Rate: {stats?.success_rate}%
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto 50px'
      }}>
        <StatCard 
          icon="🤖"
          title="Total Models"
          value={stats?.total_models || 0}
          color="#0066cc"
        />
        <StatCard 
          icon="⚡"
          title="Active Requests"
          value={stats?.active_requests || 0}
          color="#00cc66"
        />
        <StatCard 
          icon="⏱️"
          title="Uptime"
          value={formatUptime(stats?.uptime_seconds || 0)}
          color="#cc6600"
        />
        <StatCard 
          icon="📊"
          title="Total Requests (24h)"
          value={stats?.total_requests || 0}
          color="#9933cc"
        />
      </div>

      {/* System Status */}
      {systemStatus && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            🖥️ System Status
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {Object.entries(systemStatus.services).map(([service, status]) => (
              <div key={service} style={{
                padding: '15px',
                background: status === 'online' ? '#e8f5e9' : '#ffebee',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {service}
                </span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: status === 'online' ? '#4caf50' : '#f44336',
                  color: 'white'
                }}>
                  {status}
                </span>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              📈 Resource Usage
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <ResourceBar 
                label="CPU"
                value={systemStatus.resources.cpu_usage}
                color="#2196f3"
              />
              <ResourceBar 
                label="Memory"
                value={systemStatus.resources.memory_used}
                color="#ff9800"
              />
              <ResourceBar 
                label="Disk"
                value={systemStatus.resources.disk_used}
                color="#4caf50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <div style={{
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 102, 204, 0.1)',
    border: '2px solid #e3f2fd',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
  }}>
    <div style={{fontSize: '48px', marginBottom: '10px'}}>{icon}</div>
    <div style={{fontSize: '14px', color: '#666', marginBottom: '5px'}}>{title}</div>
    <div style={{fontSize: '28px', fontWeight: 'bold', color: color}}>{value}</div>
  </div>
);

// Resource Bar Component
const ResourceBar = ({ label, value, color }) => (
  <div>
    <div style={{ 
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
      fontSize: '14px',
      color: '#666'
    }}>
      <span>{label}</span>
      <span style={{ fontWeight: 'bold' }}>{value.toFixed(1)}%</span>
    </div>
    <div style={{
      height: '8px',
      background: '#e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        height: '100%',
        width: `${value}%`,
        background: color,
        transition: 'width 0.3s ease'
      }} />
    </div>
  </div>
);

// Render App with Query Provider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Step 4: Install Dependencies

**File:** `predator12-local/frontend/package.json`

```bash
cd predator12-local/frontend
npm install @tanstack/react-query
```

---

## ✅ Testing Checklist

### Backend Tests

- [ ] Test `/api/v1/dashboard/stats` endpoint
- [ ] Test `/api/v1/dashboard/system-status` endpoint
- [ ] Verify database queries performance
- [ ] Test cache functionality
- [ ] Test error handling

### Frontend Tests

- [ ] Test API client methods
- [ ] Test hooks (useStats, useSystemStatus)
- [ ] Test loading states
- [ ] Test error states
- [ ] Test auto-refresh functionality

### Integration Tests

- [ ] Frontend connects to backend
- [ ] Data updates in real-time
- [ ] Error messages display correctly
- [ ] Loading animations work
- [ ] Cache works correctly

---

## 🚀 Deployment Steps

### 1. Backend

```bash
cd predator12-local/backend

# Create new files
mkdir -p app/api/v1/endpoints
touch app/api/v1/endpoints/dashboard.py
mkdir -p app/schemas
touch app/schemas/dashboard.py
touch app/core/cache.py

# Add dependencies to requirements.txt
echo "redis[hiredis]" >> requirements.txt
echo "psutil" >> requirements.txt

# Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### 2. Frontend

```bash
cd predator12-local/frontend

# Install dependencies
npm install @tanstack/react-query

# Update files (використати код вище)

# Build
npm run build

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### 3. Verify

```bash
# Check backend
curl http://localhost:8000/api/v1/dashboard/stats
curl http://localhost:8000/api/v1/dashboard/system-status

# Check frontend
open http://localhost:3000

# Check logs
docker logs predator12-local-backend-1
docker logs predator12-local-frontend-1
```

---

## 📝 Notes

- Backend кеш встановлено на 30 секунд для stats
- Frontend автоматично оновлює дані кожні 5-10 секунд
- Додано proper error handling
- Додано loading states
- Додано retry logic

---

## 🎉 Expected Results

After completion:

✅ Dashboard показує реальні дані з backend  
✅ Автоматичне оновлення кожні 5 секунд  
✅ System status показує стан всіх сервісів  
✅ Resource usage відображається в real-time  
✅ Error handling працює коректно  
✅ Loading states відображаються  
✅ Performance оптимізовано через caching  

---

**Status:** Ready to implement  
**Priority:** HIGH  
**Estimated Time:** 2-3 днів
