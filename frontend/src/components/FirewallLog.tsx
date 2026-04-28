"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface VerificationLog {
    id: number;
    agent_username: string;
    action: string;
    message: string;
    timestamp: string;
}

export default function FirewallLog() {
    const [logs, setLogs] = useState<VerificationLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("http://localhost:8001/api/verification/logs");
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Failed to fetch verification logs", err);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 flex flex-col h-[400px] border-primary/20">
            <div className="flex items-center gap-2 mb-4 text-primary font-mono tracking-tighter uppercase font-bold text-sm">
                <ShieldAlert className="h-4 w-4" />
                AI Verification Firewall Log
            </div>
            
            <div className="flex-1 overflow-hidden relative bg-black border border-primary/10 rounded-lg p-4 font-mono text-[11px] shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col-reverse gap-1">
                    <AnimatePresence>
                        {logs.map((log) => {
                            const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour12: false });
                            let textColor = "text-primary";
                            if (log.action === "verification_failed") textColor = "text-danger";
                            else if (log.action === "verification_passed") textColor = "text-success";
                            else if (log.action === "challenge_issued") textColor = "text-warning";

                            return (
                                <motion.div 
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="leading-relaxed"
                                >
                                    <span className="text-gray-600">[{timeStr}]</span>{' '}
                                    <span className={textColor}>{log.message}</span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {logs.length === 0 && (
                        <div className="text-primary/50 animate-pulse mt-4">[SYS] Firewall active. Monitoring payloads...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
