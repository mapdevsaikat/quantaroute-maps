# 🔄 Dual Mode Setup Guide - Local & Remote API

## Overview

The QuantaRoute demo now supports **two modes**:

1. **🏠 Local Mode**: Runs backend on localhost with local OSM data
2. **🌐 Remote Mode**: Connects to your deployed production API

You can **switch between modes** in real-time without restarting!

---

## 🎯 Quick Start

### Option 1: Local Mode (Default)

**Best for:** Development, testing, offline demos

```bash
cd /Users/saikat.maiti/Documents/sssp/demo-app
python start_simple_demo.py
```

**Access:** http://localhost:8000

---

### Option 2: Remote Mode

**Best for:** Public demos, production use, sharing with users

#### Step 1: Configure Remote API

Edit `demo-app/static/js/demo-config.js`:

```javascript
remote: {
    apiBaseUrl: 'https://your-app.up.railway.app/api/v1',  // Your deployed API
    apiKey: 'your_production_api_key_here',                 // Your API key
    // ... other config
}
```

#### Step 2: Start Demo

```bash
cd /Users/saikat.maiti/Documents/sssp/demo-app
python start_simple_demo.py
```

#### Step 3: Switch to Remote Mode

In the browser:
- Click the **mode indicator** in the top-right corner
- Or add `?mode=remote` to the URL
- Or use browser console: `window.demoConfig.setMode('remote')`

**Access:** http://localhost:8000?mode=remote

---

## 📖 Detailed Configuration

### 1. Environment Variables

Create `demo-app/config.env`:

```bash
# Copy from example
cp config.env.example config.env

# Edit with your values
vim config.env
```

Update these values:

```bash
# For Remote Mode
QUANTAROUTE_API_URL=https://your-app.up.railway.app/api/v1
QUANTAROUTE_API_KEY=your_production_api_key

# For Local Mode
LOCAL_API_URL=http://localhost:8000/api
OSM_DATA_PATH=../test-data/bengaluru-highways.osm.pbf
```

### 2. JavaScript Configuration

Edit `demo-app/static/js/demo-config.js`:

```javascript
remote: {
    // YOUR DEPLOYED API URL
    apiBaseUrl: 'https://your-app.up.railway.app/api/v1',
    
    // YOUR API KEY (from deployment)
    apiKey: 'your_production_api_key_here',
    
    displayName: '🌐 Production API',
    description: 'Using deployed QuantaRoute API',
    authRequired: true,
    healthCheck: true
}
```

### 3. Deploy Your API (If Not Already Deployed)

If you haven't deployed the backend yet:

```bash
# Deploy to Railway
cd /Users/saikat.maiti/Documents/sssp
railway login
railway up

# Get your API URL
railway open
```

Your API will be at: `https://your-app-XXXXX.up.railway.app`

---

## 🔀 Switching Modes

### Method 1: In-Browser Toggle (Easiest)

1. Look for the **mode indicator** in the top-right corner
2. Shows current mode (🏠 Local or 🌐 Remote)
3. Click "Switch to Remote" or "Switch to Local" button
4. Page reloads automatically with new mode

### Method 2: URL Parameter

Add mode parameter to URL:

```
http://localhost:8000?mode=local   # Local mode
http://localhost:8000?mode=remote  # Remote mode
```

### Method 3: Browser Console

Open browser console (F12) and run:

```javascript
// Switch to remote mode
window.demoConfig.setMode('remote');

// Switch to local mode
window.demoConfig.setMode('local');

// Check current mode
console.log(window.demoConfig.mode);

// Get full config
console.log(window.demoConfig.getDisplayInfo());
```

### Method 4: LocalStorage

Your mode preference is saved in localStorage:

```javascript
// Set mode (persists across page loads)
localStorage.setItem('quantaroute_demo_mode', 'remote');

// Get saved mode
localStorage.getItem('quantaroute_demo_mode');

// Clear saved mode (will auto-detect)
localStorage.removeItem('quantaroute_demo_mode');
```

---

## 🎨 UI Features

### Mode Indicator

A small panel in the top-right corner shows:

```
┌─────────────────────────────────────────┐
│ 🏠  🏠 Local Demo                       │
│     Using local QuantaRoute instance    │
│     on localhost:8000                   │
│     [Switch to Remote]                  │
└─────────────────────────────────────────┘
```

Or when in remote mode:

```
┌─────────────────────────────────────────┐
│ 🌐  🌐 Production API                   │
│     Using deployed QuantaRoute API      │
│     🔐 API Key: Active                  │
│     [Switch to Local]                   │
└─────────────────────────────────────────┘
```

### Status Indicators

- **Green dot** (●): Backend healthy
- **Yellow dot** (●): Backend loading
- **Red dot** (●): Backend unavailable

---

## 🔧 Technical Details

### API Endpoint Mapping

| Feature | Local Endpoint | Remote Endpoint |
|---------|---------------|----------------|
| Health Check | `/api/health` | `/health` |
| Single Route | `/api/route` | `/api/v1/route` |
| Alternative Routes | `/api/route/alternatives` | `/api/v1/alternatives` |
| Bengaluru Bounds | `/api/bengaluru-bounds` | `/api/v1/bounds` |
| Search POI | `/api/search` | `/api/v1/search` |

### Authentication

**Local Mode:**
- No authentication required
- Direct access to backend

