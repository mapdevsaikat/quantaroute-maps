# 🔄 Migration to Unified Backend Architecture

## Problem Identified

The demo-app was **still building its own graph** even though we implemented:
- ✅ Graph caching system
- ✅ Unified backend architecture  
- ✅ Smart profile selection

**Root Cause:** `start_simple_demo.py` was starting `real_routing_app.py` (port 8000) which:
- Loads PBF file from scratch
- Builds graph for all 5 profiles
- Takes 35+ seconds **per profile** (175+ seconds total!)
- Doesn't use cached graphs

## Solution: Use Unified Demo Starter

### New Startup Script: `start_unified_demo.py`

**What it does:**
1. ✅ Checks if main API server (port 8080) is running
2. ✅ Starts only frontend (port 3000)
3. ✅ Frontend connects to port 8080
4. ✅ Uses cached graphs (instant!)
5. ✅ NO graph rebuilding

**Benefits:**
- ⚡ **Instant startup** (no 30s+ graph building)
- 💾 **Uses cached graphs** (2-5s vs 35s per profile)
- 🎯 **Single source of truth** (main API server)
- 🚀 **Production-like setup**

## Comparison

### OLD: `start_simple_demo.py` (Dual Backend)

```
Terminal 1:                    Terminal 2:
python start_simple_demo.py    (none)
  ├─ Starts real_routing_app   
  │  (port 8000)                
  │  ⏳ Builds car graph       (~35s)
  │  ⏳ Builds bicycle graph   (~35s)
  │  ⏳ Builds foot graph      (~35s)
  │  ⏳ Builds motorcycle      (~35s)
  │  ⏳ Builds transit graph   (~35s)
  │  Total: ~175 seconds       ❌
  └─ Starts frontend (port 3000)

Frontend connects to: localhost:8000
Graph caching: NOT USED ❌
```

### NEW: `start_unified_demo.py` (Unified Backend)

```
Terminal 1:                    Terminal 2:
python start_api_server.py     python start_unified_demo.py
  ├─ Checks for PBF             ├─ Checks port 8080 ✅
  ├─ Detects region             ├─ Starts frontend only
  ├─ Checks cache ✅             └─ Opens browser
  │  
  ├─ IF cache exists:            
  │  └─ Load from cache (2-5s) ⚡
  │
  └─ IF no cache:
     └─ Build on first request
        then cache for next time

Frontend connects to: localhost:8080
Graph caching: ACTIVE ✅
```

## Migration Steps

### Step 1: Stop Old Demo

If `start_simple_demo.py` is running:

```bash
# Press Ctrl+C in the terminal
# Or kill processes:
pkill -f real_routing_app
pkill -f "http.server.*3000"
```

### Step 2: Start Main API Server

**Terminal 1:**
```bash
cd /Users/saikat.maiti/Documents/sssp
python start_api_server.py
```

**First time:**
```
🗺️  Found OSM data: test-data/bengaluru-highways.osm.pbf
🎯 Smart profile selection: car_india.yml
💾 Checking for cached graph...
ℹ️  No cache found - will build on first request
   (Build takes ~30s, then cached for instant reloads)
```

**After first routing request, cache is created!**

### Step 3: Start Unified Demo

**Terminal 2:**
```bash
cd /Users/saikat.maiti/Documents/sssp/demo-app
python start_unified_demo.py
```

**Output:**
```
🚀 QuantaRoute Unified Demo
═══════════════════════════════════════

🔍 Checking Main API Server (port 8080)...
✅ API Server is running on port 8080
✅ API Server is healthy!
   💾 Graph loaded from cache
   ⚡ Routing available instantly!

🌐 Starting frontend server on port 3000...
✅ Frontend server started successfully

🎯 UNIFIED DEMO READY!
```

**Startup time:** < 5 seconds! ⚡

### Step 4: Use the Demo

1. Open http://localhost:3000/frontend/
2. Click on map to set start point
3. Click again to set end point
4. Watch instant routing with turn-by-turn!

