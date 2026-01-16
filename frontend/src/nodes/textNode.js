import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [vars, setVars] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 200, height: 100 });
  const textRef = useRef(null);

  useEffect(() => {
    const pattern = /\{\{(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*)\}\}/g;
    const found = [];
    let match;
    
    while ((match = pattern.exec(currText)) !== null) {
      const varName = match[1].trim();
      if (!found.includes(varName)) {
        found.push(varName);
      }
    }
    
    setVars(found);
  }, [currText]);

  useEffect(() => {
    if (textRef.current) {
      const h = textRef.current.scrollHeight;
      const w = textRef.current.scrollWidth;
      
      setDimensions({
        width: Math.max(200, Math.min(400, w + 40)),
        height: Math.max(100, h + 60)
      });
    }
  }, [currText]);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  return (
    <div style={{
      width: dimensions.width, 
      height: dimensions.height, 
      border: '1px solid black',
      borderRadius: '5px',
      padding: '10px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        fontWeight: 'bold',
        marginBottom: '8px',
        fontSize: '14px'
      }}>
        <span>Text</span>
      </div>
      <div>
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Text:</span>
          <textarea
            ref={textRef}
            value={currText} 
            onChange={handleTextChange}
            style={{
              width: '100%',
              minHeight: '40px',
              resize: 'none',
              border: '1px solid #ccc',
              borderRadius: '3px',
              padding: '5px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
            rows={Math.max(2, currText.split('\n').length)}
          />
        </label>
      </div>
      
      {vars.map((varName, index) => (
        <Handle
          key={`${id}-${varName}`}
          type="target"
          position={Position.Left}
          id={`${id}-${varName}`}
          style={{
            top: `${50 + (index * 20)}px`,
            background: '#555'
          }}
        />
      ))}
      
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{
          background: '#555'
        }}
      />
      
      {vars.length > 0 && (
        <div style={{
          position: 'absolute',
          left: '-80px',
          top: '35px',
          fontSize: '10px',
          color: '#666'
        }}>
          {vars.map((varName, index) => (
            <div key={varName} style={{
              marginBottom: '10px',
              textAlign: 'right'
            }}>
              {varName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
