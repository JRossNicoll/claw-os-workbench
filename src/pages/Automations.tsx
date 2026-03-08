import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Plus, ArrowLeft, Clock, Zap, Timer, ChevronDown, MoreHorizontal, Play, CheckCircle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const automations = [
  {
    id: "1",
    name: "Token Scanner",
    description: "Scans for new token launches and filters by volume",
    status: "active" as const,
    trigger: "Every 10 minutes",
    triggerType: "schedule",
    lastRun: "2 min ago",
    runs: 142,
    steps: [
      { id: "s1", name: "Scan tokens", status: "success" as const, duration: "12s" },
      { id: "s2", name: "Filter by volume", status: "success" as const, duration: "4s" },
      { id: "s3", name: "Notify Telegram", status: "success" as const, duration: "1s" },
    ],
    history: [
      { id: "r1", status: "success" as const, time: "2 min ago", duration: "17s" },
      { id: "r2", status: "success" as const, time: "12 min ago", duration: "15s" },
      { id: "r3", status: "success" as const, time: "22 min ago", duration: "19s" },
    ],
    logs: [
      { timestamp: "14:32:01", level: "info" as const, message: "Scanning 1,247 tokens across 3 chains" },
      { timestamp: "14:32:12", level: "info" as const, message: "Found 8 tokens matching criteria" },
      { timestamp: "14:32:16", level: "info" as const, message: "3 tokens passed volume filter (>$50k)" },
      { timestamp: "14:32:17", level: "info" as const, message: "Alert sent to Telegram" },
    ],
  },
  {
    id: "2",
    name: "Telegram Alerts",
    description: "Sends alerts when price spikes are detected",
    status: "active" as const,
    trigger: "Price spike detected",
    triggerType: "event",
    lastRun: "Just now",
    runs: 89,
    steps: [
      { id: "s1", name: "Monitor prices", status: "running" as const },
      { id: "s2", name: "Detect spike", status: "pending" as const },
      { id: "s3", name: "Send alert", status: "pending" as const },
    ],
    history: [],
    logs: [],
  },
  {
    id: "3",
    name: "Wallet Monitor",
    description: "Tracks whale wallet movements and large transfers",
    status: "active" as const,
    trigger: "Every 15 minutes",
    triggerType: "schedule",
    lastRun: "5 min ago",
    runs: 67,
    steps: [
      { id: "s1", name: "Track wallets", status: "success" as const, duration: "8s" },
      { id: "s2", name: "Detect movement", status: "success" as const, duration: "3s" },
      { id: "s3", name: "Alert user", status: "success" as const, duration: "1s" },
    ],
    history: [],
    logs: [],
  },
  {
    id: "4",
    name: "DEX Arbitrage",
    description: "Finds and executes cross-DEX arbitrage opportunities",
    status: "inactive" as const,
    trigger: "Spread > 0.5%",
    triggerType: "event",
    lastRun: "2h ago",
    runs: 34,
    steps: [
      { id: "s1", name: "Fetch prices", status: "pending" as const },
      { id: "s2", name: "Find spread", status: "pending" as const },
      { id: "s3", name: "Execute swap", status: "pending" as const },
    ],
    history: [],
    logs: [],
  },
  {
    id: "5",
    name: "Portfolio Sync",
    description: "Synchronizes portfolio data across all tracked wallets",
    status: "active" as const,
    trigger: "Every hour",
    triggerType: "schedule",
    lastRun: "30 min ago",
    runs: 248,
    steps: [
      { id: "s1", name: "Fetch balances", status: "success" as const, duration: "5s" },
      { id: "s2", name: "Calculate P&L", status: "success" as const, duration: "2s" },
      { id: "s3", name: "Update dashboard", status: "success" as const, duration: "1s" },
    ],
    history: [],
    logs: [],
  },
];

const stepIcons: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  running: Loader2,
  failed: XCircle,
  pending: Clock,
};

