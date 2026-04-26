import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { X, Play, Loader2, CheckCircle2, XCircle, Clock, GitBranch, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRuns, useRunAutomation } from "@/hooks/use-runs";
import { useStepRuns } from "@/hooks/use-step-runs";
import { timeAgo } from "@/hooks/use-activity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  automationId: string;
  automationName: string;
  stepsCount: number;
  initialTab?: "live" | "history";
  onClose: () => void;
}

const statusIcon = (s: string) =>
  s === "success" ? CheckCircle2 :
  s === "failed" ? XCircle :
  s === "running" ? Loader2 :
  Clock;

const statusColor = (s: string) =>
  s === "success" ? "text-success" :
  s === "failed" ? "text-destructive" :
  s === "running" ? "text-info" :
  "text-muted-foreground";

const levelColor: Record<string, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

export function ExecutionDrawer({ automationId, automationName, stepsCount, initialTab = "live", onClose }: Props) {
  const navigate = useNavigate();
  const { data: runs = [] } = useRuns(automationId);
  const runMutation = useRunAutomation();
  const activeRun = runs[0]; // most recent
  const { data: stepRuns = [] } = useStepRuns(activeRun?.id);
  const logsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal as logs stream in
  const logs = useMemo(() => activeRun?.logs ?? [], [activeRun]);
  useEffect(() => {
    const el = logsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs.length, stepRuns.length]);

  const handleRunNow = () => {
    runMutation.mutate(
      { id: automationId, name: automationName, stepsCount },
      { onSuccess: () => toast.success("Execution started") }
    );
  };

  const isRunning = activeRun?.status === "running" || activeRun?.status === "queued";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] bg-card border-l border-border z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 text-info animate-spin flex-shrink-0" />
            ) : (
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{automationName}</div>
              <div className="text-[10px] text-muted-foreground">
                {isRunning ? "Streaming live execution" : `${runs.length} historical run${runs.length === 1 ? "" : "s"}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRunNow}
              disabled={runMutation.isPending}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {runMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              Run now
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active run summary */}
        {activeRun ? (
          <div className="px-5 py-3 border-b border-border flex-shrink-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => { const I = statusIcon(activeRun.status); return <I className={cn("w-3.5 h-3.5", statusColor(activeRun.status), activeRun.status === "running" && "animate-spin")} />; })()}
                <span className={cn("text-xs font-medium capitalize", statusColor(activeRun.status))}>{activeRun.status}</span>
                <span className="text-[10px] text-muted-foreground/60">· {timeAgo(activeRun.started_at)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {activeRun.steps_completed}/{activeRun.steps} steps {activeRun.duration ? `· ${activeRun.duration}` : ""}
              </span>
            </div>
            {/* progress bar */}
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn(
                  "h-full",
                  activeRun.status === "failed" ? "bg-destructive" :
                  activeRun.status === "success" ? "bg-success" : "bg-info"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${activeRun.steps ? (activeRun.steps_completed / activeRun.steps) * 100 : 0}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {/* Step pipeline */}
            {stepRuns.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {stepRuns.map((sr) => {
                  const I = statusIcon(sr.status);
                  return (
                    <div
                      key={sr.id}
                      title={`${sr.name} · ${sr.status}${sr.duration_ms ? ` · ${sr.duration_ms}ms` : ""}`}
                      className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-border bg-background/40",
                        statusColor(sr.status)
                      )}
                    >
                      <I className={cn("w-2.5 h-2.5", sr.status === "running" && "animate-spin")} />
                      <span className="text-foreground truncate max-w-[120px]">{sr.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-6 border-b border-border text-center">
            <p className="text-xs text-muted-foreground">No runs yet. Click Run now to execute.</p>
          </div>
        )}

        {/* Live terminal logs */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between px-5 py-2 border-b border-border flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Live Logs {isRunning && <span className="ml-1.5 text-info">●</span>}
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-mono">{logs.length} lines</span>
          </div>
          <div
            ref={logsRef}
            className="flex-1 overflow-y-auto bg-terminal-bg font-mono text-[11px] p-3 terminal-scrollbar"
          >
            {logs.length === 0 ? (
              <div className="text-terminal-dim italic">// awaiting log stream…</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2 leading-5">
                  <span className="text-terminal-dim flex-shrink-0">{log.timestamp}</span>
                  <span className={cn("flex-shrink-0 w-12", levelColor[log.level] || "text-muted-foreground")}>
                    [{log.level}]
                  </span>
                  <span className="text-terminal-text break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History footer */}
        {runs.length > 1 && (
          <div className="border-t border-border px-5 py-3 flex-shrink-0 max-h-48 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Recent runs
            </div>
            <div className="space-y-1">
              {runs.slice(1, 6).map((r) => {
                const I = statusIcon(r.status);
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/runs?run=${r.id}`)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-muted transition-colors"
                  >
                    <I className={cn("w-3 h-3", statusColor(r.status))} />
                    <span className="text-[11px] text-foreground capitalize flex-1">{r.status}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{r.duration || "—"}</span>
                    <span className="text-[10px] text-muted-foreground/50">{timeAgo(r.started_at)}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/40" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
