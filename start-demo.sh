#!/bin/bash
"""
QuantaRoute Demo Launcher
========================

Quick start script for the QuantaRoute interactive demonstration.
"""

echo "🚀 QuantaRoute Demo Launcher"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    echo "❌ Please run this script from the demo-app directory"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is required but not installed"
    exit 1
fi

# Check if QuantaRoute is installed
echo "🔍 Checking QuantaRoute installation..."
cd ..
python3 -c "import quantaroute; print('✅ QuantaRoute', quantaroute.__version__, 'detected')" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  QuantaRoute not found, installing..."
    pip3 install -e .
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install QuantaRoute"
        exit 1
    fi
fi

cd demo-app

# Install demo dependencies
echo "📦 Installing demo dependencies..."
pip3 install -r requirements.txt

# Check if Singapore data exists
echo "🗺️  Checking Singapore data..."
if [ ! -f "../test-data/sg-220825.osm.pbf" ]; then
    echo "⚠️  Singapore test data not found at ../test-data/sg-220825.osm.pbf"
    echo "💡 The demo will run in simulation mode"
else
    echo "✅ Singapore data found: $(du -h ../test-data/sg-220825.osm.pbf | cut -f1)"
fi

echo ""
echo "🎯 Starting QuantaRoute Demo..."
echo "📍 Demo will be available at: http://localhost:8000"
echo "🗺️  Open frontend/index.html in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the FastAPI server
cd backend
python3 app.py
