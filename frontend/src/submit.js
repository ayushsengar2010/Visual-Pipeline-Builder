import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
    const { nodes, edges } = useStore(selector, shallow);

    const handleSubmit = async () => {
        try {
            const pipelineData = {
                nodes: nodes.map(node => ({
                    id: node.id,
                    type: node.type,
                    position: node.position,
                    data: node.data
                })),
                edges: edges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle
                }))
            };

            const response = await fetch('http://localhost:8000/pipelines/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pipelineData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const message = `Pipeline Analysis:\n\n` +
                          `Number of Nodes: ${result.num_nodes}\n` +
                          `Number of Edges: ${result.num_edges}\n` +
                          `Is DAG (Directed Acyclic Graph): ${result.is_dag ? 'Yes ✓' : 'No ✗'}`;
            
            alert(message);

        } catch (error) {
            console.error('Error submitting pipeline:', error);
            alert(`Error submitting pipeline: ${error.message}\n\nPlease make sure the backend server is running on http://localhost:8000`);
        }
    };

    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px'}}>
            <button 
                type="submit" 
                onClick={handleSubmit}
                style={{
                    padding: '10px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
                Submit Pipeline
            </button>
        </div>
    );
}
