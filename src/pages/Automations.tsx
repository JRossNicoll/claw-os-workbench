import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import {
  Plus, ArrowLeft, Clock, Zap, ChevronDown, MoreHorizontal,
  Play, CheckCircle, Loader2, XCircle, GitBranch, RotateCcw,
  SkipForward, ChevronRight, FileCode, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAutomations } from "@/hooks/use-automations";
import { useRuns, useRunAutomation } from "@/hooks/use-runs";
import { timeAgo } from "@/hooks/use-activity";
import { toast } from "sonner";
import { AutomationBuilder } from "@/components/AutomationBuilder";

const stepIcons: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  running: Loader2,
  failed: XCircle,
  pending: Clock,
  skipped: SkipForward,
};

const stepColors: Record<string, string> = {
  success: "text-success",
  running: "text-info",
  failed: "text-destructive",
  pending: "text-muted-foreground/40",
  skipped: "text-muted-foreground/50",
};

const levelColors: Record<string, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

const Automations = () => {
  const { data: automations = [], isLoading } = useAutomations();
  const runMutation = useRunAutomation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"steps" | "history" | "logs">("steps");
  const [showBuilder, setShowBuilder] = useState(false);
  const navigate = useNavigate();

  const selected = automations.find((a) => a.id === selectedId);
  const { data: runs = [] } = useRuns(selectedId || undefined);

  const handleRun = (id: string) => {
    const auto = automations.find((a) => a.id === id);
    if (!auto) return;
    runMutation.mutate(
      { id: auto.id, name: auto.name, stepsCount: auto.steps.length },
      { onSuccess: () => toast.success("Automation started") }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selected) {
    const steps = selected.steps || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{selected.name}</h1>
                <StatusIndicator status={selected.status || "inactive"} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                <span>Trigger: {selected.trigger}</span>
                <span className="text-border">·</span>
                <span>{selected.totalRuns} total runs</span>
                {selected.lastRun && (
                  <>
                    <span className="text-border">·</span>
                    <span>Last: {selected.lastRun}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRun(selected.id)}
                disabled={runMutation.isPending}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {runMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {runMutation.isPending ? "Running..." : "Run now"}
              </button>
            </div>
          </div>
        </div>

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

        <AnimatePresence mode="wait">
          {detailTab === "steps" && (
            <motion.div key="steps" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              {steps.length > 0 ? (
                <div className="space-y-2">
                  {steps.map((step, i) => {
                    const Icon = stepIcons[step.status] || Clock;
                    const isLast = i === steps.length - 1;
                    return (
                      <div key={step.id || i} className="relative">
                        {!isLast && (
                          <div className={cn("absolute left-[19px] w-px z-0 top-[44px] h-[calc(100%-28px)]", step.status === "success" ? "bg-success/15" : "bg-border")} />
                        )}
                        <div className="w-full flex items-center gap-4 p-4 rounded-xl surface-elevated">
                          <Icon className={cn("w-5 h-5 flex-shrink-0", stepColors[step.status] || "text-muted-foreground", step.status === "running" && "animate-spin")} />
                          <span className={cn("text-sm text-foreground flex-1", step.status === "skipped" && "line-through text-muted-foreground")}>{step.name}</span>
                          {step.duration && <span className="text-xs text-muted-foreground">{step.duration}</span>}
                          {step.condition && <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded"><GitBranch className="w-2.5 h-2.5 inline mr-1" />Conditional</span>}
                          {step.retry && <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded"><RotateCcw className="w-2.5 h-2.5 inline mr-1" />{step.retry.maxRetries} retries</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No steps configured</p>
              )}
            </motion.div>
          )}

          {detailTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              {runs.length > 0 ? (
               <div className="space-y-2">
                  {runs.map((run) => (
                    <div key={run.id} className="flex items-center gap-4 p-4 rounded-xl surface-elevated cursor-pointer hover:border-primary/15 transition-all" onClick={() => navigate("/runs")}>
                      <div className={cn("w-2 h-2 rounded-full", run.status === "success" ? "bg-success" : run.status === "failed" ? "bg-destructive" : "bg-info")} />
                      <span className="text-sm text-foreground flex-1 capitalize">{run.status}</span>
                      <span className="text-xs text-muted-foreground">{run.duration || "—"}</span>
                      <span className="text-[10px] text-muted-foreground/40">{timeAgo(run.started_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No execution history yet</p>
              )}
            </motion.div>
          )}

          {detailTab === "logs" && (
            <motion.div key="logs" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              {runs.length > 0 && runs[0].logs.length > 0 ? (
                <div className="bg-terminal-bg rounded-lg border border-border p-4 font-mono text-[11px] space-y-0.5 max-h-60 overflow-y-auto terminal-scrollbar">
                  {runs[0].logs.map((log, j) => (
                    <div key={j} className="flex gap-2 leading-5">
                      <span className="text-terminal-dim">{log.timestamp}</span>
                      <span className={cn("w-12", levelColors[log.level] || "text-muted-foreground")}>[{log.level}]</span>
                      <span className="text-terminal-text">{log.message}</span>
                    </div>
                  ))}
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Automations</h1>
          <p className="text-sm text-muted-foreground mt-1">Your automated workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/templates")} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors">
            <FileCode className="w-4 h-4" /> Templates
          </button>
          <button onClick={() => setShowBuilder(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New Automation
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showBuilder && <AutomationBuilder onClose={() => setShowBuilder(false)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        {automations.length > 0 ? (
          <div className="space-y-2">
            {automations.map((auto, i) => (
              <motion.div key={auto.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}>
                <button
                  onClick={() => { setSelectedId(auto.id); setDetailTab("steps"); }}
                  className="w-full flex items-center gap-4 p-5 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-foreground">{auto.name}</span>
                      <StatusIndicator status={auto.status || "inactive"} />
                    </div>
                    <p className="text-xs text-muted-foreground">{auto.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <div className="text-[10px] text-muted-foreground">{auto.trigger}</div>
                    <div className="text-[10px] text-muted-foreground/50">{auto.totalRuns} runs</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground/30 -rotate-90 group-hover:text-muted-foreground transition-colors" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
            <Layers className="w-10 h-10 text-muted-foreground/25 mb-4" />
            <p className="text-sm text-muted-foreground mb-1">No automations yet</p>
            <p className="text-xs text-muted-foreground/60 mb-5">Create one or start with a template</p>
            <button onClick={() => navigate("/templates")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors">
              <FileCode className="w-4 h-4" /> Browse Templates
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Automations;