const stepColors: Record<string, string> = {
  success: "text-success",
  running: "text-info",
  failed: "text-destructive",
  pending: "text-muted-foreground/40",
};

const levelColors: Record<string, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

const Automations = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"steps" | "history" | "logs">("steps");
  const selected = automations.find((a) => a.id === selectedId);

  if (selected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Back + Header */}
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{selected.name}</h1>
                <StatusIndicator status={selected.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Play className="w-3.5 h-3.5" /> Run now
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {selected.triggerType === "schedule" ? <Timer className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              {selected.trigger}
            </span>
            <span>{selected.runs} runs total</span>
            <span>Last: {selected.lastRun}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {(["steps", "history", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium capitalize transition-colors relative",
                detailTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              {detailTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {detailTab === "steps" && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2"
            >
              {selected.steps.map((step, i) => {
                const Icon = stepIcons[step.status];
                return (
                  <div key={step.id} className="relative">
                    {i < selected.steps.length - 1 && (
                      <div className={cn(
                        "absolute left-[19px] top-[44px] w-px h-[calc(100%-28px)]",
                        step.status === "success" ? "bg-success/20" : "bg-border"
                      )} />
                    )}
                    <div className="flex items-center gap-4 p-4 rounded-xl surface-elevated">
                      <Icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        stepColors[step.status],
                        step.status === "running" && "animate-spin"
                      )} />
                      <span className="text-sm text-foreground flex-1">{step.name}</span>
                      {step.duration && (
                        <span className="text-xs text-muted-foreground">{step.duration}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {detailTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-1"
            >
              {selected.history.length > 0 ? selected.history.map((run) => (
                <div key={run.id} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <StatusIndicator status={run.status} />
                  <span className="text-sm text-foreground flex-1">{run.time}</span>
                  <span className="text-xs text-muted-foreground">{run.duration}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No execution history yet</p>
              )}
            </motion.div>
          )}

          {detailTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {selected.logs.length > 0 ? (
                <div className="bg-terminal-bg rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
                    </div>
                  </div>
                  <div className="p-4 font-mono text-xs space-y-1 max-h-80 overflow-y-auto terminal-scrollbar">
                    {selected.logs.map((log, j) => (
                      <div key={j} className="flex gap-3 leading-6">
                        <span className="text-terminal-dim">{log.timestamp}</span>
                        <span className={cn("w-12", levelColors[log.level])}>[{log.level}]</span>
                        <span className="text-terminal-text">{log.message}</span>
                      </div>
                    ))}
                    <div className="text-muted-foreground mt-1 animate-pulse-soft">▌</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No logs available</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold text-foreground">Automations</h1>
          <p className="text-sm text-muted-foreground mt-1">Your automated workflows</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Automation
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-2"
      >
        {automations.map((auto, i) => (
          <motion.div
            key={auto.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
          >
            <button
              onClick={() => { setSelectedId(auto.id); setDetailTab("steps"); }}
              className="w-full flex items-center gap-4 p-5 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-foreground">{auto.name}</span>
                  <StatusIndicator status={auto.status} />
                </div>
                <p className="text-xs text-muted-foreground">{auto.description}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {auto.triggerType === "schedule" ? <Timer className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    {auto.trigger}
                  </span>
                  <span className="text-[11px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground">{auto.runs} runs</span>
                  <span className="text-[11px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground">Last: {auto.lastRun}</span>
                </div>
              </div>

              {/* Mini step indicators */}
              <div className="flex items-center gap-1 mr-2">
                {auto.steps.map((step) => (
                  <div key={step.id} className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    step.status === "success" && "bg-success",
                    step.status === "running" && "bg-info animate-pulse-soft",
                    step.status === "failed" && "bg-destructive",
                    step.status === "pending" && "bg-muted-foreground/20",
                  )} />
                ))}
              </div>

              <ChevronDown className="w-4 h-4 text-muted-foreground/30 -rotate-90 group-hover:text-muted-foreground transition-colors" />
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Automations;
