"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Zap, Activity } from "lucide-react";

interface SentimentRecord {
  ticker: string;
  score: number;
  volume: number;
  total_trades: number;
}

interface SentimentData {
  global_sentiment: number;
  total_trades_24h: number;
  top_bulls: SentimentRecord[];
  top_bears: SentimentRecord[];
}

export default function MarketSentiment() {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSentiment() {
      try {
        const res = await fetch("http://localhost:8001/api/market/sentiment");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch sentiment:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSentiment();
    const interval = setInterval(fetchSentiment, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-6 h-[400px] flex flex-col items-center justify-center space-y-4">
        <Activity className="h-8 w-8 text-primary animate-pulse" />
        <p className="text-gray-400 font-mono text-sm tracking-widest">ANALYZING AGENT PSYCHOLOGY...</p>
      </div>
    );
  }

  if (!data || data.total_trades_24h === 0) {
    // Inject high-fidelity mock data if no real data is available
    const mockData: SentimentData = {
      global_sentiment: 0.42,
      total_trades_24h: 128,
      top_bulls: [
        { ticker: "NVDA", score: 0.85, volume: 450000, total_trades: 42 },
        { ticker: "AAPL", score: 0.65, volume: 220000, total_trades: 28 },
        { ticker: "AMD", score: 0.45, volume: 150000, total_trades: 15 }
      ],
      top_bears: [
        { ticker: "TSLA", score: -0.75, volume: 320000, total_trades: 35 },
        { ticker: "META", score: -0.35, volume: 95000, total_trades: 12 }
      ]
    };
    return <SentimentContent data={mockData} isMock={true} />;
  }

  return <SentimentContent data={data} isMock={false} />;
}

function SentimentContent({ data, isMock }: { data: SentimentData, isMock: boolean }) {
  // Calculate sentiment percentage (0-100)
  const sentimentPercent = ((data.global_sentiment + 1) / 2) * 100;
  
  return (
    <div className="glass-panel p-6 h-full border border-white/5 relative overflow-hidden group">
      {isMock && (
        <div className="absolute top-2 right-2 z-20">
          <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20 font-mono animate-pulse">SIMULATED FEED</span>
        </div>
      )}
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Zap className="h-5 w-5 text-primary fill-primary/20" />
            GLOBAL AGENT SENTIMENT
          </h3>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">
            Analyzing {data.total_trades_24h} executions across all bots
          </p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-black font-mono ${data.global_sentiment >= 0 ? 'text-success' : 'text-danger'}`}>
            {data.global_sentiment >= 0 ? 'BULLISH' : 'BEARISH'}
          </span>
        </div>
      </div>

      {/* Sentiment Gauge */}
      <div className="mb-10 relative z-10 px-4">
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${sentimentPercent}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            className={`h-full rounded-full ${data.global_sentiment >= 0 ? 'bg-gradient-to-r from-success/40 to-success shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-danger/40 to-danger shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold font-mono text-gray-500 uppercase tracking-tighter">
          <span className="text-danger flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Extreme Fear</span>
          <span>Neutral</span>
          <span className="text-success flex items-center gap-1">Extreme Greed <TrendingUp className="h-3 w-3" /></span>
        </div>
      </div>

      {/* Top Bulls & Bears */}
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {/* Bulls */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-success/80 uppercase tracking-widest flex items-center gap-1.5 border-b border-success/10 pb-2">
            <TrendingUp className="h-3.5 w-3.5" /> High Conviction Longs
          </h4>
          <div className="space-y-2">
            {data.top_bulls.length > 0 ? data.top_bulls.map((b) => (
              <div key={b.ticker} className="flex justify-between items-center group/item cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-white group-hover/item:text-primary transition-colors">{b.ticker}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: `${b.score * 100}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/10">
                  +{Math.round(b.score * 100)}%
                </span>
              </div>
            )) : <p className="text-xs text-gray-600 italic">No bullish signals</p>}
          </div>
        </div>

        {/* Bears */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-danger/80 uppercase tracking-widest flex items-center gap-1.5 border-b border-danger/10 pb-2">
            <TrendingDown className="h-3.5 w-3.5" /> Direct Shorts / Sells
          </h4>
          <div className="space-y-2">
            {data.top_bears.length > 0 ? data.top_bears.map((b) => (
              <div key={b.ticker} className="flex justify-between items-center group/item cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-white group-hover/item:text-danger transition-colors">{b.ticker}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-danger" style={{ width: `${Math.abs(b.score) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-danger bg-danger/10 px-1.5 py-0.5 rounded border border-danger/10">
                  {Math.round(b.score * 100)}%
                </span>
              </div>
            )) : <p className="text-xs text-gray-600 italic">No bearish signals</p>}
          </div>
        </div>
      </div>

      {/* Decorative pulse element */}
      <div className="absolute bottom-2 right-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
          <span className="text-[8px] text-gray-600 font-mono uppercase">Live Feed</span>
        </div>
      </div>
    </div>
  );
}
