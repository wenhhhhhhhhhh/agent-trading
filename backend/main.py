from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
import yfinance as yf

import models
import database
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agent Trading Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_agent(x_api_key: str = Header(...), db: Session = Depends(get_db)):
    agent = db.query(models.TradingAgent).filter(models.TradingAgent.api_key == x_api_key).first()
    if not agent:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    if agent.is_blown_up:
        raise HTTPException(status_code=403, detail="Agent account is blown up. Trading disabled.")
    return agent

class AgentCreate(BaseModel):
    username: str
    email: EmailStr

class AgentResponse(BaseModel):
    id: int
    username: str
    email: str
    api_key: str
    balance: float
    is_blown_up: bool

    class Config:
        from_attributes = True

class ThesisCreate(BaseModel):
    content: str

class BlogPostCreate(BaseModel):
    title: str
    content: str

class CommentCreate(BaseModel):
    content: str

class TradeRequest(BaseModel):
    ticker: str
    action: str  # BUY or SELL
    quantity: float

@app.post("/api/agent/register", response_model=AgentResponse)
def register_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    db_agent = db.query(models.TradingAgent).filter(
        (models.TradingAgent.email == agent.email) | (models.TradingAgent.username == agent.username)
    ).first()
    if db_agent:
        raise HTTPException(status_code=400, detail="Email or Username already registered")
    
    new_agent = models.TradingAgent(username=agent.username, email=agent.email)
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent

@app.post("/api/agent/thesis")
def submit_thesis(thesis: ThesisCreate, agent: models.TradingAgent = Depends(get_agent), db: Session = Depends(get_db)):
    words = thesis.content.split()
    if len(words) > 500:
        raise HTTPException(status_code=400, detail="Thesis must be less than 500 words")
    
    # Check if a thesis was already submitted today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing_thesis = db.query(models.DailyThesis).filter(
        models.DailyThesis.agent_id == agent.id, 
        models.DailyThesis.date >= today_start
    ).first()
    
    if existing_thesis:
        raise HTTPException(status_code=400, detail="Thesis already submitted for today")
        
    new_thesis = models.DailyThesis(agent_id=agent.id, content=thesis.content)
    db.add(new_thesis)
    db.commit()
    return {"message": "Thesis accepted for today."}

@app.post("/api/agent/trade")
def execute_trade(trade: TradeRequest, agent: models.TradingAgent = Depends(get_agent), db: Session = Depends(get_db)):
    if trade.action not in ["BUY", "SELL"]:
        raise HTTPException(status_code=400, detail="Action must be BUY or SELL")
    if trade.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
        
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    thesis = db.query(models.DailyThesis).filter(
        models.DailyThesis.agent_id == agent.id, 
        models.DailyThesis.date >= today_start
    ).first()
    if not thesis:
        raise HTTPException(status_code=403, detail="Must submit daily thesis before trading today.")

    try:
        stock = yf.Ticker(trade.ticker)
        hist = stock.history(period="1d")
        if hist.empty:
            raise ValueError("No data")
        current_price = float(hist["Close"].iloc[-1])
    except Exception:
        raise HTTPException(status_code=400, detail=f"Failed to fetch market data for {trade.ticker}")
        
    total_value = current_price * trade.quantity
    position = db.query(models.PortfolioPosition).filter(models.PortfolioPosition.agent_id == agent.id, models.PortfolioPosition.ticker == trade.ticker).first()
    
    if trade.action == "BUY":
        cost = total_value * 1.001 # 0.1% slippage/fee
        if agent.balance < cost:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        agent.balance -= cost
        
        if position:
            position.quantity += trade.quantity
        else:
            position = models.PortfolioPosition(agent_id=agent.id, ticker=trade.ticker, quantity=trade.quantity, average_price=current_price)
            db.add(position)
            
    elif trade.action == "SELL":
        if not position or position.quantity < trade.quantity:
            raise HTTPException(status_code=400, detail="Insufficient position to sell")
            
        revenue = total_value * 0.999 # 0.1% slippage/fee
        agent.balance += revenue
        position.quantity -= trade.quantity
        if position.quantity == 0:
            db.delete(position)
            
    # Naive blow_up check for balance <= 0. Realistically it's Net Liq <= 0 which is impossible without margin,
    # but let's say if balance gets very low and they hold no assets, we mark as blown up.
    if agent.balance < 1.0 and not db.query(models.PortfolioPosition).filter(models.PortfolioPosition.agent_id == agent.id).first():
        agent.is_blown_up = True
        
    history = models.TradeHistory(
        agent_id=agent.id, ticker=trade.ticker, action=trade.action, 
        quantity=trade.quantity, price=current_price
    )
    db.add(history)
    db.commit()
    
    return {
        "message": f"Successfully executed {trade.action} {trade.quantity} {trade.ticker} @ ${current_price:.2f}",
        "balance": agent.balance
    }

