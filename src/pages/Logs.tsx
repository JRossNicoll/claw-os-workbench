import { useState } from "react";
import { LogViewer } from "@/components/LogViewer";
import { Filter } from "lucide-react";

const allLogs = [
  { timestamp: "14:32:01", level: "info" as const, message: "[token_scanner] Started execution on worker-01", module: "token_scanner", workflow: "Token Launch Pipeline" },
  { timestamp: "14:31:58", level: "info" as const, message: "[telegram_bot] Notification sent to channel #alerts", module: "telegram_bot", workflow: "Token Launch Pipeline" },
  { timestamp: "14:31:45", level: "error" as const, message: "[dex_monitor] Connection timeout after 30s - retrying (attempt 3/5)", module: "dex_monitor", workflow: "DEX Arbitrage" },
  { timestamp: "14:31:30", level: "warn" as const, message: "[wallet_tracker] Rate limit approaching (85% of 100 req/min)", module: "wallet_tracker", workflow: "Wallet Monitor" },
  { timestamp: "14:31:12", level: "debug" as const, message: "[scheduler] Tick: 3 pending jobs in queue, 2 workers available", module: "system", workflow: "" },
  { timestamp: "14:30:55", level: "info" as const, message: "[price_oracle] TWAP calculation complete: ETH=$3,245.67", module: "price_oracle", workflow: "Token Launch Pipeline" },
  { timestamp: "14:30:42", level: "info" as const, message: "[token_scanner] Found 12 new tokens in last scan", module: "token_scanner", workflow: "Token Launch Pipeline" },
  { timestamp: "14:30:30", level: "error" as const, message: "[nft_indexer] Failed to index collection 0x1234...abcd", module: "nft_indexer", workflow: "" },
  { timestamp: "14:30:15", level: "info" as const, message: "[wallet_tracker] Detected large transfer: 500 ETH from 0xdead...", module: "wallet_tracker", workflow: "Wallet Monitor" },
  { timestamp: "14:30:01", level: "warn" as const, message: "[dex_monitor] Spread below threshold (0.2%), skipping", module: "dex_monitor", workflow: "DEX Arbitrage" },
  { timestamp: "14:29:45", level: "debug" as const, message: "[system] Memory usage: 2.1GB / 4GB (52.5%)", module: "system", workflow: "" },
  { timestamp: "14:29:30", level: "info" as const, message: "[telegram_bot] Connected to Telegram API", module: "telegram_bot", workflow: "" },
];

const modules = ["All", "token_scanner", "telegram_bot", "dex_monitor", "wallet_tracker", "price_oracle", "nft_indexer", "system"];
const levels = ["All", "info", "warn", "error", "debug"];

const Logs = () => {
  const [moduleFilter, setModuleFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");

  const filtered = allLogs.filter((log) => {
    if (moduleFilter !== "All" && !log.module.includes(moduleFilter)) return false;
    if (levelFilter !== "All" && log.level !== levelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Central log explorer with real-time streaming</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          {modules.map((m) => <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>)}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          {levels.map((l) => <option key={l} value={l}>{l === "All" ? "All Levels" : l.toUpperCase()}</option>)}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} entries</span>
      </div>

      <LogViewer logs={filtered} maxHeight="calc(100vh - 240px)" />
    </div>
  );
};

export default Logs;
