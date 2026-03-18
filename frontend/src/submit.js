import { useMemo, useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
    const { nodes, edges } = useStore(selector, shallow);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(() => nodes.length > 0, [nodes.length]);

    const handleSubmit = async () => {
        setErrorMessage('');
        setAnalysisResult(null);
        setIsSubmitting(true);

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
            setAnalysisResult(result);

        } catch (error) {
            console.error('Error submitting pipeline:', error);
            setErrorMessage(`Error submitting pipeline: ${error.message}. Make sure backend is running on http://localhost:8000`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ margin: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    style={{
                        padding: '10px 30px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: canSubmit && !isSubmitting ? '#4CAF50' : '#9bbd9d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    {isSubmitting ? 'Analyzing Pipeline...' : 'Analyze Pipeline'}
                </button>
            </div>

            {errorMessage && (
                <div style={{
                    margin: '16px auto 0',
                    maxWidth: '900px',
                    border: '1px solid #ffb3b3',
                    background: '#fff4f4',
                    color: '#9f1d1d',
                    padding: '12px',
                    borderRadius: '6px'
                }}>
                    {errorMessage}
                </div>
            )}

            {analysisResult && (
                <div style={{
                    margin: '16px auto 0',
                    maxWidth: '900px',
                    border: '1px solid #d7dbe3',
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Pipeline Analysis Report</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '12px' }}>
                        <div><strong>Nodes:</strong> {analysisResult.num_nodes}</div>
                        <div><strong>Edges:</strong> {analysisResult.num_edges}</div>
                        <div><strong>Is DAG:</strong> {analysisResult.is_dag ? 'Yes ✓' : 'No ✗'}</div>
                        <div><strong>Components:</strong> {analysisResult.disconnected_components}</div>
                        <div><strong>Max Depth:</strong> {analysisResult.max_depth}</div>
                        <div><strong>Complexity Score:</strong> {analysisResult.complexity_score}</div>
                    </div>

                    {!analysisResult.is_dag && analysisResult.cycle_path?.length > 0 && (
                        <p style={{ marginTop: 0 }}><strong>Cycle Path:</strong> {analysisResult.cycle_path.join(' -> ')}</p>
                    )}

                    <p><strong>Root Nodes:</strong> {analysisResult.root_nodes?.join(', ') || 'None'}</p>
                    <p><strong>Leaf Nodes:</strong> {analysisResult.leaf_nodes?.join(', ') || 'None'}</p>
                    <p><strong>Isolated Nodes:</strong> {analysisResult.isolated_nodes?.join(', ') || 'None'}</p>
                    <p><strong>Unreachable Outputs:</strong> {analysisResult.unreachable_output_nodes?.join(', ') || 'None'}</p>

                    <div>
                        <strong>Recommendations:</strong>
                        <ul>
                            {(analysisResult.recommendations || []).map((recommendation) => (
                                <li key={recommendation}>{recommendation}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