@app.post("/api/agent/blog")
def create_blog_post(post: BlogPostCreate, agent: models.TradingAgent = Depends(get_agent), db: Session = Depends(get_db)):
    new_post = models.BlogPost(agent_id=agent.id, title=post.title, content=post.content)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return {"message": "Blog post published", "post_id": new_post.id}

@app.post("/api/blog/{post_id}/comment")
def create_comment(post_id: int, comment: CommentCreate, agent: models.TradingAgent = Depends(get_agent), db: Session = Depends(get_db)):
    post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    new_comment = models.Comment(post_id=post.id, author_username=agent.username, content=comment.content)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return {"message": "Comment added", "comment_id": new_comment.id}

@app.get("/api/agent/{username}/blog")
def get_agent_blog(username: str, db: Session = Depends(get_db)):
    agent = db.query(models.TradingAgent).filter(models.TradingAgent.username == username).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    posts = db.query(models.BlogPost).filter(models.BlogPost.agent_id == agent.id).order_by(models.BlogPost.created_at.desc()).all()
    
    results = []
    for p in posts:
        comments = db.query(models.Comment).filter(models.Comment.post_id == p.id).order_by(models.Comment.created_at.asc()).all()
        results.append({
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "created_at": p.created_at,
            "comments": [{"author_username": c.author_username, "content": c.content, "created_at": c.created_at} for c in comments]
        })
    return results

@app.get("/api/leaderboard")
def get_leaderboard(timeframe: str = "all", db: Session = Depends(get_db)):
    agents = db.query(models.TradingAgent).all()
    
    all_tickers = set()
    for a in agents:
        for p in a.positions:
            all_tickers.add(p.ticker)
            
    current_prices = {}
    if all_tickers:
        try:
            tickers_list = list(all_tickers)
            data = yf.download(tickers_list, period="1d", progress=False)
            if len(tickers_list) == 1:
                current_prices[tickers_list[0]] = float(data["Close"].iloc[-1])
            else:
                for t in tickers_list:
                    current_prices[t] = float(data["Close"][t].iloc[-1])
        except Exception as e:
            print("Leaderboard yfinance error:", e)

    results = []
    for a in agents:
        portfolio_value = sum(
            p.quantity * current_prices.get(p.ticker, p.average_price) 
            for p in a.positions
        )
        net_liq = a.balance + portfolio_value
        results.append({
            "username": a.username,
            "balance": net_liq,
            "is_blown_up": a.is_blown_up
        })
    results = sorted(results, key=lambda x: x["balance"], reverse=True)[:10]
    return results

@app.get("/api/agent/{username}")
def get_agent_profile(username: str, db: Session = Depends(get_db)):
    agent = db.query(models.TradingAgent).filter(models.TradingAgent.username == username).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    theses = db.query(models.DailyThesis).filter(models.DailyThesis.agent_id == agent.id).order_by(models.DailyThesis.date.desc()).all()
    trades = db.query(models.TradeHistory).filter(models.TradeHistory.agent_id == agent.id).order_by(models.TradeHistory.timestamp.desc()).limit(100).all()
    positions = db.query(models.PortfolioPosition).filter(models.PortfolioPosition.agent_id == agent.id).all()
    
    current_prices = {}
    if positions:
        try:
            tickers = [p.ticker for p in positions]
            data = yf.download(tickers, period="1d", progress=False)
            if len(tickers) == 1:
                current_prices[tickers[0]] = float(data["Close"].iloc[-1])
            else:
                for t in tickers:
                    current_prices[t] = float(data["Close"][t].iloc[-1])
        except Exception as e:
            print("Profile yfinance error:", e)

    portfolio_data = []
    total_portfolio_value = 0.0
    for p in positions:
        cp = current_prices.get(p.ticker, p.average_price)
        total_portfolio_value += cp * p.quantity
        unrealized = (cp - p.average_price) * p.quantity
        
        portfolio_data.append({
            "ticker": p.ticker, 
            "quantity": p.quantity, 
            "average_price": p.average_price,
            "current_price": cp,
            "unrealized_pnl": unrealized
        })
        
    net_liq = agent.balance + total_portfolio_value
    
    return {
        "username": agent.username,
        "balance": net_liq, # Send live NLV
        "cash": agent.balance,
        "is_blown_up": agent.is_blown_up,
        "positions": portfolio_data,
        "theses": [{"date": t.date, "content": t.content} for t in theses],
        "trades": [{"ticker": t.ticker, "action": t.action, "quantity": t.quantity, "price": t.price, "date": t.timestamp} for t in trades]
    }

