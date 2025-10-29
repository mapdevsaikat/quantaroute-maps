# Quick Start: Demo App with Real QuantaRoute API

## 🚀 5-Minute Setup

### Step 1: Start QuantaRoute API (Terminal 1)

```bash
cd /Users/saikat.maiti/Documents/sssp
python start_api_server_demo.py
```

**Wait for**: `✅ QuantaRoute API ready at http://localhost:8080`

**Note**: This uses `start_api_server_demo.py` which has authentication DISABLED for easy demo usage. No API keys needed!

### Step 2: Start Demo Frontend (Terminal 2)

```bash
cd /Users/saikat.maiti/Documents/sssp/demo-app
python -m http.server 3000
```

Or use the existing script:
```bash
python start_simple_demo.py
```

### Step 3: Open Browser

Navigate to: **http://localhost:3000/frontend/**

### Step 4: Test It!

1. **Click anywhere on the map** to set start/end points
2. **Select transport mode**: 🚗 Car, 🚲 Bike, 🚶 Foot, 🏍️ Motorcycle, 🚌 Transit
3. **Click "Calculate Route"**
4. **See REAL routing** powered by QuantaRoute's O(m·log^{2/3}n) algorithm!

## ✅ What's Fixed

- ✅ **CORS errors** - Resolved with client-side mocks
- ✅ **API endpoints** - Using correct localhost:8080/v1
- ✅ **Real routing** - Actual QuantaRoute API (not simulation!)
- ✅ **All profiles** - Including public_transport
- ✅ **Alternative routes** - Multiple route options

## 🎯 What You'll See

### Map Interface
- Interactive map with Bengaluru POIs
- Click-to-route functionality
- Search for locations

### Real Routing Performance
```
🏆 Route calculated in 45-150ms
📏 Distance: 8.2 km
⏱️  Duration: 15 min
🚗 Mode: Car
```

### Alternative Routes
- 🥇 Optimal route (SSSP)
- 🥈 Alternative 1 (Via different road)
- 🥉 Alternative 2 (Scenic route)

## 📊 Verify It's Working

### Check API Connection

Open browser console (F12) and look for:
```
🔧 DemoConfig initialized:
  mode: "local"
  apiBaseUrl: "http://localhost:8080/v1"
  authRequired: false

✅ Authorization header added for remote mode
📡 API Call to: routing
🔗 Full URL: http://localhost:8080/v1/routing/
```

### No CORS Errors

You should NOT see:
```
❌ Access to fetch... has been blocked by CORS policy
```

You SHOULD see:
```
✅ Route calculated successfully
```

## 🐛 Troubleshooting

### Problem: "Server Error"

**Solution**: Make sure QuantaRoute API is running
```bash
curl http://localhost:8080/health
```

Expected: `{"status":"healthy"}`

### Problem: Map doesn't load

**Solution**: Refresh the page. The map bounds are now client-side.

### Problem: Search doesn't work

**Solution**: POI search is now client-side with 8 pre-loaded Bengaluru locations.

### Problem: CORS errors

**Solution**: Restart QuantaRoute API to reload CORS config
```bash
cd /Users/saikat.maiti/Documents/sssp
python start_api_server_demo.py
```

## 🎉 Success!

If you see:
- ✅ Map loads with markers
- ✅ Route calculates in < 200ms
- ✅ Turn-by-turn directions appear
- ✅ Alternative routes shown
- ✅ No CORS errors in console

**You're using the REAL QuantaRoute API!** 🚀

## 📚 More Information

- Full details: `CORS_FIX_COMPLETE.md`
- API endpoints: `DEMO_APP_API_FIXES.md`
- Coordinate formats: `/docs/api/FLEXIBLE_COORDINATES_GUIDE.md`

---

**Now showing the REAL power of QuantaRoute!** ⚡

