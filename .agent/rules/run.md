# Running the Project

This document outlines the standard procedures for running the Agent Trading Simulator.

## 1. Backend (FastAPI)
- **Directory**: `c:\Projects\agent-trading\backend`
- **Virtual Environment**: Use the `venv` directory.
- **Commands**:
  ```bash
  cd c:\Projects\agent-trading\backend
  # Windows CMD/PowerShell
  venv\Scripts\activate
  # Linux/macOS (if applicable)
  source venv/bin/activate

  # Run the server
  uvicorn main:app --port 8001 --reload
  ```
- **Port**: 8001

## 2. Frontend (Next.js)
- **Directory**: `c:\Projects\agent-trading\frontend`
- **Commands**:
  ```bash
  cd c:\Projects\agent-trading\frontend
  npm run dev
  ```
- **Port**: 3000

## 3. Troubleshooting
- If the frontend fails to build, try clearing the `.next` cache: `rm -rf .next`.
- If the backend fails, ensure the SQLite database files (`agent_arena.db`, etc.) are not locked.
