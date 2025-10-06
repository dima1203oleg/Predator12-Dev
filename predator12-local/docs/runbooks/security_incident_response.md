# Security Incident Response

## Rate Limit Triggers

### Symptoms
- 429 Too Many Requests errors
- Increased latency

### Investigation
```bash
# Check current limits
redis-cli KEYS "rate_limit:*" | xargs redis-cli GET

# Verify metrics
curl http://metrics:9001/metrics | grep rate_limit
```

### Resolution
1. **False positive**:
   ```bash
   # Reset counters for IP
   redis-cli DEL "rate_limit:/api/search:1.2.3.4"
   ```

2. **Attack**:
   ```bash
   # Block IP
   iptables -A INPUT -s 1.2.3.4 -j DROP
   ```

---

## JWT Issues

### Symptoms
- 401 Unauthorized errors
- Token expiration

### Resolution
1. **Expired token**:
   - Refresh token workflow

2. **Invalid token**:
   ```python
   # Verify key rotation
   openssl ecparam -genkey -name prime256v1 -noout -out private.key
   ```

---

## Emergency Procedures

### Revoke all tokens
```python
# Update secret key
SECRET_KEY = generate_new_key()
```

### Disable API
```bash
# Scale down services
kubectl scale deploy/predator-api --replicas=0
```
