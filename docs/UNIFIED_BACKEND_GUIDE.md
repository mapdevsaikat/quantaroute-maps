# 🎯 Unified Backend Architecture - Complete Guide

## Overview

The QuantaRoute demo-app now uses a **single, unified backend architecture** with intelligent profile selection.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Demo-App Frontend                            │
│                   (http://localhost:3000)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Always connects to
                           │ Main API Server
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Main API Server (Port 8080)                     │
│                   start_api_server.py                            │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         Smart Profile Selector                            │  │
│  │    (quantaroute/profile_selector.py)                      │  │
│  │                                                            │  │
│  │  1. Detect region from PBF filename                       │  │
│  │     bengaluru*.pbf → India                                │  │
│  │     singapore*.pbf → Singapore                            │  │
│  │                                                            │  │
│  │  2. Select appropriate profile                            │  │
│  │     car + India → car_india.yml                           │  │
│  │     car + Singapore → car.yml                             │  │
│  │                                                            │  │
│  │  3. Load profile automatically                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              QuantaRoute Engine                           │  │
│  │      (Uses auto-selected profile)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### ✅ Single Backend Source
- Demo-app **always** uses Main API Server (port 8080)
- No more dual backends (real_routing_app.py is now optional/backup)
- Consistent behavior in development and production

### ✅ Intelligent Profile Selection
- **Automatic detection** from PBF filename
- **Region-aware** profile mapping
- **Zero configuration** needed for common regions

### ✅ Region Support

| Region | Detection Keywords | Car Profile | Speed Range |
|--------|-------------------|-------------|-------------|
| **India** | bengaluru, karnataka, mumbai, delhi, etc. | `car_india.yml` | 15-80 km/h |
| **Singapore** | singapore, sg | `car.yml` | 15-90 km/h |
| **Default** | (any other) | `car.yml` | Standard speeds |

## How It Works

### 1. PBF Detection

When you start the API server:

```bash
python start_api_server.py
```

The system automatically:
1. Finds the OSM PBF file (e.g., `bengaluru-highways.osm.pbf`)
2. Detects region from filename (`bengaluru` → India)
3. Selects appropriate profile (`car` → `car_india.yml`)

**Example Output:**
```
🗺️  Found OSM data: test-data/bengaluru-highways.osm.pbf
🎯 Smart profile selection: car_india.yml (auto-detected from PBF)
🌍 Region: bengaluru
```

### 2. Profile Mapping

The `profile_selector.py` module provides intelligent mapping:

```python
# For Bengaluru/India PBF files:
car → car_india.yml           # India-specific speeds
bicycle → bicycle.yml          # Standard cycling profile  
foot → foot.yml               # Standard walking profile
motorcycle → motorcycle.yml   # Standard motorcycle profile

# For Singapore PBF files:
car → car.yml                 # Singapore-specific speeds
bicycle → bicycle.yml         # Standard cycling profile
...
```

### 3. Frontend Configuration

The demo-app frontend automatically connects to port 8080:

```javascript
// demo-config.js
local: {
    apiBaseUrl: 'http://localhost:8080/v1',  // Main API server
    displayName: '🏠 Local Demo',
    authRequired: true,
    apiKey: 'demo_enterprise_api_key_quantaroute_2024'
}
```

## Running Locally

### Quick Start (Recommended)

```bash
# Terminal 1: Start main API server with auto-detection
cd /Users/saikat.maiti/Documents/sssp
python start_api_server.py

# Look for:
# 🎯 Smart profile selection: car_india.yml (auto-detected)

# Terminal 2: Initialize router
curl -X POST http://localhost:8080/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo_enterprise_api_key_quantaroute_2024" \
  -d '{
    "pbf_path": "test-data/bengaluru-highways.osm.pbf",
    "profile": "car"
  }'

# Terminal 3: Start demo-app frontend
cd /Users/saikat.maiti/Documents/sssp/demo-app
python -m http.server 3000

# Open: http://localhost:3000/frontend/
```

### Alternative: Demo Backend (Optional)

If you prefer the demo backend for testing:

```bash
# Terminal 1: Start demo backend (optional)
cd /Users/saikat.maiti/Documents/sssp/demo-app/backend
python real_routing_app.py

# This now ALSO uses smart profile selection!
```

## Deployment

### Production Setup

When deploying to server:

```bash
# Set environment variables
export QUANTAROUTE_OSM_FILE=/app/data/bengaluru-highways.osm.pbf
export PORT=8080

# Start server (profile auto-detected)
python start_api_server.py
```

The system will:
1. Detect region from PBF path (`/app/data/bengaluru-*` → India)
2. Load `car_india.yml` automatically
3. Serve on configured port

### Railway/Docker Deployment

**Dockerfile:**
```dockerfile
FROM python:3.11

WORKDIR /app
COPY . /app

# Install dependencies
RUN pip install -r requirements.txt

# OSM data should be mounted or downloaded
# Profile will be auto-detected from filename

EXPOSE 8080
CMD ["python", "start_api_server.py"]
```

**Railway Configuration:**
```toml
[build]
builder = "DOCKERFILE"

[deploy]
startCommand = "python start_api_server.py"
```

Environment variables on Railway:
- `QUANTAROUTE_OSM_FILE`: Path to PBF file (auto-detected if not set)
- `PORT`: Automatically set by Railway

## Adding New Regions

To add support for a new region:

### 1. Create Region-Specific Profile

```bash
# Example: Create profile for Mumbai
cp profiles/car_india.yml profiles/car_mumbai.yml
```

Edit `car_mumbai.yml` with Mumbai-specific speeds if needed.

### 2. Update Profile Selector

Edit `quantaroute/profile_selector.py`:

```python
REGION_PROFILE_MAP = {
    # ... existing mappings ...
    "mumbai": "car_mumbai",  # Add new region
}

PROFILE_VARIANTS = {
    "car": {
        # ... existing variants ...
        "mumbai": "car_mumbai",  # Add variant
    }
}
```

### 3. Test

```bash
# Place Mumbai PBF file
# e.g., test-data/mumbai-roads.osm.pbf

# Start server
python start_api_server.py

# Check output for:
# 🎯 Smart profile selection: car_mumbai.yml (auto-detected)
```

## Profile File Structure

### Required Profile Files

```
profiles/
├── car_india.yml           # India car routing (Bengaluru, Mumbai, etc.)
├── car.yml                 # Singapore/default car routing
├── bicycle.yml             # Cycling (used for all regions)
├── foot.yml                # Walking (used for all regions)
├── motorcycle.yml          # Motorcycle (used for all regions)
└── public_transport.yml    # Transit (used for all regions)
```

### Profile Inheritance

Current implementation:
- **Car**: Region-specific (car_india.yml vs car.yml)
- **Other modes**: Shared profiles (same for all regions)

Future expansion:
- Create `bicycle_india.yml` for India-specific cycling
- Create `foot_india.yml` for India-specific walking
- Update `PROFILE_VARIANTS` in `profile_selector.py`

## Verification

### Check Active Profile

```bash
# Method 1: Check server startup logs
python start_api_server.py | grep "profile selection"
# Should show: 🎯 Smart profile selection: car_india.yml

# Method 2: Call health check
curl http://localhost:8080/health | jq
# Should show current configuration

# Method 3: Test routing speed
curl -X POST http://localhost:8080/v1/routing/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo_enterprise_api_key_quantaroute_2024" \
  -d '{
    "start": {"lat": 13.0078, "lon": 77.5963},
    "end": {"lat": 13.0056, "lon": 77.5714},
    "profile": "car"
  }' | jq '.route.duration'

# Expected: ~480-720 seconds (8-12 minutes) for India profile
# Wrong: ~2400 seconds (40 minutes) if using Singapore profile
```

## Troubleshooting

### Issue: Wrong Profile Loaded

**Symptoms:**
- Routes taking 40+ minutes for 4km
- Speeds showing 5-6 km/h

**Solution:**
```bash
# Check which profile is being used
grep "profile selection" <server_log>

# If wrong profile, check PBF filename
ls -la test-data/*.pbf

# Rename PBF to match region
mv test-data/my-data.osm.pbf test-data/bengaluru-highways.osm.pbf

# Restart server
```

### Issue: Profile Not Found

**Symptoms:**
```
FileNotFoundError: profiles/car_india.yml
```

**Solution:**
```bash
# Check profiles directory exists
ls -la profiles/

# Create missing profile
cp profiles/car.yml profiles/car_india.yml

# Edit car_india.yml with India speeds
```

### Issue: Frontend Still Connecting to Port 8000

**Symptoms:**
- Using old demo backend on port 8000

**Solution:**
```bash
# Update demo-config.js
# Change apiBaseUrl to: http://localhost:8080/v1

# Restart frontend (Ctrl+R in browser)
```

## Migration from Old Architecture

### Before (Dual Backend)

```
Demo Frontend → real_routing_app.py (port 8000) → Manual profile ("car_india")
            → start_api_server.py (port 8080)   → Manual profile ("car_india")
```

### After (Unified Backend)

```
Demo Frontend → start_api_server.py (port 8080) → Auto-detect profile
```

### Migration Steps

1. **Update frontend config** (already done):
   ```javascript
   // demo-config.js
   apiBaseUrl: 'http://localhost:8080/v1'
   ```

2. **Stop old demo backend**:
   ```bash
   # No longer need to run real_routing_app.py
   # (Can keep for backup/testing)
   ```

3. **Use main API server**:
   ```bash
   python start_api_server.py
   ```

## Benefits

### ✅ Simplified Architecture
- One backend to maintain
- Consistent behavior everywhere
- Less configuration needed

### ✅ Intelligent Defaults
- Auto-detects region from PBF
- Selects correct profile automatically
- Zero-config for common regions

### ✅ Easy Deployment
- Same code works locally and in production
- No environment-specific configuration
- Profile auto-adapts to data source

### ✅ Extensible
- Easy to add new regions
- Simple profile variants
- Clear inheritance model

## Summary

🎯 **One Backend**: Main API server (port 8080) for everything
🌍 **Smart Detection**: Auto-selects profile from PBF filename  
🚀 **Zero Config**: Works out of the box for common regions
📦 **Production Ready**: Same setup for dev and deployment

---

**Questions?** Check `profiles/car_india.yml` for India-specific speeds or `quantaroute/profile_selector.py` for detection logic.

