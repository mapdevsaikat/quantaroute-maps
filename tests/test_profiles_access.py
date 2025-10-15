#!/usr/bin/env python3
"""
Quick test to verify profiles directory is accessible from demo-app
"""

from pathlib import Path

print("🧪 Testing Profiles Directory Access")
print("=" * 50)

# Test from demo-app directory
script_dir = Path(__file__).parent  # demo-app/
profiles_dir = script_dir.parent / "profiles"  # sssp/profiles

print(f"\n📂 Script directory: {script_dir.absolute()}")
print(f"📂 Profiles directory: {profiles_dir.absolute()}")

if profiles_dir.exists():
    print(f"✅ Profiles directory EXISTS")
    
    # List profile files
    profile_files = list(profiles_dir.glob("*.yml"))
    print(f"\n📄 Found {len(profile_files)} profile files:")
    for pf in sorted(profile_files):
        size_kb = pf.stat().st_size / 1024
        print(f"   ✓ {pf.name} ({size_kb:.1f} KB)")
    
    # Test reading a profile
    car_profile = profiles_dir / "car.yml"
    if car_profile.exists():
        print(f"\n✅ car.yml is readable")
        with open(car_profile, 'r') as f:
            lines = f.readlines()
            print(f"   📝 {len(lines)} lines")
            print(f"   📝 First line: {lines[0].strip()}")
    else:
        print(f"\n❌ car.yml NOT FOUND")
else:
    print(f"❌ Profiles directory DOES NOT EXIST")

print("\n" + "=" * 50)
print("🎯 Test complete!")

