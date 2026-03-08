import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import {
  Plus, ArrowLeft, Clock, Zap, Timer, ChevronDown, MoreHorizontal,
  Play, CheckCircle, Loader2, XCircle, GitBranch, RotateCcw,
  SkipForward, ArrowDownRight, ChevronRight, FileCode, Layers,
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

const automations: Automation[] = [];

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
              {selected.steps.length > 0 ? (
                <div className="space-y-2">
                  {selected.steps.map((step, i) => {
                    const Icon = stepIcons[step.status];
                    const isExpanded = expandedSteps[step.id];
                    const hasDetails = step.condition || step.retry || step.logs;
                    const isLast = i === selected.steps.length - 1;

                    return (
                      <div key={step.id} className="relative">
                        {!isLast && (
                          <div className={cn(
                            "absolute left-[19px] w-px z-0 top-[44px] h-[calc(100%-28px)]",
                            step.skipped ? "bg-muted-foreground/10" : (step.status === "success" ? "bg-success/15" : "bg-border"),
                          )} />
                        )}
                        <button
                          onClick={() => hasDetails && toggleStep(step.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl surface-elevated transition-all text-left",
                            step.skipped && "opacity-50",
                            hasDetails && "cursor-pointer hover:border-primary/15"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 flex-shrink-0", stepColors[step.status], (step.status === "running" || step.status === "retrying") && "animate-spin")} />
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
                              {step.condition && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><GitBranch className="w-2.5 h-2.5" /> Conditional</span>}
                              {step.retry && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" /> {step.retry.maxRetries} retries</span>}
                            </div>
                          </div>
                          {step.duration && <span className="text-xs text-muted-foreground">{step.duration}</span>}
                          {hasDetails && <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground/40 transition-transform", isExpanded && "rotate-90")} />}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="ml-[38px] mt-1 space-y-2 pb-1">
                                {step.condition && (
                                  <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider"><GitBranch className="w-3 h-3" /> Condition</div>
                                    <code className="text-[11px] font-mono text-foreground/80 bg-background px-2 py-1 rounded block">{step.condition.expression}</code>
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                      {step.condition.onFalse === "skip_step" ? <><SkipForward className="w-3 h-3" /> If false: skip this step</> : <><ArrowDownRight className="w-3 h-3" /> If false: jump to step {step.condition.targetStepOrder}</>}
                                    </div>
                                  </div>
                                )}
                                {step.retry && (
                                  <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider"><RotateCcw className="w-3 h-3" /> Retry Policy</div>
                                    <div className="text-[11px] text-foreground/80">Up to {step.retry.maxRetries} retries · {step.retry.delaySeconds}s delay</div>
                                  </div>
                                )}
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
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No steps configured</p>
              )}
            </motion.div>
          )}

          {detailTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              <p className="text-sm text-muted-foreground py-8 text-center">No execution history yet</p>
            </motion.div>
          )}

          {detailTab === "logs" && (
            <motion.div key="logs" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              <p className="text-sm text-muted-foreground py-8 text-center">No logs available</p>
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
      >
        {automations.length > 0 ? (
          <div className="space-y-2">
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
            <p className="text-xs text-muted-foreground/60 mb-5">Create one from scratch or start with a template</p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> New Automation
              </button>
              <button
                onClick={() => navigate("/templates")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
              >
                <FileCode className="w-4 h-4" /> Browse Templates
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Automations;
