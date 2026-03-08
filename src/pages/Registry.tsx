import { Github, Download, ExternalLink } from "lucide-react";

const registryModules = [
  { name: "token_scanner", description: "Scan and analyze new token launches across multiple chains", github: "clawos/token-scanner", stars: 234 },
  { name: "telegram_bot", description: "Telegram notification bot with custom alert templates", github: "clawos/telegram-bot", stars: 189 },
  { name: "dex_monitor", description: "Real-time DEX price and liquidity monitoring", github: "clawos/dex-monitor", stars: 156 },
  { name: "wallet_tracker", description: "Track wallet movements and transaction patterns", github: "clawos/wallet-tracker", stars: 312 },
  { name: "price_oracle", description: "Multi-source price aggregation with TWAP support", github: "clawos/price-oracle", stars: 445 },
  { name: "nft_indexer", description: "Index and monitor NFT collections and sales", github: "clawos/nft-indexer", stars: 98 },
  { name: "swap_executor", description: "Execute token swaps with slippage protection", github: "clawos/swap-executor", stars: 267 },
  { name: "chain_listener", description: "Listen to on-chain events with configurable filters", github: "clawos/chain-listener", stars: 178 },
];

const Registry = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and install modules from the ClawOS registry</p>
      </div>

      <div className="flex gap-3">
        <input
          placeholder="Search modules..."
          className="flex-1 max-w-md bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {registryModules.map((mod) => (
          <div key={mod.name} className="bg-card rounded-lg border border-border p-5 hover:border-primary/30 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-medium text-foreground">{mod.name}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.description}</p>
              </div>
              <button className="flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                <Download className="w-3 h-3" /> Install
              </button>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Github className="w-3 h-3" /> {mod.github}
              </a>
              <span>⭐ {mod.stars}</span>
              <a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto">
                <ExternalLink className="w-3 h-3" /> Docs
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Registry;
