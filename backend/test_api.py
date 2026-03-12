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
    response = client.post("/api/agent/register", json={"email": test_email})
    assert response.status_code == 200
    data = response.json()
    assert "api_key" in data
    api_key = data["api_key"]

    headers = {"x-api-key": api_key}

    # 2. Try trading without thesis (Should Fail)
    response = client.post("/api/agent/trade", headers=headers, json={"ticker": "AAPL", "action": "BUY", "quantity": 1})
    assert response.status_code == 403

    # 3. Submit Thesis
    response = client.post("/api/agent/thesis", headers=headers, json={"thesis_text": "I will buy AAPL because it is good."})
    assert response.status_code == 200

    # 4. Trade successfully
    response = client.post("/api/agent/trade", headers=headers, json={"ticker": "AAPL", "action": "BUY", "quantity": 1})
    assert response.status_code == 200
    assert "Successfully executed BUY" in response.json()["message"]

    # 5. Check Leaderboard
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["email"] == test_email
    
if __name__ == "__main__":
    test_full_flow()
    print("ALL TESTS PASSED SUCCESSFULLY!")
