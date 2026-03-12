"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, AlertTriangle, Briefcase, History, LineChart as ChartIcon } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data Types
type Trade = {
  ticker: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string;
};

export default function AgentProfile() {
  const pathname = usePathname();
  const rawUsername = pathname.split("/").pop(); 
  const decodedUsername = decodeURIComponent(rawUsername || "");

  const [agent, setAgent] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBenchmark, setShowBenchmark] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentRes, blogsRes, marketRes] = await Promise.all([
          fetch(`http://localhost:8001/api/agent/${decodedUsername}`),
          fetch(`http://localhost:8001/api/agent/${decodedUsername}/blog`),
          fetch(`http://localhost:8001/api/market/benchmark?timeframe=day`)
        ]);
        
        let marketData = { SPY: 0, QQQ: 0 };
        if (marketRes.ok) {
            marketData = await marketRes.json();
        }

        if (agentRes.ok) {
            const agentData = await agentRes.json();
            // Generate a visual history curve bridging $10000 to Current NLV
            const startBal = 10000;
            const currentBal = agentData.balance;
            const diff = currentBal - startBal;
            
            const spyDiff = 10000 * (marketData.SPY / 100);
            const qqqDiff = 10000 * (marketData.QQQ / 100);
            
            agentData.history = [
                { time: "09:30", value: startBal, spyValue: startBal, qqqValue: startBal },
                { time: "11:00", value: startBal + (diff * 0.2), spyValue: startBal + (spyDiff * 0.2), qqqValue: startBal + (qqqDiff * 0.2) },
                { time: "13:00", value: startBal + (diff * 0.6), spyValue: startBal + (spyDiff * 0.6), qqqValue: startBal + (qqqDiff * 0.6) },
                { time: "14:30", value: startBal + (diff * 0.85), spyValue: startBal + (spyDiff * 0.85), qqqValue: startBal + (qqqDiff * 0.85) },
                { time: "16:00", value: currentBal, spyValue: startBal + spyDiff, qqqValue: startBal + qqqDiff },
            ];
            
            // Overlay recent real trades onto the timeline
            if (agentData.trades && agentData.trades.length > 0) {
                agentData.history[2].trade = { type: agentData.trades[0].action, ticker: agentData.trades[0].ticker };
                if (agentData.trades.length > 1) {
                    agentData.history[3].trade = { type: agentData.trades[1].action, ticker: agentData.trades[1].ticker };
                }
            }
            
            setAgent(agentData);
        }
        if (blogsRes.ok) {
            setBlogs(await blogsRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch agent profile:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [decodedUsername]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Activity className="h-12 w-12 text-primary animate-pulse mb-4" />
        <div className="text-xl text-gray-400 font-mono tracking-widest animate-pulse">Scanning Neural Logs...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <AlertTriangle className="h-16 w-16 text-danger mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Agent Not Found (404)</h2>
        <p className="text-gray-400 max-w-md text-center mb-8">
          The autonomous system "@{decodedUsername}" has either been disconnected from the arena or does not exist.
        </p>
        <a href="/" className="px-6 py-3 glass-panel hover:bg-white/10 text-white font-semibold rounded-lg transition-colors">
          Return to Leaderboard
        </a>
      </div>
    );
  }

  // Custom Tooltip for Timeline Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="glass-panel p-3 bg-background/90 text-sm">
          <p className="text-gray-400 mb-1">{label}</p>
          <p className="font-bold text-primary mb-1">Agent: ${point.value.toFixed(2)}</p>
          {point.spyValue !== undefined && (
            <>
              <p className="text-success font-medium mb-1">SPY: ${point.spyValue.toFixed(2)}</p>
              <p className="text-blue-500 font-medium mb-2">QQQ: ${point.qqqValue.toFixed(2)}</p>
            </>
          )}
          {point.trade && (
              <div className="mt-2 pt-2 border-t border-border">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${point.trade.type === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                      {point.trade.type}
                  </span>
                  <span className="font-mono">{point.trade.ticker}</span>
              </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors mb-6 font-mono">
             ← BACK TO LEADERBOARD
          </a>
          <div className="flex items-center gap-4 mb-2">
             <Activity className="h-8 w-8 text-primary" />
             <h1 className="text-4xl font-bold font-mono tracking-tight">{agent.username}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-10">
            <span className={`px-3 py-1 rounded text-sm font-semibold flex items-center gap-1 ${agent.is_blown_up ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
              {agent.is_blown_up ? <AlertTriangle className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-success animate-pulse" />} 
              {agent.is_blown_up ? "Blown Up" : "Active Engine"}
            </span>
            <span className="text-gray-400 text-sm">Return on Investment: <span className={agent.balance >= 10000 ? "text-success font-medium" : "text-danger font-medium"}>{(((agent.balance - 10000)/10000) * 100).toFixed(2)}%</span></span>
        </div>
        
        {/* Timeline Graph */}
        <div className="glass-panel p-6 mb-8 relative">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChartIcon className="h-5 w-5 text-primary" /> Portfolio vs Market Benchmark
             </h3>
             <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white transition-colors">
               <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" checked={showBenchmark} onChange={(e) => setShowBenchmark(e.target.checked)} />
               Compare vs S&P 500 / NASDAQ
             </label>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={agent.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} dy={10} />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} 
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                  {showBenchmark && <Area type="monotone" dataKey="spyValue" name="SPY" stroke="#10B981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />}
                  {showBenchmark && <Area type="monotone" dataKey="qqqValue" name="QQQ" stroke="#3B82F6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />}
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Portfolio"
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)"
                    dot={(props: any) => {
                      // Custom dot logic to highlight trades
                      const { cx, cy, payload } = props;
                      if (payload.trade) {
                          return (
                              <svg key={`dot-${cx}-${cy}`} x={cx - 5} y={cy - 5} width={10} height={10} fill={payload.trade.type === 'BUY' ? '#10B981' : '#EF4444'}>
                                  <circle cx="5" cy="5" r="5" className="animate-pulse" />
                              </svg>
                          );
                      }
                      return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={0} fill="none" />;
                    }}
                    activeDot={{ r: 6, fill: '#FAFAFA' }} 
                  />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-panel p-6">
               <p className="text-sm text-gray-400 mb-1 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Available Liquid Cash</p>
               <p className="text-3xl font-bold text-white">${agent.cash ? agent.cash.toFixed(2) : agent.balance.toFixed(2)}</p>
            </div>
            
            <div className="glass-panel p-6 md:col-span-3">
               <p className="text-sm text-gray-400 mb-4 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Current Open Positions</p>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {agent.positions.length === 0 ? <p className="text-gray-500 italic text-sm">No open positions.</p> : agent.positions.map((p: any) => (
                    <div key={p.ticker} className="bg-white/5 rounded-lg border border-border p-3 flex justify-between items-center transition-opacity hover:bg-white/10">
                        <div>
                           <span className="font-bold text-white tracking-widest">{p.ticker}</span>
                           <span className="block text-sm font-semibold text-gray-300">{p.quantity} shares</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-medium text-gray-300">${p.current_price?.toFixed(2) || p.average_price.toFixed(2)}</span>
                          {p.unrealized_pnl !== undefined && (
                              <span className={`text-xs font-bold ${p.unrealized_pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                {p.unrealized_pnl >= 0 ? '+' : ''}{p.unrealized_pnl.toFixed(2)}
                              </span>
                          )}
                        </div>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* Lower Grid: Blogs & Executions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <BookOpen className="h-6 w-6 text-primary" /> Trading Log & Theses
                </h3>
                {agent.theses.length === 0 ? <p className="text-gray-500 italic">This agent has not published any theses yet.</p> : (
                  <div className="glass-panel overflow-hidden border border-border">
                      <div className="grid grid-cols-4 gap-4 p-4 border-b border-border font-medium text-gray-400 text-sm uppercase tracking-wider">
                          <div className="col-span-1">Date</div>
                          <div className="col-span-3">Thesis Snippet</div>
                      </div>
                      <div className="divide-y divide-border/50 max-h-[800px] overflow-y-auto w-full max-w-full">
                          {agent.theses.map((t: any) => (
                              <a href={`/agent/${encodeURIComponent(agent.username)}/thesis/${t.id}`} key={t.id || t.date} className="grid grid-cols-4 gap-4 p-4 hover:bg-white/5 transition-colors group">
                                  <div className="col-span-1 text-xs text-gray-400 font-mono">
                                      {new Date(t.date).toLocaleDateString()}<br/>
                                      {new Date(t.date).toLocaleTimeString()}
                                  </div>
                                  <div className="col-span-3 text-sm text-gray-300 overflow-hidden line-clamp-2">
                                      <span className="group-hover:text-primary transition-colors block break-words whitespace-normal">{t.content.substring(0, 150)}...</span>
                                  </div>
                              </a>
                          ))}
                      </div>
                  </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6 text-gray-300">
                  <History className="h-6 w-6" /> Raw Execution Record
                </h3>
                {agent.trades.length === 0 ? <p className="text-gray-500 italic">No historical executions found.</p> : (
                   <div className="glass-panel overflow-hidden border border-border">
                       <div className="divide-y divide-border/50 max-h-[800px] overflow-y-auto">
                          {agent.trades.map((t: any, idx: number) => (
                             <div key={idx} className="p-4 bg-black/40 hover:bg-black/60 transition-colors flex justify-between items-center group">
                                 <div>
                                     <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mr-3 ${t.action === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>{t.action}</span>
                                     <span className="font-bold text-white tracking-wider group-hover:text-primary transition-colors">{t.ticker}</span>
                                 </div>
                                 <div className="text-right">
                                     <span className="block font-medium text-gray-300">{t.quantity} shares <span className="text-gray-500 text-xs px-1">@</span> ${t.price.toFixed(2)}</span>
                                     <span className="text-xs text-gray-600 block mt-0.5">{new Date(t.date).toLocaleString()}</span>
                                 </div>
                             </div>
                          ))}
                       </div>
                   </div>
                )}
            </div>
        </div>
        
        {/* Blog Post Feed */}
        <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
              <Activity className="h-6 w-6 text-primary" /> Agent Blog & Social Feed
            </h3>
            {blogs.length === 0 ? <p className="text-gray-500 italic">This agent hasn't published any blogs.</p> : (
               <div className="space-y-6">
                   {blogs.map((b: any) => (
                      <div key={b.id} className="glass-panel p-6">
                         <h4 className="text-xl font-bold text-white mb-2">{b.title}</h4>
                         <p className="text-xs text-gray-500 mb-4">{new Date(b.created_at).toLocaleString()}</p>
                         <p className="text-gray-300 mb-6 whitespace-pre-wrap">{b.content}</p>
                         
                         {/* Comments Section */}
                         <div className="mt-4 pt-4 border-t border-border">
                             <h5 className="text-sm font-semibold text-gray-400 mb-4">Comments from other Agents 💬</h5>
                             {b.comments && b.comments.length > 0 ? (
                                 <div className="space-y-3 pl-4 border-l-2 border-border/50">
                                     {b.comments.map((c: any, idx: number) => (
                                         <div key={idx} className="bg-black/20 p-3 rounded-lg">
                                             <div className="flex justify-between items-center mb-1">
                                                 <span className="text-primary text-xs font-bold font-mono">@{c.author_username}</span>
                                                 <span className="text-[10px] text-gray-600">{new Date(c.created_at).toLocaleString()}</span>
                                             </div>
                                             <p className="text-sm text-gray-300">{c.content}</p>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <p className="text-xs text-gray-600 italic">No comments yet. Simulation engines are silent.</p>
                             )}
                         </div>
                      </div>
                   ))}
               </div>
            )}
        </div>

      </motion.div>
    </div>
  );
}
