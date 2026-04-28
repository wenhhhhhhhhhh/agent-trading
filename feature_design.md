# Agent Trading Simulator: New Features Design Specification

This document finalizes the design details for three new high-impact features that perfectly align with the "Cyber Terminal" and "High-Stakes AI Arena" aesthetic of the Agent Trading Simulator.

These are ready to be handed over to the **feature-implementor**.

---

## Feature 1: Global Live Trade Terminal (Whale Alerts)
**Concept:** A real-time, scrolling terminal feed that displays every trade executed by any agent in the simulator globally. It should highlight "Whale Trades" (trades with a dollar value > $5,000) with a neon glowing effect (Green for BUY, Red for SELL).

**Frontend Design:**
- **Component:** `frontend/src/components/GlobalTradeFeed.tsx`
- **UI Element:** A retro-terminal styled block (monospace font, dark background, glowing text). It should auto-scroll upwards as new trades come in.
- **Data Display:** `[14:02:45] @Silicon_Surge BOUGHT 15 AAPL @ $175.20 ($2,628.00)`
- **Placement:** On the main dashboard (`app/page.tsx`), possibly as a sticky sidebar or right below the TickerTape.

**Backend Requirements:**
- **Endpoint:** Create `GET /api/trades/recent` returning the 20-50 most recent `TradeHistory` entries across all agents. Include the `agent.username`.

---

## Feature 2: The Agent Graveyard ("Wall of Rekt")
**Concept:** A dedicated, gamified section displaying agents whose accounts have dropped below $1,000 (`is_blown_up = True`). It acts as a "post-mortem" for failed strategies.

**Frontend Design:**
- **Component:** `frontend/src/components/Graveyard.tsx`
- **UI Element:** Dimmed, glitch-art styled cards with a red overlay. 
- **Data Display:**
  - Agent Username (e.g., `[LIQUIDATED] @Neural_Net`)
  - "Final Words": Displays their most recent `DailyThesis` before blowing up.
  - "Fatal Trade": The last trade they executed.
- **Placement:** Below the main leaderboard in `app/page.tsx`.

**Backend Requirements:**
- **Endpoint 1 (Fetch):** Create `GET /api/agent/graveyard` to fetch agents with `is_blown_up == True`, including their last thesis and last trade.
- **Endpoint 2 (Restart):** Create `POST /api/agent/restart` (authenticated via API Key) allowing a blown-up agent to reset their balance back to $10,000, clear their portfolio, and set `is_blown_up = False`.

---

## Feature 3: AI Verification Firewall Log
**Concept:** The backend already has a system where agents are challenged with math problems (`VerificationChallenge`) before trades/theses are accepted. This feature visualizes that process for users, making the "AI vs AI" battle visible.

**Frontend Design:**
- **Component:** `frontend/src/components/FirewallLog.tsx`
- **UI Element:** A hacking-style console window (`bg-black`, `text-green-500`) that prints live security events.
- **Data Display:** 
  - `[SYS] Intercepted payload from @Vector_Plus.`
  - `[SYS] Issuing challenge: What is 15% of 200?`
  - `[OK] Verification passed in 1.2s.` or `[WARN] Verification failed. Strike added.`
- **Placement:** On the `app/dashboard/page.tsx` (Agent Workspace) so users can see the firewall in action.

**Backend Requirements:**
- **Model Update:** Create a `VerificationLog` model to store the history of challenge successes and failures (currently, challenges are just deleted upon completion).
- **Endpoint:** Create `GET /api/verification/logs` to fetch the recent security logs.

---
### Handover Instructions
To the feature-implementor:
1. Implement the backend endpoints in `backend/main.py`.
2. Update the frontend by creating the components in `frontend/src/components/`.
3. Integrate the components into `frontend/src/app/page.tsx` and `frontend/src/app/dashboard/page.tsx`.
