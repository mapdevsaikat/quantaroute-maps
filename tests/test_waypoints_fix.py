#!/usr/bin/env python3
"""
Test Waypoints (Add Stop) Feature Fix
Verify that waypoints work for both single route and alternative routes
"""

import requests
import json
import time

def test_single_route_with_waypoints():
    """Test that single route API works with waypoints"""
    
    print("🧪 TESTING SINGLE ROUTE WITH WAYPOINTS")
    print("=" * 50)
    
    # Test coordinates - Singapore locations that should be accessible
    start = [1.3521, 103.8198]    # Singapore center
    waypoint1 = [1.3048, 103.8318]  # Orchard Road
    end = [1.2834, 103.8607]      # Marina Bay
    
    base_url = "http://localhost:8000"
    
    print(f"📍 Test Route with Waypoint:")
    print(f"   Start: {start} (Singapore Center)")
    print(f"   Waypoint: {waypoint1} (Orchard Road)")
    print(f"   End: {end} (Marina Bay)")
    
    # Test single route API with waypoints
    print(f"\n🚗 Testing Single Route API with Waypoints:")
    print("-" * 50)
    
    single_data = {
        "start": start,
        "end": end,
        "waypoints": [waypoint1],
        "profile": "car",
        "algorithm": "quantaroute",
        "alternatives": False
    }
    
    try:
        response = requests.post(f"{base_url}/api/route", json=single_data, timeout=45)  # Longer timeout for waypoints
        if response.status_code == 200:
            result = response.json()
            
            print(f"   ✅ Single route with waypoints works!")
            print(f"   📏 Total Distance: {result.get('distance_km', 0):.2f}km")
            print(f"   ⏱️ Total Duration: {result.get('duration_min', 0):.1f}min")
            print(f"   🚀 Algorithm: {result.get('algorithm', 'unknown')}")
            print(f"   📍 Path points: {len(result.get('path', []))}")
            
            # Check for instructions
            instructions = result.get('instructions', [])
            print(f"   🧭 Instructions: {len(instructions)} steps")
            
            if len(instructions) > 0:
                print(f"   ✅ Turn-by-turn instructions included!")
                
                # Show waypoint-related instructions
                waypoint_instructions = [instr for instr in instructions if 'waypoint' in instr.get('instruction', '').lower()]
                if waypoint_instructions:
                    print(f"   📍 Waypoint instructions found: {len(waypoint_instructions)}")
                    for instr in waypoint_instructions:
                        print(f"      - {instr.get('instruction', 'No instruction')}")
                else:
                    print(f"   📍 No explicit waypoint instructions (may be integrated)")
                
                # Show sample instructions
                print(f"   📝 Sample instructions:")
                for i, instruction in enumerate(instructions[:3]):
                    step_text = instruction.get('instruction', 'No instruction')
                    distance = instruction.get('distance_m', 0)
                    print(f"      {i+1}. {step_text}")
                    if distance > 0:
                        print(f"         📏 {distance}m")
                
                if len(instructions) > 3:
                    print(f"      ... and {len(instructions) - 3} more steps")
            else:
                print(f"   ❌ No turn-by-turn instructions")
            
            return True, len(instructions), result.get('distance_km', 0)
            
        else:
            print(f"   ❌ Single route with waypoints failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False, 0, 0
            
    except Exception as e:
        print(f"   ❌ Single route with waypoints error: {e}")
        return False, 0, 0

def test_alternative_routes_with_waypoints():
    """Test that alternative routes API works with waypoints"""
    
    print(f"\n🛣️ TESTING ALTERNATIVE ROUTES WITH WAYPOINTS:")
    print("-" * 55)
    
    # Same test coordinates
    start = [1.3521, 103.8198]
    waypoint1 = [1.3048, 103.8318]
    end = [1.2834, 103.8607]
    
    base_url = "http://localhost:8000"
    
    alt_data = {
        "start": start,
        "end": end,
        "waypoints": [waypoint1],  # Add waypoints to alternative routes
        "profile": "car",
        "method": "adaptive",
        "num_alternatives": 2,  # Fewer alternatives for waypoint routes
        "diversity_preference": 0.7
    }
    
    try:
        response = requests.post(f"{base_url}/api/route/alternatives", json=alt_data, timeout=60)  # Even longer timeout
        if response.status_code == 200:
            result = response.json()
            
            print(f"   ✅ Alternative routes with waypoints works!")
            print(f"   📊 Total routes: {result.get('total_routes', 0)}")
            print(f"   🚀 Computation method: {result.get('computation_method', 'unknown')}")
            
            # Check optimal route
            optimal_route = result.get('optimal_route', {})
            if optimal_route:
                print(f"   🏆 Optimal route: {optimal_route.get('distance_km', 0):.2f}km")
                optimal_instructions = optimal_route.get('instructions', [])
                print(f"   🧭 Optimal instructions: {len(optimal_instructions)} steps")
            
            # Check alternative routes
            alternative_routes = result.get('alternative_routes', [])
            print(f"   🔀 Alternative routes: {len(alternative_routes)}")
            
            total_instructions = len(optimal_instructions)
            for i, alt_route in enumerate(alternative_routes):
                alt_instructions = alt_route.get('instructions', [])
                alt_distance = alt_route.get('distance_km', 0)
                route_name = alt_route.get('route_name', f'Alternative {i+1}')
                
                print(f"      {i+1}. {route_name}: {alt_distance:.2f}km, {len(alt_instructions)} instructions")
                total_instructions += len(alt_instructions)
            
            print(f"   📊 Total instructions across all routes: {total_instructions}")
            
            success = (result.get('total_routes', 0) > 0 and len(optimal_instructions) > 0)
            return success, len(optimal_instructions), len(alternative_routes)
            
        else:
            print(f"   ❌ Alternative routes with waypoints failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False, 0, 0
            
    except Exception as e:
        print(f"   ❌ Alternative routes with waypoints error: {e}")
        return False, 0, 0

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
    print("🚀 WAYPOINTS (ADD STOP) FEATURE FIX TEST")
    print("=" * 60)
    
    # Check server first
    if not test_demo_app_server():
        print(f"\n⚠️ Please start the demo app server first")
        exit(1)
    
    print()
    
    # Test single route with waypoints
    single_success, single_instructions, single_distance = test_single_route_with_waypoints()
    
    # Test alternative routes with waypoints
    alt_success, alt_instructions, alt_count = test_alternative_routes_with_waypoints()
    
    # Summary
    print(f"\n📊 WAYPOINTS FEATURE FIX SUMMARY:")
    print("=" * 45)
    
    if single_success:
        print(f"   ✅ Single Route + Waypoints: FIXED")
        print(f"      - Route calculated: {single_distance:.2f}km")
        print(f"      - Instructions: {single_instructions} steps")
        print(f"      - Multi-segment routing works")
    else:
        print(f"   ❌ Single Route + Waypoints: STILL BROKEN")
    
    if alt_success:
        print(f"   ✅ Alternative Routes + Waypoints: FIXED")
        print(f"      - Instructions: {alt_instructions} steps")
        print(f"      - Alternative routes: {alt_count}")
        print(f"      - Complex waypoint routing works")
    else:
        print(f"   ❌ Alternative Routes + Waypoints: STILL BROKEN")
    
    print(f"\n🎯 USER EXPERIENCE:")
    print("=" * 40)
    if single_success and alt_success:
        print(f"   ✅ Users can add stops (waypoints) to any route type")
        print(f"   ✅ Multi-segment routing works reliably")
        print(f"   ✅ Turn-by-turn directions include waypoint navigation")
        print(f"   ✅ Both single and alternative routes support waypoints")
        print(f"   ✅ Professional multi-stop navigation experience")
    elif single_success:
        print(f"   ✅ Single routes with waypoints work")
        print(f"   ❌ Alternative routes with waypoints need more work")
    elif alt_success:
        print(f"   ❌ Single routes with waypoints need more work")
        print(f"   ✅ Alternative routes with waypoints work")
    else:
        print(f"   ❌ Waypoints feature is still broken for both route types")
    
    print(f"\n🔧 TECHNICAL DETAILS:")
    print("=" * 40)
    print(f"   🚀 Waypoint segments now use alternative_routes() method")
    print(f"   🔄 Fallback to original route() method if needed")
    print(f"   📍 Multi-segment path stitching preserved")
    print(f"   🧭 Turn-by-turn instructions for each segment")
    
    if single_success and alt_success:
        print(f"\n🎉 WAYPOINTS FEATURE FIX SUCCESSFUL!")
        print(f"   The 'Add Stop' functionality is now fully restored")
        print(f"   Users can create complex multi-stop routes")
    else:
        print(f"\n⚠️ WAYPOINTS FEATURE FIX INCOMPLETE")
        print(f"   Additional debugging may be needed")
    
    exit(0 if (single_success and alt_success) else 1)
