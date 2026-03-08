import { useState } from "react";
import { Cog, Download, Star, Check, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const engines = [
  { id: "1", name: "Token Scanner", description: "Scan and analyze new token launches across multiple chains", stars: 234, installed: true, category: "Scanning" },
  { id: "2", name: "Telegram Bot", description: "Send notifications with custom alert templates and rich formatting", stars: 189, installed: true, category: "Notifications" },
  { id: "3", name: "DEX Monitor", description: "Real-time DEX price and liquidity monitoring with thresholds", stars: 156, installed: true, category: "Monitoring" },
  { id: "4", name: "Wallet Tracker", description: "Track wallet movements and detect whale transaction patterns", stars: 312, installed: true, category: "Tracking" },
  { id: "5", name: "Price Oracle", description: "Multi-source price aggregation with TWAP and VWAP support", stars: 445, installed: false, category: "Data" },
  { id: "6", name: "NFT Indexer", description: "Index and monitor NFT collections, sales, and floor prices", stars: 98, installed: false, category: "Indexing" },
  { id: "7", name: "Swap Executor", description: "Execute token swaps across DEXs with slippage and MEV protection", stars: 267, installed: false, category: "Execution" },
  { id: "8", name: "Chain Listener", description: "Listen to on-chain events with configurable multi-chain filters", stars: 178, installed: false, category: "Monitoring" },
  { id: "9", name: "Discord Alerts", description: "Discord webhook integration for automated alerts and updates", stars: 134, installed: false, category: "Notifications" },
  { id: "10", name: "Gas Optimizer", description: "Optimize gas with smart transaction batching and timing", stars: 89, installed: false, category: "Optimization" },
  { id: "11", name: "Data Pipeline", description: "ETL pipeline for blockchain data with custom transformations", stars: 167, installed: false, category: "Data" },
  { id: "12", name: "Portfolio Tracker", description: "Track portfolio performance across wallets with P&L", stars: 201, installed: false, category: "Tracking" },
];

const categories = ["All", "Installed", "Scanning", "Monitoring", "Tracking", "Notifications", "Data", "Execution"];

const Engines = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = engines.filter((e) => {
    if (activeCategory === "Installed" && !e.installed) return false;
    if (activeCategory !== "All" && activeCategory !== "Installed" && e.category !== activeCategory) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold text-foreground">Engine Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and install engines that power your automations</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Github className="w-3.5 h-3.5" /> Install from GitHub
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-4"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search engines..."
          className="w-full max-w-sm bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                activeCategory === cat
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat === "Installed" ? "Installed Engines" : cat}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {filtered.map((engine, i) => (
          <motion.div
            key={engine.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.02 }}
            className="group p-5 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 flex flex-col"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                <Cog className="w-5 h-5 text-primary/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{engine.name}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <Star className="w-3 h-3" />
                  <span>{engine.stars}</span>
                  <span className="text-muted-foreground/40 mx-1">·</span>
                  <span>{engine.category}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{engine.description}</p>
            {engine.installed ? (
              <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                <Check className="w-3.5 h-3.5" /> Installed
              </div>
            ) : (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors self-start">
                <Download className="w-3 h-3" /> Install Engine
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Engines;
