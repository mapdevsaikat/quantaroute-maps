# 🚀 QuantaRoute Maps - Navigation Demo

**Advanced navigation showcase demonstrating QuantaRoute's breakthrough SSSP O(m·log^{2/3}n) routing algorithm on Bengaluru's road network.**

---

## 🎯 Overview

QuantaRoute Maps is a demonstration of the QuantaRoute routing engine, showcasing:
- **SSSP O(m·log^{2/3}n)** algorithm (theoretically faster than traditional Dijkstra)
- Real-time routing on Bengaluru's road network (~750K nodes, 1.6M edges)
- Multi-profile routing (car, bicycle, foot, motorcycle)
- Interactive map interface with turn-by-turn navigation

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser

### Installation
```bash
# Install dependencies
pip install -r requirements.txt
```

### Run the Demo
```bash
# Start the demo server
python start_demo.py
```

The demo will be available at **http://localhost:3000/**

**Note:** The demo connects to the main QuantaRoute API server (port 8080). Ensure the API server is running before starting the demo.

---

## 🗺️ Using the Demo

1. **Search Locations**: Type Bengaluru landmarks (e.g., "MG Road", "Airport", "Whitefield")
2. **Click Map**: Click anywhere on the map to set start/end points
3. **Select Profile**: Choose 🚗 Driving, 🚲 Cycling, or 🚶 Walking mode
4. **Add Waypoints**: Use "Add Stop" for multi-destination routes
5. **Calculate Route**: View optimal path with turn-by-turn directions
6. **View Metrics**: See real-time performance and elevation data

---

## 🏗️ Project Structure

```
quantaroute-maps/
├── README.md                    # This guide
├── start_demo.py                # Demo launcher script
├── start-demo.sh                # Shell script launcher
├── requirements.txt             # Python dependencies
│
├── frontend/                    # Frontend HTML
│   └── index.html
│
├── static/                      # Static assets
│   ├── css/
│   │   └── demo.css            # Styling
│   └── js/
│       ├── demo.js             # Main demo logic
│       ├── demo-config.js      # Configuration
│       └── exploration_visualizer.js
│
├── tests/                       # Test scripts
│   ├── test_backend_startup.py
│   ├── test_routing_issue.py
│   └── ...
│
└── docs/                        # Documentation
    ├── archived/                # Historical docs
    ├── deployment/              # Deployment guides
    │   └── ARCHITECTURE_AND_DEPLOYMENT.md
    ├── fixes/                   # Fix documentation
    └── setup/                   # Setup guides
```

---

## ⚡ Performance

| Metric | QuantaRoute | Traditional Dijkstra |
|--------|-------------|---------------------|
| **Algorithm** | O(m·log^{2/3}n) | O(m + n log n) |
| **Route Time** | 50-150ms | 2-5 seconds |
| **Network** | 756K nodes, 1.6M edges | Same |

---

## 🔧 Technical Details

### Algorithm
- **Primary**: SSSP O(m·log^{2/3}n) (QuantaRoute default)
- **Reference**: Dijkstra O(m + n log n) (for comparison)
- **Alternative Routes**: Rust-based with multiple strategies (Adaptive, Perturbation, Highway)

### Routing Profiles
- **Car**: Optimized for highways and traffic patterns
- **Bicycle**: Gradient-aware routing for hilly terrain
- **Foot**: Pedestrian pathways
- **Motorcycle**: Two-wheeler specific routing

### Data
- **Region**: Bengaluru, India
- **Network**: Highway-focused OSM data
- **Nodes**: 756,204
- **Edges**: 1,594,440
- **Restricted Edges**: 281,700 (17.7%)

---

## 📚 Documentation

- **Architecture**: [`docs/deployment/ARCHITECTURE_AND_DEPLOYMENT.md`](docs/deployment/ARCHITECTURE_AND_DEPLOYMENT.md)
- **Quick Start**: [`docs/setup/00_START_HERE.md`](docs/setup/00_START_HERE.md)
- **Deployment**: [`docs/deployment/QUICK_DEPLOYMENT_GUIDE.md`](docs/deployment/QUICK_DEPLOYMENT_GUIDE.md)

---

## 🚀 Deployment Options

See [`docs/deployment/ARCHITECTURE_AND_DEPLOYMENT.md`](docs/deployment/ARCHITECTURE_AND_DEPLOYMENT.md) for detailed deployment instructions:

1. **Local Demo** - Run on localhost (current setup)
2. **Full API Server** - Deploy production API with authentication
3. **Hybrid** - Demo UI with remote API backend

---

## 🧪 Testing

Run tests to verify functionality:

```bash
# Test backend startup
python tests/test_backend_startup.py

# Test basic routing
python tests/test_basic_routing.py

# Test complete demo
python tests/run-complete-demo.py
```

---

## 📄 License

See [LICENSE](LICENSE) for details.

---

**🌟 QuantaRoute: Breakthrough routing performance for real-world navigation** 🚀