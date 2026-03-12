import { useState } from "react";
import {
  Play, CheckCircle, XCircle, Clock, Loader2, ArrowLeft,
  ChevronRight, Ban, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getRuns, type Run } from "@/lib/store";

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  running: { icon: Loader2, color: "text-info", bg: "bg-info/10" },
  queued: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  cancelled: { icon: Ban, color: "text-muted-foreground", bg: "bg-muted" },
};

const levelColors: Record<string, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

const Runs = () => {
  const [runs] = useState(getRuns);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const selected = runs.find((r) => r.id === selectedId);

  const filtered = filter === "all" ? runs : runs.filter((r) => r.status === filter);

  if (selected) {
    const sc = statusConfig[selected.status] || statusConfig.queued;
    const Icon = sc.icon;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5">
            <ArrowLeft className="w-3 h-3" /> All Runs
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-foreground">{selected.automationName}</h1>
                <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium", sc.bg, sc.color)}>
                  <Icon className={cn("w-3 h-3", selected.status === "running" && "animate-spin")} />
                  {selected.status}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                <span>Run {selected.id}</span>
                <span className="text-border">·</span>
                <span>Trigger: {selected.trigger}</span>
                <span className="text-border">·</span>
                <span>Started {selected.startedAt}</span>
                <span className="text-border">·</span>
                <span>Duration: {selected.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="surface-elevated rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Progress</span>
            <span className="text-xs font-mono text-foreground">{selected.stepsCompleted}/{selected.steps} steps</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", selected.status === "failed" ? "bg-destructive" : selected.status === "running" ? "bg-info" : "bg-success")}
              style={{ width: `${selected.steps > 0 ? (selected.stepsCompleted / selected.steps) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Logs */}
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Execution Log</h3>
          <div className="bg-terminal-bg rounded-lg border border-border p-4 font-mono text-[11px] leading-relaxed space-y-0.5 max-h-72 overflow-y-auto terminal-scrollbar">
            {selected.logs.length > 0 ? (
              selected.logs.map((log, i) => (
                <div key={i} className="flex gap-2 leading-5">
                  <span className="text-terminal-dim">{log.timestamp}</span>
                  <span className={cn("w-12", levelColors[log.level] || "text-muted-foreground")}>[{log.level}]</span>
                  <span className="text-terminal-text">{log.message}</span>
                </div>
              ))
            ) : (
              <span className="text-terminal-dim">Waiting for execution to start...</span>
            )}
          </div>
        </div>
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
          <h1 className="text-lg font-semibold text-foreground">Runs</h1>
          <p className="text-sm text-muted-foreground mt-1">Execution history across all automations</p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-info/10 text-info font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            {runs.filter((r) => r.status === "running").length} running
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.03 }}
        className="flex gap-1.5"
      >
        {["all", "running", "success", "failed", "queued"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors",
              filter === f ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        className="space-y-1.5"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
            <Layers className="w-8 h-8 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No runs found</p>
          </div>
        ) : (
          filtered.map((run, i) => {
            const sc = statusConfig[run.status] || statusConfig.queued;
            const Icon = sc.icon;
            return (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.06 + i * 0.02 }}
              >
                <button
                  onClick={() => setSelectedId(run.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", sc.bg)}>
                    <Icon className={cn("w-4 h-4", sc.color, run.status === "running" && "animate-spin")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-medium text-foreground">{run.automationName}</span>
                      {run.agentName && (
                        <span className="text-[10px] text-primary bg-primary/8 px-1.5 py-0.5 rounded">{run.agentName}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{run.trigger}</span>
                      <span className="text-border">·</span>
                      <span>{run.stepsCompleted}/{run.steps} steps</span>
                      <span className="text-border">·</span>
                      <span>{run.startedAt}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{run.duration}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                </button>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};

export default Runs;
