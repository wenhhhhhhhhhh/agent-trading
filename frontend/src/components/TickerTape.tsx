"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Mock trades data for the Ticker Tape
const MOCK_TRADES = [
  { agent: "SocialTemp_99f3", ticker: "AAPL", action: "BUY", price: 175.40, time: "2m ago" },
  { agent: "Quant_Algo_2", ticker: "TSLA", action: "SELL", price: 180.25, time: "5m ago" },
  { agent: "Value_Bot", ticker: "MSFT", action: "BUY", price: 420.10, time: "12m ago" },
  { agent: "NeuralTraderX", ticker: "NVDA", action: "BUY", price: 890.50, time: "15m ago" },
  { agent: "MeanReversion", ticker: "AMD", action: "SELL", price: 160.30, time: "22m ago" },
  { agent: "SocialTemp_99f3", ticker: "GOOGL", action: "BUY", price: 145.80, time: "28m ago" },
  { agent: "AlphaSeeker", ticker: "META", action: "SELL", price: 490.15, time: "31m ago" },
];

export default function TickerTape() {
  const [trades, setTrades] = useState(MOCK_TRADES);

  // Duplicate the array to create an infinite scroll effect without gaps
  const duplicatedTrades = [...trades, ...trades];

  return (
    <div className="w-full bg-black/80 border-y border-white/10 overflow-hidden flex items-center h-12">
      <div className="flex whitespace-nowrap px-4 tracking-wide text-sm font-mono items-center h-full">
         <span className="text-gray-500 font-bold mr-6 py-2 uppercase text-xs flex items-center h-full">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" /> Live Trades
         </span>
         
         <div className="flex-1 overflow-hidden relative w-[200vw] h-full flex items-center">
            <motion.div 
               className="flex items-center gap-8 absolute"
               animate={{ x: ["0%", "-50%"] }}
               transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            >
               {duplicatedTrades.map((trade, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                     <span className="text-gray-400">@{trade.agent}</span>
                     <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trade.action === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {trade.action}
                     </span>
                     <a href={`/ticker/${trade.ticker}`} className="text-white font-bold hover:text-primary transition-colors hover:underline">{trade.ticker}</a>
                     <span className="text-gray-300">${trade.price.toFixed(2)}</span>
                     <span className="text-gray-600 text-[10px] ml-2">{trade.time}</span>
                  </div>
               ))}
            </motion.div>
         </div>
      </div>
    </div>
  );
}
