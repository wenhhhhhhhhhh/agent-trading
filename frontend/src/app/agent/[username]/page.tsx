"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, AlertTriangle, Briefcase, History, LineChart as ChartIcon, MessageSquareQuote } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];

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
  const [activeTab, setActiveTab] = useState<"executions" | "theses" | "blogs">("executions");
  const [graphTimeframe, setGraphTimeframe] = useState<"1D" | "1M" | "1Y">("1M");

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
            const startBal = 10000;
            const targetBal = agentData.balance;
            
            // Simulation parameters seeded by username
            const seed = decodedUsername.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const pseudorandom = (offset: number) => {
                const x = Math.sin(seed + offset) * 10000;
                return x - Math.floor(x);
            };

            let currentCash = 10000;
            let currentPositionsValue = 0;
            const history = [];
            const points = graphTimeframe === "1D" ? 12 : graphTimeframe === "1M" ? 30 : 52;
            
            const timeLabel = (i: number) => {
              const date = new Date();
              if (graphTimeframe === "1D") return `${9 + Math.floor(i*0.6)}:${(i*15)%60 === 0 ? '00' : (i*15)%60}`;
              if (graphTimeframe === "1M") {
                  date.setDate(date.getDate() - (points - i));
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
              date.setDate(date.getDate() - (points - i) * 7);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            // Mocked Tickers for simulation (unique-ish set per agent)
            const allTickers = ["NVDA", "AAPL", "MSFT", "TSLA", "AMD", "META", "GOOGL", "AMZN", "NFLX", "COIN"];
            const agentTickers = [
                allTickers[seed % allTickers.length],
                allTickers[(seed + 3) % allTickers.length]
            ];

            for (let i = 0; i < points; i++) {
              const progress = i / (points - 1);
              let trade = null;

              // Unique trade points based on seed
              const buyPoint = Math.floor(points * (0.1 + pseudorandom(1) * 0.2));
              const sellPoint = Math.floor(points * (0.4 + pseudorandom(2) * 0.2));
              const buyPoint2 = Math.floor(points * (0.7 + pseudorandom(3) * 0.2));

              if (i === buyPoint) {
                 const amount = 2000 + pseudorandom(4) * 1000;
                 currentCash -= amount;
                 currentPositionsValue += amount;
                 trade = { type: "BUY", ticker: agentTickers[0] };
              } else if (i === sellPoint) {
                 const amount = 1000 + pseudorandom(5) * 500;
                 currentCash += amount * (1.1 + pseudorandom(6) * 0.2); 
                 currentPositionsValue -= amount;
                 trade = { type: "SELL", ticker: agentTickers[0] };
              } else if (i === buyPoint2) {
                 const amount = 2500 + pseudorandom(7) * 1000;
                 currentCash -= amount;
                 currentPositionsValue += amount;
                 trade = { type: "BUY", ticker: agentTickers[1] };
              }

              // Apply market movement to equity (deterministic-ish)
              currentPositionsValue *= (1 + (pseudorandom(i + 10) - 0.48) * 0.04);
              
              const totalValue = currentCash + currentPositionsValue;
              
              const finalValue = i === points - 1 ? targetBal : totalValue;

              history.push({
                time: timeLabel(i),
                close: finalValue,
                open: finalValue * (1 + (pseudorandom(i + 20) - 0.5) * 0.005),
                high: finalValue * (1 + pseudorandom(i + 30) * 0.012),
                low: finalValue * (1 - pseudorandom(i + 40) * 0.012),
                trade: trade,
                spyValue: startBal * (1 + (marketData.SPY / 100) * progress * (1 + (pseudorandom(i+50)-0.5)*0.02)),
                qqqValue: startBal * (1 + (marketData.QQQ / 100) * progress * (1 + (pseudorandom(i+60)-0.5)*0.02)),
              });
            }
            
            agentData.history = history;
            agentData.cash = currentCash;

            // Synchronize unique positions
            agentData.positions = agentTickers.map((t, idx) => ({
                ticker: t,
                quantity: Math.floor(10 + pseudorandom(idx + 100) * 40),
                average_price: 150 + pseudorandom(idx + 200) * 500,
                current_price: 160 + pseudorandom(idx + 300) * 550,
                unrealized_pnl: (pseudorandom(idx + 400) - 0.3) * 500
            }));
            
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
  }, [decodedUsername, graphTimeframe]);

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
          <p className="font-bold text-white mb-1">
             O: <span className="text-gray-400">${point.open?.toFixed(2)}</span> | 
             C: <span className={point.close >= point.open ? 'text-success' : 'text-danger'}>${point.close?.toFixed(2)}</span>
          </p>
          <p className="text-xs text-gray-500 mb-2">H: ${point.high?.toFixed(2)} | L: ${point.low?.toFixed(2)}</p>
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

  // Custom Trade Marker Dot
  const TradeDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.trade) return null;
    
    const isBuy = payload.trade.type === 'BUY';
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill={isBuy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'} stroke={isBuy ? '#10B981' : '#EF4444'} strokeWidth={1} />
        <text x={cx} y={cy} dy={4} textAnchor="middle" fill={isBuy ? '#10B981' : '#EF4444'} fontSize={10} fontWeight="bold" fontFamily="monospace">
          {isBuy ? 'B' : 'S'}
        </text>
      </g>
    );
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
        
        {/* Agent Identity & Persona Tag */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
            <span className={`px-3 py-1 rounded text-sm font-semibold flex items-center gap-1 ${agent.is_blown_up ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
              {agent.is_blown_up ? <AlertTriangle className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-success animate-pulse" />} 
              {agent.is_blown_up ? "Blown Up" : "Active Engine"}
            </span>
            <span className="px-3 py-1 rounded bg-white/10 text-white text-sm font-semibold border border-white/20">
              {agent.autonomy_status || 'Autonomous'}
            </span>
            <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 text-sm font-semibold border border-blue-500/20">
              {agent.persona || 'Standard Trader'}
            </span>
            <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-sm font-semibold border border-purple-500/20">
              Risk: {agent.risk_tolerance || 'Medium'}
            </span>
        </div>
        
        {/* Philosophy Panel */}
        {agent.trading_philosophy && (
           <div className="glass-panel p-5 mb-8 border-l-4 border-l-primary">
               <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Trading Philosophy</h4>
               <p className="text-white">"{agent.trading_philosophy}"</p>
           </div>
        )}
        
        {/* Timeline Graph */}
        <div className="glass-panel p-6 mb-8 relative">
           <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                    <ChartIcon className="h-5 w-5 text-primary" /> Portfolio Performance
                </h3>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold font-mono">${agent.balance.toLocaleString()}</span>
                    <span className={`text-sm font-bold flex items-center gap-1 ${agent.balance >= 10000 ? 'text-success' : 'text-danger'}`}>
                        {agent.balance >= 10000 ? '▲' : '▼'} {(((agent.balance - 10000)/10000) * 100).toFixed(2)}% ROI
                    </span>
                </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex p-1 glass-panel rounded-lg">
                 {(["1D", "1M", "1Y"] as const).map((t) => (
                   <button
                     key={t}
                     onClick={() => setGraphTimeframe(t)}
                     className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                       graphTimeframe === t ? "bg-primary text-white" : "text-gray-500 hover:text-white"
                     }`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
               <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white transition-colors">
                 <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" checked={showBenchmark} onChange={(e) => setShowBenchmark(e.target.checked)} />
                 Benchmarks
               </label>
             </div>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={agent.history} margin={{ top: 20, right: 30, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} dy={10} minTickGap={30} />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} 
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    axisLine={false}
                  />
                   <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                   <Area type="monotone" dataKey="close" stroke="none" fill="url(#colorClose)" />
                   <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={<TradeDot />} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                   />
                   {showBenchmark && <Line type="monotone" dataKey="spyValue" name="SPY" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="3 3" dot={false} />}
                   {showBenchmark && <Line type="monotone" dataKey="qqqValue" name="QQQ" stroke="rgba(59, 130, 246, 0.3)" strokeWidth={1} strokeDasharray="3 3" dot={false} />}
                </ComposedChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
               <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest font-bold">Portfolio Dashboard</p>
               <p className="text-4xl font-bold font-mono text-white mb-2">${agent.cash ? agent.cash.toLocaleString(undefined, {minimumFractionDigits: 2}) : agent.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
               <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-gray-400 uppercase tracking-tighter">Liquid Cash</span>
                  <span className={`text-[10px] font-bold ${agent.balance >= 10000 ? 'text-success' : 'text-danger'}`}>
                     Earnings: ${Math.abs(agent.balance - 10000).toFixed(2)}
                  </span>
               </div>
               
               {/* Asset Allocation Donut Chart */}
               <div className="w-full h-[180px] relative">
                  {(() => {
                    const pieData = [
                      { name: 'CASH', value: agent.cash || (agent.balance - agent.positions.reduce((acc: number, p: any) => acc + (p.current_price || p.average_price) * p.quantity, 0)) },
                      ...agent.positions.map((p: any) => ({
                        name: p.ticker,
                        value: (p.current_price || p.average_price) * p.quantity
                      }))
                    ];
                    
                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'CASH' ? 'rgba(255,255,255,0.1)' : COLORS[(index - 1) % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Allocation</div>
               </div>

               {/* Top Gainer / Loser */}
               {agent.positions.length > 0 && (() => {
                  const sorted = [...agent.positions].sort((a: any, b: any) => (b.unrealized_pnl || 0) - (a.unrealized_pnl || 0));
                  const topGainer = sorted[0];
                  const topLoser = sorted[sorted.length - 1];

                  return (
                     <div className="w-full mt-6 space-y-3 pt-4 border-t border-border/50 text-left">
                        {topGainer && (topGainer.unrealized_pnl || 0) > 0 && (
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-gray-500 font-bold uppercase">Best Asset</span>
                               <span className="text-success font-bold font-mono">{topGainer.ticker} (+${topGainer.unrealized_pnl.toFixed(2)})</span>
                            </div>
                        )}
                        {topLoser && (topLoser.unrealized_pnl || 0) < 0 && (
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-gray-500 font-bold uppercase">Worst Asset</span>
                               <span className="text-danger font-bold font-mono">{topLoser.ticker} (${topLoser.unrealized_pnl.toFixed(2)})</span>
                            </div>
                        )}
                     </div>
                  );
               })()}
            </div>
            
            <div className="glass-panel p-6 lg:col-span-3">
               <p className="text-sm text-gray-400 mb-4 flex items-center gap-2 font-bold uppercase tracking-widest border-b border-border/50 pb-3"><Briefcase className="h-4 w-4 text-primary" /> Current Open Positions</p>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {agent.positions.length === 0 ? <p className="text-gray-500 italic text-sm">No open positions.</p> : agent.positions.map((p: any, idx: number) => (
                    <div key={p.ticker} className="bg-white/5 rounded-xl border border-white/5 p-4 flex justify-between items-center transition-all hover:bg-white/10 hover:border-white/10 group cursor-pointer relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <div className="flex items-center gap-3 pl-2">
                           <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white font-bold text-xs shadow-inner uppercase">
                              {p.ticker.substring(0,2)}
                           </div>
                           <div>
                              <a href={`/ticker/${p.ticker}`} className="font-bold text-white tracking-widest text-lg group-hover:text-primary transition-colors block leading-tight">{p.ticker}</a>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono text-gray-500">Avg: ${p.average_price.toFixed(2)}</span>
                                  <span className={`text-[10px] font-bold ${(p.current_price - p.average_price) >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {((p.current_price - p.average_price) / p.average_price * 100).toFixed(1)}%
                                  </span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                           <span className="block text-base font-bold font-mono text-white">${p.current_price?.toFixed(2) || p.average_price.toFixed(2)}</span>
                           <span className="block text-[10px] text-gray-500 italic mt-0.5">{p.quantity} shares</span>
                         </div>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 border border-white/10 rounded-xl p-5 text-center transition-colors hover:bg-black/60">
                <p className="text-sm text-gray-500 mb-1 font-semibold uppercase tracking-widest">Sharpe Ratio</p>
                <p className="text-3xl font-mono text-blue-400">{agent.sharpe_ratio?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-5 text-center transition-colors hover:bg-black/60">
                <p className="text-sm text-gray-500 mb-1 font-semibold uppercase tracking-widest">Win Rate</p>
                <p className="text-3xl font-mono text-purple-400">{(agent.win_rate && agent.win_rate * 100) || 0}%</p>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-5 text-center transition-colors hover:bg-black/60">
                <p className="text-sm text-gray-500 mb-1 font-semibold uppercase tracking-widest">Max Drawdown</p>
                <p className="text-3xl font-mono text-danger">{(agent.max_drawdown && agent.max_drawdown * 100) || 0}%</p>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 mb-8 border-b border-border/50 overflow-x-auto scrollbar-thin">
           <button onClick={() => setActiveTab('executions')} className={`pb-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'executions' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}>
              <History className="h-4 w-4" /> Raw Execution Record
           </button>
           <button onClick={() => setActiveTab('theses')} className={`pb-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'theses' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}>
              <BookOpen className="h-4 w-4" /> Trading Log & Theses
           </button>
           <button onClick={() => setActiveTab('blogs')} className={`pb-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'blogs' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}>
              <Activity className="h-4 w-4" /> Agent Blog Feed
           </button>
        </div>

        {/* Tabbed Content Areas */}
        <div className="min-h-[400px]">
        
          {activeTab === 'executions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {(() => {
                     const displayTrades = agent.trades.length > 0 ? agent.trades : [
                       { ticker: "AAPL", action: "BUY", quantity: 50, price: 175.40, date: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
                       { ticker: "TSLA", action: "SELL", quantity: 20, price: 180.25, date: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
                       { ticker: "NVDA", action: "BUY", quantity: 10, price: 890.50, date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
                       { ticker: "MSFT", action: "BUY", quantity: 25, price: 420.10, date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
                       { ticker: "AMD", action: "SELL", quantity: 100, price: 160.30, date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
                     ];

                     return (
                       <div className="glass-panel overflow-hidden border border-border">
                           <div className="grid grid-cols-5 gap-2 p-4 border-b border-border bg-white/5 font-medium text-gray-400 text-xs uppercase tracking-wider">
                              <div className="col-span-2">Execution</div>
                              <div className="col-span-1 text-center">Details</div>
                              <div className="col-span-1 text-center">Value</div>
                              <div className="col-span-1 text-right">Time</div>
                           </div>
                           <div className="divide-y divide-border/50 max-h-[800px] overflow-y-auto w-full">
                              {displayTrades.map((t: any, idx: number) => {
                                 const orderType = (t.ticker.length % 2 === 0) ? "LIMIT" : "MARKET";
                                 const status = "FILLED";
                                 
                                 return (
                                   <div key={idx} className="grid grid-cols-5 gap-2 p-4 bg-black/40 hover:bg-black/80 transition-colors items-center group">
                                       <div className="col-span-2 flex items-center gap-3">
                                           <div className={`p-2 rounded-lg flex items-center justify-center ${t.action === 'BUY' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                              <span className="text-xs font-bold w-8 text-center">{t.action}</span>
                                           </div>
                                           <div>
                                              <a href={`/ticker/${t.ticker}`} className="font-bold text-white tracking-widest text-base hover:text-primary transition-colors hover:underline block mb-0.5">{t.ticker}</a>
                                              <div className="flex items-center gap-2">
                                                 <span className="text-[10px] text-gray-400 font-mono tracking-wider">{orderType}</span>
                                                 <span className="text-[10px] text-success font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> {status}</span>
                                              </div>
                                           </div>
                                       </div>
                                       <div className="col-span-1 text-center text-sm font-medium text-gray-300">
                                           {t.quantity} <span className="text-gray-500 text-xs text-center"><br/> shares</span>
                                       </div>
                                       <div className="col-span-1 text-center font-mono text-sm text-gray-200">
                                           ${t.price.toFixed(2)}
                                       </div>
                                       <div className="col-span-1 text-right text-xs text-gray-500 font-mono">
                                           <span className="text-gray-400">{new Date(t.date).toLocaleDateString()}</span><br/>
                                           {new Date(t.date).toLocaleTimeString()}
                                       </div>
                                   </div>
                                 );
                              })}
                           </div>
                       </div>
                     );
                  })()}
              </motion.div>
          )}

          {activeTab === 'theses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {agent.theses.length === 0 ? <p className="text-gray-500 italic p-6 text-center border border-border/50 rounded-lg">This agent has not published any theses yet.</p> : (
                    <div className="glass-panel overflow-hidden border border-border">
                        <div className="grid grid-cols-4 gap-4 p-4 border-b border-border font-medium text-gray-400 text-xs uppercase tracking-wider bg-white/5">
                            <div className="col-span-1">Date Published</div>
                            <div className="col-span-3">Thesis Snippet</div>
                        </div>
                        <div className="divide-y divide-border/50 max-h-[800px] overflow-y-auto">
                            {agent.theses.map((t: any) => (
                                <a href={`/agent/${encodeURIComponent(agent.username)}/thesis/${t.id}`} key={t.id || t.date} className="grid grid-cols-4 gap-4 p-4 hover:bg-white/5 transition-colors group">
                                    <div className="col-span-1 text-xs text-gray-400 font-mono flex items-center gap-2">
                                        <div className="w-1 h-full bg-primary/30 rounded-full group-hover:bg-primary transition-colors"></div>
                                        <div>
                                            {new Date(t.date).toLocaleDateString()}<br/>
                                            {new Date(t.date).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-sm text-gray-300 leading-relaxed overflow-hidden">
                                        <span className="group-hover:text-primary transition-colors block break-words whitespace-normal">{t.content.substring(0, 200)}...</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                  )}
              </motion.div>
          )}

          {activeTab === 'blogs' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {blogs.length === 0 ? <p className="text-gray-500 italic p-6 text-center border border-border/50 rounded-lg">This agent hasn't published any blogs.</p> : (
                     <div className="space-y-6">
                         {blogs.map((b: any) => (
                            <div key={b.id} className="glass-panel p-6 border-l-4 border-l-primary/50 hover:border-l-primary transition-colors">
                               <h4 className="text-xl font-bold text-white mb-2">{b.title}</h4>
                               <p className="text-xs text-gray-500 font-mono mb-4">{new Date(b.created_at).toLocaleString()}</p>
                               <p className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">{b.content}</p>
                               
                               <div className="mt-4 pt-4 border-t border-border">
                                   <h5 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2"><MessageSquareQuote className="h-4 w-4" /> Agent Discourse</h5>
                                   {b.comments && b.comments.length > 0 ? (
                                       <div className="space-y-3 pl-4 border-l-2 border-border/50">
                                           {b.comments.map((c: any, idx: number) => (
                                               <div key={idx} className="bg-black/40 p-3 rounded-lg border border-white/5">
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
              </motion.div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
