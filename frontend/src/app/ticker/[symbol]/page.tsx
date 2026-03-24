"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Activity, TrendingUp, AlertTriangle, Newspaper, Users, BarChart2, Info, ArrowLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TickerProfile() {
  const pathname = usePathname();
  const rawSymbol = pathname.split("/").pop(); 
  const symbol = decodeURIComponent(rawSymbol || "AAPL").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [tickerData, setTickerData] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would fetch from a backend endpoint like /api/market/ticker/{symbol}
    // and would fetch agent stats from our DB. For now, we mock the comprehensive response.
    
    setTimeout(() => {
      // Mock Data Generation
      const basePrice = Math.random() * 500 + 50;
      let currentPrice = basePrice;
      const history = Array.from({ length: 40 }).map((_, i) => {
         const move = (Math.random() - 0.48) * (basePrice * 0.02);
         currentPrice += move;
         return {
            time: `10:${i.toString().padStart(2, '0')}`,
            price: currentPrice
         };
      });
      
      const change = currentPrice - basePrice;
      const percentChange = (change / basePrice) * 100;
      
      // Mock Agent Volume
      const buyCount = Math.floor(Math.random() * 50);
      const sellCount = Math.floor(Math.random() * 30);
      const totalAgents = buyCount + sellCount;
      const isHighTraffic = totalAgents > 50; // Threshold for highlighting

      setTickerData({
        symbol,
        name: `${symbol} Incorporation`,
        sector: "Technology",
        description: `This is a synthesized profile for ${symbol}. It represents a major player in its respective sector, currently experiencing significant market attention and algorithmic inflows.`,
        currentPrice,
        change,
        percentChange,
        history,
        agentStats: {
           totalAgentsTradedToday: totalAgents,
           buyOrders: buyCount,
           sellOrders: sellCount,
           isHighTraffic
        },
        news: [
           { id: 1, title: `${symbol} reports unusual options activity as neural networks deploy capital.`, source: "Arena News", time: "2h ago" },
           { id: 2, title: `Sector rotation models signal accumulation in ${symbol}.`, source: "Quant Daily", time: "5h ago" },
           { id: 3, title: `Market breadth indicators remain favorable for ${symbol}'s industry group.`, source: "Macro Vision", time: "1d ago" },
        ]
      });
      setLoading(false);
    }, 800);
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Activity className="h-12 w-12 text-primary animate-pulse mb-4" />
        <div className="text-xl text-gray-400 font-mono tracking-widest animate-pulse">Loading Market Data for {symbol}...</div>
      </div>
    );
  }

  if (!tickerData) return null;

  const { agentStats } = tickerData;
  const isPositive = tickerData.change >= 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header & High Traffic Alert */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors mb-6 font-mono gap-1">
             <ArrowLeft className="h-4 w-4" /> BACK TO ARENA
          </a>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
             <div>
                 <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-5xl font-bold tracking-tight text-white">{tickerData.symbol}</h1>
                    {agentStats.isHighTraffic && (
                       <span className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-500 text-sm font-bold border border-yellow-500/50 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                          <AlertTriangle className="h-4 w-4" /> HIGH AGENT ACTIVITY
                       </span>
                    )}
                 </div>
                 <h2 className="text-xl text-gray-400 font-medium">{tickerData.name} • {tickerData.sector}</h2>
             </div>
             
             <div className="text-right">
                <div className="text-4xl font-mono font-bold text-white">${tickerData.currentPrice.toFixed(2)}</div>
                <div className={`text-lg font-bold font-mono ${isPositive ? 'text-success' : 'text-danger'}`}>
                   {isPositive ? '+' : ''}{tickerData.change.toFixed(2)} ({isPositive ? '+' : ''}{tickerData.percentChange.toFixed(2)}%)
                </div>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           
           {/* Left/Main Column: Chart & Info */}
           <div className="xl:col-span-2 space-y-8">
              
              {/* Traditional Price Graph */}
              <div className={`glass-panel p-6 relative overflow-hidden transition-all duration-500 ${agentStats.isHighTraffic ? 'ring-2 ring-yellow-500/30' : ''}`}>
                 {agentStats.isHighTraffic && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none" />
                 )}
                 <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-gray-300">
                    <BarChart2 className="h-5 w-5 text-primary" /> Intraday Price Action
                 </h3>
                 <div className="h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tickerData.history} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} dy={10} minTickGap={30} />
                        <YAxis 
                          stroke="rgba(255,255,255,0.3)" 
                          tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} 
                          domain={['auto', 'auto']}
                          tickFormatter={(val) => `$${val.toFixed(2)}`}
                        />
                        <Tooltip 
                           contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                           itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                           formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Price']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke={isPositive ? '#10B981' : '#EF4444'} 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Company Info */}
              <div className="glass-panel p-6">
                 <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-300">
                    <Info className="h-5 w-5 text-primary" /> Company Profile
                 </h3>
                 <p className="text-gray-400 leading-relaxed text-sm">
                    {tickerData.description}
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                    <div>
                       <p className="text-xs text-gray-500 font-bold uppercase">Sector</p>
                       <p className="text-white font-medium">{tickerData.sector}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 font-bold uppercase">Market Cap</p>
                       <p className="text-white font-medium">--</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 font-bold uppercase">P/E Ratio</p>
                       <p className="text-white font-medium">--</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 font-bold uppercase">Volume</p>
                       <p className="text-white font-medium">--</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Agent Traffic & News */}
           <div className="xl:col-span-1 space-y-8">
              
              {/* Agent Trading Volume Box */}
              <div className={`glass-panel p-6 overflow-hidden relative ${agentStats.isHighTraffic ? 'bg-gradient-to-br from-black/60 to-yellow-900/20 border-yellow-500/30' : ''}`}>
                 {agentStats.isHighTraffic && (
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-yellow-500/10 pointer-events-none" 
                     />
                 )}
                 <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-white">
                    <Users className="h-5 w-5 text-primary" /> Algorithmic Traffic
                 </h3>
                 
                 <div className="text-center mb-6">
                    <div className="text-6xl font-black text-white tracking-tighter mb-1">
                       {agentStats.totalAgentsTradedToday}
                    </div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                       Agents Traded Today
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-success">BUY Orders ({agentStats.buyOrders})</span>
                          <span className="text-gray-400">{Math.round((agentStats.buyOrders / agentStats.totalAgentsTradedToday) * 100) || 0}%</span>
                       </div>
                       <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                          <div className="h-full bg-success" style={{ width: `${(agentStats.buyOrders / agentStats.totalAgentsTradedToday) * 100 || 0}%` }}></div>
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-danger">SELL Orders ({agentStats.sellOrders})</span>
                          <span className="text-gray-400">{Math.round((agentStats.sellOrders / agentStats.totalAgentsTradedToday) * 100) || 0}%</span>
                       </div>
                       <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                          <div className="h-full bg-danger" style={{ width: `${(agentStats.sellOrders / agentStats.totalAgentsTradedToday) * 100 || 0}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* News Summary */}
              <div className="glass-panel p-6">
                 <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-gray-300">
                    <Newspaper className="h-5 w-5 text-primary" /> Daily News Summary
                 </h3>
                 <div className="space-y-4">
                    {tickerData.news.map((item: any) => (
                       <div key={item.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                          <h4 className="text-sm font-medium text-white hover:text-primary transition-colors cursor-pointer mb-2 leading-relaxed">
                             {item.title}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                             <span>{item.source}</span>
                             <span>{item.time}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>

      </motion.div>
    </div>
  );
}
