# QuantaRoute Demo App - Deployment Strategy Guide

## 🎯 **Recommended: Separate Deployment Architecture**

Deploy the demo-app and QuantaRoute API as two separate services for optimal scalability, cost, and maintainability.

---

## 🏗️ **Architecture Overview**

```
┌──────────────────────────────────────────────────────────┐
│  TIER 1: Demo App (User-Facing)                          │
│  ┌────────────────────┐    ┌──────────────────────────┐ │
│  │ Static Frontend    │    │ Demo Backend (Thin)      │ │
│  │ - Vercel/Netlify   │◄───┤ - Railway/Render         │ │
│  │ - Leaflet.js       │    │ - Proxy + UI logic       │ │
│  │ - HTML/CSS/JS      │    │ - 512MB RAM              │ │
│  └────────────────────┘    └──────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                              ↓
                    API Key Authentication
                              ↓
┌──────────────────────────────────────────────────────────┐
│  TIER 2: QuantaRoute API (Core Service)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ QuantaRoute Core API                                │ │
│  │ - Railway/AWS/GCP                                   │ │
│  │ - Full routing engine                               │ │
│  │ - OSM data + Graph in memory                        │ │
│  │ - 4GB+ RAM                                          │ │
│  │ - Can serve multiple clients                        │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 **Deployment Options Comparison**

| Aspect | **Option 1: Separate** ⭐ | **Option 2: Monolithic** | **Option 3: Static Only** |
|--------|--------------------------|--------------------------|---------------------------|
| **Scalability** | ✅ Excellent | ⚠️ Limited | ✅ Frontend only |
| **Cost** | ✅ Optimal | ❌ Expensive | ✅ Cheapest |
| **Complexity** | ⚠️ Moderate | ✅ Simple | ✅ Simple |
| **API Reusability** | ✅ Yes | ❌ No | ✅ Yes |
| **Update Flexibility** | ✅ Independent | ⚠️ Coupled | ✅ Frontend only |
| **Resource Usage** | ✅ Efficient | ❌ Redundant | ✅ Minimal |
| **Best For** | **Production** | Prototyping | Demos |

---

## 🚀 **Option 1: Separate Deployment (RECOMMENDED)**

### **Components:**

#### **1. QuantaRoute Core API**
**What:** Full routing engine with OSM data  
**Deploy:** Railway (recommended) / AWS / GCP  
**Resources:** 4GB RAM, 2 vCPU  
**URL:** `https://api.quantaroute.com`

**Environment:**
```env
QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf
QUANTAROUTE_REGION=bengaluru
QUANTAROUTE_PROFILES_DIR=/app/profiles
QUANTAROUTE_AUTH_ENABLED=true
PORT=8080
```

**Endpoints:**
- `GET /api/health`
- `GET /api/bengaluru-bounds`
- `POST /api/route`
- `POST /api/route/alternatives`
- `GET /api/search?q={query}`

---

#### **2. Demo App Frontend**
**What:** Static HTML/CSS/JS with Leaflet  
**Deploy:** Vercel / Netlify / Cloudflare Pages  
**Resources:** CDN (no server)  
**URL:** `https://demo.quantaroute.com`

**Configuration (`demo-config.js`):**
```javascript
remoteApiBaseUrl: 'https://api.quantaroute.com/api'
apiKey: 'demo_enterprise_api_key_quantaroute_2024'
```

---

#### **3. Demo App Backend (Optional Thin Layer)**
**What:** Lightweight proxy + UI-specific logic  
**Deploy:** Railway / Render / Vercel Serverless  
**Resources:** 512MB RAM  
**URL:** `https://demo-backend.quantaroute.com`

**Purpose:**
- Add demo-specific features (geocoding, address search)
- Rate limiting for demo users
- Analytics/logging
- Proxy to hide API keys from frontend

**Environment:**
```env
QUANTAROUTE_API_URL=https://api.quantaroute.com/api
QUANTAROUTE_API_KEY=demo_enterprise_api_key_quantaroute_2024
PORT=8000
```

---

## 📦 **Deployment Steps**

### **Step 1: Deploy QuantaRoute Core API**

#### **Using Railway (Recommended):**

```bash
# 1. Install Railway CLI
npm install -g railway

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Upload OSM data
railway run -- mkdir -p /app/data
railway volumes create data
railway volumes attach data /app/data
# Upload bengaluru-highways.osm.pbf to volume

# 5. Deploy
cd /Users/saikat.maiti/Documents/sssp
railway up

# 6. Set environment variables
railway variables set QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf
railway variables set QUANTAROUTE_REGION=bengaluru
railway variables set QUANTAROUTE_PROFILES_DIR=/app/profiles
railway variables set QUANTAROUTE_AUTH_ENABLED=true

# 7. Get deployment URL
railway domain
# Note: https://your-app.up.railway.app
```

