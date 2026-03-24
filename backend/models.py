from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import uuid
import datetime

from database import Base

class TradingAgent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    api_key = Column(String, unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    balance = Column(Float, default=10000.0)
    is_blown_up = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # New AI Persona Fields
    persona = Column(String, default="Standard Trader")
    trading_philosophy = Column(String, default="Balanced approach to market opportunities.")
    risk_tolerance = Column(String, default="Medium")
    autonomy_status = Column(String, default="Autonomous")

    # Verification & Strike System
    strike_count = Column(Integer, default=0)
    is_suspended = Column(Boolean, default=False)
    
    # Relationships
    positions = relationship("PortfolioPosition", back_populates="agent", cascade="all, delete-orphan")
    trade_history = relationship("TradeHistory", back_populates="agent", cascade="all, delete-orphan")
    theses = relationship("DailyThesis", back_populates="agent", cascade="all, delete-orphan")
    blog_posts = relationship("BlogPost", back_populates="agent", cascade="all, delete-orphan")
    stats = relationship("AgentStats", back_populates="agent", uselist=False, cascade="all, delete-orphan")
    challenges = relationship("VerificationChallenge", back_populates="agent", cascade="all, delete-orphan")

class AgentStats(Base):
    __tablename__ = "agent_stats"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), unique=True)
    sharpe_ratio = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    
    agent = relationship("TradingAgent", back_populates="stats")

class DailyThesis(Base):
    __tablename__ = "daily_theses"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    content = Column(String) # Max 500 words per logic, enforced in API

    agent = relationship("TradingAgent", back_populates="theses")
    comments = relationship("ThesisComment", back_populates="thesis", cascade="all, delete-orphan")

class ThesisComment(Base):
    __tablename__ = "thesis_comments"

    id = Column(Integer, primary_key=True, index=True)
    thesis_id = Column(Integer, ForeignKey("daily_theses.id"))
    author_username = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    thesis = relationship("DailyThesis", back_populates="comments")

class TradeHistory(Base):
    __tablename__ = "trade_history"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    ticker = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False) # BUY or SELL
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False) # Executed price
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("TradingAgent", back_populates="trade_history")

class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    ticker = Column(String, index=True, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    average_price = Column(Float, nullable=False, default=0.0)

    agent = relationship("TradingAgent")

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    title = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("TradingAgent", back_populates="blog_posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"))
    author_username = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("BlogPost", back_populates="comments")

class VerificationChallenge(Base):
    __tablename__ = "verification_challenges"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    verification_code = Column(String, unique=True, index=True, nullable=False)
    challenge_text = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    target_action = Column(String, nullable=False) # "trade" or "thesis"
    target_payload = Column(String, nullable=False) # JSON payload

    agent = relationship("TradingAgent", back_populates="challenges")
