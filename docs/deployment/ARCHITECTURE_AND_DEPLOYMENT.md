# QuantaRoute Architecture & Deployment Guide

## 📋 Overview

This document explains the architecture of QuantaRoute and how the demo-app works, then provides instructions for making it available to users.

---

## 🏗️ Architecture Overview

### 1. **Is QuantaRoute using the new SSSP algorithm?**

**YES! ✅** QuantaRoute uses a revolutionary **SSSP O(m·log^{2/3}n)** algorithm by default.

#### Algorithm Selection Logic (in `quantaroute/routing.py`)

```python
# Line 279-288: Algorithm selection in route() method
elif algorithm == "quantaroute" and hasattr(self, 'sssp_algorithm') and self.sssp_algorithm:
    print("🏆 Using BREAKTHROUGH SSSP O(m·log^{2/3}n) algorithm!")
    if traffic_applied:
        from .algo.sssp_new import SSSPNew
        traffic_sssp = SSSPNew(routing_graph)
        path, total_time_s = traffic_sssp.find_shortest_path(start_node, end_node)
        algorithm_name = "QuantaRoute SSSP O(m·log^{2/3}n) + Traffic"
    else:
        path, total_time_s = self.sssp_algorithm.find_shortest_path(start_node, end_node)
        algorithm_name = "QuantaRoute SSSP O(m·log^{2/3}n)"
```

**Available Algorithms:**
1. **`quantaroute`** (default) → SSSP O(m·log^{2/3}n) algorithm ⚡
2. **`dijkstra_reference`** → Traditional Dijkstra O(m + n log n) for comparison

**Performance Advantage:**
- SSSP is theoretically faster than Dijkstra for large sparse graphs
- Breakthrough complexity: O(m·log^{2/3}n) vs O(m + n log n)
- Real-world speedup on Bengaluru network (~750K nodes, 1.6M edges)

#### Alternative Routes Algorithms

For multiple route options, QuantaRoute uses:

**Rust Implementation (Primary):**
- `PySimpleAlternativeRoutes` with multiple strategies:
  - **Adaptive** (default) - smart strategy selection
  - **Perturbation** - weight variations for diversity
  - **Highway** - major road alternatives
  - **Major** - main edge exclusion

**Python Fallback:**
- Yen's K-Shortest Paths
- Plateau Alternative Routes
- Edge Penalty Alternative Routes
- Fast Alternative Routes

---

### 2. **Is the demo-app powered by QuantaRoute?**

**YES! ✅** The demo-app is a **direct client** of the QuantaRoute library.

#### Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     USER BROWSER                          │
│  (Leaflet.js Map + demo.js)                              │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP API Calls
                        ↓
┌──────────────────────────────────────────────────────────┐
│           DEMO-APP BACKEND (FastAPI)                      │
│  File: demo-app/backend/real_routing_app.py              │
│                                                           │
│  Imports:                                                 │
│  • from quantaroute.routing import QuantaRoute           │
│  • from quantaroute.elevation import get_elevation_data  │
│                                                           │
│  Endpoints:                                               │
│  • POST /api/route          → Single optimal route       │
│  • POST /api/route/alternatives → Multiple routes        │
│  • GET  /api/health         → Status check               │
│  • GET  /api/bengaluru-bounds → Map bounds              │
└───────────────────────┬──────────────────────────────────┘
                        │ Direct Python Import
                        ↓
┌──────────────────────────────────────────────────────────┐
│              QUANTAROUTE LIBRARY                          │
│  File: quantaroute/routing.py (QuantaRoute class)        │
│                                                           │
│  Core Methods:                                            │
│  • route() → Single route calculation                    │
│  • alternative_routes() → Multiple route options         │
│  • from_pbf() → Load OSM PBF data                        │
│                                                           │
│  Algorithms:                                              │
│  • SSSP O(m·log^{2/3}n) (default)                        │
│  • Rust alternatives (fast)                              │
│  • Python alternatives (fallback)                        │
│  • Dijkstra (reference)                                  │
└───────────────────────┬──────────────────────────────────┘
                        │ Reads OSM Data
                        ↓
