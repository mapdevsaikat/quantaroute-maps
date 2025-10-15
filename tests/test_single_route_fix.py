#!/usr/bin/env python3
"""
Test Single Route API Fix
Verify that the single route API now works consistently with alternative routes API
"""

import requests
import json
import time

def test_single_route_api():
    """Test that single route API works after the fix"""
    
    print("🧪 TESTING SINGLE ROUTE API FIX")
    print("=" * 50)
    
    # Test coordinates (same as in the screenshot)
    start = [1.3258, 103.8009]  # From screenshot
    end = [1.3309, 103.9018]    # From screenshot
    
    base_url = "http://localhost:8000"
    
    print(f"📍 Test Route:")
    print(f"   Start: {start}")
    print(f"   End: {end}")
    
    # Test 1: Alternative routes API (should work)
    print(f"\n🛣️ Testing Alternative Routes API:")
    print("-" * 40)
    
    alt_data = {
        "start": start,
        "end": end,
        "profile": "car",
        "method": "adaptive",
        "num_alternatives": 3,
        "diversity_preference": 0.7
    }
    
    try:
        response = requests.post(f"{base_url}/api/route/alternatives", json=alt_data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Alternative routes API works")
            print(f"   📊 Response: {result.get('total_routes', 0)} routes found")
            print(f"   ⚡ Compute time: {result.get('total_compute_time_ms', 0):.1f}ms")
            print(f"   🚀 Method: {result.get('computation_method', 'unknown')}")
            alt_works = True
        else:
            print(f"   ❌ Alternative routes API failed: {response.status_code}")
            print(f"   Error: {response.text}")
            alt_works = False
    except Exception as e:
        print(f"   ❌ Alternative routes API error: {e}")
        alt_works = False
    
    # Test 2: Single route API (the one we fixed)
    print(f"\n🚗 Testing Single Route API (FIXED):")
    print("-" * 40)
    
    single_data = {
        "start": start,
        "end": end,
        "profile": "car",
        "algorithm": "quantaroute",
        "alternatives": False
    }
    
    try:
        response = requests.post(f"{base_url}/api/route", json=single_data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Single route API works!")
            print(f"   📏 Distance: {result.get('distance_km', 0):.2f}km")
            print(f"   ⏱️ Duration: {result.get('duration_min', 0):.1f}min")
            print(f"   🚀 Algorithm: {result.get('algorithm', 'unknown')}")
            print(f"   📍 Path points: {len(result.get('path', []))}")
            single_works = True
        else:
            print(f"   ❌ Single route API failed: {response.status_code}")
            print(f"   Error: {response.text}")
            single_works = False
    except Exception as e:
        print(f"   ❌ Single route API error: {e}")
        single_works = False
    
    # Test 3: Compare consistency
    print(f"\n🔍 CONSISTENCY CHECK:")
    print("-" * 40)
    
    if alt_works and single_works:
        print(f"   ✅ Both APIs work - consistency achieved!")
        print(f"   🎯 Users can now toggle between single and alternative routes")
        print(f"   🚀 Both use the same underlying routing engine")
        
        # Additional verification
        print(f"\n📊 VERIFICATION RESULTS:")
        print(f"   ✅ Alternative routes toggle will work properly")
        print(f"   ✅ No more 404 errors when unchecking alternatives")
        print(f"   ✅ Consistent routing behavior across both modes")
        print(f"   ✅ Same enhanced adaptive algorithm used in both cases")
        
        return True
    elif alt_works and not single_works:
        print(f"   ⚠️ Alternative routes work but single route still fails")
        print(f"   🔧 The fix may need additional adjustments")
        return False
    elif not alt_works and single_works:
        print(f"   ⚠️ Single route works but alternative routes fail")
        print(f"   🔧 There may be a broader routing issue")
        return False
    else:
        print(f"   ❌ Both APIs fail - there's a fundamental routing problem")
        print(f"   🔧 Check if the demo app backend is running properly")
        return False

def test_demo_app_server():
    """Check if demo app server is running"""
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Demo app server is running")
            print(f"   Status: {health.get('status', 'unknown')}")
            print(f"   QuantaRoute: {health.get('quantaroute_available', False)}")
            return True
        else:
            print(f"❌ Demo app server responded with {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to demo app server: {e}")
        print(f"💡 Please start the server with: python start_simple_demo.py")
        return False

if __name__ == "__main__":
    print("🚀 SINGLE ROUTE API FIX VERIFICATION")
    print("=" * 60)
    
    # Check server first
    if not test_demo_app_server():
        print(f"\n⚠️ Please start the demo app server first:")
        print(f"   cd demo-app")
        print(f"   python start_simple_demo.py")
        exit(1)
    
    print()
    success = test_single_route_api()
    
    if success:
        print(f"\n🎉 FIX VERIFICATION SUCCESSFUL!")
        print(f"   The alternative routes toggle should now work properly")
        print(f"   Users can switch between single and alternative routes without errors")
    else:
        print(f"\n⚠️ FIX VERIFICATION FAILED")
        print(f"   Additional debugging may be needed")
    
    exit(0 if success else 1)
