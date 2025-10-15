#!/usr/bin/env python3
"""
Debug Routing Failure
Investigate why routing fails for coordinates that work in other navigation apps
"""

import sys
import os
sys.path.append('.')

def test_coordinates_analysis():
    """Analyze the problematic coordinates"""
    
    # Coordinates from the error log
    start = [1.4210066536027877, 103.74449193477632]
    end = [1.3619242902546635, 103.99011790752412]
    
    print("🔍 ROUTING FAILURE ANALYSIS")
    print("=" * 50)
    print(f"Start: {start}")
    print(f"End: {end}")
    
    # Check Singapore bounds
    SINGAPORE_BOUNDS = {
        'north': 1.4784,  # Updated bounds from health API
        'south': 1.1304,
        'west': 103.6008,
        'east': 104.0448
    }
    
    start_in_bounds = (SINGAPORE_BOUNDS['south'] <= start[0] <= SINGAPORE_BOUNDS['north'] and 
                       SINGAPORE_BOUNDS['west'] <= start[1] <= SINGAPORE_BOUNDS['east'])
    end_in_bounds = (SINGAPORE_BOUNDS['south'] <= end[0] <= SINGAPORE_BOUNDS['north'] and 
                     SINGAPORE_BOUNDS['west'] <= end[1] <= SINGAPORE_BOUNDS['east'])
    
    print(f"\n📍 BOUNDS CHECK:")
    print(f"Start in bounds: {'✅' if start_in_bounds else '❌'}")
    print(f"End in bounds: {'✅' if end_in_bounds else '❌'}")
    
    # Calculate distance
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
    print(f"Distance: {distance:.2f}km")
    print(f"Route type: {'Long distance' if distance > 20 else 'Medium distance' if distance > 5 else 'Short distance'}")
    
    # Identify approximate locations
    print(f"\n🗺️ APPROXIMATE LOCATIONS:")
    
    # Start coordinate analysis
    if start[0] > 1.41 and start[1] < 103.8:
        print(f"Start: Northern Singapore, western area (possibly Woodlands/Sembawang)")
    elif start[0] > 1.4:
        print(f"Start: Northern Singapore")
    else:
        print(f"Start: Central/Southern Singapore")
    
    # End coordinate analysis  
    if end[1] > 103.95:
        print(f"End: Eastern Singapore (possibly Changi/Pasir Ris area)")
    elif end[1] > 103.9:
        print(f"End: Eastern Singapore")
    else:
        print(f"End: Central Singapore")
    
    return start, end, distance

