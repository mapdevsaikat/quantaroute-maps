#!/usr/bin/env python3
"""
Test Routing Issue
Investigate why specific coordinates fail to route
"""

import sys
import os
sys.path.append('.')

def test_routing_with_correct_api():
    """Test routing with the correct QuantaRoute API"""
    
    print("🧪 TESTING ROUTING WITH CORRECT QUANTAROUTE API")
    print("=" * 55)
    
    # Problematic coordinates from the error log
    start = [1.4210066536027877, 103.74449193477632]
    end = [1.3619242902546635, 103.99011790752412]
    
    print(f"📍 Testing coordinates:")
    print(f"   Start: {start} (Northern Singapore, western)")
    print(f"   End: {end} (Eastern Singapore)")
    
    try:
        from quantaroute.routing import QuantaRoute
        
        # Initialize with correct API
        singapore_pbf = "../test-data/sg-220825.osm.pbf"
        
        print(f"\n🚶 Testing FOOT profile (from error log)...")
        
        # Use the correct from_pbf class method
        router = QuantaRoute.from_pbf(singapore_pbf, "foot")
        
        print(f"✅ QuantaRoute initialized for foot profile")
        print(f"   Nodes: {len(router.nodes):,}")
        print(f"   Profile: {router.profile}")
        
        # Test routing with the problematic coordinates
        print(f"\n🛣️ Testing route calculation...")
        
        try:
            # Try the route method
            route = router.route(
                start=(start[0], start[1]),
                end=(end[0], end[1])
            )
            
            print(f"✅ ROUTING SUCCESS!")
            print(f"   Distance: {route.distance_km:.2f}km")
            print(f"   Duration: {route.duration_min:.1f}min")
            print(f"   Algorithm: {route.algorithm}")
            print(f"   Path points: {len(route.path) if hasattr(route, 'path') else 'N/A'}")
            
            return True, "Direct routing successful"
            
        except Exception as route_error:
            print(f"❌ ROUTING FAILED: {route_error}")
            
            # Check if it's a "No route found" error
            if "No route found" in str(route_error):
                print(f"🔍 This is a connectivity issue - coordinates are not connected by walkable paths")
                return False, f"No route found: {route_error}"
            else:
                print(f"🔍 This is a different error: {route_error}")
                return False, f"Routing error: {route_error}"
        
    except Exception as e:
        print(f"❌ QuantaRoute initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False, f"Initialization error: {e}"

def test_with_known_good_coordinates():
    """Test with coordinates that should definitely work"""
    
    print(f"\n🧪 TESTING WITH KNOWN GOOD COORDINATES:")
    print("-" * 45)
    
    # Well-known Singapore locations
    test_routes = [
        {
            "name": "Marina Bay to Orchard Road",
            "start": [1.2834, 103.8607],  # Marina Bay Sands
            "end": [1.3048, 103.8318],    # Orchard Road
        },
        {
            "name": "Singapore Center to Changi Airport",
            "start": [1.3521, 103.8198],  # Singapore Center
            "end": [1.3644, 103.9915],    # Changi Airport
        }
    ]
    
    try:
        from quantaroute.routing import QuantaRoute
        singapore_pbf = "../test-data/sg-220825.osm.pbf"
        
        # Test with foot profile
        router = QuantaRoute.from_pbf(singapore_pbf, "foot")
        
        for test_route in test_routes:
            print(f"\n📍 Testing: {test_route['name']}")
            
            try:
                route = router.route(
                    start=(test_route['start'][0], test_route['start'][1]),
                    end=(test_route['end'][0], test_route['end'][1])
                )
                
                print(f"   ✅ SUCCESS: {route.distance_km:.2f}km, {route.duration_min:.1f}min")
                
            except Exception as e:
                print(f"   ❌ FAILED: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Known good coordinates test failed: {e}")
        return False

def analyze_coordinate_accessibility():
    """Analyze if the coordinates are accessible for foot routing"""
    
    print(f"\n🔍 COORDINATE ACCESSIBILITY ANALYSIS:")
    print("-" * 45)
    
    start = [1.4210066536027877, 103.74449193477632]
    end = [1.3619242902546635, 103.99011790752412]
    
    print(f"🗺️ Analyzing coordinate locations:")
    
    # Start coordinate analysis (Northern Singapore, western)
    print(f"\n📍 START COORDINATE: {start}")
    if start[0] > 1.41 and start[1] < 103.8:
        print(f"   Location: Northern Singapore, western area")
        print(f"   Likely areas: Woodlands, Sembawang, Yishun")
        print(f"   Potential issues:")
        print(f"   • May be in industrial/restricted areas")
        print(f"   • Limited pedestrian infrastructure")
        print(f"   • Near Malaysia border (restricted zones)")
    
    # End coordinate analysis (Eastern Singapore)
    print(f"\n📍 END COORDINATE: {end}")
    if end[1] > 103.95:
        print(f"   Location: Far eastern Singapore")
        print(f"   Likely areas: Changi, Pasir Ris, Tampines")
        print(f"   Potential issues:")
        print(f"   • May be in airport restricted areas")
        print(f"   • Industrial zones with limited pedestrian access")
        print(f"   • Coastal areas with restricted access")
    
    # Distance analysis
    import math
    def haversine_distance(lat1, lng1, lat2, lng2):
        R = 6371
        dLat = math.radians(lat2 - lat1)
        dLng = math.radians(lng2 - lng1)
        a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLng/2) * math.sin(dLng/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
    distance = haversine_distance(start[0], start[1], end[0], end[1])
    
    print(f"\n📏 ROUTE ANALYSIS:")
    print(f"   Distance: {distance:.2f}km")
    print(f"   Route type: Very long walking distance")
    print(f"   Walking time estimate: ~{distance/5*60:.0f} minutes ({distance/5:.1f} hours)")
    print(f"   Feasibility: {'❌ Impractical for walking' if distance > 20 else '⚠️ Very long walk' if distance > 10 else '✅ Reasonable'}")
    
    if distance > 20:
        print(f"\n⚠️ ROUTING ISSUE LIKELY CAUSE:")
        print(f"   • 28km is an extremely long walking distance")
        print(f"   • OSM foot routing may not support such long routes")
        print(f"   • Route may cross restricted/inaccessible areas")
        print(f"   • Better suited for car/public transport routing")

def suggest_solutions():
    """Suggest solutions for the routing issue"""
    
    print(f"\n💡 SUGGESTED SOLUTIONS:")
    print("-" * 35)
    
    print(f"1. 🚗 TRY DIFFERENT PROFILE:")
    print(f"   • Use 'car' profile instead of 'foot'")
    print(f"   • 28km is more suitable for driving")
    print(f"   • Car routing has better connectivity")
    
    print(f"\n2. 📍 USE INTERMEDIATE WAYPOINTS:")
    print(f"   • Break the 28km route into segments")
    print(f"   • Add waypoints in accessible areas")
    print(f"   • Avoid restricted zones")
    
    print(f"\n3. 🔍 VERIFY COORDINATE ACCURACY:")
    print(f"   • Check coordinates on OpenStreetMap.org")
    print(f"   • Ensure they're on accessible roads/paths")
    print(f"   • Avoid industrial/restricted areas")
    
    print(f"\n4. 🛣️ TEST WITH SHORTER ROUTES:")
    print(f"   • Start with <10km routes for foot profile")
    print(f"   • Use well-connected urban areas")
    print(f"   • Test with central Singapore coordinates")

if __name__ == "__main__":
    print("🚀 ROUTING ISSUE INVESTIGATION")
    print("=" * 50)
    
    # Test with the problematic coordinates
    routing_success, error_msg = test_routing_with_correct_api()
    
    # Test with known good coordinates
    if not routing_success:
        known_good_success = test_with_known_good_coordinates()
    else:
        known_good_success = True
    
    # Analyze coordinate accessibility
    analyze_coordinate_accessibility()
    
    # Suggest solutions
    suggest_solutions()
    
    # Summary
    print(f"\n📊 INVESTIGATION SUMMARY:")
    print("=" * 35)
    
    if routing_success:
        print(f"✅ Routing works - issue may be in API layer")
    else:
        print(f"❌ Routing fails with direct QuantaRoute")
        print(f"   Error: {error_msg}")
        
        if known_good_success:
            print(f"✅ Known good coordinates work")
            print(f"🔍 Issue is specific to these coordinates")
        else:
            print(f"❌ Even known good coordinates fail")
            print(f"🔍 Issue may be with QuantaRoute setup")
    
    print(f"\n🎯 MAIN FINDINGS:")
    print("=" * 25)
    print(f"• 28km walking route is extremely long")
    print(f"• Coordinates may be in restricted/inaccessible areas")
    print(f"• Foot profile may not support such long distances")
    print(f"• Car profile would be more appropriate")
    
    print(f"\n🚀 IMMEDIATE ACTION:")
    print("=" * 25)
    print(f"Try the same coordinates with 'car' profile instead of 'foot'")
    print(f"This will likely resolve the routing issue!")
    
    exit(0 if routing_success else 1)
