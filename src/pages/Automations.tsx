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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkflows, runWorkflow, getWorkflowRuns, ApiError } from "@/lib/api";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

  const { data: workflowsData, isLoading, error } = useQuery({
    queryKey: ["workflows"],
    queryFn: getWorkflows,
  });

  const automations: any[] = Array.isArray(workflowsData) ? workflowsData : [];
  const selected = automations.find((a: any) => a.id === selectedId);

  const { data: runsData } = useQuery({
    queryKey: ["workflow-runs", selectedId],
    queryFn: () => getWorkflowRuns(selectedId!),
    enabled: !!selectedId && detailTab === "history",
  });

  const runMutation = useMutation({
    mutationFn: (id: string) => runWorkflow(id),
    onSuccess: () => {
      toast.success("Automation started");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const toggleStep = (id: string) => setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));

  const runs: any[] = Array.isArray(runsData) ? runsData : [];

  if (selected) {
    const steps = selected.steps || [];
    const logs = selected.logs || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
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
                <StatusIndicator status={selected.status || "inactive"} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => runMutation.mutate(selected.id)}
                disabled={runMutation.isPending}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {runMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {runMutation.isPending ? "Starting..." : "Run now"}
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
              {steps.length > 0 ? (
                <div className="space-y-2">
                  {steps.map((step: any, i: number) => {
                    const Icon = stepIcons[step.status] || Clock;
                    const isExpanded = expandedSteps[step.id];
                    const hasDetails = step.condition || step.retry || step.logs;
                    const isLast = i === steps.length - 1;

                    return (
                      <div key={step.id || i} className="relative">
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
                          <Icon className={cn("w-5 h-5 flex-shrink-0", stepColors[step.status] || "text-muted-foreground", (step.status === "running" || step.status === "retrying") && "animate-spin")} />
                          <div className="flex-1 min-w-0">
                            <span className={cn("text-sm text-foreground", step.skipped && "line-through text-muted-foreground")}>{step.name}</span>
                          </div>
                          {step.duration && <span className="text-xs text-muted-foreground">{step.duration}</span>}
                          {hasDetails && <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground/40 transition-transform", isExpanded && "rotate-90")} />}
                        </button>
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
                  {runs.map((run: any, i: number) => (
                    <div key={run.id || i} className="flex items-center gap-4 p-4 rounded-xl surface-elevated">
                      <div className={cn("w-2 h-2 rounded-full", run.status === "success" ? "bg-success" : run.status === "failed" ? "bg-destructive" : "bg-info")} />
                      <span className="text-sm text-foreground flex-1">{run.status}</span>
                      <span className="text-xs text-muted-foreground">{run.duration || run.time}</span>
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
              {logs.length > 0 ? (
                <div className="bg-terminal-bg rounded-lg border border-border p-4 font-mono text-[11px] space-y-0.5 max-h-60 overflow-y-auto terminal-scrollbar">
                  {logs.map((log: any, j: number) => (
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
            <p className="text-sm text-destructive mb-1">Failed to load automations</p>
            <p className="text-xs text-muted-foreground">{(error as ApiError)?.message || "Check your API connection"}</p>
          </div>
        ) : automations.length > 0 ? (
          <div className="space-y-2">
            {automations.map((auto: any, i: number) => (
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
                      <StatusIndicator status={auto.status || "inactive"} />
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
