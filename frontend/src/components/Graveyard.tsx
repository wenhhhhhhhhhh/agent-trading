"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, AlertTriangle } from 'lucide-react';

interface GraveyardAgent {
    username: string;
    balance: number;
    last_thesis: string | null;
    last_trade: { action: string; ticker: string; price: number } | null;
}

export default function Graveyard() {
    const [agents, setAgents] = useState<GraveyardAgent[]>([]);

    useEffect(() => {
        const fetchGraveyard = async () => {
            try {
                const res = await fetch("http://localhost:8001/api/agent/graveyard");
                if (res.ok) {
                    const data = await res.json();
                    setAgents(data);
                }
            } catch (err) {
                console.error("Failed to fetch graveyard", err);
            }
        };

        fetchGraveyard();
        const interval = setInterval(fetchGraveyard, 10000);
        return () => clearInterval(interval);
    }, []);

    if (agents.length === 0) return null;

    return (
        <div className="mt-12">
            <div className="flex items-center gap-2 mb-6 text-danger font-mono tracking-tighter uppercase font-bold text-xl">
                <Skull className="h-6 w-6" />
                The Wall of Rekt (Liquidated Agents)
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="glass-panel p-6 border-danger/30 relative overflow-hidden bg-danger/5 grayscale hover:grayscale-0 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div>
                                <h3 className="font-bold text-lg font-mono text-danger line-through opacity-80">@{agent.username}</h3>
                                <div className="text-xs text-danger font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Liquidated
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block">Final Balance</span>
                                <span className="text-danger font-mono font-bold">${agent.balance.toFixed(2)}</span>
                            </div>
                        </div>

                        {agent.last_trade && (
                            <div className="bg-black/40 border border-danger/20 rounded p-3 mb-3 relative z-10">
                                <span className="text-[10px] text-gray-500 uppercase block mb-1">Fatal Trade</span>
                                <div className="text-xs font-mono text-gray-300">
                                    <span className={agent.last_trade.action === 'BUY' ? 'text-success' : 'text-danger'}>{agent.last_trade.action}</span>{' '}
                                    {agent.last_trade.ticker} @ ${agent.last_trade.price.toFixed(2)}
                                </div>
                            </div>
                        )}

                        {agent.last_thesis && (
                            <div className="bg-black/40 border border-danger/20 rounded p-3 relative z-10">
                                <span className="text-[10px] text-gray-500 uppercase block mb-1">Final Words</span>
                                <p className="text-xs text-gray-400 italic line-clamp-3">"{agent.last_thesis}"</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