#### **Dockerfile (already exists):**
```dockerfile
# Use your existing Dockerfile or Dockerfile.simple
# Ensure it copies profiles/ and data/
```

---

### **Step 2: Deploy Demo Frontend**

#### **Using Vercel:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Configure demo-config.js
cd /Users/saikat.maiti/Documents/sssp/demo-app
python setup_remote_api.py
# Enter: https://your-app.up.railway.app

# 3. Create vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    },
    {
      "src": "static/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/index.html"
    }
  ]
}
EOF

# 4. Deploy
vercel --prod

# 5. Get deployment URL
# Note: https://your-demo.vercel.app
```

---

### **Step 3: Deploy Demo Backend (Optional)**

Only if you need demo-specific features.

#### **Using Railway:**

```bash
# 1. Create separate Railway project for demo backend
railway init quantaroute-demo-backend

# 2. Deploy
cd /Users/saikat.maiti/Documents/sssp/demo-app
railway up

# 3. Set environment variables
railway variables set QUANTAROUTE_API_URL=https://your-app.up.railway.app/api
railway variables set QUANTAROUTE_API_KEY=demo_enterprise_api_key_quantaroute_2024
railway variables set PORT=8000

# 4. Update frontend to use demo backend
# In demo-config.js:
# remoteApiBaseUrl: 'https://demo-backend.up.railway.app/api'
```

---

## 💰 **Cost Estimation**

### **Separate Deployment:**

| Service | Provider | Resources | Monthly Cost |
|---------|----------|-----------|--------------|
| **QuantaRoute API** | Railway | 4GB RAM, 2 vCPU | $20-30 |
| **Demo Frontend** | Vercel | CDN | $0 (free tier) |
| **Demo Backend** (optional) | Railway | 512MB RAM | $5 |
| **Domain** | Namecheap | quantaroute.com | $12/year |
| **Total** | | | **$25-35/month** |

### **Monolithic Deployment:**

| Service | Provider | Resources | Monthly Cost |
|---------|----------|-----------|--------------|
| **Combined App** | Railway | 4GB RAM, 2 vCPU | $20-30 |
| **Redundancy** (2 instances) | Railway | 2x 4GB RAM | $40-60 |
| **Total** | | | **$60-90/month** |

**Savings:** ~$35/month with separate deployment! 💰

---

## 🔒 **Security & Configuration**

### **API Key Management:**

#### **For Demo Backend (Recommended):**
```python
# backend/real_routing_app.py
import os

QUANTAROUTE_API_URL = os.getenv('QUANTAROUTE_API_URL')
QUANTAROUTE_API_KEY = os.getenv('QUANTAROUTE_API_KEY')

# Proxy requests to Core API
async def proxy_to_core_api(endpoint: str, data: dict):
    headers = {
        'Authorization': f'Bearer {QUANTAROUTE_API_KEY}',
        'Content-Type': 'application/json'
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f'{QUANTAROUTE_API_URL}/{endpoint}',
            json=data,
            headers=headers
        )
        return response.json()
```

#### **For Static Frontend (Not Recommended - Exposes Key):**
```javascript
// static/js/demo-config.js
// ⚠️ API key visible in frontend code!
apiKey: 'demo_enterprise_api_key_quantaroute_2024'
```

**Best Practice:** Use demo backend to hide API keys! 🔐

---

## 🎯 **Traffic & Scaling**

### **Expected Load:**

| Metric | Demo App | Core API |
|--------|----------|----------|
| **Requests/min** | 100 | 20 |
| **Data Transfer** | 10 MB/min | 2 MB/min |
| **CPU Usage** | 10% | 60% |
| **RAM Usage** | 100 MB | 3 GB |

**Why Separate?**
- Demo app: Light load, cheap to scale
- Core API: Heavy computation, expensive to scale
- Scale each independently based on actual needs!

---

## 📈 **Scaling Strategy**

### **Horizontal Scaling:**

```
Load Balancer
     ↓
┌─────┴─────┐
│ Demo 1    │ Demo 2    │ Demo 3    │  ← Scale cheaply
└───────────┴───────────┴───────────┘
            ↓
