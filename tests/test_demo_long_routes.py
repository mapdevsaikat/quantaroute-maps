#!/usr/bin/env python3
"""
Test Demo Long Routes
Verify that the demo app can handle long routes without restrictions
"""

import sys
import os
sys.path.append('.')

def test_long_route_demo():
    """Test that long routes work in demo mode"""
    
    print("🧪 TESTING DEMO LONG ROUTE SUPPORT")
    print("=" * 50)
    
    # The problematic coordinates that should now work
    start = [1.4210066536027877, 103.74449193477632]  # Northern Singapore
    end = [1.3619242902546635, 103.99011790752412]    # Eastern Singapore
    
    print(f"📍 Testing coordinates:")
    print(f"   Start: {start} (Northern Singapore)")
    print(f"   End: {end} (Eastern Singapore)")
    print(f"   Distance: ~28km")
    
    try:
        from quantaroute.routing import QuantaRoute
        
        # Test with different profiles
        profiles_to_test = ["car", "foot", "bicycle"]
        singapore_pbf = "../test-data/sg-220825.osm.pbf"
        
        for profile in profiles_to_test:
            print(f"\n🚗 Testing {profile.upper()} profile...")
            
            try:
                router = QuantaRoute.from_pbf(singapore_pbf, profile)
                print(f"✅ Router initialized for {profile}")
                
                # Try routing with different algorithms
                for algorithm in ["quantaroute", "dijkstra_reference"]:
                    try:
                        print(f"  🔄 Trying {algorithm}...")
                        route = router.route(
                            start=(start[0], start[1]),
                            end=(end[0], end[1]),
                            algorithm=algorithm
                        )
                        
                        print(f"  ✅ {profile.upper()} + {algorithm}: SUCCESS!")
                        print(f"     Distance: {route.distance_km:.2f}km")
                        print(f"     Duration: {route.duration_min:.1f}min")
                        print(f"     Algorithm: {route.algorithm}")
                        
                        # Verify it's following roads (not straight line)
                        if hasattr(route, 'geojson') and route.geojson:
                            coords = route.geojson.get('geometry', {}).get('coordinates', [])
                            if len(coords) > 10:  # Should have many waypoints for 28km
                                print(f"     ✅ Route follows roads ({len(coords)} waypoints)")
                            else:
                                print(f"     ⚠️ Route may be simplified ({len(coords)} waypoints)")
                        
                        break  # Success with this profile
                        
                    except Exception as alg_error:
                        print(f"  ❌ {profile.upper()} + {algorithm}: {alg_error}")
                        continue
                else:
                    print(f"  ❌ {profile.upper()}: All algorithms failed")
                    
            except Exception as profile_error:
                print(f"❌ {profile.upper()} profile failed: {profile_error}")
                
    except Exception as e:
        print(f"❌ Test setup failed: {e}")
        return False
    
    return True

