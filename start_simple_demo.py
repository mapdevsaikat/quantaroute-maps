#!/usr/bin/env python3
"""
Simple demo starter that uses the REAL routing backend
"""

import subprocess
import time
import webbrowser
import os
import signal
import sys
from pathlib import Path

def start_demo():
    """Start backend and frontend with REAL routing"""
    
    print("🚀 Starting QuantaRoute Demo with REAL Bengaluru Roads")
    print("=======================================================")
    print("")
    print("✅ This demo uses:")
    print("   🗺️  REAL Bengaluru OSM road network (highway data)")
    print("   🛣️  Actual road following with live routing")
    print("   ⚡ SSSP algorithm on real graph data")
    print("")
    
    # Start the real routing backend
    print("🖥️  Starting REAL routing backend...")
    backend_process = subprocess.Popen([
        sys.executable, "backend/real_routing_app.py"
    ])  # Remove output capture so we can see backend logs
    
    # Wait for backend to load the road network (intelligent waiting)
    print("⏳ Loading Bengaluru road network with 5 profiles (bicycle, car, foot, motorcycle, public_transport)...")
    print("   This may take 30-45 seconds to load and process the highway network...")
    
    # Intelligent waiting - check backend health periodically
    max_attempts = 250  # 250 attempts = up to 250 seconds (5 profiles need ~210-230 seconds)
    attempt = 0
    backend_ready = False
    
    while attempt < max_attempts and not backend_ready:
        attempt += 1
        print(f"   Checking backend... ({attempt}/{max_attempts})")
        
        try:
            import requests
            response = requests.get("http://localhost:8000/api/health", timeout=3)
            if response.status_code == 200:
                data = response.json()
                if data.get("real_routing") and data.get("router_initialized"):
                    profiles = data.get("available_profiles", [])
                    total_routers = data.get("total_routers", 0)
                    print("✅ REAL routing backend is ready!")
                    print(f"   📊 {total_routers} profile routers loaded: {', '.join(profiles)}")
                    print(f"   🗺️ Bengaluru road network: {data.get('bengaluru_bounds', {}).get('center', 'Bengaluru')}")
                    backend_ready = True
                    break
                else:
                    print(f"   ⏳ Backend loading... (status: {data.get('status', 'unknown')})")
        except requests.exceptions.RequestException:
            # Backend not responding yet
            pass
        except Exception as e:
            print(f"   ⚠️ Backend check error: {e}")
        
        time.sleep(1)
    
    if not backend_ready:
        print(f"❌ Backend failed to start within {max_attempts} seconds!")
        print("   Check backend logs above for errors.")
        print("   You can still try the demo, but routing may not work.")
    else:
        # Extra verification - test a simple route (MG Road area, Bengaluru)
        try:
            test_response = requests.post("http://localhost:8000/api/route", 
                json={"start": [12.9716, 77.5946], "end": [12.9750, 77.6000], "profile": "foot"},
                timeout=10)
            if test_response.status_code == 200:
                print("   ✅ Route calculation test passed!")
            else:
                print(f"   ⚠️ Route test failed: {test_response.status_code}")
        except Exception as e:
            print(f"   ⚠️ Route test error: {e}")
    
    # Check if port 3000 is available
    print("🌐 Checking port 3000 availability...")
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 3000))
        sock.close()
        
        if result == 0:
            print("⚠️  Port 3000 is already in use. Attempting to free it...")
            # Try to kill any process using port 3000
            try:
                subprocess.run(["pkill", "-f", "http.server.*3000"], check=False)
                time.sleep(2)  # Wait for process to die
            except:
                pass
    except:
        pass
    
    # Start frontend
    print("🌐 Starting frontend server on port 3000...")
    try:
        # First attempt - try to start normally
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "http.server", "3000", "--bind", "127.0.0.1"
        ], cwd=os.path.dirname(os.path.abspath(__file__)))
        
        time.sleep(3)  # Give it more time to start
        
        # Check if frontend started successfully by testing the port
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 3000))
        sock.close()
        
        if result == 0:
            print("✅ Frontend server started successfully on port 3000")
        else:
            print("❌ Frontend server failed to bind to port 3000")
            if frontend_process.poll() is None:
                frontend_process.terminate()
            # Try to find and kill any conflicting process
            try:
                subprocess.run(["pkill", "-f", "python.*http.server.*3000"], check=False)
                time.sleep(2)
                # Retry
                frontend_process = subprocess.Popen([
                    sys.executable, "-m", "http.server", "3000", "--bind", "127.0.0.1"
                ], cwd=os.path.dirname(os.path.abspath(__file__)))
                time.sleep(2)
                print("✅ Frontend server restarted on port 3000")
            except Exception as retry_error:
                print(f"❌ Failed to restart frontend: {retry_error}")
                sys.exit(1)
            
    except Exception as e:
        print(f"❌ Failed to start frontend server: {e}")
        sys.exit(1)
    
    # Open browser
    demo_url = "http://localhost:3000/frontend/"
    print(f"🌐 Opening demo: {demo_url}")
    try:
        webbrowser.open(demo_url)
    except:
        pass
    
    print("")
    print("🎯 DEMO READY WITH REAL ROUTING!")
    print("================================")
    print(f"📍 URL: {demo_url}")
    print("📋 Instructions:")
    print("   1. Click anywhere on Bengaluru map → Green start marker")
    print("   2. Click another location → Red destination marker")
    print("   3. Watch REAL road-based routing with turn-by-turn!")
    print("")
    print("🏆 This demonstrates SSSP algorithm on actual Bengaluru roads")
    print("🛑 Press Ctrl+C to stop both servers")
    
    def signal_handler(sig, frame):
        print("\n🛑 Stopping demo servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Demo stopped!")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Keep running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    start_demo()
