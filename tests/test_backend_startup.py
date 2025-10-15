#!/usr/bin/env python3
"""
Test Backend Startup Fix
Quick test to verify the backend can start without syntax errors
"""

import sys
import subprocess
import time
import requests
import signal
import os

def test_backend_startup():
    """Test that the backend starts without syntax errors"""
    
    print("🧪 TESTING BACKEND STARTUP AFTER WAYPOINTS FIX")
    print("=" * 55)
    
    # Change to demo-app directory
    demo_app_dir = "/Users/saikat.maiti/Documents/sssp/demo-app"
    
    print(f"📁 Working directory: {demo_app_dir}")
    
    # Start the backend process
    print(f"\n🚀 Starting backend server...")
    
    try:
        # Start backend in background
        process = subprocess.Popen(
            [sys.executable, "start_simple_demo.py"],
            cwd=demo_app_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print(f"   Backend process started with PID: {process.pid}")
        
        # Wait for startup (max 30 seconds)
        startup_timeout = 30
        print(f"   Waiting up to {startup_timeout} seconds for startup...")
        
        for i in range(startup_timeout):
            time.sleep(1)
            
            # Check if process is still running
            if process.poll() is not None:
                # Process has terminated
                stdout, stderr = process.communicate()
                print(f"   ❌ Backend process terminated early!")
                print(f"   Exit code: {process.returncode}")
                if stdout:
                    print(f"   STDOUT:\n{stdout}")
                if stderr:
                    print(f"   STDERR:\n{stderr}")
                return False
            
            # Try to connect to health endpoint
            try:
                response = requests.get("http://localhost:8000/api/health", timeout=2)
                if response.status_code == 200:
                    health = response.json()
                    print(f"   ✅ Backend started successfully!")
                    print(f"   Status: {health.get('status', 'unknown')}")
                    print(f"   QuantaRoute: {health.get('quantaroute_available', False)}")
                    
                    # Terminate the process
                    process.terminate()
                    process.wait(timeout=5)
                    
                    return True
            except requests.exceptions.RequestException:
                # Still starting up
                if i % 5 == 0:  # Print progress every 5 seconds
                    print(f"   ⏳ Still starting... ({i+1}/{startup_timeout}s)")
                continue
        
        # Timeout reached
        print(f"   ❌ Backend startup timeout after {startup_timeout} seconds")
        
        # Get any output
        try:
            stdout, stderr = process.communicate(timeout=2)
            if stdout:
                print(f"   STDOUT:\n{stdout}")
            if stderr:
                print(f"   STDERR:\n{stderr}")
        except subprocess.TimeoutExpired:
            print(f"   Process still running, terminating...")
        
        # Terminate the process
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        
        return False
        
    except Exception as e:
        print(f"   ❌ Error starting backend: {e}")
        return False

def test_syntax_check():
    """Test that the Python files have no syntax errors"""
    
    print(f"\n🔍 SYNTAX CHECK:")
    print("-" * 30)
    
    demo_app_dir = "/Users/saikat.maiti/Documents/sssp/demo-app"
    
    # Check main backend file
    try:
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", "backend/real_routing_app.py"],
            cwd=demo_app_dir,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print(f"   ✅ real_routing_app.py: No syntax errors")
        else:
            print(f"   ❌ real_routing_app.py: Syntax errors found")
            print(f"   Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error checking real_routing_app.py: {e}")
        return False
    
    # Check startup script
    try:
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", "start_simple_demo.py"],
            cwd=demo_app_dir,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print(f"   ✅ start_simple_demo.py: No syntax errors")
        else:
            print(f"   ❌ start_simple_demo.py: Syntax errors found")
            print(f"   Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error checking start_simple_demo.py: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 BACKEND STARTUP TEST AFTER WAYPOINTS FIX")
    print("=" * 60)
    
    # First check syntax
    syntax_ok = test_syntax_check()
    
    if not syntax_ok:
        print(f"\n❌ SYNTAX ERRORS FOUND - Backend cannot start")
        print(f"   Please fix syntax errors before testing startup")
        exit(1)
    
    # Test actual startup
    startup_ok = test_backend_startup()
    
    # Summary
    print(f"\n📊 BACKEND STARTUP TEST SUMMARY:")
    print("=" * 45)
    
    if syntax_ok and startup_ok:
        print(f"   ✅ Syntax Check: PASSED")
        print(f"   ✅ Backend Startup: SUCCESSFUL")
        print(f"   ✅ Waypoints fix did not break backend")
        print(f"   ✅ Ready for waypoints testing")
    elif syntax_ok:
        print(f"   ✅ Syntax Check: PASSED")
        print(f"   ❌ Backend Startup: FAILED")
        print(f"   ⚠️ Runtime error (not syntax)")
    else:
        print(f"   ❌ Syntax Check: FAILED")
        print(f"   ❌ Backend Startup: NOT TESTED")
        print(f"   ⚠️ Fix syntax errors first")
    
    print(f"\n🎯 NEXT STEPS:")
    print("=" * 30)
    if startup_ok:
        print(f"   ✅ Backend is working - you can test waypoints now")
        print(f"   💡 Try: python test_waypoints_fix.py")
    else:
        print(f"   🔧 Backend needs debugging")
        print(f"   💡 Check logs above for specific errors")
    
    exit(0 if startup_ok else 1)
