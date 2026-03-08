import { Package, Download, ExternalLink, Star, Github } from "lucide-react";

const marketplaceModules = [
  { name: "token_scanner", description: "Scan and analyze new token launches across multiple chains in real-time", github: "clawos/token-scanner", stars: 234, category: "Scanning" },
  { name: "telegram_bot", description: "Telegram notification bot with custom alert templates and rich formatting", github: "clawos/telegram-bot", stars: 189, category: "Notifications" },
  { name: "dex_monitor", description: "Real-time DEX price and liquidity monitoring with configurable thresholds", github: "clawos/dex-monitor", stars: 156, category: "Monitoring" },
  { name: "wallet_tracker", description: "Track wallet movements, detect whale activity and transaction patterns", github: "clawos/wallet-tracker", stars: 312, category: "Tracking" },
  { name: "price_oracle", description: "Multi-source price aggregation with TWAP and VWAP support", github: "clawos/price-oracle", stars: 445, category: "Data" },
  { name: "nft_indexer", description: "Index and monitor NFT collections, sales, and floor price movements", github: "clawos/nft-indexer", stars: 98, category: "Indexing" },
  { name: "swap_executor", description: "Execute token swaps across DEXs with slippage protection and MEV guard", github: "clawos/swap-executor", stars: 267, category: "Execution" },
  { name: "chain_listener", description: "Listen to on-chain events with configurable filters and multi-chain support", github: "clawos/chain-listener", stars: 178, category: "Monitoring" },
  { name: "discord_alerts", description: "Discord webhook integration for automated alerts and status updates", github: "clawos/discord-alerts", stars: 134, category: "Notifications" },
  { name: "portfolio_tracker", description: "Track portfolio performance across wallets with P&L calculations", github: "clawos/portfolio-tracker", stars: 201, category: "Tracking" },
  { name: "gas_optimizer", description: "Optimize gas usage with smart batching and timing strategies", github: "clawos/gas-optimizer", stars: 89, category: "Optimization" },
  { name: "data_pipeline", description: "ETL pipeline for blockchain data with custom transformations", github: "clawos/data-pipeline", stars: 167, category: "Data" },
];

const categories = ["All", "Scanning", "Monitoring", "Tracking", "Notifications", "Data", "Execution", "Indexing", "Optimization"];

import { useState } from "react";
import { cn } from "@/lib/utils";

const Registry = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = marketplaceModules.filter((m) => {
    if (activeCategory !== "All" && m.category !== activeCategory) return false;
    if (search && !m.name.includes(search) && !m.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover and install automation modules</p>
      </div>

      {/* Search + Categories */}
      <div className="space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modules..."
          className="w-full max-w-md bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                activeCategory === cat
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod) => (
          <div
            key={mod.name}
            className="bg-card rounded-lg border border-border p-5 hover:border-primary/30 transition-all group flex flex-col"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                <Package className="w-5 h-5 text-primary/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-medium text-foreground">{mod.name}</div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{mod.category}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{mod.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{mod.stars}</span>
                <a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Github className="w-3 h-3" />
                </a>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                <Download className="w-3 h-3" /> Install
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Registry;
