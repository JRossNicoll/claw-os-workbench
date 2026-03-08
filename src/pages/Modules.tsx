import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, Github, MoreVertical, Plus, Download } from "lucide-react";

const installedModules = [
  { name: "token_scanner", status: "active" as const, image: "clawos/scanner:latest", cpu: "250m", memory: "256Mi", version: "1.4.2" },
  { name: "telegram_bot", status: "active" as const, image: "clawos/telegram:latest", cpu: "100m", memory: "128Mi", version: "2.1.0" },
  { name: "dex_monitor", status: "inactive" as const, image: "clawos/dex:latest", cpu: "500m", memory: "512Mi", version: "0.9.8" },
  { name: "wallet_tracker", status: "active" as const, image: "clawos/wallet:latest", cpu: "200m", memory: "256Mi", version: "1.2.1" },
  { name: "price_oracle", status: "active" as const, image: "clawos/oracle:latest", cpu: "150m", memory: "128Mi", version: "3.0.0" },
  { name: "nft_indexer", status: "inactive" as const, image: "clawos/nft:latest", cpu: "300m", memory: "384Mi", version: "0.5.3" },
];

const Modules = () => {
  const [showInstall, setShowInstall] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Modules</h1>
          <p className="text-sm text-muted-foreground mt-1">Install and manage automation modules</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstall(!showInstall)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Install Module
          </button>
        </div>
      </div>

      {showInstall && (
        <div className="bg-card rounded-lg border border-border p-5 animate-slide-in space-y-4">
          <h3 className="text-sm font-medium text-foreground">Install Module</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">From Registry</label>
              <div className="flex gap-2">
                <input placeholder="Search registry..." className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <button className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">From GitHub</label>
              <div className="flex gap-2">
                <input placeholder="owner/repo" className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary font-mono" />
                <button className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors">
                  <Github className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installedModules.map((mod) => (
          <div key={mod.name} className="bg-card rounded-lg border border-border p-5 hover:border-primary/30 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground font-mono">{mod.name}</div>
                  <div className="text-xs text-muted-foreground">v{mod.version}</div>
                </div>
              </div>
              <button className="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <StatusBadge status={mod.status} />
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Image</span>
                <span className="font-mono text-foreground">{mod.image}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">CPU</span>
                <span className="font-mono text-foreground">{mod.cpu}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Memory</span>
                <span className="font-mono text-foreground">{mod.memory}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
