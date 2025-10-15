# 🚀 Quick Deployment Guide

## Current State vs Desired State

### 📍 **CURRENT: Local Demo**
```
┌──────────────────┐
│   Your Machine   │
│                  │
│  ┌────────────┐  │
│  │  Browser   │  │
│  │ localhost  │  │
│  │   :8000    │  │
│  └──────┬─────┘  │
│         │        │
│  ┌──────▼─────┐  │
│  │  Backend   │  │
│  │  FastAPI   │  │
│  └──────┬─────┘  │
│         │        │
│  ┌──────▼─────┐  │
│  │QuantaRoute │  │
│  │  Library   │  │
│  └──────┬─────┘  │
│         │        │
│  ┌──────▼─────┐  │
│  │ Bengaluru  │  │
│  │  OSM Data  │  │
│  └────────────┘  │
└──────────────────┘

✅ Works great locally
❌ Not accessible to others
```

### 🌐 **DESIRED: Public API**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Browser   │     │  User Browser   │     │  User Browser   │
│  (India)        │     │  (USA)          │     │  (Europe)       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │ HTTPS
                                 │ API Key Auth
                                 ▼
                    ┌────────────────────────┐
                    │  QuantaRoute API       │
                    │  (Railway/Cloud)       │
                    │  https://your-app.com  │
                    │                        │
                    │  Endpoints:            │
                    │  • /api/v1/route      │
                    │  • /api/v1/alternatives│
                    │  • /playground         │
                    │  • /docs               │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   QuantaRoute Library  │
                    │   (SSSP Algorithm)     │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Bengaluru OSM Data   │
                    │   (756K nodes, 1.6M edges)│
                    └────────────────────────┘

✅ Accessible from anywhere
✅ API key authentication
✅ Rate limiting
✅ Scalable
```

---

## 🎯 Simple 3-Step Deployment

### **Step 1: Install Railway CLI** (2 minutes)
```bash
# macOS/Linux
curl -fsSL cli.new | sh

# Login to Railway
railway login
```

### **Step 2: Deploy** (3 minutes)
```bash
# Go to your project
cd /Users/saikat.maiti/Documents/sssp

# Initialize Railway project
railway init

# Deploy!
railway up
```

### **Step 3: Configure** (2 minutes)
```bash
# Upload OSM data
railway run upload test-data/bengaluru-highways.osm.pbf /app/data/

# Or set environment variable to download on startup
railway variables set QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf
```

**Done! 🎉** Your API is now live at: `https://your-app.up.railway.app`

---

## 🧪 Test Your Deployed API

### Using the Playground (Easiest)
1. Open: `https://your-app.up.railway.app/playground`
2. Click on the map to set start/end points
3. See routes calculated with Bengaluru data!

### Using curl (Quick Test)
```bash
curl -X POST https://your-app.up.railway.app/api/v1/route \
  -H "Content-Type: application/json" \
  -H "X-API-Key: demo_enterprise_api_key_quantaroute_2024" \
  -d '{
    "start": {"lat": 12.9716, "lon": 77.5946},
    "end": {"lat": 12.9750, "lon": 77.6000},
    "profile": "car"
  }'
```

### Using Python
```python
import requests

response = requests.post(
    "https://your-app.up.railway.app/api/v1/route",
    headers={
        "X-API-Key": "demo_enterprise_api_key_quantaroute_2024"
    },
    json={
        "start": {"lat": 12.9716, "lon": 77.5946},  # MG Road, Bengaluru
        "end": {"lat": 12.9750, "lon": 77.6000},
        "profile": "car",
        "algorithm": "quantaroute"  # Uses SSSP O(m·log^{2/3}n)
    }
)

route = response.json()
print(f"Distance: {route['distance_km']} km")
print(f"Duration: {route['duration_min']} min")
print(f"Algorithm: {route['algorithm']}")
```

---

## 📚 What You Get

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/route` | POST | Single optimal route |
| `/api/v1/alternatives` | POST | Multiple route options |
| `/api/v1/isochrone` | POST | Reachability analysis |
| `/api/v1/matrix` | POST | Distance/time matrix |
| `/playground` | GET | Interactive map UI |
| `/docs` | GET | API documentation |
| `/graphql` | POST | GraphQL endpoint |

### API Keys (Demo - Change in Production!)

```python
# Free Tier: 100 requests/day
API_KEY_FREE = "demo_free_api_key_quantaroute_2024"

