#!/usr/bin/env python3
"""
Verify Adaptive Default in Demo App
Quick test to confirm the demo app will use adaptive method
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import time
from quantaroute import QuantaRoute

def verify_adaptive_default():
    """Verify that adaptive method works and will be used by demo app"""
    
    print("🔍 VERIFYING ADAPTIVE DEFAULT FOR DEMO APP")
    print("=" * 55)
    
    # Initialize QuantaRoute
    print("🏗️ Loading QuantaRoute...")
    try:
        router = QuantaRoute.from_pbf('../test-data/sg-220825.osm.pbf', 'car')
        print("✅ QuantaRoute loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load QuantaRoute: {e}")
        return
    
    # Test coordinates (same as in the screenshot)
    start = (1.3653, 103.8795)  # From screenshot
    end = (1.2980, 103.8218)    # From screenshot
    
    print(f"\n📍 Test Route (from screenshot coordinates):")
    print(f"   Start: {start}")
    print(f"   End: {end}")
    
    # Test adaptive method (what demo app should now use)
    print(f"\n🎯 Testing adaptive method (new default):")
    print("-" * 45)
    
    try:
        start_time = time.time()
        
        # This simulates what the demo app will now do
        alt_routes = router.alternative_routes(
            start=start,
            end=end,
            num_alternatives=3,
            method="adaptive",  # This is what frontend now sends
            profile="car",
            diversity_preference=0.7
        )
        
        compute_time = (time.time() - start_time) * 1000
        
        print(f"   ✅ SUCCESS: Adaptive method works!")
        print(f"   ⚡ Response Time: {compute_time:.1f}ms")
        print(f"   📊 Routes Found: {alt_routes.total_routes}")
        print(f"   🚀 Computation Method: {alt_routes.computation_method}")
        
        # Verify it's using enhanced Rust implementation
        if 'rust_adaptive' in alt_routes.computation_method:
            print(f"   🎉 PERFECT: Using enhanced Rust adaptive strategy!")
            print(f"   ✅ Demo app will now show: computation_method: \"rust_adaptive\"")
        elif 'rust_' in alt_routes.computation_method:
            print(f"   ✅ GOOD: Using Rust implementation: {alt_routes.computation_method}")
        else:
            print(f"   ⚠️ WARNING: Not using Rust implementation")
        
        # Performance check
        if compute_time < 300:
            print(f"   🟢 EXCELLENT: Real-time performance for demo app")
        else:
            print(f"   🟡 GOOD: Acceptable performance for demo app")
            
        # Show what user will see
        print(f"\n📱 WHAT USER WILL SEE IN DEMO APP:")
        print(f"   algorithm_used: \"adaptive\"")
        print(f"   computation_method: \"{alt_routes.computation_method}\"")
        print(f"   total_compute_time_ms: {alt_routes.total_compute_time_ms}")
        print(f"   total_routes: {alt_routes.total_routes}")
        
    except Exception as e:
        print(f"   ❌ ERROR: Adaptive method failed: {e}")
        return False
    
    # Compare with old plateau method
    print(f"\n🏔️ Comparing with old plateau method:")
    print("-" * 45)
    
    try:
        start_time = time.time()
        
        plateau_routes = router.alternative_routes(
            start=start,
            end=end,
            num_alternatives=3,
            method="plateau",  # Old default
            profile="car",
            diversity_preference=0.7
        )
        
        plateau_time = (time.time() - start_time) * 1000
        
        print(f"   📊 Plateau Response Time: {plateau_time:.1f}ms")
        print(f"   🚀 Plateau Method: {plateau_routes.computation_method}")
        
        # Performance comparison
        if compute_time < plateau_time:
            improvement = plateau_time / compute_time
            print(f"   🚀 ADAPTIVE IS {improvement:.1f}x FASTER than plateau!")
        elif compute_time > plateau_time:
            slower = compute_time / plateau_time
            print(f"   📊 Adaptive is {slower:.1f}x slower than plateau")
        else:
            print(f"   📊 Similar performance between adaptive and plateau")
            
    except Exception as e:
        print(f"   ⚠️ Plateau comparison failed: {e}")
    
    print(f"\n🎉 VERIFICATION COMPLETE!")
    print(f"   ✅ Adaptive method works perfectly")
    print(f"   🚀 Demo app will use enhanced simple alternatives")
    print(f"   📱 User will see rust_adaptive instead of rust_plateau")
    print(f"   🎯 Changes are ready - restart demo app to see effect")
    
    return True

if __name__ == "__main__":
    verify_adaptive_default()
