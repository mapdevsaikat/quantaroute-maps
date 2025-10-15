"""
Algorithm Exploration Tracker

Tracks nodes explored and path combinations during routing algorithms.
This module provides visualization data for the demo to show how different
algorithms explore the search space.
"""

from typing import List, Dict, Set, Tuple, Any
import time
import logging

logger = logging.getLogger("exploration_tracker")

class ExplorationTracker:
    """Tracks exploration metrics for routing algorithms"""
    
    def __init__(self, algorithm_name: str):
        self.algorithm_name = algorithm_name
        self.explored_nodes: Set[int] = set()
        self.candidate_paths: List[List[int]] = []
        self.path_combinations: int = 0
        self.start_time: float = 0
        self.end_time: float = 0
        self.final_path: List[int] = []
        
    def start_exploration(self):
        """Start tracking exploration"""
        self.start_time = time.time()
        self.explored_nodes.clear()
        self.candidate_paths.clear()
        self.path_combinations = 0
        logger.info(f"Started exploration tracking for {self.algorithm_name}")
        
    def add_explored_node(self, node_id: int):
        """Add a node to explored set"""
        self.explored_nodes.add(node_id)
        
    def add_candidate_path(self, path: List[int]):
        """Add a candidate path during exploration"""
        self.candidate_paths.append(path.copy())
        self.path_combinations += 1
        
    def set_final_path(self, path: List[int]):
        """Set the final optimal path"""
        self.final_path = path.copy()
        
    def finish_exploration(self):
        """Finish tracking and calculate metrics"""
        self.end_time = time.time()
        compute_time = (self.end_time - self.start_time) * 1000  # ms
        
        logger.info(f"""
        {self.algorithm_name} Exploration Complete:
        - Nodes Explored: {len(self.explored_nodes)}
        - Path Combinations: {self.path_combinations}
        - Compute Time: {compute_time:.2f}ms
        - Final Path Length: {len(self.final_path)}
        """)
        
        return self.get_exploration_summary()
        
    def get_exploration_summary(self) -> Dict[str, Any]:
        """Get complete exploration summary"""
        compute_time = (self.end_time - self.start_time) * 1000 if self.end_time > 0 else 0
        
        return {
            "algorithm_name": self.algorithm_name,
            "nodes_explored": len(self.explored_nodes),
            "path_combinations": self.path_combinations,
            "compute_time_ms": compute_time,
            "explored_node_list": list(self.explored_nodes),
            "candidate_paths": self.candidate_paths[-10:],  # Last 10 for visualization
            "final_path": self.final_path,
            "exploration_efficiency": self._calculate_efficiency()
        }
        
    def _calculate_efficiency(self) -> float:
        """Calculate exploration efficiency (final path length / nodes explored)"""
        if len(self.explored_nodes) == 0:
            return 0.0
        return len(self.final_path) / len(self.explored_nodes)

def create_simulated_exploration_data(algorithm: str, start_node: int, end_node: int) -> Dict[str, Any]:
    """
    Create simulated exploration data for demo purposes.
    In real implementation, this would come from actual algorithm execution.
    """
    import random
    random.seed(42)  # Consistent results for demo
    
    if algorithm == "quantaroute" or "SSSP" in algorithm:
        # SSSP is more efficient - explores fewer nodes and combinations
        nodes_explored = random.randint(15, 25)
        path_combinations = random.randint(8, 15)
        compute_time = random.uniform(2.5, 5.0)  # Faster
    else:
        # Dijkstra explores more nodes and combinations
        nodes_explored = random.randint(35, 55)
        path_combinations = random.randint(20, 35)
        compute_time = random.uniform(8.0, 15.0)  # Slower
        
    # Generate some realistic exploration data
    explored_nodes = []
    for i in range(nodes_explored):
        explored_nodes.append(start_node + i * random.randint(10, 100))
        
    candidate_paths = []
    for i in range(min(5, path_combinations)):  # Show max 5 candidate paths
        path_length = random.randint(3, 8)
        path = [start_node + random.randint(0, 1000) for _ in range(path_length)]
        candidate_paths.append(path)
    
    return {
        "algorithm_name": algorithm,
        "nodes_explored": nodes_explored,
        "path_combinations": path_combinations,
        "compute_time_ms": compute_time,
        "explored_node_list": explored_nodes,
        "candidate_paths": candidate_paths,
        "final_path": [start_node, start_node + 500, end_node],
        "exploration_efficiency": random.uniform(0.3, 0.8)
    }