# Basic Tier: 1000 requests/day  
API_KEY_BASIC = "demo_basic_api_key_quantaroute_2024"

# Enterprise: Unlimited
API_KEY_ENTERPRISE = "demo_enterprise_api_key_quantaroute_2024"
```

---

## 🔧 Advanced: Connect Demo UI to Deployed API

If you want to keep the nice map UI but use the deployed API:

### Option A: Update Backend to Call API

Edit `demo-app/backend/real_routing_app.py`:
```python
# Add at top
import requests
API_URL = "https://your-app.up.railway.app"
API_KEY = "demo_enterprise_api_key_quantaroute_2024"

# Update route endpoint (line ~855)
@app.post("/api/route")
async def calculate_route(request: dict):
    # Instead of using QuantaRoute directly, call the API
    response = requests.post(
        f"{API_URL}/api/v1/route",
        headers={"X-API-Key": API_KEY},
        json={
            "start": {"lat": request["start"][0], "lon": request["start"][1]},
            "end": {"lat": request["end"][0], "lon": request["end"][1]},
            "profile": request.get("profile", "car")
        }
    )
    return response.json()
```

### Option B: Update Frontend to Call API Directly

Edit `demo-app/static/js/demo.js`:
```javascript
// Line 16 - Update API URL
this.apiBaseUrl = 'https://your-app.up.railway.app/api';

// Add API key to headers
async makeApiCall(endpoint, data) {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'demo_enterprise_api_key_quantaroute_2024'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}
```

Then deploy frontend to Vercel (free):
```bash
cd demo-app
vercel deploy
```

---

## 💰 Cost Estimate

### Railway Pricing (Pay as you go)
- **Starter Plan:** $5/month
  - 500 hours of runtime
  - 512 MB RAM
  - Good for: Testing, demos, small usage

- **Pro Plan:** $20/month + usage
  - 8GB RAM
  - Good for: Production, many users

### Alternative: DigitalOcean App Platform
- **Basic:** $5/month
- **Professional:** $12/month

### Free Option: Fly.io
- Free tier: 3 shared VMs
- Good for: Testing, proof of concept

---

## 🎓 Key Concepts Explained

### 1. **QuantaRoute Library = The Engine**
- Python library with routing algorithms
- Loaded with OSM data
- File: `quantaroute/routing.py`
- **Uses SSSP O(m·log^{2/3}n) algorithm by default** ✅

### 2. **Demo App = Local UI + Backend**
- FastAPI backend + Leaflet.js frontend
- **Directly imports QuantaRoute library** ✅
- File: `demo-app/backend/real_routing_app.py`
- Currently runs on localhost

### 3. **API Server = Production Service**
- Complete API with authentication
- File: `start_api_server.py`
- Also uses QuantaRoute library
- Meant for deployment

### 4. **Deployment = Making API Server Public**
- Upload code + data to cloud
- Get public URL
- Users access via API keys

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] API responds: `curl https://your-app.up.railway.app/api/health`
- [ ] Playground loads: Visit `/playground` in browser
- [ ] Route calculation works: Test with coordinates from Bengaluru
- [ ] Uses SSSP algorithm: Check response includes `"algorithm": "QuantaRoute SSSP"`
- [ ] Access restrictions respected: No routes through private roads
- [ ] Alternative routes work: Test `/api/v1/alternatives` endpoint

---

## 🆘 Troubleshooting

### "Router not initialized"
```bash
# Upload OSM data to Railway
railway run upload test-data/bengaluru-highways.osm.pbf /app/data/
```

### "Profile file not found"
```bash
# Ensure profiles directory is in deployment
railway variables set QUANTAROUTE_PROFILES_DIR=/app/profiles
```

### "Out of memory"
```bash
# Upgrade to larger instance (Railway Pro plan)
railway up --plan pro
```

---

## 📞 Next Steps

1. **Deploy to Railway:** Run `railway up` (5 min)
2. **Test Playground:** Visit your app URL + `/playground`
3. **Share with Users:** Give them API URL + keys
4. **Optional:** Deploy demo UI separately for nicer UX

**Questions?** The full architecture details are in `ARCHITECTURE_AND_DEPLOYMENT.md`

---

**Current Status:**
- ✅ QuantaRoute uses SSSP algorithm
- ✅ Demo-app uses QuantaRoute directly
- ✅ Bengaluru network loaded (756K nodes)
- ✅ Access restrictions working
- ⏳ Ready to deploy!

