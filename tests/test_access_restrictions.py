#!/usr/bin/env python3
"""
Test access restriction handling in Bengaluru routing
"""

import sys
from pathlib import Path

# Add quantaroute to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from quantaroute.io.osm_loader import OSMLoader
from quantaroute.graph.build import GraphBuilder
import pandas as pd

print("🧪 Testing Access Restrictions in Bengaluru OSM Data")
print("=" * 60)

# Load Bengaluru OSM data
bengaluru_pbf = Path("../test-data/bengaluru-highways.osm.pbf")
if not bengaluru_pbf.exists():
    print(f"❌ Bengaluru OSM data not found: {bengaluru_pbf}")
    sys.exit(1)

print(f"📍 Loading data from: {bengaluru_pbf.absolute()}")

# Load for car profile
loader = OSMLoader(str(bengaluru_pbf), profile="car")
nodes_df, ways_df = loader.load_for_routing()

print(f"\n📊 Data loaded:")
print(f"   Nodes: {len(nodes_df):,}")
print(f"   Ways: {len(ways_df):,}")

# Check for access restrictions
print(f"\n🔍 Checking Access Restrictions:")
print("-" * 60)

# Check if access column exists
if 'access' in ways_df.columns:
    print(f"✅ 'access' column found")
    access_counts = ways_df['access'].value_counts()
    print(f"\n📋 Access tag values:")
    for value, count in access_counts.items():
        if value:  # Skip empty values
            print(f"   access={value}: {count} ways")
else:
    print(f"❌ 'access' column NOT FOUND in ways_df")

# Check if access_allowed was calculated
if 'access_allowed' in ways_df.columns:
    print(f"\n✅ 'access_allowed' column found")
    allowed_count = ways_df['access_allowed'].sum()
    restricted_count = len(ways_df) - allowed_count
    print(f"   Allowed: {allowed_count:,} ways ({allowed_count/len(ways_df)*100:.1f}%)")
    print(f"   Restricted: {restricted_count:,} ways ({restricted_count/len(ways_df)*100:.1f}%)")
    
    # Show restricted ways
    if restricted_count > 0:
        print(f"\n🚫 Sample of restricted ways:")
        restricted_ways = ways_df[ways_df['access_allowed'] == False]
        for idx, row in restricted_ways.head(10).iterrows():
            access_val = row.get('access', 'N/A')
            highway_val = row.get('highway', 'N/A')
            name_val = row.get('name', 'unnamed')
            print(f"   Way {row.get('way_id', 'N/A')}: {name_val} (highway={highway_val}, access={access_val})")
else:
    print(f"❌ 'access_allowed' column NOT FOUND")

# Check test coordinates area
print(f"\n📍 Testing specific coordinates:")
print(f"   Start: 12.8593, 77.6977")
print(f"   End: 12.9365, 77.6910")

# Find ways near these coordinates
lat_min, lat_max = 12.85, 12.94
lon_min, lon_max = 77.69, 77.70

# Filter ways by their nodes (approximate)
print(f"\n🔍 Looking for ways in test area (lat: {lat_min}-{lat_max}, lon: {lon_min}-{lon_max})")

# Build graph to see how edges are created
print(f"\n🏗️  Building routing graph...")
builder = GraphBuilder(nodes_df, ways_df, profile="car")
graph = builder.build()

print(f"\n📊 Graph statistics:")
print(f"   Nodes: {len(graph.nodes):,}")
print(f"   Edges: {len(graph.edges):,}")

# Count edges by access_allowed
allowed_edges = sum(1 for e in graph.edges if e.access_allowed)
restricted_edges = len(graph.edges) - allowed_edges

print(f"\n🚦 Edge access status:")
print(f"   Allowed: {allowed_edges:,} edges ({allowed_edges/len(graph.edges)*100:.1f}%)")
print(f"   Restricted: {restricted_edges:,} edges ({restricted_edges/len(graph.edges)*100:.1f}%)")

if restricted_edges > 0:
    print(f"\n🚫 Sample of restricted edges:")
    for edge in [e for e in graph.edges if not e.access_allowed][:10]:
        print(f"   Edge {edge.id}: {edge.src_node} → {edge.dst_node} ({edge.name or 'unnamed'}, {edge.highway})")

print("\n" + "=" * 60)
print("🎯 Test complete!")

