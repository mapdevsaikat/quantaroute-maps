# Quick Deployment Reference

## ⭐ **TL;DR - Best Approach**

**Deploy as 2 separate services:**

```
┌─────────────────────┐
│ Demo App            │  ← Vercel (Free)
│ - Static frontend   │
│ - 0MB RAM           │
└─────────────────────┘
          ↓ API calls
┌─────────────────────┐
│ QuantaRoute API     │  ← Railway ($25/mo)
│ - Full routing      │
│ - 4GB RAM           │
│ - OSM data          │
└─────────────────────┘
```

**Cost:** $25/month  
**Time to deploy:** 30 minutes  
**Scalability:** ⭐⭐⭐⭐⭐

---

## 🚀 **30-Minute Deployment**

### **Step 1: Deploy QuantaRoute API (15 min)**

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Deploy from project root
cd /Users/saikat.maiti/Documents/sssp
railway init quantaroute-api
railway up

# Upload data to Railway volume
railway volumes create data
# Upload bengaluru-highways.osm.pbf via Railway dashboard

# Set environment
railway variables set QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf
railway variables set QUANTAROUTE_REGION=bengaluru
railway variables set QUANTAROUTE_PROFILES_DIR=/app/profiles

# Get URL
railway domain  # Save this URL!
```

### **Step 2: Deploy Demo Frontend (15 min)**

```bash
# Install Vercel CLI
npm install -g vercel

# Update API URL
cd /Users/saikat.maiti/Documents/sssp/demo-app
python setup_remote_api.py
# Enter: https://your-railway-app.up.railway.app

# Deploy
vercel --prod

# Done!
```

---

## 💰 **Cost Comparison**

| Option | Monthly Cost | RAM Usage | Best For |
|--------|-------------|-----------|----------|
| **Separate (Recommended)** | $25 | 4GB | Production |
| **Monolithic** | $60 | 8GB (2x4GB) | Never |
| **Static Only** | $0 + API | 4GB | Demos |

---

## ✅ **Pros of Separate Deployment**

1. **Scalability** - Scale demo and API independently
2. **Cost** - Only pay for what you need
3. **Reusability** - API serves multiple clients
4. **Updates** - Update UI without restarting engine
5. **Security** - API keys hidden from frontend

---

## 🎯 **When to Use What**

### **Separate Deployment** ⭐ (RECOMMENDED)
```
Use when: Production, multiple clients, scaling needs
Cost: $25/month
Complexity: Moderate
Scalability: Excellent
```

### **Monolithic Deployment**
```
Use when: Quick prototype, single user
Cost: $60/month
Complexity: Simple
Scalability: Limited
```

### **Static Frontend Only**
```
Use when: API already deployed, simple demo
Cost: $0/month (+ API costs)
Complexity: Simple
Scalability: Frontend only
```

---

## 📊 **Architecture Diagram**

```
USER
  ↓
┌─────────────────────────────────┐
│ Frontend (Vercel CDN)           │
│ - HTML/CSS/JS                   │
│ - Leaflet.js maps               │
│ - FREE                          │
└─────────────────────────────────┘
  ↓ HTTPS API calls
┌─────────────────────────────────┐
│ QuantaRoute API (Railway)       │
│ ┌─────────────────────────────┐ │
│ │ FastAPI Backend             │ │
│ │ - /api/route                │ │
│ │ - /api/route/alternatives   │ │
│ │ - /api/search               │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ QuantaRoute Engine          │ │
│ │ - SSSP Algorithm            │ │
│ │ - Graph in memory (3GB)     │ │
│ │ - Bengaluru OSM data        │ │
│ └─────────────────────────────┘ │
│ $25/month - 4GB RAM             │
└─────────────────────────────────┘
```

---

## 🛠️ **Required Files**

### **For API Deployment:**
```
/Users/saikat.maiti/Documents/sssp/
├── Dockerfile               ← Use this
├── requirements.txt
├── start_api_server.py
├── quantaroute/            ← Core engine
├── core-rust/              ← Rust bindings
├── profiles/               ← Vehicle profiles
└── data/
    └── bengaluru-highways.osm.pbf  ← Upload to Railway
```

### **For Frontend Deployment:**
```
/Users/saikat.maiti/Documents/sssp/demo-app/
├── frontend/
│   └── index.html          ← Main page
├── static/
│   ├── css/
│   └── js/
│       ├── demo.js
│       └── demo-config.js  ← Update API URL here!
└── vercel.json             ← Create this
```

---

## 🔧 **Environment Variables**

### **QuantaRoute API (Railway):**
```env
QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf
QUANTAROUTE_REGION=bengaluru
QUANTAROUTE_PROFILES_DIR=/app/profiles
QUANTAROUTE_AUTH_ENABLED=true
PORT=8080
```

### **Demo Frontend (`demo-config.js`):**
```javascript
{
    mode: 'remote',
    remoteApiBaseUrl: 'https://your-app.up.railway.app/api',
    apiKey: 'demo_enterprise_api_key_quantaroute_2024'
}
```

---

## 📝 **Deployment Checklist**

### **Before You Start:**
- [ ] Railway account created
- [ ] Vercel account created
- [ ] OSM data file ready (bengaluru-highways.osm.pbf)
- [ ] Profiles directory available
- [ ] `maturin develop --release` run successfully

### **API Deployment:**
- [ ] Railway project created
- [ ] Environment variables set
- [ ] OSM data uploaded to Railway volume
- [ ] Profiles copied to deployment
- [ ] Health check passing: `https://your-app.up.railway.app/api/health`
- [ ] Test route: `POST /api/route`

### **Frontend Deployment:**
- [ ] `demo-config.js` updated with Railway URL
- [ ] Vercel project linked
- [ ] Static files deployed
- [ ] Test in browser: routing works
- [ ] Map loads correctly

---

## 🎉 **Success Criteria**

After deployment, you should be able to:

1. ✅ Visit `https://your-demo.vercel.app`
2. ✅ See Bengaluru map loaded
3. ✅ Click on map to set start/end points
4. ✅ Calculate route successfully
5. ✅ See turn-by-turn instructions
6. ✅ Generate alternative routes
7. ✅ See traffic signal counts
8. ✅ All in < 2 seconds response time

---

## 🆘 **Troubleshooting**

### **"Cannot connect to API"**
- Check Railway deployment logs
- Verify API URL in `demo-config.js`
- Test API directly: `curl https://your-app.up.railway.app/api/health`

### **"Graph not loaded"**
- Check Railway logs for graph loading errors
- Verify OSM file uploaded correctly
- Check RAM usage (needs 4GB+)

### **"No route found"**
- Verify Bengaluru bounds correct
- Check coordinates are within Bengaluru
- Test with known working coordinates

---

## 📚 **Next Steps After Deployment**

1. **Monitor:** Set up Railway metrics dashboard
2. **Optimize:** Add caching if response time > 500ms
3. **Scale:** Add more Railway instances if CPU > 80%
4. **Secure:** Rotate API keys regularly
5. **Document:** Update team on deployment URLs

---

## 🔗 **Useful Links**

- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs

---

## 💡 **Pro Tips**

1. **Use Railway Hobby Plan** ($5/mo credit) to start
2. **Enable auto-sleep** on Railway for demo (free tier)
3. **Set up health check** monitoring (UptimeRobot)
4. **Use environment branch** for staging deployments
5. **Keep API keys in Railway secrets**, not in code

---

**Questions?** Check `DEPLOYMENT_STRATEGY.md` for full details!

**Ready to deploy?** Follow the 30-minute guide above! 🚀

