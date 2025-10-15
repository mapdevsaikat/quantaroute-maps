#!/usr/bin/env python3
"""
Test Turn-by-Turn Instructions Fix
Verify that single route API now provides proper turn-by-turn directions
"""

import requests
import json
import time

def test_turn_by_turn_instructions():
    """Test that single route API provides turn-by-turn instructions"""
    
    print("🧪 TESTING TURN-BY-TURN INSTRUCTIONS FIX")
    print("=" * 55)
    
    # Test coordinates
    start = [1.3076, 103.8284]  # From terminal logs
    end = [1.3663, 103.8847]    # From terminal logs
    
    base_url = "http://localhost:8000"
    
    print(f"📍 Test Route:")
    print(f"   Start: {start}")
    print(f"   End: {end}")
    
    # Test single route API (should now have turn-by-turn)
    print(f"\n🚗 Testing Single Route API Turn-by-Turn:")
    print("-" * 50)
    
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
            
            # Check for turn-by-turn instructions
            instructions = result.get('instructions', [])
            print(f"   🧭 Instructions: {len(instructions)} steps")
            
            if len(instructions) > 0:
                print(f"   ✅ TURN-BY-TURN INSTRUCTIONS FOUND!")
                
                # Show first few instructions
                print(f"\n   📋 Sample Instructions:")
                for i, instruction in enumerate(instructions[:3]):
                    step_text = instruction.get('instruction', 'No instruction')
                    distance = instruction.get('distance_m', 0)
                    duration = instruction.get('duration_s', 0)
                    street = instruction.get('street_name', '')
                    
                    print(f"      {i+1}. {step_text}")
                    if distance > 0:
                        print(f"         📏 {distance}m, ⏱️ {duration}s")
                    if street:
                        print(f"         🛣️ Street: {street}")
                
                if len(instructions) > 3:
                    print(f"      ... and {len(instructions) - 3} more steps")
                
                # Check instruction quality
                has_street_names = any(instr.get('street_name') for instr in instructions)
                has_distances = any(instr.get('distance_m', 0) > 0 for instr in instructions)
                has_coordinates = any(instr.get('segment_coordinates') for instr in instructions)
                
                print(f"\n   📊 Instruction Quality:")
                print(f"      Street Names: {'✅' if has_street_names else '❌'}")
                print(f"      Distances: {'✅' if has_distances else '❌'}")
                print(f"      Coordinates: {'✅' if has_coordinates else '❌'}")
                
                return True, len(instructions), has_street_names
            else:
                print(f"   ❌ NO TURN-BY-TURN INSTRUCTIONS FOUND")
                return True, 0, False
                
        else:
            print(f"   ❌ Single route API failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False, 0, False
            
    except Exception as e:
        print(f"   ❌ Single route API error: {e}")
        return False, 0, False

def compare_with_alternatives():
    """Compare single route with alternative routes instructions"""
    
    print(f"\n🛣️ COMPARING WITH ALTERNATIVE ROUTES:")
    print("-" * 50)
    
    start = [1.3076, 103.8284]
    end = [1.3663, 103.8847]
    base_url = "http://localhost:8000"
    
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
            
            # Check optimal route instructions
            optimal_instructions = []
            if 'optimal_route' in result and 'instructions' in result['optimal_route']:
                optimal_instructions = result['optimal_route']['instructions']
            
            print(f"   ✅ Alternative routes API works")
            print(f"   🧭 Optimal route instructions: {len(optimal_instructions)} steps")
            
            if len(optimal_instructions) > 0:
                print(f"   📋 Sample from optimal route:")
                first_instr = optimal_instructions[0]
                print(f"      1. {first_instr.get('instruction', 'No instruction')}")
                if first_instr.get('street_name'):
                    print(f"         🛣️ Street: {first_instr.get('street_name')}")
            
            return len(optimal_instructions)
        else:
            print(f"   ❌ Alternative routes API failed: {response.status_code}")
            return 0
    except Exception as e:
        print(f"   ❌ Alternative routes API error: {e}")
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
    print("🚀 TURN-BY-TURN INSTRUCTIONS FIX TEST")
    print("=" * 60)
    
    # Check server first
    if not test_demo_app_server():
        print(f"\n⚠️ Please start the demo app server first")
        exit(1)
    
    print()
    
    # Test single route turn-by-turn
    single_works, single_instructions, has_streets = test_turn_by_turn_instructions()
    
    # Compare with alternatives
    alt_instructions = compare_with_alternatives()
    
    # Summary
    print(f"\n📊 TURN-BY-TURN FIX SUMMARY:")
    print("=" * 40)
    
    if single_works:
        if single_instructions > 0:
            print(f"   ✅ Single Route Turn-by-Turn: FIXED")
            print(f"      - {single_instructions} instruction steps")
            print(f"      - Street names: {'✅' if has_streets else '❌'}")
            print(f"      - Ready for navigation UI")
        else:
            print(f"   ⚠️ Single Route API works but no instructions")
    else:
        print(f"   ❌ Single Route API: STILL BROKEN")
    
    if alt_instructions > 0:
        print(f"   ✅ Alternative Routes: {alt_instructions} instructions (reference)")
    
    print(f"\n🎯 USER EXPERIENCE:")
    print("=" * 40)
    if single_works and single_instructions > 0:
        print(f"   ✅ Users get turn-by-turn directions in single route mode")
        print(f"   ✅ Consistent navigation experience across toggle states")
        print(f"   ✅ Professional navigation app functionality")
        
        if has_streets:
            print(f"   ✅ Real street names for better user experience")
        else:
            print(f"   ⚠️ Generic instructions (may need street name enhancement)")
    else:
        print(f"   ❌ Turn-by-turn navigation still not working properly")
    
    if single_works and single_instructions > 0:
        print(f"\n🎉 TURN-BY-TURN FIX SUCCESSFUL!")
        print(f"   The alternative routes toggle should now work completely")
    else:
        print(f"\n⚠️ TURN-BY-TURN FIX INCOMPLETE")
        print(f"   Additional debugging needed")
    
    exit(0 if (single_works and single_instructions > 0) else 1)
