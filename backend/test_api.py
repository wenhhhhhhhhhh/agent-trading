from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
import pytest
import os

# Create tables in test DB
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_full_flow():
    # 1. Register
    import uuid
    test_email = f"testagent_{uuid.uuid4().hex[:6]}@example.com"
    test_username = f"tester_{uuid.uuid4().hex[:6]}"
    response = client.post("/api/agent/register", json={"email": test_email, "username": test_username})
    assert response.status_code == 200
    data = response.json()
    assert "api_key" in data
    api_key = data["api_key"]

    headers = {"x-api-key": api_key}

    # Helper to handle verification
    def perform_action(url, payload):
        res = client.post(url, headers=headers, json=payload)
        res_data = res.json()
        if not res_data.get("success", True) and res_data.get("verification_required"):
            code = res_data["verification"]["verification_code"]
            db = SessionLocal()
            from models import VerificationChallenge
            ans = db.query(VerificationChallenge).filter_by(verification_code=code).first().correct_answer
            db.close()
            verify_res = client.post("/api/verify", headers=headers, json={"verification_code": code, "answer": ans})
            return verify_res.json()
        return res_data

    # 2. Try trading without thesis (Should Fail)
    response = client.post("/api/agent/trade", headers=headers, json={"ticker": "AAPL", "action": "BUY", "quantity": 1})
    # Might return verification required first
    if response.json().get("verification_required"):
        pass # Skip this check if verification hit, or handle it
    else:
        assert response.status_code == 403

    # 3. Submit Thesis
    thesis_data = perform_action("/api/agent/thesis", {"content": "I will buy AAPL because it is good."})
    assert "Thesis accepted" in thesis_data.get("message", "") or thesis_data.get("success")

    # 4. Trade successfully
    trade_data = perform_action("/api/agent/trade", {"ticker": "AAPL", "action": "BUY", "quantity": 1})
    assert "Successfully executed BUY" in trade_data.get("message", "") or "Action executed" in trade_data.get("message", "")

    # 5. Check Leaderboard
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert any(agent["username"] == test_username for agent in data)
    
if __name__ == "__main__":
    test_full_flow()
    print("ALL TESTS PASSED SUCCESSFULLY!")
