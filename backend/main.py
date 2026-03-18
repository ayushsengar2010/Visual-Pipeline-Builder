from collections import deque
from typing import Any, Dict, List, Optional, Set, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class PipelineAnalysisResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    cycle_path: List[str]
    root_nodes: List[str]
    leaf_nodes: List[str]
    isolated_nodes: List[str]
    disconnected_components: int
    input_nodes: List[str]
    output_nodes: List[str]
    unreachable_output_nodes: List[str]
    max_depth: int
    topological_order: List[str]
    complexity_score: float
    recommendations: List[str]


def build_graph(nodes: List[Node], edges: List[Edge]) -> Tuple[Dict[str, List[str]], Dict[str, int]]:
    graph = {node.id: [] for node in nodes}
    in_degree = {node.id: 0 for node in nodes}

    for edge in edges:
        if edge.source in graph and edge.target in graph:
            graph[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    return graph, in_degree


def find_cycle_path(graph: Dict[str, List[str]]) -> List[str]:
    state = {node_id: 0 for node_id in graph}
    parent: Dict[str, str] = {}

    def dfs(node_id: str) -> List[str]:
        state[node_id] = 1

        for neighbor in graph.get(node_id, []):
            if state[neighbor] == 0:
                parent[neighbor] = node_id
                path = dfs(neighbor)
                if path:
                    return path
            elif state[neighbor] == 1:
                cycle = [neighbor]
                cursor = node_id

                while cursor != neighbor:
                    cycle.append(cursor)
                    cursor = parent[cursor]

                cycle.append(neighbor)
                cycle.reverse()
                return cycle

        state[node_id] = 2
        return []

    for node_id in graph:
        if state[node_id] == 0:
            cycle_path = dfs(node_id)
            if cycle_path:
                return cycle_path

    return []


def find_components(nodes: List[Node], graph: Dict[str, List[str]]) -> int:
    undirected = {node.id: set() for node in nodes}
    for source, targets in graph.items():
        for target in targets:
            undirected[source].add(target)
            undirected[target].add(source)

    visited: Set[str] = set()
    components = 0

    for node in nodes:
        node_id = node.id
        if node_id in visited:
            continue

        components += 1
        stack = [node_id]
        while stack:
            curr = stack.pop()
            if curr in visited:
                continue
            visited.add(curr)
            stack.extend(neighbor for neighbor in undirected[curr] if neighbor not in visited)

    return components


def get_reachable_from_starts(graph: Dict[str, List[str]], starts: List[str]) -> Set[str]:
    reachable: Set[str] = set()
    queue: deque[str] = deque(starts)

    while queue:
        curr = queue.popleft()
        if curr in reachable:
            continue
        reachable.add(curr)

        for neighbor in graph.get(curr, []):
            if neighbor not in reachable:
                queue.append(neighbor)

    return reachable


def get_topological_order(graph: Dict[str, List[str]], in_degree: Dict[str, int]) -> List[str]:
    working_in_degree = dict(in_degree)
    queue: deque[str] = deque(node_id for node_id, degree in working_in_degree.items() if degree == 0)
    order: List[str] = []

    while queue:
        node_id = queue.popleft()
        order.append(node_id)

        for neighbor in graph.get(node_id, []):
            working_in_degree[neighbor] -= 1
            if working_in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(graph):
        return []

    return order


def get_max_depth(graph: Dict[str, List[str]], topo_order: List[str]) -> int:
    if not topo_order:
        return -1

    depth = {node_id: 0 for node_id in graph}
    for node_id in topo_order:
        for neighbor in graph.get(node_id, []):
            depth[neighbor] = max(depth[neighbor], depth[node_id] + 1)

    return max(depth.values()) if depth else 0


def compute_complexity_score(num_nodes: int, num_edges: int, max_depth: int, component_count: int) -> float:
    density_term = (num_edges / max(1, num_nodes)) * 1.6
    depth_term = max(0, max_depth) * 0.9
    component_penalty = max(0, component_count - 1) * 0.8
    score = num_nodes + density_term + depth_term + component_penalty
    return round(score, 2)


def analyze_pipeline(pipeline: Pipeline) -> PipelineAnalysisResponse:
    nodes = pipeline.nodes
    edges = pipeline.edges
    graph, in_degree = build_graph(nodes, edges)

    num_nodes = len(nodes)
    num_edges = len(edges)

    root_nodes = sorted([node_id for node_id, degree in in_degree.items() if degree == 0])
    leaf_nodes = sorted([node_id for node_id, neighbors in graph.items() if len(neighbors) == 0])
    isolated_nodes = sorted([node_id for node_id in graph if in_degree[node_id] == 0 and len(graph[node_id]) == 0])

    cycle_path = find_cycle_path(graph)
    is_dag = len(cycle_path) == 0

    topo_order = get_topological_order(graph, in_degree) if is_dag else []
    max_depth = get_max_depth(graph, topo_order)
    disconnected_components = find_components(nodes, graph)

    input_nodes = sorted([node.id for node in nodes if node.type == "customInput"])
    output_nodes = sorted([node.id for node in nodes if node.type == "customOutput"])

    reachable_from_inputs = get_reachable_from_starts(graph, input_nodes) if input_nodes else set()
    unreachable_output_nodes = sorted([node_id for node_id in output_nodes if node_id not in reachable_from_inputs])

    complexity_score = compute_complexity_score(num_nodes, num_edges, max_depth, disconnected_components)

    recommendations: List[str] = []
    if not is_dag:
        recommendations.append(
            f"Remove cycle in path {' -> '.join(cycle_path)} to make execution deterministic."
        )
    if disconnected_components > 1:
        recommendations.append(
            f"Pipeline has {disconnected_components} disconnected components; connect or remove unused sub-graphs."
        )
    if isolated_nodes:
        recommendations.append(
            f"Remove or connect isolated nodes: {', '.join(isolated_nodes)}."
        )
    if not input_nodes:
        recommendations.append("Add at least one Input node to define workflow entry points.")
    if not output_nodes:
        recommendations.append("Add at least one Output node so the workflow produces consumable results.")
    if unreachable_output_nodes:
        recommendations.append(
            f"Some outputs are unreachable from inputs: {', '.join(unreachable_output_nodes)}."
        )
    if num_nodes >= 12:
        recommendations.append("Consider grouping repeated logic into reusable sub-pipelines to improve maintainability.")
    if not recommendations:
        recommendations.append("Pipeline structure looks healthy. Next step: add runtime observability and execution metrics.")

    return PipelineAnalysisResponse(
        num_nodes=num_nodes,
        num_edges=num_edges,
        is_dag=is_dag,
        cycle_path=cycle_path,
        root_nodes=root_nodes,
        leaf_nodes=leaf_nodes,
        isolated_nodes=isolated_nodes,
        disconnected_components=disconnected_components,
        input_nodes=input_nodes,
        output_nodes=output_nodes,
        unreachable_output_nodes=unreachable_output_nodes,
        max_depth=max_depth,
        topological_order=topo_order,
        complexity_score=complexity_score,
        recommendations=recommendations,
    )

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    return analyze_pipeline(pipeline)


@app.post('/pipelines/analyze', response_model=PipelineAnalysisResponse)
def analyze_pipeline_endpoint(pipeline: Pipeline):
    return analyze_pipeline(pipeline)
