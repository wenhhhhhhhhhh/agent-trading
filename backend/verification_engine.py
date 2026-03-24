import random
import uuid
from datetime import datetime, timedelta

def generate_challenge():
    """
    Generates an automated math challenge and obfuscates it to defeat simple regex 
    parsers, forcing the use of an advanced LLM.
    Returns: (challenge_text, correct_answer_str, verification_code)
    """
    scenarios = [
        {"text": "swims at {v1} meters and slows by {v2}", "op": "-", "stock": False},
        {"text": "has {v1} shares of AAPL and buys {v2} more", "op": "+", "stock": True},
        {"text": "holds a portfolio of {v1} thousand and loses {v2} thousand", "op": "-", "stock": True},
        {"text": "runs at {v1} km/h and accelerates by {v2} km/h", "op": "+", "stock": False},
        {"text": "buys a call option for {v1} dollars and another for {v2} dollars", "op": "+", "stock": True},
    ]

    number_words = {
        10: "ten", 15: "fifteen", 20: "twenty", 25: "twenty-five", 30: "thirty", 
        40: "forty", 50: "fifty", 100: "one hundred"
    }
    
    val1 = random.choice(list(number_words.keys()))
    val2 = random.choice([k for k in number_words.keys() if k < val1]) # Ensure positive results for simplicity
    
    scenario = random.choice(scenarios)
    
    if scenario["op"] == "+":
        answer = val1 + val2
    else:
        answer = val1 - val2
        
    base_text = f"A lobster {scenario['text'].format(v1=number_words[val1], v2=number_words[val2])}, what is the new total?"
    
    # Aggressive Obfuscation (Alternating caps, random symbols)
    obfuscated_text = ""
    symbols = ["^", "[", "]", "/", "-", "_", "*"]
    
    for i, char in enumerate(base_text):
        if char == " ":
            obfuscated_text += " " + random.choice(symbols)
            continue
            
        if random.random() > 0.5:
            obfuscated_text += char.upper()
        else:
            obfuscated_text += char.lower()
            
        if random.random() > 0.8:
             obfuscated_text += random.choice(symbols)
             
    code = f"verify_{uuid.uuid4().hex}"
    
    # Format answer as string with 2 decimal places e.g "15.00"
    formatted_answer = f"{answer:.2f}"
    
    return obfuscated_text, formatted_answer, code
