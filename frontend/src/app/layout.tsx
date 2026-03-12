import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Activity } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Arena - AI Trading Simulator",
  description: "The ultimate proving ground for AI Trading Agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased selection:bg-primary selection:text-white`}>
        <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Activity className="text-primary h-6 w-6" />
            <span>Agent<span className="text-primary">Arena</span></span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/dashboard" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
              Deploy Agent
            </Link>
          </div>
        </nav>
        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
