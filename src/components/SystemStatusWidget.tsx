import { motion } from "framer-motion";
import {
  Activity, Cpu, ListOrdered, CheckCircle2, XCircle, Loader2, Clock,
  RefreshCw, AlertOctagon, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRuns } from "@/hooks/use-runs";
import { timeAgo } from "@/hooks/use-activity";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type Health = "operational" | "degraded" | "idle" | "down";

// Threshold (minutes) after the last heartbeat where workers are considered DOWN
const DOWN_THRESHOLD_MIN = 30;
// Window for breakdown / failure-rate calculations
const RECENT_WINDOW = 20;

const REFRESH_OPTIONS = [
  { label: "Live", ms: 0 },
  { label: "10s", ms: 10_000 },
  { label: "30s", ms: 30_000 },
  { label: "1m", ms: 60_000 },
  { label: "Off", ms: -1 },
] as const;

const PREFS_KEY = "clawos-system-status-prefs-v1";

export function SystemStatusWidget() {
  const { data: runs = [], refetch, isFetching } = useRuns();
  const qc = useQueryClient();

  const [prefs, setPrefs] = useState<{ intervalMs: number }>(() => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "") || { intervalMs: 30_000 }; }
    catch { return { intervalMs: 30_000 }; }
  });
  useEffect(() => { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }, [prefs]);

  // Tick clock so "time since heartbeat" stays fresh — independent of data refetch
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  // Optional polling on top of the realtime subscription (off / Live / interval)
  useEffect(() => {
    if (prefs.intervalMs <= 0) return; // Live (-realtime only) or Off
    const t = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["runs"] });
    }, prefs.intervalMs);
    return () => clearInterval(t);
  }, [prefs.intervalMs, qc]);

  const handleRefresh = () => refetch();

  // ---- Derived metrics ----
  const queued = runs.filter((r) => r.status === "queued").length;
  const running = runs.filter((r) => r.status === "running").length;
  const queueLength = queued + running;

  const lastStart = runs.reduce<number>((acc, r) => {
    const t = new Date(r.started_at).getTime();
    return t > acc ? t : acc;
  }, 0);
  const minutesSinceLast = lastStart ? (now - lastStart) / 60_000 : Infinity;

  const recent = useMemo(() => runs.slice(0, RECENT_WINDOW), [runs]);
  const breakdown = useMemo(() => ({
    success: recent.filter((r) => r.status === "success").length,
    failed: recent.filter((r) => r.status === "failed").length,
    running: recent.filter((r) => r.status === "running").length,
    queued: recent.filter((r) => r.status === "queued").length,
    cancelled: recent.filter((r) => r.status === "cancelled").length,
  }), [recent]);
  const failureRate = recent.length ? breakdown.failed / recent.length : 0;

  // ---- Health classification ----
  let health: Health = "operational";
  let healthLabel = "All workers operational";
  let healthHelp = "";

  if (running > 0) {
    health = "operational";
    healthLabel = `${running} worker${running > 1 ? "s" : ""} active`;
    healthHelp = "Executor is processing jobs.";
  } else if (lastStart === 0) {
    health = "idle";
    healthLabel = "Idle · awaiting first run";
    healthHelp = "No automations have run yet. Trigger one to bring workers online.";
  } else if (minutesSinceLast > DOWN_THRESHOLD_MIN && (queued > 0 || queueLength > 0)) {
    // Jobs queued but no heartbeat = workers truly down
    health = "down";
    healthLabel = "Workers unresponsive";
    healthHelp = `No heartbeat in ${Math.round(minutesSinceLast)}m with ${queued} queued. Check the run-automation function logs.`;
  } else if (minutesSinceLast > 60 * 24) {
    health = "idle";
    healthLabel = "Idle · no recent activity";
    healthHelp = "No automation has run in over 24h.";
  } else if (failureRate >= 0.5) {
    health = "degraded";
    healthLabel = "Degraded · elevated failures";
    healthHelp = `${breakdown.failed} of last ${recent.length} runs failed. Inspect failing automations.`;
  } else if (failureRate >= 0.25) {
    health = "degraded";
    healthLabel = "Degraded";
    healthHelp = `${breakdown.failed} of last ${recent.length} runs failed.`;
  } else {
    healthHelp = `${breakdown.success}/${recent.length} of recent runs succeeded.`;
  }

  const healthColor: Record<Health, string> = {
    operational: "text-success",
    degraded: "text-warning",
    idle: "text-muted-foreground",
    down: "text-destructive",
  };
  const healthDot: Record<Health, string> = {
    operational: "bg-success animate-pulse",
    degraded: "bg-warning animate-pulse",
    idle: "bg-muted-foreground/40",
    down: "bg-destructive animate-pulse",
  };
  const HealthIcon = health === "down" ? AlertOctagon : Radio;

  // ---- Last run ----
  const lastRun = runs[0];
  const LastRunIcon =
    lastRun?.status === "success" ? CheckCircle2 :
    lastRun?.status === "failed" ? XCircle :
    lastRun?.status === "running" ? Loader2 :
    Clock;
  const lastRunColor =
    lastRun?.status === "success" ? "text-success" :
    lastRun?.status === "failed" ? "text-destructive" :
    lastRun?.status === "running" ? "text-info" :
    "text-muted-foreground";

  // ---- Breakdown bar segments ----
  const total = Math.max(1, recent.length);
  const segments = [
    { key: "success", count: breakdown.success, color: "bg-success" },
    { key: "running", count: breakdown.running, color: "bg-info" },
    { key: "queued", count: breakdown.queued, color: "bg-muted-foreground/60" },
    { key: "failed", count: breakdown.failed, color: "bg-destructive" },
    { key: "cancelled", count: breakdown.cancelled, color: "bg-muted-foreground/30" },
  ].filter((s) => s.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.06 }}
      className="p-4 rounded-lg surface-elevated"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            System Status
          </h2>
          <span className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", healthDot[health])} />
            <span className={cn("text-[10px] font-medium flex items-center gap-1", healthColor[health])}>
              <HealthIcon className="w-2.5 h-2.5" />
              {healthLabel}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Refresh interval picker */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-background/40">
            {REFRESH_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setPrefs({ intervalMs: opt.ms })}
                title={opt.ms === 0 ? "Realtime via subscription only" : opt.ms < 0 ? "No auto-refresh" : `Auto-refresh every ${opt.label}`}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-colors",
                  prefs.intervalMs === opt.ms
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground/70 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh now"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Down state guidance banner */}
      {health === "down" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2.5 rounded-md border border-destructive/30 bg-destructive/5 flex items-start gap-2"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-destructive">Workers down</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{healthHelp}</p>
            <ul className="text-[10px] text-muted-foreground/80 mt-1 list-disc list-inside space-y-0.5">
              <li>Try Refresh — realtime may have dropped</li>
              <li>Check the run-automation function logs in System</li>
              <li>Re-run a recent failed automation manually</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* 3 tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Workers */}
        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Cpu className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Workers</span>
          </div>
          <div className={cn("text-sm font-semibold font-mono", healthColor[health])}>
            {running > 0 ? `${running} active` : health === "down" ? "Down" : health === "idle" ? "Idle" : "Standby"}
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            {lastStart ? `Heartbeat ${timeAgo(new Date(lastStart).toISOString())}` : "No heartbeat yet"}
          </div>
        </div>

        {/* Queue */}
        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <ListOrdered className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Queue</span>
          </div>
          <div className={cn(
            "text-sm font-semibold font-mono",
            queueLength === 0 ? "text-muted-foreground" : queueLength > 5 ? "text-warning" : "text-foreground"
          )}>
            {queueLength} job{queueLength === 1 ? "" : "s"}
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            {queued} queued · {running} running
          </div>
        </div>

        {/* Last Run */}
        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Last Run</span>
          </div>
          {lastRun ? (
            <>
              <div className={cn("text-sm font-semibold flex items-center gap-1.5", lastRunColor)}>
                <LastRunIcon className={cn("w-3 h-3", lastRun.status === "running" && "animate-spin")} />
                <span className="capitalize">{lastRun.status}</span>
              </div>
              <div className="text-[10px] text-muted-foreground/60 mt-1 truncate" title={lastRun.automation_name}>
                {lastRun.automation_name || "—"} · {timeAgo(lastRun.started_at)}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-muted-foreground">None</div>
              <div className="text-[10px] text-muted-foreground/60 mt-1">No automation runs yet</div>
            </>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {recent.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
              Last {recent.length} runs
            </span>
            <span className="text-[10px] text-muted-foreground/60" title={healthHelp}>
              {healthHelp}
            </span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/40">
            {segments.map((s) => (
              <div
                key={s.key}
                className={cn("h-full", s.color)}
                style={{ width: `${(s.count / total) * 100}%` }}
                title={`${s.key}: ${s.count}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] font-mono">
            <BreakdownChip label="success" count={breakdown.success} dot="bg-success" />
            <BreakdownChip label="running" count={breakdown.running} dot="bg-info" />
            <BreakdownChip label="queued" count={breakdown.queued} dot="bg-muted-foreground/60" />
            <BreakdownChip label="failed" count={breakdown.failed} dot="bg-destructive" />
            {breakdown.cancelled > 0 && (
              <BreakdownChip label="cancelled" count={breakdown.cancelled} dot="bg-muted-foreground/30" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function BreakdownChip({ label, count, dot }: { label: string; count: number; dot: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", count === 0 && "opacity-40")}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{count}</span>
    </span>
  );
}
