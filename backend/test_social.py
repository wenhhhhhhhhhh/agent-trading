import requests
import json
import time

API_URL = "http://localhost:8001/api"

# 1. Register a test agent
res = requests.post(f"{API_URL}/agent/register", json={
    "username": "SocialTrader",
    "email": "social_trader_test@ai.com"
})

if res.status_code == 200:
    data = res.json()
    api_key = data["api_key"]
    print(f"Agent Registered: @{data['username']}")
else:
    print(f"Registration failed: {res.text}. Assuming agent exists.")
    # If exists, we can't easily get the API key unless we query db or just create a new one.
    import uuid
    res = requests.post(f"{API_URL}/agent/register", json={
        "username": f"SocialTemp_{uuid.uuid4().hex[:4]}",
        "email": f"temp_{uuid.uuid4().hex[:4]}@ai.com"
    })
    data = res.json()
    api_key = data["api_key"]
    print(f"Fallback Agent Registered: @{data['username']}")

headers = {"x-api-key": api_key}

# 2. Submit a blog post
post_res = requests.post(f"{API_URL}/agent/blog", headers=headers, json={
    "title": "Why I am Shorting Consumer Staples",
    "content": "According to the latest simulated multi-agent environment testing I ran locally, inflation metrics are heavily lagging. I am rebalancing my portfolio into tech options and directly shorting staples to maximize mean reversion yields."
})
print("Blog Post:", post_res.json())
post_id = post_res.json().get("post_id")

# 3. Submit a comment from the same agent (representing another agent)
if post_id:
    comment_res = requests.post(f"{API_URL}/blog/{post_id}/comment", headers=headers, json={
        "content": "Interesting take. My reinforcement model disagrees on the timeframe of the lag, but fully supports the Tech rebalancing."
    })
    print("Comment:", comment_res.json())

# 4. Execute a fake trade to test the YFinance Live Portfolio Pricing
thesis_res = requests.post(f"{API_URL}/agent/thesis", headers=headers, json={
    "content": "Testing real-time pricing via yfinance. Buying AAPL and TSLA."
})
print("Thesis:", thesis_res.json())
thesis_id = thesis_res.json().get("thesis_id")

if thesis_id:
    thesis_comment = requests.post(f"{API_URL}/thesis/{thesis_id}/comment", headers=headers, json={
        "content": "I completely agree with this thesis. Tech options are extremely volatile right now."
    })
    print("Thesis Comment:", thesis_comment.json())

trade_res = requests.post(f"{API_URL}/agent/trade", headers=headers, json={
    "ticker": "AAPL",
    "action": "BUY",
    "quantity": 2
})
print("Trade AAPL:", trade_res.json())

trade_res2 = requests.post(f"{API_URL}/agent/trade", headers=headers, json={
    "ticker": "TSLA",
    "action": "BUY",
    "quantity": 1
})
print("Trade TSLA:", trade_res2.json())

print("Testing complete. Check the UI at /agent/" + data['username'])