def test_routing_with_quantaroute():
    """Test routing directly with QuantaRoute"""
    
    print(f"\n🧪 TESTING ROUTING WITH QUANTAROUTE:")
    print("-" * 45)
    
    try:
        # Import QuantaRoute directly
        from quantaroute import QuantaRoute
        
        # Initialize with Singapore data
        singapore_pbf = "../test-data/sg-220825.osm.pbf"
        profiles_dir = "../profiles"
        
        print(f"📁 Data file: {singapore_pbf}")
        print(f"📁 Profiles: {profiles_dir}")
        
        # Test with foot profile (from the error)
        print(f"\n🚶 Testing FOOT profile routing...")
        
        router = QuantaRoute(
            osm_file=singapore_pbf,
            profile="foot",
            profiles_dir=profiles_dir
        )
        
        print(f"✅ QuantaRoute initialized for foot")
        
        # Test coordinates
        start = [1.4210066536027877, 103.74449193477632]
        end = [1.3619242902546635, 103.99011790752412]
        
        print(f"🛣️ Testing route calculation...")
        
        # Try alternative_routes method first
        try:
            result = router.alternative_routes(
                start=(start[0], start[1]),
                end=(end[0], end[1]),
                num_alternatives=1,
                method="fast"
            )
            
            if result and result.optimal_route:
                print(f"✅ ALTERNATIVE ROUTES SUCCESS!")
                print(f"   Distance: {result.optimal_route.distance_km:.2f}km")
                print(f"   Duration: {result.optimal_route.duration_min:.1f}min")
                print(f"   Algorithm: {result.optimal_route.algorithm}")
                return True
            else:
                print(f"❌ Alternative routes returned no result")
                
        except Exception as alt_error:
            print(f"❌ Alternative routes failed: {alt_error}")
            
            # Try original route method
            try:
                print(f"🔄 Trying original route method...")
                route = router.route(
                    start=(start[0], start[1]),
                    end=(end[0], end[1])
                )
                
                print(f"✅ ORIGINAL ROUTE SUCCESS!")
                print(f"   Distance: {route.distance_km:.2f}km")
                print(f"   Duration: {route.duration_min:.1f}min")
                print(f"   Algorithm: {route.algorithm}")
                return True
                
            except Exception as route_error:
                print(f"❌ Original route also failed: {route_error}")
                print(f"   This suggests the coordinates are not routable in the OSM data")
                return False
        
    except ImportError as e:
        print(f"❌ Cannot import QuantaRoute: {e}")
        return False
    except Exception as e:
        print(f"❌ QuantaRoute initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_with_different_profiles():
    """Test routing with different profiles to see if it's profile-specific"""
    
    print(f"\n🔄 TESTING DIFFERENT PROFILES:")
    print("-" * 40)
    
    profiles_to_test = ["car", "bicycle", "foot"]
    start = [1.4210066536027877, 103.74449193477632]
    end = [1.3619242902546635, 103.99011790752412]
    
    try:
        from quantaroute import QuantaRoute
        singapore_pbf = "../test-data/sg-220825.osm.pbf"
        profiles_dir = "../profiles"
        
        for profile in profiles_to_test:
            print(f"\n🧪 Testing {profile.upper()} profile...")
            
            try:
                router = QuantaRoute(
                    osm_file=singapore_pbf,
                    profile=profile,
                    profiles_dir=profiles_dir
                )
                
                # Try routing
                route = router.route(
                    start=(start[0], start[1]),
                    end=(end[0], end[1])
                )
                
                print(f"   ✅ {profile.upper()}: {route.distance_km:.2f}km, {route.duration_min:.1f}min")
                
            except Exception as e:
                print(f"   ❌ {profile.upper()}: {str(e)}")
                
    except Exception as e:
        print(f"❌ Profile testing failed: {e}")

def suggest_alternative_coordinates():
    """Suggest alternative coordinates that should work"""
    
    print(f"\n💡 SUGGESTED TEST COORDINATES:")
    print("-" * 40)
    
    # Well-known Singapore locations that should definitely work
    test_coords = [
        {
            "name": "Marina Bay to Orchard Road",
            "start": [1.2834, 103.8607],  # Marina Bay Sands
            "end": [1.3048, 103.8318],    # Orchard Road
            "distance": "~3km"
        },
        {
            "name": "Changi Airport to City Center", 
            "start": [1.3644, 103.9915],  # Changi Airport
            "end": [1.3521, 103.8198],    # Singapore Center
            "distance": "~20km"
        },
        {
            "name": "Singapore Zoo to Sentosa",
            "start": [1.4043, 103.7930],  # Singapore Zoo
            "end": [1.2494, 103.8303],    # Sentosa
            "distance": "~25km"
        }
    ]
    
    for coord in test_coords:
        print(f"📍 {coord['name']} ({coord['distance']}):")
        print(f"   Start: {coord['start']}")
        print(f"   End: {coord['end']}")

if __name__ == "__main__":
    print("🚀 ROUTING FAILURE DEBUG ANALYSIS")
    print("=" * 60)
    
    # Analyze the problematic coordinates
    start, end, distance = test_coordinates_analysis()
    
    # Test routing directly with QuantaRoute
    routing_success = test_routing_with_quantaroute()
    
    # Test different profiles
    if not routing_success:
        test_with_different_profiles()
    
    # Suggest alternatives
    suggest_alternative_coordinates()
    
    # Summary
    print(f"\n📊 ANALYSIS SUMMARY:")
    print("=" * 30)
    
    if routing_success:
        print(f"✅ Routing works with direct QuantaRoute")
        print(f"❓ Issue may be in the API layer or request processing")
    else:
        print(f"❌ Routing fails even with direct QuantaRoute")
        print(f"🔍 Possible causes:")
        print(f"   • Coordinates are in areas not covered by OSM data")
        print(f"   • Start/end points are not connected to road network")
        print(f"   • Profile restrictions prevent routing")
        print(f"   • OSM data quality issues in those areas")
    
    print(f"\n🎯 RECOMMENDATIONS:")
    print("=" * 30)
    print(f"1. Test with the suggested coordinates above")
    print(f"2. Check if the original coordinates work in OpenStreetMap.org")
    print(f"3. Verify the OSM data coverage for those areas")
    print(f"4. Consider using more central Singapore coordinates")
    
    exit(0 if routing_success else 1)
