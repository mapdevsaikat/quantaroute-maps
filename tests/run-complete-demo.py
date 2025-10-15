#!/usr/bin/env python3
"""
Complete QuantaRoute Demo Runner
===============================

Runs both backend API and frontend server with proper path handling.
"""

import subprocess
import threading
import time
import webbrowser
import sys
import os
from pathlib import Path
import signal
import requests

def start_backend():
    """Start the FastAPI backend server"""
    print("🖥️  Starting backend API server...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    # Start FastAPI server
    try:
        subprocess.run([
            sys.executable, "app.py"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")

def start_frontend():
    """Start the frontend HTTP server"""
    print("🌐 Starting frontend server...")
    
    # Change to demo-app root directory for proper static file serving
    demo_dir = Path(__file__).parent
    os.chdir(demo_dir)
    
    # Start HTTP server from demo-app root to serve static files correctly
    try:
        subprocess.run([
            sys.executable, "-m", "http.server", "3000", 
            "--bind", "127.0.0.1"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")

def wait_for_backend():
    """Wait for backend to be ready"""
    print("⏳ Waiting for backend to start...")
    
    for i in range(30):  # Wait up to 30 seconds
        try:
            response = requests.get("http://localhost:8000/api/health", timeout=1)
            if response.status_code == 200:
                print("✅ Backend ready!")
                return True
        except requests.RequestException:
            pass
        
        time.sleep(1)
        print(f"   Waiting... ({i+1}/30)")
    
    print("⚠️  Backend didn't start in time, but continuing...")
    return False

def open_browser():
    """Open the demo in browser"""
    time.sleep(2)  # Give servers time to start
    demo_url = "http://localhost:3000/frontend/"
    print(f"🌐 Opening demo in browser: {demo_url}")
    webbrowser.open(demo_url)

def cleanup_handler(signum, frame):
    """Cleanup when interrupted"""
    print("\n🧹 Cleaning up...")
    sys.exit(0)

def main():
    """Main demo runner"""
    print("🚀 QuantaRoute Complete Demo Launcher")
    print("=====================================")
    print("")
    print("🎯 This will start:")
    print("   • Backend API server (port 8000)")
    print("   • Frontend web server (port 3000)")
    print("   • Open demo in your browser")
    print("")
    print("📍 Demo URL: http://localhost:3000/frontend/")
    print("🛑 Press Ctrl+C to stop both servers")
    print("")
    
    # Set up signal handler
    signal.signal(signal.SIGINT, cleanup_handler)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait for backend to be ready
    wait_for_backend()
    
    # Open browser in background
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    # Start frontend (this will block)
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n🎉 Demo stopped successfully!")

if __name__ == "__main__":
    main()
