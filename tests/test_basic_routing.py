#!/usr/bin/env python3
"""
Simple test to verify routing works and respects access restrictions
"""

import sys
from pathlib import Path

# Add quantaroute to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from quantaroute.routing import QuantaRoute

print("🧪 Testing Basic Routing with Access Restrictions")
print("=" * 60)

# Load Bengaluru data
bengaluru_pbf = Path("../test-data/bengaluru-highways.osm.pbf")
print(f"📍 Loading Bengaluru road network...")
router = QuantaRoute.from_pbf(str(bengaluru_pbf), profile="car")

print(f"\n📊 Router loaded:")
print(f"   Nodes: {len(router.nodes):,}")
print(f"   Edges: {len(router.graph.edges):,}")

# Count restricted edges
restricted = sum(1 for e in router.graph.edges if not e.access_allowed)
print(f"   Restricted edges: {restricted:,} ({restricted/len(router.graph.edges)*100:.1f}%)")

# Test a simple route
print(f"\n🧭 Testing route (MG Road area):")
start = (12.9716, 77.5946)  # MG Road
end = (12.9750, 77.6000)    # Nearby

print(f"   Start: {start}")
print(f"   End: {end}")

try:
    route = router.route(start=start, end=end, profile="car")
    
    print(f"\n✅ Route calculated!")
    print(f"   Distance: {route.distance_km:.2f} km")
    print(f"   Duration: {route.duration_min:.1f} min")
    print(f"   Algorithm: {route.algorithm}")
    print(f"   Path points: {len(route.path)}")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Now test with the problematic coordinates
print(f"\n🧭 Testing problematic route:")
start = (12.8593, 77.6977)
end = (12.9365, 77.6910)

print(f"   Start: {start}")
print(f"   End: {end}")

try:
    route = router.route(start=start, end=end, profile="car")
    
    print(f"\n✅ Route calculated!")
    print(f"   Distance: {route.distance_km:.2f} km")
    print(f"   Duration: {route.duration_min:.1f} min")
    print(f"   Algorithm: {route.algorithm}")
    print(f"   Path points: {len(route.path)}")
    
    # Analyze the route path
    if hasattr(route, 'edges') and route.edges:
        print(f"\n🔍 Route analysis:")
        print(f"   Total edges: {len(route.edges)}")
        restricted_in_route = sum(1 for e in route.edges if not getattr(e, 'access_allowed', True))
        print(f"   Restricted edges: {restricted_in_route}")
        
        if restricted_in_route > 0:
            print(f"\n   ⚠️  WARNING: Route uses restricted edges!")
        else:
            print(f"\n   ✅ GOOD: Route respects access restrictions!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")

print("\n" + "=" * 60)
print("🎯 Test complete!")

