import { useState } from "react";
import { Filter, Terminal, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const allLogs = [
  { timestamp: "14:32:01.234", level: "info" as const, message: "token_scanner → Started execution on worker-01", module: "token_scanner" },
  { timestamp: "14:31:58.891", level: "info" as const, message: "telegram_bot → Notification sent to #alerts", module: "telegram_bot" },
  { timestamp: "14:31:45.102", level: "error" as const, message: "dex_monitor → Connection timeout after 30s — retrying (3/5)", module: "dex_monitor" },
  { timestamp: "14:31:30.445", level: "warn" as const, message: "wallet_tracker → Rate limit 85% of 100 req/min", module: "wallet_tracker" },
  { timestamp: "14:31:12.667", level: "debug" as const, message: "scheduler → tick: 3 pending, 2 workers idle", module: "system" },
  { timestamp: "14:30:55.112", level: "info" as const, message: "price_oracle → TWAP complete: ETH=$3,245.67", module: "price_oracle" },
  { timestamp: "14:30:42.998", level: "info" as const, message: "token_scanner → Found 12 new tokens", module: "token_scanner" },
  { timestamp: "14:30:30.776", level: "error" as const, message: "nft_indexer → Failed to index 0x1234…abcd", module: "nft_indexer" },
  { timestamp: "14:30:15.334", level: "info" as const, message: "wallet_tracker → Large transfer: 500 ETH from 0xdead…", module: "wallet_tracker" },
  { timestamp: "14:30:01.223", level: "warn" as const, message: "dex_monitor → Spread 0.2% below threshold, skip", module: "dex_monitor" },
  { timestamp: "14:29:45.001", level: "debug" as const, message: "system → Memory: 2.1GB/4GB (52.5%)", module: "system" },
  { timestamp: "14:29:30.889", level: "info" as const, message: "telegram_bot → Connected to Telegram API", module: "telegram_bot" },
  { timestamp: "14:29:15.445", level: "info" as const, message: "token_scanner → Initializing chain connectors...", module: "token_scanner" },
  { timestamp: "14:29:00.112", level: "debug" as const, message: "system → GC cycle completed in 12ms", module: "system" },
];

const modules = ["All", "token_scanner", "telegram_bot", "dex_monitor", "wallet_tracker", "price_oracle", "nft_indexer", "system"];
const levels = ["All", "info", "warn", "error", "debug"];

const levelColors: Record<string, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

const levelDotColors: Record<string, string> = {
  info: "bg-info",
  warn: "bg-warning",
  error: "bg-destructive",
  debug: "bg-muted-foreground/50",
};

const Logs = () => {
  const [moduleFilter, setModuleFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");

  const filtered = allLogs.filter((log) => {
    if (moduleFilter !== "All" && log.module !== moduleFilter) return false;
    if (levelFilter !== "All" && log.level !== levelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Logs</h1>
            <p className="text-xs text-muted-foreground">Live system output</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Circle className="w-2 h-2 fill-success text-success animate-pulse-glow" />
          <span>Streaming</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-muted border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
        >
          {modules.map((m) => <option key={m} value={m}>{m === "All" ? "all modules" : m}</option>)}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="bg-muted border border-border rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
        >
          {levels.map((l) => <option key={l} value={l}>{l === "All" ? "all levels" : l}</option>)}
        </select>
        <span className="text-[11px] text-muted-foreground ml-auto font-mono">{filtered.length} entries</span>
      </div>

      {/* Terminal */}
      <div className="flex-1 bg-terminal-bg rounded-lg border border-border overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono ml-2">clawos://logs</span>
        </div>
        <div className="flex-1 overflow-y-auto terminal-scrollbar p-4 font-mono text-xs space-y-px">
          {filtered.map((log, i) => (
            <div key={i} className="flex gap-2 leading-6 hover:bg-foreground/[0.02] rounded px-1 -mx-1 group">
              <span className={cn("w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0", levelDotColors[log.level])} />
              <span className="text-terminal-dim flex-shrink-0 tabular-nums">{log.timestamp}</span>
              <span className={cn("flex-shrink-0 w-14 uppercase", levelColors[log.level])}>{log.level}</span>
              <span className="text-terminal-text">{log.message}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <span className="animate-pulse">▌</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
