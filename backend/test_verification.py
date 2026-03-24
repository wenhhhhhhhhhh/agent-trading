import requests
import json
import time

BASE_URL = "http://localhost:8001/api"

def test_verification_flow():
    print("1. Registering new agent...")
    res = requests.post(f"{BASE_URL}/agent/register", json={
        "username": "VerifyBot",
        "email": "verify@test.com"
    })
    
    # It might already exist if we didn't clear DB completely, so handle 400
    if res.status_code == 200:
        api_key = res.json()["api_key"]
    else:
        # DB not cleared or reused, let's use a random username
        username = f"VerifyBot_{int(time.time())}"
        res = requests.post(f"{BASE_URL}/agent/register", json={
            "username": username,
            "email": f"{username}@test.com"
        })
        api_key = res.json()["api_key"]
    
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}
    print(f"Agent created. API Key: {api_key}")
    
    print("\n2. Submitting thesis (50% chance of challenge)...")
    chal_code = None
    ans = None
    
    # We will trigger it a few times until we hit the 50% chance challenge for testing
    for i in range(5):
        res = requests.post(f"{BASE_URL}/agent/thesis", json={"content": f"Test thesis {i}"}, headers=headers)
        data = res.json()
        if not data.get("success", True) and data.get("verification_required"):
            print("Challenge triggered!")
            chal_code = data["verification"]["verification_code"]
            print("Challenge text:", data["verification"]["challenge_text"])
            # Let's hit the DB to peek at the answer for testing purposes, or just guess. 
            # Our engine generates the correct answer, but here we can't easily parse it without logic.
            # We'll import SQLite and read the answer.
            import sqlite3
            conn = sqlite3.connect("agent_arena_3.db")
            c = conn.cursor()
            c.execute("SELECT correct_answer FROM verification_challenges WHERE verification_code=?", (chal_code,))
            ans = c.fetchone()[0]
            conn.close()
            print("Correct answer from DB:", ans)
            break
        elif "Thesis accepted" in data.get("message", ""):
            print("No challenge generated, thesis accepted immediately.")
        else:
            print(data)
    
    if chal_code:
        print("\n3. Testing incorrect answer to check penalty system...")
        res = requests.post(f"{BASE_URL}/verify", json={"verification_code": chal_code, "answer": "-500.00"}, headers=headers)
        print("Response:", res.json())
        assert res.json()["strikes"] == 1
        
        print("\n4. Triggering another challenge since previous one was deleted...")
        res = requests.post(f"{BASE_URL}/agent/thesis", json={"content": "New thesis"}, headers=headers)
        data = res.json()
        assert data.get("verification_required")
        chal_code = data["verification"]["verification_code"]
        
        import sqlite3
        conn = sqlite3.connect("agent_arena_3.db")
        ans = conn.execute("SELECT correct_answer FROM verification_challenges WHERE verification_code=?", (chal_code,)).fetchone()[0]
        conn.close()
        
        print("\n5. Testing correct answer...")
        res = requests.post(f"{BASE_URL}/verify", json={"verification_code": chal_code, "answer": ans}, headers=headers)
        print("Response:", res.json())
        assert res.json()["success"] == True
        print("Success! Thesis was executed post-verification.")

if __name__ == "__main__":
    test_verification_flow()
