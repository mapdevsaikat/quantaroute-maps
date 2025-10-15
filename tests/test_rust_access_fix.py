#!/usr/bin/env python3
"""
Test that Rust routing respects access restrictions
"""

import sys
from pathlib import Path

# Add quantaroute to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from quantaroute.routing import QuantaRoute

print("🧪 Testing Rust Access Restriction Fix")
print("=" * 60)

# Load Bengaluru data with car profile
bengaluru_pbf = Path("../test-data/bengaluru-highways.osm.pbf")
if not bengaluru_pbf.exists():
    print(f"❌ Bengaluru OSM data not found: {bengaluru_pbf}")
    sys.exit(1)

print(f"📍 Loading Bengaluru road network...")
router = QuantaRoute.from_pbf(str(bengaluru_pbf), profile="car")

print(f"\n📊 Router loaded:")
print(f"   Nodes: {len(router.nodes):,}")
print(f"   Edges: {len(router.graph.edges):,}")

# Check if Rust is available
has_rust = router.rust_alternatives is not None
print(f"\n🦀 Rust available: {has_rust}")
if has_rust:
    print(f"   ✅ Using Rust implementation with access restriction fix")
else:
    print(f"   ⚠️  Using Python fallback (already respects restrictions)")

# Test route with problematic coordinates
start = (12.8593, 77.6977)
end = (12.9365, 77.6910)

print(f"\n🧭 Testing route:")
print(f"   Start: {start}")
print(f"   End: {end}")

try:
    result = router.alternative_routes(
        start=start,
        end=end,
        num_alternatives=1,
        method="adaptive",
        profile="car"
    )
    
    if result and result.optimal_route:
        route = result.optimal_route
        print(f"\n✅ Route calculated successfully!")
        print(f"   Distance: {route.distance_km:.2f} km")
        print(f"   Duration: {route.duration_min:.1f} min")
        print(f"   Algorithm: {route.algorithm}")
        
        # Check if route uses restricted edges
        if hasattr(route, 'edges') and route.edges:
            restricted_count = sum(1 for e in route.edges if not getattr(e, 'access_allowed', True))
            total_edges = len(route.edges)
            print(f"\n🚦 Route edge analysis:")
            print(f"   Total edges: {total_edges}")
            print(f"   Restricted edges used: {restricted_count}")
            
            if restricted_count == 0:
                print(f"   ✅ PASS: No restricted edges used!")
            else:
                print(f"   ❌ FAIL: Route uses {restricted_count} restricted edges")
                print(f"\n   Restricted edges:")
                for e in route.edges[:5]:  # Show first 5 restricted
                    if not getattr(e, 'access_allowed', True):
                        print(f"      Edge {e.id}: {e.src_node} → {e.dst_node} ({e.name or 'unnamed'})")
        else:
            print(f"\n⚠️  Cannot verify edge restrictions (no edge details available)")
            
    else:
        print(f"\n❌ No route found!")
        
except Exception as e:
    print(f"\n❌ Routing error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("🎯 Test complete!")

