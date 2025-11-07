# 🔐 Keycloak SSO Integration - Quick Start Guide

## 📦 Що додано

### 1. **Docker Compose Configuration**
- ✅ Keycloak 23.0 контейнер
- ✅ Окрема PostgreSQL база для Keycloak
- ✅ Auto-import realm конфігурації
- ✅ Health checks для всіх сервісів

### 2. **Keycloak Realm Configuration**
**Файл:** `predator-analytics/keycloak/realms/predator-realm.json`

#### Realm: `predator`
- 🌐 URL: `http://localhost:8080/realms/predator`
- 🔒 SSL: External only
- 🛡️ Brute force protection: Enabled

#### Ролі (Roles):
- **admin** - Повний доступ до системи
- **analyst** - Аналітик з правами читання/аналізу
- **viewer** - Тільки перегляд
- **data-engineer** - Доступ до ETL та pipelines
- **ml-engineer** - Доступ до ML моделей

#### Групи (Groups):
- `/Administrators` → admin role
- `/Analysts` → analyst role
- `/Engineers/Data Engineers` → data-engineer role
- `/Engineers/ML Engineers` → ml-engineer role
- `/Viewers` → viewer role

#### Тестові користувачі:
| Username | Email | Password | Roles | Group |
|----------|-------|----------|-------|-------|
| admin | admin@predator.local | admin123 | admin | Administrators |
| analyst | analyst@predator.local | analyst123 | analyst | Analysts |
| viewer | viewer@predator.local | viewer123 | viewer | Viewers |

#### OAuth2 Clients:
1. **predator-backend** (FastAPI)
   - Client ID: `predator-backend`
   - Client Secret: `predator-backend-secret`
   - Flow: Authorization Code + Service Account
   - Token lifespan: 1 hour

2. **predator-frontend** (Next.js)
   - Client ID: `predator-frontend`
   - Client Secret: `predator-frontend-secret`
   - Flow: Authorization Code with PKCE
   - Redirect URI: `http://localhost:3000/api/auth/callback/keycloak`

3. **predator-celery** (Workers)
   - Client ID: `predator-celery`
   - Client Secret: `predator-celery-secret`
   - Flow: Service Account only

### 3. **Backend Integration (FastAPI)**

**Файл:** `predator-analytics/backend/auth/keycloak.py`

#### Нові залежності:
```python
python-keycloak==3.9.0
jwcrypto==1.5.0
```

#### Основні компоненти:

##### KeycloakUser Model:
```python
class KeycloakUser:
    - sub: User ID
    - email: Email
    - username: Username
    - roles: List[str]
    - groups: List[str]
    - tenant: Optional tenant ID
```

##### Dependencies:
```python
# Обов'язкова автентифікація
user = Depends(get_current_user)

# Опціональна автентифікація
user = Depends(get_current_user_optional)

# Перевірка ролей
user = Depends(require_admin)      # Тільки admin
user = Depends(require_analyst)    # admin або analyst
user = Depends(require_engineer)   # admin, data-engineer, ml-engineer
```

##### Decorators:
```python
@require_roles(["admin"])
@require_roles(["analyst", "viewer"], require_all=False)
@require_groups(["/Administrators"])
```

#### Приклади використання:

**Захищений endpoint:**
```python
@app.get("/api/v1/protected")
async def protected_endpoint(user: KeycloakUser = Depends(get_current_user)):
    return {"message": f"Hello {user.username}!", "roles": user.roles}
```

**Admin-only endpoint:**
```python
@app.get("/api/v1/admin")
async def admin_endpoint(user: KeycloakUser = Depends(require_admin)):
    return {"message": "Admin access granted"}
```

**Custom role check:**
```python
@app.get("/api/v1/data")
@require_roles(["data-engineer", "ml-engineer"])
async def data_endpoint(user: KeycloakUser = Depends(get_current_user)):
    if user.has_role("data-engineer"):
        return {"data": "ETL pipelines"}
    return {"data": "ML models"}
```

#### Health Check:
```bash
GET /health
# Response включає Keycloak status
{
  "status": "healthy",
  "service": "predator-analytics",
  "version": "1.0.0",
  "keycloak": "healthy"
}
```

#### Auth Info Endpoint:
```bash
GET /api/v1/auth/me
Authorization: Bearer <token>

# Response:
{
  "sub": "uuid",
  "username": "admin",
  "email": "admin@predator.local",
  "roles": ["admin"],
  "groups": ["/Administrators"],
  "email_verified": true
}
```

### 4. **Frontend Integration (Next.js)**

**Файл:** `predator-analytics/frontend/app/api/auth/[...nextauth]/route.ts`

#### Нова залежність:
```json
"next-auth": "4.24.5"
```

