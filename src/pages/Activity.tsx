import { StatusIndicator } from "@/components/StatusIndicator";
import { Play, Bell, Zap, Package, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const activityItems = [
  { id: "1", icon: Play, message: "Token Scanner completed successfully", detail: "Found 8 new tokens, 3 passed filters", time: "2 min ago", status: "success" as const },
  { id: "2", icon: Bell, message: "Telegram alert sent to #signals", detail: "3 tokens above $50k volume threshold", time: "3 min ago", status: "success" as const },
  { id: "3", icon: Zap, message: "Wallet Monitor triggered", detail: "Detected 500 ETH transfer from whale wallet", time: "5 min ago", status: "success" as const },
  { id: "4", icon: Play, message: "DEX Arbitrage failed", detail: "Insufficient liquidity for ETH/USDC swap", time: "1h ago", status: "failed" as const },
  { id: "5", icon: Play, message: "Token Scanner completed successfully", detail: "Found 12 new tokens, 5 passed filters", time: "12 min ago", status: "success" as const },
  { id: "6", icon: Package, message: "Wallet Tracker tool updated", detail: "Updated from v1.2.0 to v1.2.1", time: "2h ago", status: "success" as const },
  { id: "7", icon: Bell, message: "Discord alert sent", detail: "Portfolio daily summary delivered", time: "3h ago", status: "success" as const },
  { id: "8", icon: Play, message: "Portfolio Sync completed", detail: "Synced 5 wallets, calculated P&L", time: "3h ago", status: "success" as const },
  { id: "9", icon: Zap, message: "Price spike detected", detail: "ETH up 4.2% in 15 minutes", time: "4h ago", status: "success" as const },
  { id: "10", icon: Play, message: "Chain Listener started", detail: "Monitoring 3 chains for new events", time: "5h ago", status: "success" as const },
];

const Activity = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Timeline of system events</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative"
      >
        {/* Timeline line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" />

        <div className="space-y-1">
          {activityItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
              className="relative flex gap-4 px-3 py-3.5 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <div className={cn(
                "w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 z-10",
                item.status === "success" ? "bg-success/8" : "bg-destructive/8"
              )}>
                <item.icon className={cn(
                  "w-4 h-4",
                  item.status === "success" ? "text-success/70" : "text-destructive/70"
                )} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{item.message}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
              <span className="text-[11px] text-muted-foreground pt-1.5 flex-shrink-0">{item.time}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors pt-1.5 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Activity;
