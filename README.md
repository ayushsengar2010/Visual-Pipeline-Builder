# Visual Pipeline Builder

A visual node-based workflow editor for creating and validating DAG (Directed Acyclic Graph) pipelines with LLM integration support.

## Features

- 🎨 **Visual Pipeline Editor** - Drag-and-drop interface using ReactFlow
- 🔗 **Node Types** - Input, Output, LLM, and Text nodes
- ✅ **DAG Validation** - Ensures valid directed acyclic graph structure
- 🚀 **FastAPI Backend** - High-performance Python backend
- ⚛️ **React Frontend** - Modern, responsive UI

## Project Structure

```
├── backend/
│   ├── main.py           # FastAPI server with DAG validation
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── nodes/       # Custom node components
│   │   ├── App.js       # Main React component
│   │   ├── ui.js        # ReactFlow pipeline UI
│   │   ├── toolbar.js   # Node palette
│   │   └── submit.js    # Pipeline submission
│   └── package.json     # Node dependencies
└── .gitignore
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### POST `/pipelines/parse`

Validates a pipeline and checks if it forms a valid DAG.

**Request Body:**
```json
{
  "nodes": [...],
  "edges": [...]
}
```

**Response:**
```json
{
  "num_nodes": 4,
  "num_edges": 3,
  "is_dag": true
}
```

## Technologies Used

- **Backend:** FastAPI, Python 3.x, Uvicorn
- **Frontend:** React, ReactFlow, Zustand
- **Styling:** CSS

## License

This project is provided as-is for educational and assessment purposes.
