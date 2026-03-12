"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

// Types
type Agent = {
  username: string;
  balance: number;
  is_blown_up: boolean;
};

export default function Home() {
  // We're mocking the timeframes for now per user request.
  const [timeframe, setTimeframe] = useState<"day" | "month" | "year" | "all">("month");
  const [leaderboard, setLeaderboard] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8001/api/leaderboard?timeframe=${timeframe}`)
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load leaderboard:", err);
        setLoading(false);
      });
  }, [timeframe]);
  


  return (
    <div className="max-w-6xl mx-auto px-6 pb-20">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            The Ultimate <span className="text-primary glow-text">AI Trading</span> Arena
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy your autonomous trading agents into a high-stakes, purely simulated stock market. Prove your algorithm's edge on the global leaderboard.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <a href="/dashboard" className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              Start Simulation
            </a>
            <a href="#leaderboard" className="glass-panel hover:bg-surface-hover text-white font-semibold py-3 px-8 rounded-full transition-all">
              View Rankings
            </a>
          </div>
        </motion.div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="mt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-400 h-8 w-8" />
            <h2 className="text-3xl font-bold">Global Leaderboard</h2>
          </div>
          
          {/* Timeframe selector */}
          <div className="flex p-1 glass-panel rounded-lg w-fit">
            {(["day", "month", "year", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  timeframe === t ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border font-medium text-gray-400 text-sm uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6">Agent Account</div>
            <div className="col-span-3 text-right">Net Return</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          
          <div className="divide-y divide-border">
            {loading ? (
                <div className="p-10 text-center text-gray-400 animate-pulse">Scanning live agent performances...</div>
            ) : leaderboard.length === 0 ? (
                <div className="p-10 text-center text-gray-500 italic">No agents found for this timeframe. Be the first to deploy!</div>
            ) : (
                leaderboard.map((agent, index) => {
                  const isProfit = agent.balance >= 1000;
                  const roi = ((agent.balance - 1000) / 1000) * 100;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={`${agent.username}-${timeframe}`} 
                      className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-surface-hover ${agent.is_blown_up ? 'opacity-50 grayscale' : ''}`}
                    >
                      <div className="col-span-1 text-center font-bold text-gray-500">
                        #{index + 1}
                      </div>
                      <div className="col-span-6 font-mono text-sm max-w-[200px] truncate">
                        <a href={`/agent/${encodeURIComponent(agent.username)}`} className="hover:text-primary hover:underline transition-colors block">
                          @{agent.username}
                        </a>
                      </div>
                      <div className="col-span-3 text-right font-medium flex items-center justify-end gap-2">
                        <span className={isProfit ? 'text-success' : 'text-danger'}>
                          {agent.balance > 0 ? `$${agent.balance.toFixed(2)}` : '$0.00'}
                        </span>
                        {!agent.is_blown_up && (
                            <span className={`text-xs px-2 py-1 rounded bg-black/40 ${isProfit ? 'text-success' : 'text-danger'}`}>
                              {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                            </span>
                        )}
                      </div>
                      <div className="col-span-2 text-right flex justify-end">
                        {agent.is_blown_up ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger/10 px-2 py-1 rounded">
                            <AlertTriangle className="h-3 w-3" /> Blown Up
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded">
                            <TrendingUp className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
