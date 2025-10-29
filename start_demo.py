#!/usr/bin/env python3
"""
Unified Demo Starter - Uses Main API Server (Port 8080)

This starter script:
1. Checks if main API server is running on port 8080
2. Starts only the frontend (port 3000)
3. Frontend connects to port 8080 (with graph caching!)
4. NO graph rebuilding - instant startup!

Benefits:
- Instant startup (no 30s+ graph building)
- Uses cached graphs from main API server
- Single source of truth (unified backend)
- Production-like setup
"""

import subprocess
import time
import webbrowser
import os
import signal
import sys
import socket
from pathlib import Path


def check_port_available(host='127.0.0.1', port=8080):
    """Check if a port is available (returns True if port is in use)"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0  # True if port is in use (server running)


def check_api_server_health():
    """Check if main API server (port 8080) is healthy"""
    try:
        import requests
        response = requests.get("http://localhost:8080/health", timeout=3)
        if response.status_code == 200:
            data = response.json()
            return data.get("status") in ["ok", "healthy"], data
    except:
        pass
    return False, {}


def start_demo():
    """Start unified demo (frontend only, uses main API server)"""
    
    print("=" * 80)
    print("🚀 QuantaRoute Unified Demo")
    print("=" * 80)
    print("")
    print("🎯 Unified Backend Architecture:")
    print("   🌐 Frontend: http://localhost:3000")
    print("   ⚡ Backend: http://localhost:8080 (Main API Server)")
    print("   💾 Graph Caching: ENABLED (instant startup!)")
    print("")
    
    # Check if main API server is running
    print("🔍 Checking Main API Server (port 8080)...")
    api_running = check_port_available('127.0.0.1', 8080)
    
    if not api_running:
        print("❌ Main API Server is NOT running on port 8080!")
        print("")
        print("📋 Please start the main API server first:")
        print("")
        print("   Option 1: Start API server in a separate terminal")
        print("   ──────────────────────────────────────────────────")
        print("   cd /Users/saikat.maiti/Documents/sssp")
        print("   python start_api_server.py")
        print("")
        print("   Option 2: Start API server now (y/n)?")
        
        choice = input("   > ").strip().lower()
        
        if choice == 'y':
            print("")
            print("🚀 Starting Main API Server...")
            print("   (Server will run in background)")
            
            # Start API server in background
            api_server_path = Path(__file__).parent.parent / "start_api_server.py"
            api_process = subprocess.Popen(
                [sys.executable, str(api_server_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=Path(__file__).parent.parent
            )
            
            # Wait for API server to be ready
            print("⏳ Waiting for API server to start...")
            max_wait = 60  # seconds
            start_time = time.time()
            
            while time.time() - start_time < max_wait:
                time.sleep(2)
                is_healthy, health_data = check_api_server_health()
                if is_healthy:
                    print("✅ API Server is ready!")
                    if health_data.get('cache_loaded'):
                        print("   💾 Graph loaded from cache (instant!)")
                    else:
                        print("   🏗️ Graph will be built on first routing request")
                    break
                print("   ⏳ Starting...")
            else:
                print("⚠️  API Server taking longer than expected")
                print("   Demo will continue, but routing may not work yet")
        else:
            print("")
            print("❌ Cannot start demo without API server running.")
            print("   Please start the API server first and try again.")
            sys.exit(1)
    else:
        # Check if API server is healthy
        print("✅ API Server is running on port 8080")
        is_healthy, health_data = check_api_server_health()
        
        if is_healthy:
            print("✅ API Server is healthy!")
            
            # Show cache status
            if health_data.get('cache_loaded'):
                print("   💾 Graph loaded from cache")
                print("   ⚡ Routing available instantly!")
            elif health_data.get('router_initialized'):
                print("   📊 Router initialized and ready")
            else:
                print("   ⏳ Router will initialize on first request")
            
            # Show available profiles
            if 'available_profiles' in health_data:
                profiles = health_data['available_profiles']
                print(f"   🚗 Profiles available: {', '.join(profiles) if profiles else 'none'}")
        else:
            print("⚠️  API Server is running but health check failed")
            print("   Demo will continue, but routing may not work")
    
    print("")
    
    # Check if port 3000 is available
    print("🌐 Checking frontend port (3000)...")
    if check_port_available('127.0.0.1', 3000):
        print("⚠️  Port 3000 is already in use. Attempting to free it...")
        try:
            subprocess.run(["pkill", "-f", "http.server.*3000"], check=False)
            time.sleep(2)
        except:
            pass
    
    # Start frontend
    print("🌐 Starting frontend server on port 3000...")
    try:
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "http.server", "3000", "--bind", "127.0.0.1"
        ], cwd=os.path.dirname(os.path.abspath(__file__)))
        
        time.sleep(2)
        
        # Verify frontend started
        if check_port_available('127.0.0.1', 3000):
            print("✅ Frontend server started successfully")
        else:
            print("❌ Frontend server failed to start")
            frontend_process.terminate()
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
    print("=" * 80)
    print("🎯 UNIFIED DEMO READY!")
    print("=" * 80)
    print(f"📍 Frontend: {demo_url}")
    print(f"⚡ Backend:  http://localhost:8080")
    print("")
    print("✅ Benefits of Unified Architecture:")
    print("   • Instant startup (no graph rebuilding)")
    print("   • Uses cached graphs (2-5s vs 30s+ per profile)")
    print("   • Single source of truth")
    print("   • Production-like setup")
    print("")
    print("📋 Instructions:")
    print("   1. Click anywhere on map → Green start marker")
    print("   2. Click another location → Red destination marker")
    print("   3. Watch REAL road-based routing!")
    print("")
    print("🛑 Press Ctrl+C to stop frontend server")
    print("   (API server will keep running)")
    print("=" * 80)
    
    def signal_handler(sig, frame):
        print("\n🛑 Stopping frontend server...")
        frontend_process.terminate()
        print("✅ Frontend stopped!")
        print("")
        print("ℹ️  Main API Server (port 8080) is still running")
        print("   Stop it separately if needed:")
        print("   ps aux | grep start_api_server.py")
        print("   kill <PID>")
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

