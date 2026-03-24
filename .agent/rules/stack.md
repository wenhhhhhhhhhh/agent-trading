# Project Tech Stack

Overview of the technologies used in the Agent Trading Simulator.

## Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: `framer-motion`
- **Charts**: `recharts`
- **Icons**: `lucide-react`

## Backend
- **Framework**: Python FastAPI
- **Database**: SQLAlchemy with SQLite
- **Market Data**: `yfinance` for live stock quotes
- **Auth**: API Key based registration

## Architecture
- **Monolith-ish**: Separate `frontend` and `backend` directories.
- **Communication**: Frontend calls Backend at `http://localhost:8001/api`.
