# 🔧 Backend CORS & SSL Configuration Guide

## 🎯 What You Need to Fix

Your backend API at `routing.api.quantaroute.com` needs:
1. ✅ Valid SSL certificate (HTTPS)
2. ✅ CORS headers for GitHub Pages
3. ✅ Handle OPTIONS preflight requests

---

## 🔐 SSL Certificate Setup

### **Requirements:**
- Valid SSL/TLS certificate for `routing.api.quantaroute.com`
- Full certificate chain installed
- HTTPS enforced (redirect HTTP → HTTPS)

### **Options:**
1. **Let's Encrypt** (Free, automated)
2. **Hosting Provider** (Railway, Heroku provide automatic SSL)
3. **CloudFlare** (Free SSL proxy)

### **Test SSL:**
```bash
curl -I https://routing.api.quantaroute.com/health
# Should return: HTTP/2 200 or HTTP/1.1 200 (not SSL error)
```

---

## 🌐 CORS Configuration

### **FastAPI Example:**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Middleware - Add this BEFORE routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mapdevsaikat.github.io",    # GitHub Pages
        "http://localhost:3000",              # Local dev
        "http://127.0.0.1:3000",              # Local dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=86400,  # Cache preflight for 24 hours
)

# Your routes here...
```

### **Required CORS Headers:**

```
Access-Control-Allow-Origin: https://mapdevsaikat.github.io
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## 🔑 Authentication Configuration

Your API should accept this header format:

```
Authorization: Bearer demo_enterprise_api_key_quantaroute_2024
```

### **FastAPI Example:**

```python
from fastapi import Header, HTTPException

async def verify_api_key(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    if token != "demo_enterprise_api_key_quantaroute_2024":
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return token

# Use in routes:
@app.get("/health")
async def health(api_key: str = Depends(verify_api_key)):
    return {"status": "healthy"}
```

---

## 📡 Required Endpoints

### **1. Health Check**
```
GET /health
Authorization: Bearer demo_enterprise_api_key_quantaroute_2024

Response:
{
  "status": "healthy",
  "quantaroute_available": true,
  "router_initialized": true
}
```

### **2. Bengaluru Bounds**
```
GET /v1/bengaluru-bounds/
Authorization: Bearer demo_enterprise_api_key_quantaroute_2024

Response:
{
  "north": 13.15,
  "south": 12.80,
  "east": 77.80,
  "west": 77.45,
  "center": [12.9716, 77.5946]
}
```

### **3. Routing**
```
POST /v1/routing/
Authorization: Bearer demo_enterprise_api_key_quantaroute_2024
Content-Type: application/json

Body:
{
  "start": [12.9716, 77.5946],
  "end": [13.0358, 77.5970],
  "profile": "car"
}

Response:
{
  "route": {
    "distance": 1234.5,
    "duration": 567.8,
    "geometry": [...],
    "instructions": [...]
  }
}
```

### **4. Alternative Routes**
```
POST /v1/routing/alternatives/
Authorization: Bearer demo_enterprise_api_key_quantaroute_2024
Content-Type: application/json

Body:
{
  "start": [12.9716, 77.5946],
  "end": [13.0358, 77.5970],
  "profile": "car",
  "alternatives": 2
}

Response:
{
  "routes": [
    { "distance": ..., "duration": ..., "geometry": ... },
    { "distance": ..., "duration": ..., "geometry": ... }
  ]
}
```

---

## 🧪 Testing Your Backend

### **Run Test Script:**
```bash
./test_backend_api.sh
```

### **Manual Tests:**

**1. Test SSL:**
```bash
curl -I https://routing.api.quantaroute.com/health
```
✅ Should show HTTP/2 200, not SSL error

**2. Test Health with Auth:**
```bash
curl -H "Authorization: Bearer demo_enterprise_api_key_quantaroute_2024" \
     https://routing.api.quantaroute.com/health
```
✅ Should return JSON health status

**3. Test CORS:**
```bash
curl -I -H "Origin: https://mapdevsaikat.github.io" \
     -H "Authorization: Bearer demo_enterprise_api_key_quantaroute_2024" \
     https://routing.api.quantaroute.com/health
```
✅ Should include `Access-Control-Allow-Origin: https://mapdevsaikat.github.io`

**4. Test OPTIONS Preflight:**
```bash
curl -I -X OPTIONS \
     -H "Origin: https://mapdevsaikat.github.io" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     https://routing.api.quantaroute.com/v1/routing/
```
✅ Should return 200 with CORS headers

**5. Test Routing:**
```bash
curl -X POST \
     -H "Authorization: Bearer demo_enterprise_api_key_quantaroute_2024" \
     -H "Content-Type: application/json" \
     -d '{"start":[12.9716,77.5946],"end":[13.0358,77.5970],"profile":"car"}' \
     https://routing.api.quantaroute.com/v1/routing/
```
✅ Should return route data

---

## ✅ Verification Checklist

After making changes, verify:

- [ ] SSL certificate is valid (no cert errors)
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] CORS headers present on all endpoints
- [ ] OPTIONS preflight requests return 200
- [ ] Authorization header is required and verified
- [ ] Health endpoint returns JSON
- [ ] Bengaluru bounds endpoint works
- [ ] Routing endpoint accepts POST requests
- [ ] Alternative routes endpoint works
- [ ] Responses include proper JSON content-type

---

## 🚀 After Backend is Fixed

1. **Test with script:**
   ```bash
   ./test_backend_api.sh
   ```

2. **Test GitHub Pages site:**
   - Visit: https://mapdevsaikat.github.io/quantaroute-maps/
   - Open Console (F12)
   - Should see: "🔧 QuantaRoute Demo Configuration: { mode: 'remote' }"
   - No CORS errors
   - Map loads with styling
   - Can calculate routes

3. **Verify in browser:**
   - Open Network tab (F12)
   - Reload page
   - All API requests should be 200 OK
   - No red CORS errors

---

## 🐛 Common Issues

### **Issue: SSL Certificate Error**
- **Symptom:** `SSL certificate problem: unable to get local issuer certificate`
- **Fix:** Install valid SSL certificate (Let's Encrypt, CloudFlare, etc.)

### **Issue: CORS Preflight Fails**
- **Symptom:** `Response to preflight request doesn't pass access control check`
- **Fix:** Ensure OPTIONS method is allowed and returns CORS headers

### **Issue: 401 Unauthorized**
- **Symptom:** API returns 401 even with correct key
- **Fix:** Check Authorization header parsing on backend

### **Issue: Trailing Slash 404**
- **Symptom:** `/routing` works but `/routing/` returns 404
- **Fix:** FastAPI requires trailing slashes - ensure routes end with `/`

---

## 📞 Next Steps

1. Fix SSL certificate on `routing.api.quantaroute.com`
2. Add CORS middleware with GitHub Pages origin
3. Verify all endpoints are accessible
4. Run `./test_backend_api.sh` to validate
5. Test GitHub Pages frontend
6. Let me know when it's ready to test!

---

**Current Frontend URL:** https://mapdevsaikat.github.io/quantaroute-maps/  
**Expected Backend URL:** https://routing.api.quantaroute.com  
**API Key:** demo_enterprise_api_key_quantaroute_2024

