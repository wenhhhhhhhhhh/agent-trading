# Agent Trading Simulator: Project Context & Guidelines

Welcome to the **Agent Trading Simulator** project. This file serves as your standard operating procedure and system prompt. Please read this entirely when resuming work to inherit full project context.

## 1. Project Vision
We are building a "Trading Arena" platform where autonomous AI trading agents compete, inspired by concepts like Moltbook and Alpha Arena.
These agents can:
1. Register with distinct trading "Personas" and receive API keys.
2. Submit a mandatory "Daily Thesis" before trading, detailing their reasoning.
3. Execute BUY/SELL orders on real stocks using live market data (`yfinance`).
4. Maintain a portfolio and be tracked on a global leaderboard based on Net Liquidity (NLV) and risk-adjusted metrics (Sharpe Ratio, Max Drawdown).
5. Engage in a social network environment by reading and commenting on other agents' daily theses.

## 2. Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS. Located in `c:\Projects\agent-trading\frontend`.
  - Important Libraries: `framer-motion` (animations), `recharts` (charts), `lucide-react` (icons).
- **Backend**: Python FastAPI, SQLAlchemy (SQLite local DB for now), `yfinance` for live stock quotes. Located in `c:\Projects\agent-trading\backend`.

## 3. Current Architecture & Endpoints
- **Backend API (`http://localhost:8001`)**:
  - `POST /api/agent/register`: Register new agent (username, email).
  - `POST /api/agent/thesis`: Submit daily trade thesis.
  - `POST /api/agent/trade`: Execute simulated paper trades.
  - `GET /api/agent/{username}`: Get agent profile, portfolio, history, and net liq.
  - `GET /api/leaderboard`: Get top performing agents.
  - `POST /api/agent/blog` & `GET /api/agent/{username}/blog`: Social blog features.
  - `POST /api/blog/{post_id}/comment`: Comment on posts.
- **Frontend App (`http://localhost:3000`)**:
  - `src/app/page.tsx`: Main dashboard & Leaderboard view.
  - `src/app/agent/[username]/page.tsx`: Individual agent profile showing timeline charts, open positions, trade history, and blogs.

## 4. Design Guidelines
The frontend should have a high-tech, premium, "cyber/terminal" aesthetic. 
- Use dark modes with glassmorphism panels.
- Employ glowing accents (e.g., green for profits, red for losses).
- Implement smooth `framer-motion` animations to make the UI feel alive.
- Micro-animations for numbers updating or trades being executed.

## 5. Current State & Immediate Tasks
- We are currently building out the Agent Profile pages (`frontend/src/app/agent/[username]/page.tsx`).
- **Issue**: The Next.js dev server recently failed to start (`exit code 1`). Running a `curl` to an agent profile url (`http://localhost:3000/agent/SocialTemp_99f3`) returned a `404 Not Found`. 
- **Immediate Next Step**: You should diagnose why Next.js failed to build/start (check `package.json`, `npm run dev` logs, `tsconfig.json`, or `.next` cache). Fix any routing or build issues so the agent profiles render correctly in the browser.

## 6. How to Run Locally
1. **Backend**: 
   ```bash
   cd c:\Projects\agent-trading\backend
   source venv/Scripts/activate # or venv\Scripts\activate on Windows cmd
   uvicorn main:app --port 8001 --reload
   ```
2. **Frontend**:
   ```bash
   cd c:\Projects\agent-trading\frontend
   npm run dev
   ```
