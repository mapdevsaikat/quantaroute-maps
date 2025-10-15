"""
Enhanced FastAPI backend with turn-by-turn navigation and OSRM comparison
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from pathlib import Path
import sys
import os

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))

from enhanced_routing import get_enhanced_route

app = FastAPI(title="QuantaRoute Enhanced Demo API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singapore bounds
SINGAPORE_BOUNDS = {
    "north": 1.4784,
    "south": 1.1304,
    "east": 104.0448,
    "west": 103.6008,
    "center": [1.3521, 103.8198]
}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "quantaroute_available": True,
        "router_initialized": True,
        "osrm_available": True,
        "enhanced_routing": True,
        "singapore_bounds": SINGAPORE_BOUNDS
    }

@app.get("/api/singapore-bounds")
async def get_singapore_bounds():
    """Get Singapore geographical bounds"""
    return SINGAPORE_BOUNDS

@app.get("/api/algorithms")
async def get_algorithms():
    """Get available routing algorithms"""
    return {
        "algorithms": [
            {
                "id": "quantaroute",
                "name": "🏆 QuantaRoute SSSP - O(m·log^{2/3}n)",
                "description": "Revolutionary SSSP algorithm with turn-by-turn navigation",
                "is_default": True
            },
            {
                "id": "osrm",
                "name": "🗺️ OSRM (Traditional) - O((V + E) log V)",
                "description": "Open Source Routing Machine - Industry standard",
                "is_default": False
            },
            {
                "id": "comparison",
                "name": "⚡ Algorithm Comparison",
                "description": "Side-by-side QuantaRoute vs OSRM performance",
                "is_default": False
            }
        ]
    }

@app.post("/api/route")
async def calculate_route(request: dict):
    """Calculate route between two points with turn-by-turn navigation"""
    try:
        start = request["start"]  # [lat, lon]
        end = request["end"]      # [lat, lon]
        algorithm = request.get("algorithm", "quantaroute")
        
        # Validate coordinates
        if not (SINGAPORE_BOUNDS["south"] <= start[0] <= SINGAPORE_BOUNDS["north"] and
                SINGAPORE_BOUNDS["west"] <= start[1] <= SINGAPORE_BOUNDS["east"]):
            raise HTTPException(status_code=400, detail="Start point outside Singapore bounds")
            
        if not (SINGAPORE_BOUNDS["south"] <= end[0] <= SINGAPORE_BOUNDS["north"] and
                SINGAPORE_BOUNDS["west"] <= end[1] <= SINGAPORE_BOUNDS["east"]):
            raise HTTPException(status_code=400, detail="End point outside Singapore bounds")
        
        print(f"🧭 Enhanced routing: {start} → {end} (algorithm: {algorithm})")
        
        # Get enhanced route with turn-by-turn navigation
        routes = await get_enhanced_route(start, end, algorithm)
        
        # Return primary route based on algorithm selection
        if algorithm == "comparison":
            # Return comparison data
            return {
                "quantaroute": routes.get("quantaroute"),
                "osrm": routes.get("osrm"),
                "comparison": routes.get("comparison", {}),
                "is_comparison": True
            }
        elif algorithm == "osrm" and routes.get("osrm"):
            route_data = routes["osrm"]
            return {
                "path": route_data["path"],
                "distance_km": route_data["distance_km"],
                "duration_min": route_data["duration_min"],
                "algorithm": route_data["algorithm"],
                "compute_time_ms": route_data["compute_time_ms"],
                "instructions": route_data.get("instructions", []),
                "performance_stats": route_data["performance_stats"]
            }
        elif routes.get("quantaroute"):
            route_data = routes["quantaroute"]
            return {
                "path": route_data["path"],
                "distance_km": route_data["distance_km"],
                "duration_min": route_data["duration_min"],
                "algorithm": route_data["algorithm"],
                "compute_time_ms": route_data["compute_time_ms"],
                "instructions": route_data.get("instructions", []),
                "performance_stats": route_data["performance_stats"]
            }
        else:
            raise HTTPException(status_code=500, detail="No route could be calculated")
        
    except Exception as e:
        print(f"Routing error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting QuantaRoute Enhanced Demo API Server...")
    print("🗺️  Enhanced demo with turn-by-turn navigation available at: http://localhost:8000")
    print("⚡ Features: OSRM comparison, turn-by-turn instructions, performance metrics")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
