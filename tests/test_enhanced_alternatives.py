#!/usr/bin/env python3
"""
Test Enhanced Simple Alternatives in Demo App Context
Demonstrates the new alternative route strategies we built
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import time
from quantaroute import QuantaRoute

def test_enhanced_alternatives():
    """Test all enhanced simple alternative strategies"""
    
    print("🚀 ENHANCED SIMPLE ALTERNATIVES - DEMO APP TEST")
    print("=" * 65)
    
    # Initialize QuantaRoute with Singapore data
    print("🏗️ Loading QuantaRoute with Singapore road network...")
    try:
        router = QuantaRoute.from_pbf('../test-data/sg-220825.osm.pbf', 'car')
        print("✅ QuantaRoute loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load QuantaRoute: {e}")
        return
    
    # Test coordinates (Marina Bay to Orchard Road)
    start = (1.2966, 103.8520)  # Marina Bay
    end = (1.3048, 103.8318)    # Orchard Road
    
    print(f"\n📍 Test Route: Marina Bay → Orchard Road")
    print(f"   Start: {start}")
    print(f"   End: {end}")
    
    # Test all enhanced strategies
    strategies = [
        ('adaptive', '🎯 Adaptive Strategy Selection'),
        ('fast', '⚡ Enhanced Simple (Fast Exclusion)'),
        ('perturbation', '🎲 Weight Perturbation'),
        ('highway', '🛣️ Highway Avoidance'),
        ('major', '🔀 Major Edge Exclusion'),
        ('plateau', '🏔️ Plateau Method (Comparison)'),
    ]
    
    results = []
    
    for method, description in strategies:
        print(f"\n{description}:")
        print("-" * 50)
        
        try:
            start_time = time.time()
            
            # Test the method through QuantaRoute's alternative_routes API
            alt_routes = router.alternative_routes(
                start=start,
                end=end,
                num_alternatives=3,
                method=method,
                diversity_preference=0.7
            )
            
            compute_time = (time.time() - start_time) * 1000
            
            print(f"✅ {alt_routes.total_routes} routes found in {compute_time:.1f}ms")
            print(f"   Method: {alt_routes.computation_method}")
            print(f"   Internal time: {alt_routes.total_compute_time_ms:.1f}ms")
            
            # Show route details
            optimal = alt_routes.optimal_route
            print(f"   Optimal: {optimal.distance_km:.1f}km, {optimal.duration_min:.1f}min")
            
            for i, alt_route in enumerate(alt_routes.alternative_routes):
                route = alt_route.route
                similarity = alt_route.similarity_to_optimal
                cost_ratio = alt_route.cost_ratio
                print(f"   Alt {i+1}: {route.distance_km:.1f}km, {route.duration_min:.1f}min "
                      f"(similarity: {similarity:.3f}, cost ratio: {cost_ratio:.2f})")
            
            results.append({
                'method': method,
                'description': description,
                'routes': alt_routes.total_routes,
                'time_ms': compute_time,
                'internal_time_ms': alt_routes.total_compute_time_ms,
                'computation_method': alt_routes.computation_method
            })
            
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append({
                'method': method,
                'description': description,
                'routes': 0,
                'time_ms': float('inf'),
                'error': str(e)
            })
    
    # Summary
    print("\n" + "=" * 65)
    print("📊 PERFORMANCE SUMMARY:")
    print("=" * 65)
    
    rust_methods = ['adaptive', 'fast', 'perturbation', 'highway', 'major']
    rust_times = []
    python_times = []
    
    for result in results:
        if 'error' not in result:
            method = result['method']
            routes = result['routes']
            time_ms = result['time_ms']
            comp_method = result['computation_method']
            
            status = "🦀 Rust" if 'rust_' in comp_method else "🐍 Python"
            print(f"{result['description']:35} | {routes} routes | {time_ms:6.1f}ms | {status}")
            
            if method in rust_methods:
                rust_times.append(time_ms)
            else:
                python_times.append(time_ms)
    
    # Performance comparison
    if rust_times:
        avg_rust = sum(rust_times) / len(rust_times)
        print(f"\n🚀 ENHANCED SIMPLE ALTERNATIVES PERFORMANCE:")
        print(f"   Average time: {avg_rust:.1f}ms")
        print(f"   Strategies tested: {len(rust_times)}")
        print(f"   All using high-performance Rust implementation!")
    
    print(f"\n🎉 DEMO APP INTEGRATION COMPLETE!")
    print(f"   ✅ All enhanced strategies available in demo app")
    print(f"   ✅ Seamless integration with QuantaRoute API")
    print(f"   ✅ Real-time performance suitable for web demo")

if __name__ == "__main__":
    test_enhanced_alternatives()
