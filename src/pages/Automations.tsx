import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import {
  Plus, ArrowLeft, Clock, Zap, Timer, ChevronDown, MoreHorizontal,
  Play, CheckCircle, Loader2, XCircle, GitBranch, RotateCcw,
  SkipForward, ArrowDownRight, ChevronRight, FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface StepCondition {
  expression: string;
  onFalse: "skip_step" | "jump_to_step";
  targetStepOrder?: number;
}

interface RetryPolicy {
  maxRetries: number;
  delaySeconds: number;
}

interface Step {
  id: string;
  name: string;
  order: number;
  status: "success" | "running" | "failed" | "pending" | "skipped" | "retrying";
  duration?: string;
  condition?: StepCondition;
  retry?: RetryPolicy;
  retryAttempt?: number;
  skipped?: boolean;
  logs?: { timestamp: string; level: "info" | "warn" | "error" | "debug"; message: string }[];
}

interface Automation {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  trigger: string;
  triggerType: "schedule" | "event";
  lastRun: string;
  runs: number;
  failureMode?: "stop_on_failure" | "continue_on_failure";
  steps: Step[];
  history: { id: string; status: "success" | "failed" | "running"; time: string; duration: string }[];
  logs: { timestamp: string; level: "info" | "warn" | "error" | "debug"; message: string }[];
}

const automations: Automation[] = [
  {
    id: "1",
    name: "Token Scanner",
    description: "Scans for new token launches and filters by volume",
    status: "active",
    trigger: "Every 10 minutes",
    triggerType: "schedule",
    lastRun: "2 min ago",
    runs: 142,
    failureMode: "stop_on_failure",
    steps: [
      {
        id: "s1", name: "Scan tokens", order: 1, status: "success", duration: "12s",
        retry: { maxRetries: 2, delaySeconds: 5 },
        logs: [
          { timestamp: "14:32:01", level: "info", message: "Scanning 1,247 tokens across 3 chains" },
          { timestamp: "14:32:12", level: "info", message: "Found 8 tokens matching criteria" },
        ],
      },
      {
        id: "s2", name: "Filter by volume", order: 2, status: "success", duration: "4s",
        condition: { expression: "${steps.scan_tokens.output.count} > 0", onFalse: "skip_step" },
        logs: [
          { timestamp: "14:32:13", level: "info", message: "Condition passed: token count = 8" },
          { timestamp: "14:32:16", level: "info", message: "3 tokens passed volume filter (>$50k)" },
        ],
      },
      {
        id: "s3", name: "Check liquidity", order: 3, status: "skipped", skipped: true,
        condition: { expression: "${steps.filter_volume.output.volume} > 1000000", onFalse: "jump_to_step", targetStepOrder: 5 },
      },
      {
        id: "s4", name: "Execute trade", order: 4, status: "skipped", skipped: true,
        retry: { maxRetries: 3, delaySeconds: 10 },
      },
      {
        id: "s5", name: "Notify Telegram", order: 5, status: "success", duration: "1s",
        logs: [
          { timestamp: "14:32:17", level: "info", message: "Alert sent to Telegram #signals" },
        ],
      },
    ],
    history: [
      { id: "r1", status: "success", time: "2 min ago", duration: "17s" },
      { id: "r2", status: "success", time: "12 min ago", duration: "15s" },
      { id: "r3", status: "failed", time: "22 min ago", duration: "19s" },
    ],
    logs: [
      { timestamp: "14:32:01", level: "info", message: "Scanning 1,247 tokens across 3 chains" },
      { timestamp: "14:32:12", level: "info", message: "Found 8 tokens matching criteria" },
      { timestamp: "14:32:13", level: "info", message: "Condition: ${steps.scan_tokens.output.count} > 0 → passed" },
      { timestamp: "14:32:16", level: "info", message: "3 tokens passed volume filter (>$50k)" },
      { timestamp: "14:32:16", level: "warn", message: "Condition: volume > 1M → failed, jumping to step 5" },
      { timestamp: "14:32:17", level: "info", message: "Alert sent to Telegram" },
    ],
  },
  {
    id: "2",
    name: "Telegram Alerts",
    description: "Sends alerts when price spikes are detected",
    status: "active",
    trigger: "Price spike detected",
    triggerType: "event",
    lastRun: "Just now",
    runs: 89,
    steps: [
      { id: "s1", name: "Monitor prices", order: 1, status: "running", retry: { maxRetries: 5, delaySeconds: 3 } },
      { id: "s2", name: "Detect spike", order: 2, status: "pending", condition: { expression: "${steps.monitor_prices.output.change_pct} > 5", onFalse: "skip_step" } },
      { id: "s3", name: "Send alert", order: 3, status: "pending" },
    ],
    history: [],
    logs: [],
  },
  {
    id: "3",
    name: "Wallet Monitor",
    description: "Tracks whale wallet movements and large transfers",
    status: "active",
    trigger: "Every 15 minutes",
    triggerType: "schedule",
    lastRun: "5 min ago",
    runs: 67,
    steps: [
      { id: "s1", name: "Track wallets", order: 1, status: "success", duration: "8s" },
      { id: "s2", name: "Detect movement", order: 2, status: "success", duration: "3s", condition: { expression: "${steps.track_wallets.output.movements} > 0", onFalse: "skip_step" } },
      { id: "s3", name: "Alert user", order: 3, status: "success", duration: "1s" },
    ],
    history: [],
    logs: [],
  },
  {
    id: "4",
    name: "DEX Arbitrage",
    description: "Finds and executes cross-DEX arbitrage opportunities",
    status: "inactive",
    trigger: "Spread > 0.5%",
    triggerType: "event",
    lastRun: "2h ago",
    runs: 34,
    failureMode: "stop_on_failure",
    steps: [
      { id: "s1", name: "Fetch prices", order: 1, status: "success", duration: "5s" },
      { id: "s2", name: "Find spread", order: 2, status: "success", duration: "2s", condition: { expression: "${steps.fetch_prices.output.spread} > 0.5", onFalse: "skip_step" } },
      { id: "s3", name: "Execute swap", order: 3, status: "retrying", retryAttempt: 2, retry: { maxRetries: 3, delaySeconds: 10 } },
      { id: "s4", name: "Log result", order: 4, status: "pending" },
    ],
    history: [],
    logs: [],
  },
  {
    id: "5",
    name: "Portfolio Sync",
    description: "Synchronizes portfolio data across all tracked wallets",
    status: "active",
    trigger: "Every hour",
    triggerType: "schedule",
    lastRun: "30 min ago",
    runs: 248,
    steps: [
      { id: "s1", name: "Fetch balances", order: 1, status: "success", duration: "5s" },
      { id: "s2", name: "Calculate P&L", order: 2, status: "success", duration: "2s" },
      { id: "s3", name: "Update dashboard", order: 3, status: "success", duration: "1s" },
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
  skipped: SkipForward,
  retrying: RotateCcw,
};

const stepColors: Record<string, string> = {
  success: "text-success",
  running: "text-info",
  failed: "text-destructive",
  pending: "text-muted-foreground/40",
  skipped: "text-muted-foreground/50",
  retrying: "text-warning",
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
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const selected = automations.find((a) => a.id === selectedId);

  const toggleStep = (id: string) => setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));

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
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              {selected.triggerType === "schedule" ? <Timer className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              {selected.trigger}
            </span>
            <span>{selected.runs} runs</span>
            <span>Last: {selected.lastRun}</span>
            {selected.failureMode && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {selected.failureMode === "stop_on_failure" ? "Stops on failure" : "Continues on failure"}
              </span>
            )}
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
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
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
                const isExpanded = expandedSteps[step.id];
                const hasDetails = step.condition || step.retry || step.logs;
                const isLast = i === selected.steps.length - 1;

                return (
                  <div key={step.id} className="relative">
                    {/* Connector */}
                    {!isLast && (
                      <div className={cn(
                        "absolute left-[19px] w-px z-0",
                        step.skipped ? "bg-muted-foreground/10 border-l border-dashed border-muted-foreground/20" : (step.status === "success" ? "bg-success/15" : "bg-border"),
                        isExpanded ? "top-[44px] h-[calc(100%-28px)]" : "top-[44px] h-[calc(100%-28px)]"
                      )} />
                    )}

                    {/* Step card */}
                    <button
                      onClick={() => hasDetails && toggleStep(step.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl surface-elevated transition-all text-left",
                        step.skipped && "opacity-50",
                        hasDetails && "cursor-pointer hover:border-primary/15"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        stepColors[step.status],
                        step.status === "running" && "animate-spin",
                        step.status === "retrying" && "animate-spin",
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm text-foreground", step.skipped && "line-through text-muted-foreground")}>{step.name}</span>
                          {step.skipped && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">skipped</span>}
                          {step.status === "retrying" && step.retryAttempt && (
                            <span className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <RotateCcw className="w-2.5 h-2.5" /> retry {step.retryAttempt}/{step.retry?.maxRetries}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {step.condition && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <GitBranch className="w-2.5 h-2.5" /> Conditional
                            </span>
                          )}
                          {step.retry && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <RotateCcw className="w-2.5 h-2.5" /> {step.retry.maxRetries} retries
                            </span>
                          )}
                        </div>
                      </div>
                      {step.duration && <span className="text-xs text-muted-foreground">{step.duration}</span>}
                      {hasDetails && (
                        <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground/40 transition-transform", isExpanded && "rotate-90")} />
                      )}
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-[38px] mt-1 space-y-2 pb-1">
                            {/* Condition info */}
                            {step.condition && (
                              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                  <GitBranch className="w-3 h-3" /> Condition
                                </div>
                                <code className="text-[11px] font-mono text-foreground/80 bg-background px-2 py-1 rounded block">
                                  {step.condition.expression}
                                </code>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                  {step.condition.onFalse === "skip_step" ? (
                                    <><SkipForward className="w-3 h-3" /> If false: skip this step</>
                                  ) : (
                                    <><ArrowDownRight className="w-3 h-3" /> If false: jump to step {step.condition.targetStepOrder}</>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Retry policy */}
                            {step.retry && (
                              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                  <RotateCcw className="w-3 h-3" /> Retry Policy
                                </div>
                                <div className="text-[11px] text-foreground/80">
                                  Up to {step.retry.maxRetries} retries · {step.retry.delaySeconds}s delay between attempts
                                </div>
                              </div>
                            )}

                            {/* Step logs */}
                            {step.logs && step.logs.length > 0 && (
                              <div className="bg-terminal-bg rounded-lg border border-border overflow-hidden">
                                <div className="p-3 font-mono text-[11px] space-y-0.5 max-h-40 overflow-y-auto terminal-scrollbar">
                                  {step.logs.map((log, j) => (
                                    <div key={j} className="flex gap-2 leading-5">
                                      <span className="text-terminal-dim">{log.timestamp}</span>
                                      <span className={cn("w-12", levelColors[log.level])}>[{log.level}]</span>
                                      <span className="text-terminal-text">{log.message}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {detailTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-1">
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
            <motion.div key="logs" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/templates")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
          >
            <FileCode className="w-4 h-4" /> Templates
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New Automation
          </button>
        </div>
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
              onClick={() => { setSelectedId(auto.id); setDetailTab("steps"); setExpandedSteps({}); }}
              className="w-full flex items-center gap-4 p-5 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-foreground">{auto.name}</span>
                  <StatusIndicator status={auto.status} />
                </div>
                <p className="text-xs text-muted-foreground">{auto.description}</p>
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {auto.triggerType === "schedule" ? <Timer className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    {auto.trigger}
                  </span>
                  <span className="text-[11px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground">{auto.runs} runs</span>
                  <span className="text-[11px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground">Last: {auto.lastRun}</span>
                  {auto.steps.some(s => s.condition) && (
                    <>
                      <span className="text-[11px] text-muted-foreground/50">·</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <GitBranch className="w-2.5 h-2.5" /> Branching
                      </span>
                    </>
                  )}
                  {auto.steps.some(s => s.retry) && (
                    <>
                      <span className="text-[11px] text-muted-foreground/50">·</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <RotateCcw className="w-2.5 h-2.5" /> Retries
                      </span>
                    </>
                  )}
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
                    step.status === "skipped" && "bg-muted-foreground/15",
                    step.status === "retrying" && "bg-warning animate-pulse-soft",
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
