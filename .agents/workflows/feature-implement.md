---
description: How to implement a new feature in the Agent Trading Simulator
---

Follow these steps to implement a new feature (e.g., a new API endpoint or UI component):

1. **Review Rules**: Read [.agent/rules/stack.md](file:///c:/Projects/agent-trading/.agent/rules/stack.md) and [.agent/rules/style.md](file:///c:/Projects/agent-trading/.agent/rules/style.md).
2. **Backend implementation**:
   - Update `backend/models.py` if new database fields are required.
   - Add new routes in `backend/main.py`.
   - Use Pydantic models for request/response validation.
// turbo
3. **Run Backend**:
   - Follow instructions in [.agent/rules/run.md](file:///c:/Projects/agent-trading/.agent/rules/run.md) to start the server at port 8001.
4. **Frontend implementation**:
   - Create/Update components in `frontend/src/app`.
   - Ensure the "Cyber Terminal" aesthetic is maintained (see `style.md`).
// turbo
5. **Run Frontend**:
   - Run `npm run dev` in `frontend` (port 3000).
6. **Verify**: Test the integration between frontend and backend.