#### NextAuth Configuration:
- Provider: Keycloak
- Session Strategy: JWT
- Session Duration: 1 hour
- Automatic token refresh
- Keycloak logout on signOut

#### Custom Hook - useAuth:
**Файл:** `predator-analytics/frontend/hooks/useAuth.ts`

```typescript
const {
  session,
  status,
  isAuthenticated,
  isLoading,
  user,
  roles,
  groups,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  inGroup,
  isAdmin,
  isAnalyst,
  isEngineer,
} = useAuth();
```

#### AuthProvider Component:
**Файл:** `predator-analytics/frontend/components/providers/AuthProvider.tsx`

Обгорнути app в Provider:
```typescript
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### AuthStatus Component:
**Файл:** `predator-analytics/frontend/components/auth/AuthStatus.tsx`

Відображає:
- Loading state
- Sign In button (якщо не авторизовано)
- User info + roles + Sign Out button (якщо авторизовано)
- Admin badge (якщо є admin роль)

#### Приклади використання Frontend:

**Перевірка автентифікації:**
```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) redirect("/");
  
  return <div>Protected Content</div>;
}
```

**Перевірка ролі:**
```typescript
const { hasRole, isAdmin } = useAuth();

if (isAdmin()) {
  return <AdminPanel />;
}

if (hasRole("analyst")) {
  return <AnalyticsView />;
}

return <ViewerMode />;
```

**API запити з токеном:**
```typescript
const { session } = useAuth();

const response = await fetch("/api/v1/data", {
  headers: {
    "Authorization": `Bearer ${session?.accessToken}`,
  },
});
```

### 5. **Environment Variables**

**Backend (.env):**
```bash
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=predator
KEYCLOAK_CLIENT_ID=predator-backend
KEYCLOAK_CLIENT_SECRET=predator-backend-secret
```

**Frontend (.env.local):**
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=predator-nextauth-secret-change-in-production
KEYCLOAK_ID=predator-frontend
KEYCLOAK_SECRET=predator-frontend-secret
KEYCLOAK_ISSUER=http://localhost:8080/realms/predator
```

### 6. **Initialization Scripts**

#### init-keycloak-db.sh
**Автоматично створює Keycloak БД** при старті PostgreSQL

#### init-keycloak.sh
**Перевіряє Keycloak та виводить інформацію:**
```bash
cd predator-analytics
./scripts/init-keycloak.sh
```

Output:
- ✅ Keycloak готовність
- 🔑 Admin credentials
- 👥 Тестові користувачі
- 🔗 Realm URLs

## 🚀 Як запустити

### 1. Start Services:
```bash
cd predator-analytics
docker-compose up -d
```

### 2. Check Keycloak:
```bash
# Wait for Keycloak (може зайняти 1-2 хв)
./scripts/init-keycloak.sh
```

### 3. Access Keycloak Admin:
- URL: http://localhost:8080
- Username: `admin`
- Password: `admin`

### 4. Verify Realm:
- Перейти до: Realms → predator
- Перевірити Users, Roles, Clients

### 5. Test Authentication:

#### Backend API:
```bash
# Get token
TOKEN=$(curl -X POST "http://localhost:8080/realms/predator/protocol/openid-connect/token" \
  -d "client_id=predator-backend" \
  -d "client_secret=predator-backend-secret" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" | jq -r '.access_token')

# Call protected endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/auth/me
```

#### Frontend:
1. Відкрити http://localhost:3000
2. Натиснути "Sign In"
3. Логін: `admin@predator.local` / `admin123`

## 🔧 Troubleshooting

### Keycloak не стартує:
```bash
docker-compose logs keycloak
```

### Realm не імпортується:
```bash
# Перевірити файл
ls -la keycloak/realms/predator-realm.json

# Manually import via Admin Console
# Realm Settings → Partial Import → Upload JSON
```

### Token validation fails:
```bash
# Перевірити що Backend бачить Keycloak
docker-compose exec backend curl http://keycloak:8080/health/ready
```

## 📊 Security Features

✅ **JWT токени** з RS256 підписом  
✅ **Brute force protection** - 5 спроб, потім блокування  
✅ **Token lifespan** - 1 година  
✅ **Refresh tokens** для довгих сесій  
✅ **RBAC** - Role-Based Access Control  
✅ **CORS** налаштований для localhost:3000  
✅ **HTTPS ready** (для production)  

## 🎯 Next Steps

1. ✅ Keycloak SSO - **ГОТОВО**
2. 🔄 Додати protected routes у Frontend
3. 🔄 Додати RBAC middleware до всіх Backend endpoints
4. 🔄 Налаштувати Grafana auth через Keycloak
5. 🔄 Production secrets (Vault integration)

---

**📅 Created:** 7 листопада 2025  
**🔐 Status:** Keycloak Integration Complete  
**✅ Ready for:** Development & Testing
