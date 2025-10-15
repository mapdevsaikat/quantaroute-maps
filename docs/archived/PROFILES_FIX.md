# 🔧 Profiles Directory Access Fix

## ❌ Problem

The demo backend was unable to find the profile configuration files:
```
❌ Profile file not found: profiles/car.yml, using defaults
   Profiles directory: profiles
```

This happened because the relative path `profiles/` wasn't resolving correctly when running from the `demo-app/` directory.

---

## ✅ Solution Applied

### 1. **Environment Variable (Priority Fix)**
Set `QUANTAROUTE_PROFILES_DIR` environment variable **before** importing QuantaRoute:

```python
import os
from pathlib import Path

# Set profiles directory BEFORE importing quantaroute
profiles_env_path = Path('/Users/saikat.maiti/Documents/sssp/profiles').absolute()
os.environ['QUANTAROUTE_PROFILES_DIR'] = str(profiles_env_path)
```

### 2. **Robust Path Resolution**
Multiple fallback strategies to find the profiles directory:

```python
script_dir = Path(__file__).parent  # backend/

# Option 1: Relative to backend directory
profiles_dir = script_dir.parent.parent / "profiles"  # sssp/profiles

# Option 2: Absolute path (fallback)
if not profiles_dir.exists():
    profiles_dir = Path("/Users/saikat.maiti/Documents/sssp/profiles")

# Option 3: Try relative from working directory
if not profiles_dir.exists():
    profiles_dir = Path("../../profiles").resolve()

# Option 4: Try one level up
if not profiles_dir.exists():
    profiles_dir = Path("../profiles").resolve()
```

### 3. **Verification Before Loading**
Check that profiles exist before attempting to load them:

```python
# Verify profiles directory exists
if not profiles_dir.exists():
    print(f"❌ Profiles directory does not exist: {profiles_dir.absolute()}")
    return False

# Check for profile files
profile_files = list(profiles_dir.glob("*.yml"))
if not profile_files:
    print(f"❌ No .yml profile files found in: {profiles_dir.absolute()}")
    return False

print(f"✅ Found {len(profile_files)} profile files:")
for pf in sorted(profile_files):
    print(f"   📄 {pf.name}")
```

---

## 🧪 Testing the Fix

### Quick Verification Test:
```bash
cd demo-app
python test_profiles_access.py
```

**Expected Output:**
```
🧪 Testing Profiles Directory Access
==================================================
✅ Profiles directory EXISTS

📄 Found 5 profile files:
   ✓ bicycle.yml (5.1 KB)
   ✓ car.yml (9.0 KB)
   ✓ foot.yml (6.2 KB)
   ✓ motorcycle.yml (11.3 KB)
   ✓ public_transport.yml (13.3 KB)

✅ car.yml is readable
==================================================
```

### Full Demo Test:
```bash
cd demo-app
python start_simple_demo.py
```

**Now You Should See:**
```
🔧 PROFILES DIR ENV: Set QUANTAROUTE_PROFILES_DIR=/Users/saikat.maiti/Documents/sssp/profiles
📋 Configuring routing profiles from: /Users/saikat.maiti/Documents/sssp/profiles
✅ Found 5 profile files:
   📄 bicycle.yml
   📄 car.yml
   📄 foot.yml
   📄 motorcycle.yml
   📄 public_transport.yml
✅ Configured profiles directory: /Users/saikat.maiti/Documents/sssp/profiles

🔧 Initializing CAR routing engine...
✅ CAR router initialized in X.Xs

🔧 Initializing BICYCLE routing engine...
✅ BICYCLE router initialized in X.Xs

...
```

---

## 📋 What's in the Profiles?

The profiles directory contains 5 routing profile configurations:

| Profile | File | Size | Description |
|---------|------|------|-------------|
| 🚗 Car | `car.yml` | 9.0 KB | Vehicle routing with road hierarchy |
| 🚲 Bicycle | `bicycle.yml` | 5.1 KB | Bike lanes, gradients, surface quality |
| 🚶 Walking | `foot.yml` | 6.2 KB | Pedestrian paths, sidewalks |
| 🏍️ Motorcycle | `motorcycle.yml` | 11.3 KB | Similar to car with lane filtering |
| 🚌 Transit | `public_transport.yml` | 13.3 KB | Bus routes, metro integration |

Each profile defines:
- **Speed limits** by road type
- **Access restrictions** (which roads are allowed)
- **Surface penalties** (preference for paved vs unpaved)
- **Safety factors** (prefer safer routes)

---

## 🎯 Result

✅ **Profiles are now accessible**  
✅ **All 5 routing profiles will load correctly**  
✅ **Backend will use proper profile configurations**  

The demo should now start successfully with all profiles initialized! 🚀