┌───────────────────────────────────┐
│   QuantaRoute API (Single)        │  ← Keep single instance
└───────────────────────────────────┘
```

**Cost:** 3x demo instances = +$10/month  
**Alternative:** 3x monolithic = +$80/month

---

## 🔄 **Update Workflow**

### **Separate Deployment:**

```bash
# Update frontend only (no backend restart)
cd demo-app
vercel --prod
# ✅ 10 seconds, no downtime

# Update backend only (no frontend change)
cd demo-app/backend
railway up
# ✅ 30 seconds, frontend still works

# Update Core API (no demo changes)
cd ..
railway up
# ✅ 60 seconds, demo unaffected (uses cached data)
```

### **Monolithic Deployment:**

```bash
# Update anything = redeploy everything
railway up
# ❌ 90 seconds, full restart, downtime
```

---

## 🌍 **Multi-Region Deployment (Future)**

### **Separate Architecture Benefits:**

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Demo (Global)│    │ Demo (Global)│    │ Demo (Global)│
│   Vercel CDN │    │   Vercel CDN │    │   Vercel CDN │
└──────────────┘    └──────────────┘    └──────────────┘
       ↓                   ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ API (India)  │    │ API (US)     │    │ API (Europe) │
│ Mumbai       │    │ Virginia     │    │ Frankfurt    │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Route users to nearest API endpoint for low latency!**

---

## 🎓 **When to Use Each Option**

### **Use Separate Deployment When:**
- ✅ You plan to serve multiple clients (mobile, web, partners)
- ✅ You want to scale frontend and backend independently
- ✅ You want cost-efficient scaling
- ✅ You need API key security
- ✅ You want flexible update cycles
- ✅ **Recommended for production!**

### **Use Monolithic Deployment When:**
- ✅ Quick prototype/demo (not production)
- ✅ Single internal user
- ✅ No scaling requirements
- ✅ Simplicity over efficiency

### **Use Static-Only When:**
- ✅ Simple demo/showcase
- ✅ Core API already deployed elsewhere
- ✅ No demo-specific backend logic needed
- ✅ Budget is extremely tight

---

## 🚀 **Recommended Deployment Plan**

### **Phase 1: Initial Deployment (Week 1)**
1. ✅ Deploy QuantaRoute Core API on Railway
2. ✅ Test API endpoints
3. ✅ Configure authentication

### **Phase 2: Demo Frontend (Week 2)**
1. ✅ Deploy static frontend to Vercel
2. ✅ Configure `demo-config.js` with API URL
3. ✅ Test end-to-end routing

### **Phase 3: Demo Backend (Optional, Week 3)**
1. ✅ Deploy thin backend to Railway
2. ✅ Add geocoding/search features
3. ✅ Implement rate limiting

### **Phase 4: Optimization (Ongoing)**
1. ✅ Monitor performance
2. ✅ Scale based on usage
3. ✅ Add caching if needed

---

## 📋 **Deployment Checklist**

### **Pre-Deployment:**
- [ ] OSM data prepared (bengaluru-highways.osm.pbf)
- [ ] Profiles directory ready
- [ ] Environment variables documented
- [ ] API authentication configured
- [ ] Domain purchased (optional)

### **Core API Deployment:**
- [ ] Railway project created
- [ ] Dockerfile tested locally
- [ ] Data volume attached
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] Routing endpoints tested

### **Frontend Deployment:**
- [ ] `demo-config.js` updated with API URL
- [ ] Vercel project created
- [ ] Static files deployed
- [ ] Map rendering verified
- [ ] Routing flow tested

### **Post-Deployment:**
- [ ] End-to-end testing
- [ ] Performance monitoring setup
- [ ] Error logging configured
- [ ] Documentation updated
- [ ] Team training completed

---

## 🎉 **Summary**

### **Recommended: Separate Deployment**

**Architecture:**
```
Static Frontend (Vercel) → Demo Backend (Railway) → Core API (Railway)
     $0/month                   $5/month               $25/month
```

**Total Cost:** $30/month  
**Benefits:**
- ✅ Scalable
- ✅ Cost-effective
- ✅ Maintainable
- ✅ Secure
- ✅ Production-ready

**Next Step:** Follow Phase 1 deployment guide above! 🚀

---

**For detailed deployment commands, see:**
- `00_DUAL_MODE_START_HERE.md` - Dual-mode setup
- `INTEGRATION_GUIDE.md` - API integration
- `QUICK_DEPLOYMENT_GUIDE.md` - Railway deployment

**Questions?** Check existing documentation or ask! 🙌

