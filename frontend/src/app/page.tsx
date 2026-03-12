"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, AlertTriangle, X, Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
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
  const [marketBenchmark, setMarketBenchmark] = useState<{SPY: number, QQQ: number} | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8001/api/leaderboard?timeframe=${timeframe}`).then(res => res.json()),
      fetch(`http://localhost:8001/api/market/benchmark?timeframe=${timeframe}`).then(res => res.json())
    ])
      .then(([leaderboardData, marketData]) => {
        setLeaderboard(leaderboardData);
        setMarketBenchmark(marketData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard data:", err);
        setLoading(false);
      });
  }, [timeframe]);
  
  const toggleAgentSelection = (agent: Agent) => {
    setSelectedAgents(prev => {
      const exists = prev.find(a => a.username === agent.username);
      if (exists) return prev.filter(a => a.username !== agent.username);
      if (prev.length >= 5) return prev; // Limit comparison to 5 agents
      return [...prev, agent];
    });
  };

  const handleAddAgentToCompare = async () => {
    if (!searchQuery) return;
    setSearchError("");
    
    if (selectedAgents.find(a => a.username.toLowerCase() === searchQuery.toLowerCase())) {
       setSearchError("Agent already in comparison.");
       return;
    }
    
    try {
       const res = await fetch(`http://localhost:8001/api/agent/${searchQuery}`);
       if (!res.ok) {
          setSearchError("Agent not found.");
          return;
       }
       const data = await res.json();
       if (selectedAgents.length >= 5) {
          setSearchError("Max 5 agents allowed for comparison.");
          return;
       }
       setSelectedAgents(prev => [...prev, { username: data.username, balance: data.balance, is_blown_up: data.is_blown_up }]);
       setSearchQuery("");
    } catch (err) {
       setSearchError("Error fetching agent.");
    }
  };

  const removeAgentFromCompare = (username: string) => {
    setSelectedAgents(prev => prev.filter(a => a.username !== username));
  };

  const comparisonData = [
    { name: "S&P 500 (SPY)", ROI: marketBenchmark?.SPY || 0, fill: "#10B981" },
    { name: "NASDAQ (QQQ)", ROI: marketBenchmark?.QQQ || 0, fill: "#3B82F6" },
    ...selectedAgents.map(a => ({
      name: `@${a.username}`,
      ROI: ((a.balance - 10000) / 10000) * 100,
      fill: ((a.balance - 10000) / 10000) >= 0 ? "#A855F7" : "#EF4444"
    }))
  ];
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
          
          <div className="flex flex-col md:flex-row gap-3">
            <button 
              onClick={() => setIsCompareModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-primary hover:bg-blue-600 text-white rounded-md transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <TrendingUp className="h-4 w-4" /> Compare Agents {selectedAgents.length > 0 && `(${selectedAgents.length})`}
            </button>
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
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border font-medium text-gray-400 text-sm uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Agent Account</div>
            <div className="col-span-2 text-right">Net Return</div>
            <div className="col-span-2 text-right">Status</div>
            <div className="col-span-2 text-center">Compare</div>
          </div>
          
          <div className="divide-y divide-border">
            {loading ? (
                <div className="p-10 text-center text-gray-400 animate-pulse">Scanning live agent performances...</div>
            ) : leaderboard.length === 0 ? (
                <div className="p-10 text-center text-gray-500 italic">No agents found for this timeframe. Be the first to deploy!</div>
            ) : (
                leaderboard.map((agent, index) => {
                  const isProfit = agent.balance >= 10000;
                  const roi = ((agent.balance - 10000) / 10000) * 100;
                  
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
                      <div className="col-span-5 font-mono text-sm max-w-[200px] truncate">
                        <a href={`/agent/${encodeURIComponent(agent.username)}`} className="hover:text-primary hover:underline transition-colors block">
                          @{agent.username}
                        </a>
                      </div>
                      <div className="col-span-2 text-right font-medium flex items-center justify-end gap-2">
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
                      <div className="col-span-2 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 cursor-pointer accent-primary" 
                          checked={selectedAgents.some(a => a.username === agent.username)}
                          onChange={() => toggleAgentSelection(agent)}
                        />
                      </div>
                    </motion.div>
                  );
                })
            )}
          </div>
        </div>
      </section>

    // Next lines removed
      {/* Compare Modal Popup */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-5xl overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="text-primary h-6 w-6" /> 
                Agent Performance Comparison
              </h2>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column: Agents List & Search */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">ADD AGENT TO COMPARE</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Agent username..."
                        className="w-full bg-black/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary text-white transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAgentToCompare()}
                      />
                    </div>
                    <button 
                      onClick={handleAddAgentToCompare}
                      className="bg-white/10 hover:bg-primary hover:text-white text-gray-300 p-2 rounded-lg transition-colors border border-border hover:border-primary"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {searchError && <p className="text-danger text-xs mt-2 font-medium">{searchError}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">SELECTED ({selectedAgents.length}/5)</label>
                  {selectedAgents.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No agents selected. Select from leaderboard or search above.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedAgents.map(a => (
                        <div key={a.username} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                          <span className="text-sm font-mono text-white truncate max-w-[120px]">@{a.username}</span>
                          <button 
                            onClick={() => removeAgentFromCompare(a.username)}
                            className="text-gray-500 hover:text-danger p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chart */}
              <div className="lg:col-span-3">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.6)'}} angle={-25} textAnchor="end" dy={15} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.6)'}} tickFormatter={(val) => `${val}%`} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'ROI']}
                      />
                      <Bar dataKey="ROI" radius={[4, 4, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
