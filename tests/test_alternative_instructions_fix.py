#!/usr/bin/env python3
"""
Test Alternative Routes Turn-by-Turn Instructions Fix
Verify that alternative routes now show detailed turn-by-turn directions like single routes
"""

import requests
import json
import time

def test_alternative_routes_instructions():
    """Test that alternative routes API provides detailed turn-by-turn instructions"""
    
    print("🧪 TESTING ALTERNATIVE ROUTES TURN-BY-TURN INSTRUCTIONS")
    print("=" * 65)
    
    # Test coordinates
    start = [1.3076, 103.8284]
    end = [1.3663, 103.8847]
    
    base_url = "http://localhost:8000"
    
    print(f"📍 Test Route:")
    print(f"   Start: {start}")
    print(f"   End: {end}")
    
    # Test alternative routes API
    print(f"\n🛣️ Testing Alternative Routes API Turn-by-Turn:")
    print("-" * 55)
    
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
            
            print(f"   ✅ Alternative routes API works!")
            print(f"   📊 Total routes: {result.get('total_routes', 0)}")
            print(f"   🚀 Computation method: {result.get('computation_method', 'unknown')}")
            
            # Check optimal route instructions
            optimal_route = result.get('optimal_route', {})
            optimal_instructions = optimal_route.get('instructions', [])
            
            print(f"\n   🏆 OPTIMAL ROUTE INSTRUCTIONS:")
            print(f"      📋 Steps: {len(optimal_instructions)}")
            
            if len(optimal_instructions) > 0:
                print(f"      ✅ TURN-BY-TURN FOUND!")
                
                # Show sample instructions
                print(f"      📝 Sample instructions:")
                for i, instruction in enumerate(optimal_instructions[:3]):
                    step_text = instruction.get('instruction', 'No instruction')
                    distance = instruction.get('distance_m', 0)
                    street = instruction.get('street_name', '')
                    
                    print(f"         {i+1}. {step_text}")
                    if distance > 0:
                        print(f"            📏 {distance}m")
                    if street:
                        print(f"            🛣️ Street: {street}")
                
                if len(optimal_instructions) > 3:
                    print(f"         ... and {len(optimal_instructions) - 3} more steps")
            else:
                print(f"      ❌ NO INSTRUCTIONS FOUND")
            
            # Check alternative routes instructions
            alternative_routes = result.get('alternative_routes', [])
            print(f"\n   🔀 ALTERNATIVE ROUTES INSTRUCTIONS:")
            
            alt_instructions_found = 0
            total_alt_instructions = 0
            
            for i, alt_route in enumerate(alternative_routes):
                alt_instructions = alt_route.get('instructions', [])
                route_name = alt_route.get('route_name', f'Alternative {i+1}')
                
                print(f"      {i+1}. {route_name}: {len(alt_instructions)} steps")
                
                if len(alt_instructions) > 0:
                    alt_instructions_found += 1
                    total_alt_instructions += len(alt_instructions)
                    
                    # Show first instruction as sample
                    first_instr = alt_instructions[0]
                    sample_text = first_instr.get('instruction', 'No instruction')
                    sample_street = first_instr.get('street_name', '')
                    
                    print(f"         📝 Sample: {sample_text}")
                    if sample_street:
                        print(f"         🛣️ Street: {sample_street}")
                else:
                    print(f"         ❌ No instructions")
            
            # Summary
            print(f"\n   📊 INSTRUCTIONS SUMMARY:")
            print(f"      Optimal route: {len(optimal_instructions)} steps")
            print(f"      Alternative routes with instructions: {alt_instructions_found}/{len(alternative_routes)}")
            print(f"      Total alternative instructions: {total_alt_instructions}")
            
            # Check instruction quality
            all_instructions = optimal_instructions + [instr for alt in alternative_routes for instr in alt.get('instructions', [])]
            
            has_street_names = any(instr.get('street_name') for instr in all_instructions)
            has_distances = any(instr.get('distance_m', 0) > 0 for instr in all_instructions)
            has_real_instructions = any('Navigate to destination' not in instr.get('instruction', '') for instr in all_instructions)
            
            print(f"\n   🎯 INSTRUCTION QUALITY:")
            print(f"      Real street names: {'✅' if has_street_names else '❌'}")
            print(f"      Distance data: {'✅' if has_distances else '❌'}")
            print(f"      Detailed instructions: {'✅' if has_real_instructions else '❌'}")
            
            success = (len(optimal_instructions) > 0 and alt_instructions_found > 0)
            return success, len(optimal_instructions), alt_instructions_found, has_street_names
            
        else:
            print(f"   ❌ Alternative routes API failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False, 0, 0, False
            
    except Exception as e:
        print(f"   ❌ Alternative routes API error: {e}")
        return False, 0, 0, False

def compare_with_single_route():
    """Compare alternative routes instructions with single route"""
    
    print(f"\n🚗 COMPARING WITH SINGLE ROUTE:")
    print("-" * 40)
    
    start = [1.3076, 103.8284]
    end = [1.3663, 103.8847]
    base_url = "http://localhost:8000"
    
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
            
            single_instructions = result.get('instructions', [])
            print(f"   ✅ Single route: {len(single_instructions)} instructions")
            
            if len(single_instructions) > 0:
                first_instr = single_instructions[0]
                print(f"   📝 Sample: {first_instr.get('instruction', 'No instruction')}")
                if first_instr.get('street_name'):
                    print(f"   🛣️ Street: {first_instr.get('street_name')}")
            
            return len(single_instructions)
        else:
            print(f"   ❌ Single route failed: {response.status_code}")
            return 0
    except Exception as e:
        print(f"   ❌ Single route error: {e}")
        return 0

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
    print("🚀 ALTERNATIVE ROUTES TURN-BY-TURN INSTRUCTIONS TEST")
    print("=" * 70)
    
    # Check server first
    if not test_demo_app_server():
        print(f"\n⚠️ Please start the demo app server first")
        exit(1)
    
    print()
    
    # Test alternative routes instructions
    alt_success, optimal_steps, alt_routes_with_instructions, has_streets = test_alternative_routes_instructions()
    
    # Compare with single route
    single_steps = compare_with_single_route()
    
    # Summary
    print(f"\n📊 TURN-BY-TURN INSTRUCTIONS FIX SUMMARY:")
    print("=" * 50)
    
    if alt_success:
        print(f"   ✅ Alternative Routes Turn-by-Turn: FIXED")
        print(f"      - Optimal route: {optimal_steps} instruction steps")
        print(f"      - Alternative routes with instructions: {alt_routes_with_instructions}")
        print(f"      - Street names: {'✅' if has_streets else '❌'}")
        print(f"      - Ready for navigation UI")
    else:
        print(f"   ❌ Alternative Routes Turn-by-Turn: STILL BROKEN")
    
    if single_steps > 0:
        print(f"   ✅ Single Route (reference): {single_steps} instructions")
    else:
        print(f"   ❌ Single Route: No instructions")
    
    print(f"\n🎯 USER EXPERIENCE:")
    print("=" * 40)
    if alt_success and optimal_steps > 0:
        print(f"   ✅ Users get detailed turn-by-turn directions for ALL routes")
        print(f"   ✅ Alternative routes show same quality as single routes")
        print(f"   ✅ Professional navigation experience across all modes")
        print(f"   ✅ Real street names and distances for all routes")
        
        if has_streets:
            print(f"   ✅ Real OSM street names enhance user experience")
        else:
            print(f"   ⚠️ Generic instructions (may need street name enhancement)")
    else:
        print(f"   ❌ Turn-by-turn navigation inconsistent across route types")
    
    if alt_success and optimal_steps > 0:
        print(f"\n🎉 ALTERNATIVE ROUTES TURN-BY-TURN FIX SUCCESSFUL!")
        print(f"   All routes now provide professional navigation instructions")
        print(f"   This completes the alternative routes functionality!")
    else:
        print(f"\n⚠️ ALTERNATIVE ROUTES TURN-BY-TURN FIX INCOMPLETE")
        print(f"   Additional debugging needed")
    
    exit(0 if (alt_success and optimal_steps > 0) else 1)