## Performance Comparison

| Aspect | OLD (Dual Backend) | NEW (Unified) | Improvement |
|--------|-------------------|---------------|-------------|
| **Startup time** | 175+ seconds | 2-5 seconds | **35-87x faster** |
| **Graph building** | Every restart | Once, then cached | **Instant restarts** |
| **Memory usage** | Dual graphs in memory | Single cached graph | **50% less memory** |
| **Architecture** | Separate backends | Unified backend | **Simpler** |
| **Production ready** | No | Yes | **Deployable** |

## File Structure

### OLD Files (No Longer Needed)
```
demo-app/
├── start_simple_demo.py        ❌ Rebuilds graph every time
└── backend/
    └── real_routing_app.py     ❌ Duplicate backend (port 8000)
```

### NEW Files (Unified)
```
demo-app/
├── start_unified_demo.py       ✅ Frontend only, uses main API
└── frontend/
    └── ...                     ✅ Connects to port 8080

quantaroute/ (main API server)
├── start_api_server.py         ✅ Single source of truth
├── graph_cache.py              ✅ Graph caching
└── profile_selector.py         ✅ Smart profile selection
```

## Architecture Diagram

### OLD: Dual Backend (Redundant)
```
┌─────────────────────────────────────────────────────────┐
│  Demo Frontend (port 3000)                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Demo Backend (port 8000)                               │
│  • Builds graph every restart (35s per profile)         │
│  • No caching                                           │
│  • Duplicate of main API                                │
└─────────────────────────────────────────────────────────┘

Main API Server (port 8080) - NOT USED! ❌
```

### NEW: Unified Backend (Efficient)
```
┌─────────────────────────────────────────────────────────┐
│  Demo Frontend (port 3000)                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Main API Server (port 8080)                            │
│  • Graph caching (instant restarts)                     │
│  • Smart profile selection                              │
│  • Single source of truth                               │
│  • Production ready                                     │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Cached Graph (data/cache/graphs/)                      │
│  • Built once per PBF/profile                           │
│  • Loads in 2-5 seconds                                 │
│  • Persistent across restarts                           │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Issue: Port 8080 not available

**Symptoms:**
```
❌ Main API Server is NOT running on port 8080!
```

**Solution:**
```bash
# Start main API server
python start_api_server.py
```

### Issue: Old demo still running

**Symptoms:**
```
⚠️  Port 3000 is already in use
⚠️  Port 8000 is already in use
```

**Solution:**
```bash
# Kill old demo processes
pkill -f real_routing_app
pkill -f "http.server.*3000"

# Restart unified demo
python start_unified_demo.py
```

### Issue: No cached graph yet

**Symptoms:**
```
💾 Checking for cached graph...
ℹ️  No cache found - will build on first request
```

**Solution:**
This is normal for first run! Just make a routing request:
1. Open demo (http://localhost:3000/frontend/)
2. Click two points to create a route
3. Graph builds (~30s) and caches automatically
4. Next restart will use cache (instant!)

## Benefits Summary

### ✅ For Development
- **Instant restarts** (no 3-minute wait!)
- **Single backend** to maintain
- **Same as production** architecture

### ✅ For Production
- **Graph caching** built-in
- **Smart profile selection** automatic
- **Version management** for PBF files
- **Docker/Railway** ready

### ✅ For Testing
- **Fast iteration** (instant restarts)
- **Real backend** (not mock data)
- **Production parity** (test what you deploy)

## Next Steps

1. ✅ **Stop using** `start_simple_demo.py`
2. ✅ **Start using** `start_unified_demo.py`
3. ✅ **Keep** `real_routing_app.py` as backup for offline demos
4. ✅ **Always use** main API server (port 8080) as primary

---

**Questions?** See `UNIFIED_BACKEND_GUIDE.md` and `GRAPH_CACHING_GUIDE.md` for complete details.