┌──────────────────────────────────────────────────────────┐
│                    DATA LAYER                             │
│                                                           │
│  • test-data/bengaluru-highways.osm.pbf                  │
│  • profiles/car.yml, bicycle.yml, foot.yml, etc.         │
│                                                           │
│  Graph Structure:                                         │
│  • 756,204 nodes                                         │
│  • 1,594,440 edges                                       │
│  • 281,700 restricted edges (17.7%)                      │
└──────────────────────────────────────────────────────────┘
```

#### Code Evidence

**Demo-app imports QuantaRoute directly:**
```python
# demo-app/backend/real_routing_app.py, lines 29-30
from quantaroute.routing import QuantaRoute
from quantaroute.elevation import get_elevation_data, calculate_elevation_profile
```

**Route calculation example:**
```python
# demo-app/backend/real_routing_app.py, line 855-900
@app.post("/api/route")
async def calculate_route(request: dict):
    """Calculate route using REAL Bengaluru road network"""
    router = get_or_create_router(profile)
    
    # Uses QuantaRoute directly
    route = router.route(
        start=(start[0], start[1]),
        end=(end[0], end[1]),
        profile=profile,
        algorithm="quantaroute",  # SSSP algorithm
        consider_traffic=False
    )
    return route.to_dict()
```

---

### 3. **How to make the demo-app available with API-powered routing?**

There are **THREE DEPLOYMENT OPTIONS**:

---

## 🚀 Deployment Options

### **Option 1: Local Demo (Current Setup)** ✅

**What it is:**
- Backend and frontend run on localhost
- Direct access to local OSM data
- Good for: Development, testing, demos

**How to run:**
```bash
cd /Users/saikat.maiti/Documents/sssp/demo-app
python start_simple_demo.py
```

**Access:**
- Frontend: http://localhost:8000/
- API: http://localhost:8000/api/route

**Pros:**
- ✅ Fastest startup
- ✅ No deployment complexity
- ✅ Full control

**Cons:**
- ❌ Only accessible from your machine
- ❌ Not suitable for real users

---

### **Option 2: Full API Server (Production Ready)** 🌐

**What it is:**
- Complete FastAPI server with authentication
- Multi-tenant support with API keys
- GraphQL support
- WebSocket real-time updates
- Rate limiting and usage tiers

**Architecture:**
```
┌──────────────────┐
│  USER BROWSER    │
│  (Your App/Web)  │
└────────┬─────────┘
         │ HTTPS + API Key
         ↓
┌─────────────────────────────────────┐
│    QUANTAROUTE API SERVER           │
│    (start_api_server.py)            │
│                                     │
│  Endpoints:                         │
│  • /api/v1/route                   │
│  • /api/v1/alternatives            │
│  • /api/v1/isochrone               │
│  • /api/v1/matrix                  │
│  • /graphql                         │
│  • /playground                      │
│                                     │
│  Features:                          │
│  • Authentication & API Keys        │
│  • Rate Limiting                    │
│  • Usage Tiers (Free/Basic/Ent)    │
│  • WebSocket Support                │
│  • Traffic Integration              │
└─────────────────────────────────────┘
```

**How to deploy:**

#### Step 1: Prepare Data
```bash
# Ensure you have the Bengaluru OSM data
cd /Users/saikat.maiti/Documents/sssp
ls test-data/bengaluru-highways.osm.pbf

# Set environment variables
export QUANTAROUTE_OSM_FILE="test-data/bengaluru-highways.osm.pbf"
export QUANTAROUTE_REGION="bengaluru"
export QUANTAROUTE_AUTH_ENABLED="true"
export PORT=8080
```

#### Step 2: Start API Server
```bash
python start_api_server.py
```

This starts the full production API on http://localhost:8080

#### Step 3: Deploy to Cloud (Choose one)

**Railway.app (Easiest):**
```bash
# Install Railway CLI
curl -fsSL cli.new | sh

# Login
railway login

# Deploy
railway up

# Set environment variables in Railway dashboard:
# - QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf
# - QUANTAROUTE_AUTH_ENABLED=true
```

**DigitalOcean App Platform:**
```bash
# Use deployment/digitalocean/app.yaml
doctl apps create --spec deployment/digitalocean/app.yaml
```

**Docker + Any Cloud:**
```bash
# Build Docker image
docker build -f Dockerfile -t quantaroute-api .

# Run locally
docker run -p 8080:8080 \
  -e QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf \
  -v /path/to/bengaluru-highways.osm.pbf:/app/data/bengaluru-highways.osm.pbf \
  quantaroute-api

