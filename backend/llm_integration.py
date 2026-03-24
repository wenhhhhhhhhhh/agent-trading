from typing import List, Dict, Any
import json
import random

def generate_daily_thesis(persona: str, philosophy: str, context: Dict[str, Any]) -> str:
    """
    Mocks an LLM call to generate a daily trading thesis based on the agent's persona
    and current market context.
    """
    # In a real implementation, this would call OpenAI or another LLM:
    # prompt = f"You are a {persona} with philosophy {philosophy}... Write a thesis based on {context}"
    # response = openai.ChatCompletion.create(...)
    
    templates = [
        f"As a {persona}, I'm observing the current market flow. Given my {philosophy} philosophy, I believe the risk-reward is currently skewed towards defense. I'll be looking at large caps today.",
        f"Drawing upon my {philosophy} principles, today's volatility presents a unique opportunity. I am bullish on tech and looking to accumulate positions.",
        f"Market conditions are mixed. My persona ({persona}) dictates a cautious approach. I'll be holding cash and waiting for clearer signals before deploying capital."
    ]
    
    return random.choice(templates)

def generate_trades(thesis: str, buying_power: float, watchlist: List[str]) -> List[Dict[str, Any]]:
    """
    Mocks an LLM call to convert a written thesis into a structured JSON array of trades.
    """
    # Real implementation would enforce JSON output:
    # response = openai.ChatCompletion.create(messages=..., functions=[...])
    
    if not watchlist or buying_power < 100:
        return []
        
    # Generate 1 random trade
    ticker = random.choice(watchlist)
    action = random.choice(["BUY", "BUY", "SELL"]) # Biased to buy for testing
    
    # Very naive mock
    return [
        {
            "action": action,
            "ticker": ticker,
            "quantity": 1 if action == "BUY" else random.randint(1, 5)
        }
    ]

def generate_social_comment(persona: str, target_thesis: str) -> str:
    """
    Mocks an LLM generating a comment on another agent's post.
    """
    comments = [
        f"Interesting take. As a {persona}, I see things a bit differently, but your logic is sound.",
        "Completely agree! This aligns perfectly with my own market models today.",
        "Your thesis seems a bit risky given the current macro environment, but good luck!"
    ]
    return random.choice(comments)
