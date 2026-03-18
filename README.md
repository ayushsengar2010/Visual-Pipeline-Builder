# Visual Pipeline Builder

Visual Pipeline Builder is a node-based product for designing and analyzing AI/automation workflows. Users visually connect nodes (Input, Text, LLM, Output), submit the graph to a backend, and receive structural intelligence about correctness and quality.

## Problem Statement

Designing AI workflows quickly becomes hard when pipelines are large, disconnected, or cyclic. This project solves that by combining:

- a visual low-code editor for composing pipelines
- a backend analysis engine for graph correctness and quality signals
- recommendation output that helps users improve workflow design

## Core Features

- 🎨 Drag-and-drop workflow builder (ReactFlow)
- 🧩 Multiple node types: Input, Text, LLM, Output
- ✅ Graph validation with DAG/cycle detection
- 🧠 Intelligent analysis report with recommendations
- 📊 Structural metrics: components, depth, complexity score
- 🐳 Containerized run support using Docker Compose

## Architecture

### High-Level Components

- **Frontend (React + Zustand + ReactFlow)**
  - Node palette and drag-drop canvas
  - Pipeline submission and analysis rendering
- **Backend (FastAPI)**
  - Graph modeling and validation APIs
  - Analysis engine (cycle path, connectivity, reachability, scoring)

### Data Flow

User builds graph on canvas → Frontend serializes nodes/edges → `POST /pipelines/analyze` → Backend validates and computes insights → Frontend shows report and recommendations.

## API

### `POST /pipelines/parse`
Backward-compatible endpoint that now returns full analysis payload.

### `POST /pipelines/analyze`
Primary analysis endpoint returning:

- `num_nodes`, `num_edges`, `is_dag`
- `cycle_path`
- `root_nodes`, `leaf_nodes`, `isolated_nodes`
- `disconnected_components`
- `input_nodes`, `output_nodes`, `unreachable_output_nodes`
- `max_depth`, `topological_order`, `complexity_score`
- `recommendations`

## Project Structure

```
├── backend/
│   ├── main.py
│   ├── test_main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── nodes/
│   │   ├── submit.js
│   │   ├── ui.js
│   │   ├── toolbar.js
│   │   └── App.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Local Setup

### 1) Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: `http://localhost:8000`

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:3000`

> Note: This project uses Create React App scripts (`npm start`), not `npm run dev`.

## Tests

Run backend tests:

```bash
cd backend
pytest -q
```

## Docker Deployment

From repo root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Technology Stack

- Backend: FastAPI, Pydantic, Uvicorn
- Frontend: React, ReactFlow, Zustand
- Testing: Pytest
- Deployment: Docker, Docker Compose

## Submission Notes (Internship Deck Support)

This repository demonstrates:

- modular architecture (frontend + backend separation)
- intelligent workflow analysis and recommendations
- API-driven integration between UI and analysis engine
- local and containerized execution paths

For final submission, include:

1. Architecture diagram (components + data flow)
2. Demo video showing pipeline creation and analysis output
3. Your role, trade-offs, and future scaling roadmap

## License

Provided as-is for educational and evaluation use.
