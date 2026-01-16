from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str = None
    targetHandle: str = None

class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    graph = {node.id: [] for node in nodes}
    for edge in edges:
        if edge.source in graph:
            graph[edge.source].append(edge.target)
    
    visited = {node.id: 0 for node in nodes}
    
    def check_cycle(node_id: str) -> bool:
        visited[node_id] = 1
        
        for neighbor in graph.get(node_id, []):
            if visited.get(neighbor, 0) == 1:
                return True
            if visited.get(neighbor, 0) == 0 and check_cycle(neighbor):
                return True
        
        visited[node_id] = 2
        return False
    
    for node in nodes:
        if visited[node.id] == 0:
            if check_cycle(node.id):
                return False
    
    return True

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag_check = is_dag(pipeline.nodes, pipeline.edges)
    
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': dag_check
    }