**Remote Mode:**
- API Key required in header: `X-API-Key: your_key_here`
- Automatically added by `demo-config.js`
- Rate limiting may apply based on your tier

### Performance

**Local Mode:**
- Faster initial load (no network latency)
- ~35 seconds to load Bengaluru data
- 0.3-0.5s route calculation
- No rate limits

**Remote Mode:**
- Network latency depends on deployment location
- No local data loading needed
- 0.5-1.0s route calculation (includes network time)
- Rate limits apply per API key tier

---

## 🧪 Testing Both Modes

### Test Local Mode

```bash
# Terminal 1: Start demo
cd demo-app
python start_simple_demo.py

# Terminal 2: Test API
curl http://localhost:8000/api/health

# Browser
open http://localhost:8000
# Should show: 🏠 Local Demo
```

### Test Remote Mode

```bash
# Browser console
window.demoConfig.setMode('remote');

# Or URL
open http://localhost:8000?mode=remote

# Should show: 🌐 Production API
```

### Test Route Calculation

In both modes, click on the map to set start/end points and calculate routes. The results should be identical (using same algorithm and data).

---

## 🚀 Deployment Scenarios

### Scenario 1: Local Development
**Use:** Local mode  
**Why:** Faster iteration, no network dependency

```bash
python start_simple_demo.py
# Access at http://localhost:8000
```

### Scenario 2: Demo for Team/Clients
**Use:** Remote mode  
**Why:** Share link, no need to run backend locally

```bash
# Deploy API once
railway up

# Share demo link
https://demo.yourdomain.com?mode=remote
```

### Scenario 3: Public Demo Website
**Use:** Remote mode by default  
**Why:** Users don't have backend access

```javascript
// In demo-config.js
detectMode() {
    return 'remote';  // Always use remote for public
}
```

### Scenario 4: Offline Presentation
**Use:** Local mode  
**Why:** No internet dependency

```bash
python start_simple_demo.py
# Works without internet (after OSM data loaded)
```

---

## 🐛 Troubleshooting

### "Cannot connect to API" in Remote Mode

**Solution 1:** Check API URL
```javascript
// In browser console
console.log(window.demoConfig.config.apiBaseUrl);
```

**Solution 2:** Verify API key
```bash
curl -H "X-API-Key: your_key" https://your-app.up.railway.app/health
```

**Solution 3:** Check CORS
Make sure your deployed API allows `localhost:8000` in CORS origins.

### "Profile file not found" in Local Mode

**Solution:** Set profiles directory
```bash
export QUANTAROUTE_PROFILES_DIR=/Users/saikat.maiti/Documents/sssp/profiles
python start_simple_demo.py
```

### Mode Not Switching

**Solution:** Clear localStorage and refresh
```javascript
localStorage.clear();
location.reload();
```

### API Key Not Working

**Solution 1:** Check format
- Should be: `demo_enterprise_api_key_quantaroute_2024`
- Not: `Bearer demo_enterprise...`

**Solution 2:** Check header
```javascript
// Should show X-API-Key in headers
console.log(window.demoConfig.getHeaders());
```

---

## 📊 Comparison Matrix

| Feature | Local Mode | Remote Mode |
|---------|-----------|-------------|
| **Setup Time** | 5 minutes | 2 minutes |
| **Initial Load** | 35 seconds | Instant |
| **Route Speed** | 0.3-0.5s | 0.5-1.0s |
| **Internet Required** | No (after setup) | Yes |
| **API Key Required** | No | Yes |
| **Rate Limits** | None | Per tier |
| **Data Updates** | Manual | Automatic |
| **Best For** | Development | Production |
| **Sharing** | Local only | Anyone |
| **Cost** | Free | Deployment cost |

---

## ✅ Verification Checklist

After setup, verify:

**Local Mode:**
- [ ] Backend starts on localhost:8000
- [ ] Mode indicator shows "🏠 Local Demo"
- [ ] Status dot is green
- [ ] Can calculate routes
- [ ] No authentication required

**Remote Mode:**
- [ ] Mode indicator shows "🌐 Production API"
- [ ] Shows "🔐 API Key: Active"
- [ ] Can calculate routes
- [ ] Health check passes
- [ ] API key in request headers

**Both Modes:**
- [ ] Can switch between modes
- [ ] Routes work correctly
- [ ] Bengaluru map loads
- [ ] Alternative routes work
- [ ] Elevation profile works (if enabled)

---

## 🎯 Next Steps

### For Development:
1. Use **Local Mode**
2. Make changes to code
3. Test immediately
4. Switch to **Remote Mode** to verify deployment

### For Production:
1. Deploy API to Railway/Cloud
2. Update `demo-config.js` with API URL
3. Set **Remote Mode** as default
4. Share demo link with users

### For Demos:
1. Prepare both modes
2. Use **Local Mode** for offline
3. Use **Remote Mode** for online
4. Switch based on internet availability

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify API is deployed and healthy
3. Check API key is correct
4. Try switching modes
5. Clear browser cache and localStorage

**Debug Mode:**
```javascript
// Enable verbose logging
window.demoConfig.debug = true;
```

---

**Last Updated:** October 14, 2025  
**Status:** ✅ Dual Mode Fully Functional  
**Tested:** Local mode ✅ | Remote mode ✅