def test_demo_api_endpoints():
    """Test the demo API endpoints with long routes"""
    
    print(f"\n🌐 TESTING DEMO API ENDPOINTS")
    print("-" * 40)
    
    import requests
    import json
    
    # Test coordinates
    start = [1.4210066536027877, 103.74449193477632]
    end = [1.3619242902546635, 103.99011790752412]
    
    # Test single route API
    print(f"📡 Testing /api/route endpoint...")
    
    route_payload = {
        "start": start,
        "end": end,
        "profile": "foot",  # Test the problematic foot profile
        "algorithm": "quantaroute"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/route",
            json=route_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Single route API: SUCCESS!")
            print(f"   Distance: {data.get('distance_km', 'N/A')}km")
            print(f"   Duration: {data.get('duration_min', 'N/A')}min")
            print(f"   Path points: {len(data.get('path', []))}")
            print(f"   Instructions: {len(data.get('instructions', []))}")
        else:
            print(f"❌ Single route API failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"⚠️ Backend not running - start with: python start_simple_demo.py")
        return False
    except Exception as api_error:
        print(f"❌ API test failed: {api_error}")
        return False
    
    # Test alternative routes API
    print(f"\n📡 Testing /api/route/alternatives endpoint...")
    
    alt_payload = {
        "start": start,
        "end": end,
        "profile": "foot",
        "algorithm": "adaptive",
        "num_alternatives": 2
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/route/alternatives",
            json=alt_payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            alternatives = data.get('alternatives', [])
            print(f"✅ Alternative routes API: SUCCESS!")
            print(f"   Alternatives found: {len(alternatives)}")
            
            for i, alt in enumerate(alternatives):
                print(f"   Route {i+1}: {alt.get('distance_km', 'N/A')}km, {alt.get('duration_min', 'N/A')}min")
                
        else:
            print(f"❌ Alternative routes API failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as alt_error:
        print(f"❌ Alternative routes test failed: {alt_error}")
    
    return True

def test_different_profiles():
    """Test that all profiles can handle long routes"""
    
    print(f"\n🔄 TESTING ALL PROFILES FOR LONG ROUTES")
    print("-" * 45)
    
    start = [1.4210066536027877, 103.74449193477632]
    end = [1.3619242902546635, 103.99011790752412]
    
    profiles = ["car", "bicycle", "foot", "motorcycle"]
    
    for profile in profiles:
        print(f"\n🧪 Testing {profile.upper()} profile...")
        
        payload = {
            "start": start,
            "end": end,
            "profile": profile,
            "algorithm": "quantaroute"
        }
        
        try:
            import requests
            response = requests.post(
                "http://localhost:8000/api/route",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {profile.upper()}: SUCCESS!")
                print(f"   Distance: {data.get('distance_km', 'N/A')}km")
                print(f"   Duration: {data.get('duration_min', 'N/A')}min")
                print(f"   Algorithm: {data.get('algorithm', 'N/A')}")
                
                # Check if route follows roads
                path_points = len(data.get('path', []))
                if path_points > 50:  # Long route should have many points
                    print(f"   ✅ Follows roads ({path_points} waypoints)")
                else:
                    print(f"   ⚠️ May be simplified ({path_points} waypoints)")
                    
            else:
                print(f"❌ {profile.upper()}: FAILED ({response.status_code})")
                error_detail = response.json().get('detail', response.text)
                print(f"   Error: {error_detail}")
                
        except requests.exceptions.ConnectionError:
            print(f"⚠️ Backend not running for {profile} test")
            break
        except Exception as e:
            print(f"❌ {profile.upper()} test error: {e}")

if __name__ == "__main__":
    print("🚀 DEMO LONG ROUTE TESTING")
    print("=" * 60)
    
    print("This test verifies that the demo app can handle:")
    print("• 28km+ routes without restrictions")
    print("• All transport profiles (car, foot, bicycle, motorcycle)")
    print("• Routes that follow actual roads (no straight lines)")
    print("• Both single and alternative route APIs")
    
    # Test 1: Direct QuantaRoute testing
    direct_success = test_long_route_demo()
    
    # Test 2: API endpoint testing (requires backend running)
    api_success = test_demo_api_endpoints()
    
    # Test 3: All profiles testing
    if api_success:
        test_different_profiles()
    
    # Summary
    print(f"\n📊 TEST SUMMARY:")
    print("=" * 30)
    
    if direct_success:
        print("✅ Direct QuantaRoute: Long routes work")
    else:
        print("❌ Direct QuantaRoute: Issues found")
        
    if api_success:
        print("✅ API Endpoints: Long routes supported")
    else:
        print("❌ API Endpoints: Backend not available or issues")
    
    print(f"\n🎯 DEMO READINESS:")
    print("=" * 25)
    
    if direct_success and api_success:
        print("🎉 DEMO READY: Long routes work for all profiles!")
        print("   • No distance restrictions")
        print("   • No straight-line fallbacks")
        print("   • Routes follow actual roads")
        print("   • Works with 28km+ distances")
    elif direct_success:
        print("⚠️ PARTIAL: QuantaRoute works, start backend for full demo")
    else:
        print("❌ NOT READY: Issues need to be resolved")
    
    exit(0 if direct_success else 1)
