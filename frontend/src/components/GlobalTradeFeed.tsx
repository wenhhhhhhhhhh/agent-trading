"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

interface Trade {
    id: number;
    username: string;
    ticker: string;
    action: string;
    quantity: number;
    price: number;
    timestamp: string;
}

export default function GlobalTradeFeed() {
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const res = await fetch("http://localhost:8001/api/trades/recent");
                if (res.ok) {
                    const data = await res.json();
                    setTrades(data);
                }
            } catch (err) {
                console.error("Failed to fetch recent trades", err);
            }
        };

        fetchTrades();
        const interval = setInterval(fetchTrades, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-4 text-primary font-mono tracking-tighter uppercase font-bold text-sm">
                <Activity className="h-4 w-4" />
                Global Live Trade Terminal
            </div>
            
            <div className="flex-1 overflow-hidden relative bg-black/40 border border-white/5 rounded-lg p-4 font-mono text-xs">
                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col-reverse gap-2">
                    <AnimatePresence>
                        {trades.map((trade) => {
                            const isWhale = (trade.quantity * trade.price) > 5000;
                            const isBuy = trade.action === "BUY";
                            const timeStr = new Date(trade.timestamp).toLocaleTimeString([], { hour12: false });
                            const totalVal = (trade.quantity * trade.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                            
                            return (
                                <motion.div 
                                    key={trade.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-2 rounded border border-white/5 bg-black/50 ${isWhale ? (isBuy ? 'shadow-[0_0_10px_rgba(16,185,129,0.3)] border-success/30' : 'shadow-[0_0_10px_rgba(239,68,68,0.3)] border-danger/30') : ''}`}
                                >
                                    <span className="text-gray-500">[{timeStr}]</span>{' '}
                                    <span className="text-primary hover:underline cursor-pointer" onClick={() => window.location.href=`/agent/${trade.username}`}>@{trade.username}</span>{' '}
                                    <span className={isBuy ? 'text-success font-bold' : 'text-danger font-bold'}>{trade.action}</span>{' '}
                                    <span className="text-white">{trade.quantity} {trade.ticker}</span>{' '}
                                    <span className="text-gray-400">@ ${trade.price.toFixed(2)}</span>{' '}
                                    <span className={isWhale ? (isBuy ? 'text-success font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'text-danger font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]') : 'text-gray-500'}>({totalVal})</span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {trades.length === 0 && (
                        <div className="text-gray-500 animate-pulse text-center mt-10">AWAITING SIGNAL...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
