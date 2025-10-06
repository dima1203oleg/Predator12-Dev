# ✅ Phase 1 Implementation Checklist

## Backend Tasks

### 1. Create Dashboard Endpoint File

- [ ] Create `predator12-local/backend/app/api/v1/endpoints/dashboard.py`
- [ ] Copy code from `PHASE1_API_INTEGRATION.md`
- [ ] Add imports for database, cache, psutil
- [ ] Implement `/stats` endpoint
- [ ] Implement `/system-status` endpoint
- [ ] Add helper functions (check_database, check_redis, etc.)

### 2. Create Dashboard Schemas

- [ ] Create `predator12-local/backend/app/schemas/dashboard.py`
- [ ] Add `DashboardStats` schema
- [ ] Add `SystemStatus` schema
- [ ] Add example JSON schemas

### 3. Add Cache Module

- [ ] Create `predator12-local/backend/app/core/cache.py`
- [ ] Implement Redis client
- [ ] Implement `cache_response` decorator
- [ ] Add cache key generation

### 4. Update API Router

- [ ] Edit `predator12-local/backend/app/api/v1/api.py`
- [ ] Import dashboard router
- [ ] Register dashboard router with prefix `/dashboard`

### 5. Update Dependencies

- [ ] Add `redis[hiredis]` to `requirements.txt`
- [ ] Add `psutil` to `requirements.txt`

### 6. Test Backend

```bash
cd predator12-local
docker-compose build --no-cache backend
docker-compose up -d backend

# Test endpoints
curl http://localhost:8000/api/v1/dashboard/stats
curl http://localhost:8000/api/v1/dashboard/system-status

# Check logs
docker logs predator12-local-backend-1
```

---

## Frontend Tasks

### 1. Install Dependencies

```bash
cd predator12-local/frontend
npm install @tanstack/react-query
```

- [ ] Run npm install
- [ ] Verify package.json updated

### 2. Update API Client

- [ ] Edit `frontend/src/api/client.ts`
- [ ] Add TypeScript interfaces
- [ ] Implement API client class
- [ ] Add error handling
- [ ] Export types and client

### 3. Update Hooks

- [ ] Edit `frontend/src/hooks/useAPI.ts`
- [ ] Implement `useStats()` hook
- [ ] Implement `useSystemStatus()` hook
- [ ] Implement `useHealth()` hook
- [ ] Configure auto-refresh intervals
- [ ] Add retry logic

### 4. Update Main App

- [ ] Edit `frontend/src/main.tsx`
- [ ] Add QueryClientProvider
- [ ] Replace mock data with hooks
- [ ] Add loading state component
- [ ] Add error state component
- [ ] Add ResourceBar component
- [ ] Update dashboard to use real data

### 5. Build and Deploy

```bash
cd predator12-local/frontend
npm run build

cd ..
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

- [ ] Build successful
- [ ] No TypeScript errors
- [ ] Docker image rebuilt
- [ ] Container restarted

### 6. Test Frontend

- [ ] Open <http://localhost:3000>
- [ ] Verify data loads from API
- [ ] Check auto-refresh (5 seconds)
- [ ] Test error handling (stop backend)
- [ ] Test loading states
- [ ] Verify resource bars display correctly

---

## Integration Testing

### API Tests

- [ ] `/api/v1/dashboard/stats` returns valid JSON
- [ ] `/api/v1/dashboard/system-status` returns valid JSON
- [ ] Response times < 100ms
- [ ] Cache works (check Redis)

### Frontend Tests

- [ ] Dashboard displays real data
- [ ] Auto-refresh updates values
- [ ] Loading spinner shows on initial load
- [ ] Error message shows when backend is down
- [ ] System status cards show correct states
- [ ] Resource bars animate correctly

### End-to-End

- [ ] Start system: `docker-compose up -d`
- [ ] Open frontend: <http://localhost:3000>
- [ ] Verify all data loads
- [ ] Check browser console for errors
- [ ] Check network tab for API calls
- [ ] Verify 5-second refresh interval
- [ ] Test error recovery (restart backend)

---

## Documentation

- [ ] Update README with new endpoints
- [ ] Add API examples
- [ ] Document configuration options
- [ ] Add troubleshooting guide

---

## Deployment Checklist

### Pre-Deploy

- [ ] All code changes committed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Dependencies added to requirements.txt / package.json

### Deploy Backend

```bash
cd predator12-local
docker-compose build --no-cache backend
docker-compose up -d backend
docker logs -f predator12-local-backend-1
```

### Deploy Frontend

```bash
cd predator12-local/frontend
npm run build
cd ..
docker-compose build --no-cache frontend
docker-compose up -d frontend
docker logs -f predator12-local-frontend-1
```

### Verify

```bash
# Check all containers
docker ps

# Test endpoints
curl http://localhost:8000/api/v1/dashboard/stats | jq
curl http://localhost:8000/api/v1/dashboard/system-status | jq

# Open frontend
open http://localhost:3000

# Run system test
./test_system.sh
```

---

## Success Criteria

- ✅ Backend endpoints respond with real data
- ✅ Frontend displays live statistics
- ✅ Auto-refresh works every 5 seconds
- ✅ Error handling works correctly
- ✅ Loading states display properly
- ✅ Cache improves performance
- ✅ System status shows real service states
- ✅ Resource usage displays correctly
- ✅ No console errors
- ✅ Documentation updated

---

## Timeline

- **Backend Implementation:** 3-4 hours
- **Frontend Implementation:** 2-3 hours
- **Testing & Debugging:** 1-2 hours
- **Documentation:** 1 hour

**Total:** 7-10 hours (1-2 days)

---

## Next Steps After Phase 1

1. Phase 2: Advanced Features (Dark Mode, Charts)
2. Phase 4: Real-Time WebSocket integration
3. Phase 5: Testing coverage
4. Phase 3: User Management

---

## Notes

- Keep backend API backwards compatible
- Use semantic versioning for changes
- Document all breaking changes
- Test on different browsers
- Monitor performance metrics

---

## Troubleshooting

### Backend Not Responding

```bash
docker logs predator12-local-backend-1
docker-compose restart backend
```

### Frontend Not Updating

```bash
# Clear cache
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Check browser console
open http://localhost:3000
```

### Database Connection Error

```bash
docker-compose restart db
docker exec -it predator12-local-db-1 psql -U postgres
```

### Redis Connection Error

```bash
docker-compose restart redis
docker exec -it predator12-local-redis-1 redis-cli ping
```

---

**Status:** Ready to implement  
**Priority:** HIGH  
**Dependencies:** None (all services running)