# Deploy to any cloud (AWS ECS, GCP Cloud Run, Azure Container Instances)
```

**Access:**
- API: https://your-app.railway.app/api/v1/route
- Playground: https://your-app.railway.app/playground
- Docs: https://your-app.railway.app/docs

**API Keys (from start_api_server.py):**
```python
FREE:       demo_free_api_key_quantaroute_2024       # 100 req/day
BASIC:      demo_basic_api_key_quantaroute_2024     # 1000 req/day
ENTERPRISE: demo_enterprise_api_key_quantaroute_2024 # Unlimited
```

---

### **Option 3: Hybrid - Demo App with Remote API** 🔄

**What it is:**
- Demo frontend (Leaflet map UI)
- Backend connects to deployed API
- Best for: Public demos with nice UI

**Modification needed:**

1. **Update demo backend to use API client instead of direct QuantaRoute:**

```python
# demo-app/backend/real_routing_app.py
# BEFORE (current):
from quantaroute.routing import QuantaRoute
router = QuantaRoute.from_pbf(bengaluru_pbf, profile="car")
route = router.route(start, end, profile)

# AFTER (API-powered):
import requests

API_BASE_URL = "https://your-app.railway.app"
API_KEY = "demo_enterprise_api_key_quantaroute_2024"

def calculate_route(start, end, profile):
    response = requests.post(
        f"{API_BASE_URL}/api/v1/route",
        json={
            "start": {"lat": start[0], "lon": start[1]},
            "end": {"lat": end[0], "lon": end[1]},
            "profile": profile,
            "algorithm": "quantaroute"
        },
        headers={"X-API-Key": API_KEY}
    )
    return response.json()
```

2. **Or keep current demo and update JavaScript to call API directly:**

```javascript
// demo-app/static/js/demo.js
// Update apiBaseUrl to point to deployed API
this.apiBaseUrl = 'https://your-app.railway.app/api';

// Add API key header to all requests
async calculateRoute(start, end, profile) {
    const response = await fetch(`${this.apiBaseUrl}/v1/route`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'demo_enterprise_api_key_quantaroute_2024'
        },
        body: JSON.stringify({
            start: {lat: start[0], lon: start[1]},
            end: {lat: end[0], lon: end[1]},
            profile: profile,
            algorithm: 'quantaroute'
        })
    });
    return response.json();
}
```

---

## 📊 Comparison Matrix

| Feature | Local Demo | Full API Server | Hybrid |
|---------|-----------|-----------------|---------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Public Access** | ❌ | ✅ | ✅ |
| **Authentication** | ❌ | ✅ | ✅ |
| **Rate Limiting** | ❌ | ✅ | ✅ |
| **Nice UI** | ✅ | ⚠️ (API only) | ✅ |
| **Cost** | Free | Paid hosting | Free frontend + Paid API |
| **Best For** | Development | Production API | Public demos |

---

## 🎯 Recommended Deployment for Your Use Case

Based on your goal to "make the demo-app available for users," I recommend:

### **Phase 1: Deploy Full API Server** ⭐ RECOMMENDED

1. Deploy the production API to Railway/DigitalOcean
2. Use the built-in `/playground` endpoint for testing
3. Give users API keys for access

**Steps:**
```bash
# 1. Deploy to Railway
cd /Users/saikat.maiti/Documents/sssp
railway up

# 2. Upload Bengaluru OSM data to Railway
railway run upload test-data/bengaluru-highways.osm.pbf /app/data/

# 3. Share the API URL and keys with users
# API: https://quantaroute-production.up.railway.app
# Playground: https://quantaroute-production.up.railway.app/playground
```

### **Phase 2: Host Demo UI Separately** (Optional)

1. Deploy demo-app frontend to Vercel/Netlify (free static hosting)
2. Update JavaScript to call your Railway API
3. Users get beautiful map UI + your API backend

---

## 🔐 Production Checklist

Before going live:

- [ ] Change API keys (don't use demo keys in production)
- [ ] Set up proper authentication
- [ ] Configure rate limiting per user
- [ ] Add monitoring (uptime, errors, latency)
- [ ] Set up backups for OSM data
- [ ] Add HTTPS (Railway/DO do this automatically)
- [ ] Document API endpoints for users
- [ ] Create user onboarding guide

---

## 📝 Summary

**Your Current Setup:**
- ✅ QuantaRoute uses SSSP O(m·log^{2/3}n) algorithm by default
- ✅ Demo-app directly uses QuantaRoute library (not API)
- ✅ All routing is powered by actual Bengaluru OSM network
- ✅ Rust + Python hybrid for maximum performance

**To Make It Available:**
- 🚀 **Quick Start:** Deploy full API server to Railway (5 minutes)
- 🎨 **Better UX:** Keep demo UI, point it to deployed API
- 🔐 **Production:** Add proper auth, monitoring, and docs

**Next Steps:**
1. Deploy API server to Railway: `railway up`
2. Test with `/playground` endpoint
3. Optionally host demo UI on Vercel
4. Share API URL and keys with users

---

**Need help with deployment?** Let me know which option you want to pursue and I can guide you through the specific steps!

