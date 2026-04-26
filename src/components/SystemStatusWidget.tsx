import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Cpu, ListOrdered, CheckCircle2, XCircle, Loader2, Clock,
  RefreshCw, AlertOctagon, Radio, Settings2, BellRing, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRuns } from "@/hooks/use-runs";
import { timeAgo } from "@/hooks/use-activity";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Health = "operational" | "degraded" | "idle" | "down";

const REFRESH_OPTIONS = [
  { label: "Live", ms: 0 },
  { label: "10s", ms: 10_000 },
  { label: "30s", ms: 30_000 },
  { label: "1m", ms: 60_000 },
  { label: "Off", ms: -1 },
] as const;

const WINDOW_OPTIONS = [10, 20, 50, 100];
const PREFS_KEY = "clawos-system-status-prefs-v2";

interface Prefs {
  intervalMs: number;
  windowSize: number;
  downThresholdMin: number;
  alertsEnabled: boolean;
  alertWorkerDown: boolean;
  alertWorkerRecovery: boolean;
  alertFailureRate: boolean;
  failureRateAlertPct: number; // 0-100
}

const DEFAULT_PREFS: Prefs = {
  intervalMs: 30_000,
  windowSize: 20,
  downThresholdMin: 30,
  alertsEnabled: true,
  alertWorkerDown: true,
  alertWorkerRecovery: true,
  alertFailureRate: true,
  failureRateAlertPct: 50,
};

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { return DEFAULT_PREFS; }
}

// Animated count that tweens between values
function AnimatedCount({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number>();
  useEffect(() => {
    cancelAnimationFrame(frame.current!);
    const start = display;
    const delta = value - start;
    if (delta === 0) return;
    const startTime = performance.now();
    const dur = 350;
    const step = (t: number) => {
      const p = Math.min(1, (t - startTime) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={cn("tabular-nums", className)}>{display}</span>;
}

export function SystemStatusWidget() {
  const { data: runs = [], refetch, isFetching } = useRuns();
  const qc = useQueryClient();

  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  useEffect(() => { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }, [prefs]);
  const updatePrefs = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fresh clock for "time since heartbeat"
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  // Optional auto-refresh on top of realtime
  useEffect(() => {
    if (prefs.intervalMs <= 0) return;
    const t = setInterval(() => qc.invalidateQueries({ queryKey: ["runs"] }), prefs.intervalMs);
    return () => clearInterval(t);
  }, [prefs.intervalMs, qc]);

  // ---- Derived metrics ----
  const queued = runs.filter((r) => r.status === "queued").length;
  const running = runs.filter((r) => r.status === "running").length;
  const queueLength = queued + running;

  const lastStart = runs.reduce<number>((acc, r) => {
    const t = new Date(r.started_at).getTime();
    return t > acc ? t : acc;
  }, 0);
  const minutesSinceLast = lastStart ? (now - lastStart) / 60_000 : Infinity;

  const recent = useMemo(() => runs.slice(0, prefs.windowSize), [runs, prefs.windowSize]);
  const breakdown = useMemo(() => ({
    success: recent.filter((r) => r.status === "success").length,
    failed: recent.filter((r) => r.status === "failed").length,
    running: recent.filter((r) => r.status === "running").length,
    queued: recent.filter((r) => r.status === "queued").length,
    cancelled: recent.filter((r) => r.status === "cancelled").length,
  }), [recent]);
  const failureRate = recent.length ? breakdown.failed / recent.length : 0;
  const failurePct = Math.round(failureRate * 100);

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
  } else if (minutesSinceLast > prefs.downThresholdMin && (queued > 0 || queueLength > 0)) {
    health = "down";
    healthLabel = "Workers unresponsive";
    healthHelp = `No heartbeat in ${Math.round(minutesSinceLast)}m with ${queued} queued. Check the run-automation function logs.`;
  } else if (minutesSinceLast > 60 * 24) {
    health = "idle";
    healthLabel = "Idle · no recent activity";
    healthHelp = "No automation has run in over 24h.";
  } else if (failurePct >= prefs.failureRateAlertPct) {
    health = "degraded";
    healthLabel = "Degraded · elevated failures";
    healthHelp = `${breakdown.failed} of last ${recent.length} runs failed (${failurePct}%).`;
  } else if (failureRate >= 0.25) {
    health = "degraded";
    healthLabel = "Degraded";
    healthHelp = `${breakdown.failed} of last ${recent.length} runs failed.`;
  } else {
    healthHelp = `${breakdown.success}/${recent.length} of recent runs succeeded.`;
  }

  // ---- Alerting (state-change driven, deduped) ----
  const lastAlertedHealth = useRef<Health | null>(null);
  const lastAlertedFailurePct = useRef<number>(0);
  const initialised = useRef(false);

  useEffect(() => {
    // Skip on first render so we don't fire alerts for pre-existing state
    if (!initialised.current) {
      initialised.current = true;
      lastAlertedHealth.current = health;
      lastAlertedFailurePct.current = failurePct;
      return;
    }
    if (!prefs.alertsEnabled) return;

    const sendAlert = async (
      type: "warning" | "error" | "online",
      category: string,
      message: string,
      detail: string,
    ) => {
      await supabase.from("activity_events").insert({ type, category, message, detail });
      toast(message, { description: detail });
    };

    // Worker-down transition
    if (prefs.alertWorkerDown && health === "down" && lastAlertedHealth.current !== "down") {
      sendAlert(
        "error",
        "System",
        "Workers unresponsive",
        `No heartbeat in ${Math.round(minutesSinceLast)}m with ${queued} queued.`,
      );
    }
    // Recovery from down
    if (prefs.alertWorkerRecovery && health !== "down" && lastAlertedHealth.current === "down") {
      sendAlert("online", "System", "Workers back online", "Heartbeat restored.");
    }
    // High-failure alert (cross threshold upward)
    if (
      prefs.alertFailureRate &&
      failurePct >= prefs.failureRateAlertPct &&
      lastAlertedFailurePct.current < prefs.failureRateAlertPct &&
      recent.length >= 3
    ) {
      sendAlert(
        "warning",
        "System",
        "Elevated automation failure rate",
        `${breakdown.failed}/${recent.length} runs failing (${failurePct}% ≥ ${prefs.failureRateAlertPct}% threshold).`,
      );
    }

    lastAlertedHealth.current = health;
    lastAlertedFailurePct.current = failurePct;
  }, [health, failurePct, prefs.alertsEnabled, prefs.alertWorkerDown, prefs.alertWorkerRecovery, prefs.alertFailureRate, prefs.failureRateAlertPct, breakdown.failed, recent.length, queued, minutesSinceLast]);

  // ---- Visuals ----
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

  const total = Math.max(1, recent.length);
  const segments = [
    { key: "success", count: breakdown.success, color: "bg-success" },
    { key: "running", count: breakdown.running, color: "bg-info" },
    { key: "queued", count: breakdown.queued, color: "bg-muted-foreground/60" },
    { key: "failed", count: breakdown.failed, color: "bg-destructive" },
    { key: "cancelled", count: breakdown.cancelled, color: "bg-muted-foreground/30" },
  ];

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
          {/* Animated health label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={health + healthLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", healthDot[health])} />
              <span className={cn("text-[10px] font-medium flex items-center gap-1", healthColor[health])}>
                <HealthIcon className="w-2.5 h-2.5" />
                {healthLabel}
              </span>
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-background/40">
            {REFRESH_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => updatePrefs({ intervalMs: opt.ms })}
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
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh now"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} />
          </button>
          <button
            onClick={() => setSettingsOpen((s) => !s)}
            title="Configure"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              settingsOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Settings2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-md border border-border bg-background/40 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">
                    Window size
                  </label>
                  <div className="flex gap-1">
                    {WINDOW_OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => updatePrefs({ windowSize: n })}
                        className={cn(
                          "flex-1 px-2 py-1 rounded text-[10px] font-mono transition-colors",
                          prefs.windowSize === n ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground border border-border"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">
                    Down threshold
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={5}
                      max={120}
                      step={5}
                      value={prefs.downThresholdMin}
                      onChange={(e) => updatePrefs({ downThresholdMin: Number(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-[10px] text-foreground font-mono w-10 text-right">
                      {prefs.downThresholdMin}m
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <BellRing className="w-3 h-3 text-muted-foreground" />
                    Status-change notifications
                  </span>
                  <Toggle on={prefs.alertsEnabled} onClick={() => updatePrefs({ alertsEnabled: !prefs.alertsEnabled })} />
                </label>

                <div className={cn("space-y-1.5 pl-4 border-l border-border/60", !prefs.alertsEnabled && "opacity-40 pointer-events-none")}>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <AlertOctagon className="w-2.5 h-2.5 text-destructive/70" />
                      Worker Down
                    </span>
                    <Toggle small on={prefs.alertWorkerDown} onClick={() => updatePrefs({ alertWorkerDown: !prefs.alertWorkerDown })} />
                  </label>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Radio className="w-2.5 h-2.5 text-success/70" />
                      Worker Recovery
                    </span>
                    <Toggle small on={prefs.alertWorkerRecovery} onClick={() => updatePrefs({ alertWorkerRecovery: !prefs.alertWorkerRecovery })} />
                  </label>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <XCircle className="w-2.5 h-2.5 text-warning/70" />
                      High Failure Rate
                    </span>
                    <Toggle small on={prefs.alertFailureRate} onClick={() => updatePrefs({ alertFailureRate: !prefs.alertFailureRate })} />
                  </label>
                  <div className={cn("flex items-center gap-2 pt-1", !prefs.alertFailureRate && "opacity-40 pointer-events-none")}>
                    <span className="text-[10px] text-muted-foreground/70 w-24">Trigger at ≥</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={5}
                      value={prefs.failureRateAlertPct}
                      onChange={(e) => updatePrefs({ failureRateAlertPct: Number(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-[10px] text-foreground font-mono w-10 text-right">
                      {prefs.failureRateAlertPct}%
                    </span>
                  </div>
                </div>

                {/* Alert preview */}
                <div className={cn("mt-2 p-2 rounded-md bg-background/60 border border-border/60 space-y-1.5", !prefs.alertsEnabled && "opacity-40")}>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    Alert preview
                  </div>
                  <AlertPreviewRow
                    enabled={prefs.alertsEnabled && prefs.alertWorkerDown}
                    icon={AlertOctagon}
                    color="text-destructive"
                    title="Workers unresponsive"
                    detail={`Triggers when no heartbeat in ${prefs.downThresholdMin}m AND jobs are queued.`}
                  />
                  <AlertPreviewRow
                    enabled={prefs.alertsEnabled && prefs.alertWorkerRecovery}
                    icon={Radio}
                    color="text-success"
                    title="Workers back online"
                    detail="Triggers when heartbeat resumes after a Down state."
                  />
                  <AlertPreviewRow
                    enabled={prefs.alertsEnabled && prefs.alertFailureRate}
                    icon={XCircle}
                    color="text-warning"
                    title="Elevated automation failure rate"
                    detail={`Triggers when failures cross ${prefs.failureRateAlertPct}% over the last ${prefs.windowSize} runs (min 3 runs).`}
                  />
                  {/* Live status */}
                  <div className="pt-1 mt-1 border-t border-border/40 text-[9px] text-muted-foreground/70 leading-relaxed">
                    <span className="text-muted-foreground">Now: </span>
                    {recent.length < 3
                      ? "Need at least 3 runs for failure-rate evaluation."
                      : failurePct >= prefs.failureRateAlertPct
                        ? `Currently ${failurePct}% failures — failure-rate alert ${prefs.alertsEnabled && prefs.alertFailureRate ? "would fire on next threshold cross" : "muted"}.`
                        : health === "down"
                          ? "Worker-down alert active."
                          : `Currently ${failurePct}% failures, ${Math.round(minutesSinceLast)}m since heartbeat — no alert pending.`}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setPrefs(DEFAULT_PREFS)}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset defaults
                </button>
                <button
                  onClick={() => { setSettingsOpen(false); toast.success("Settings saved"); }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
                >
                  <Check className="w-2.5 h-2.5" /> Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Down banner */}
      <AnimatePresence>
        {health === "down" && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-2.5 rounded-md border border-destructive/30 bg-destructive/5 flex items-start gap-2">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Cpu className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Workers</span>
          </div>
          <div className={cn("text-sm font-semibold font-mono flex items-center gap-1", healthColor[health])}>
            {running > 0 ? (
              <><AnimatedCount value={running} /> active</>
            ) : health === "down" ? "Down" : health === "idle" ? "Idle" : "Standby"}
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            {lastStart ? `Heartbeat ${timeAgo(new Date(lastStart).toISOString())}` : "No heartbeat yet"}
          </div>
        </div>

        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <ListOrdered className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Queue</span>
          </div>
          <div className={cn(
            "text-sm font-semibold font-mono",
            queueLength === 0 ? "text-muted-foreground" : queueLength > 5 ? "text-warning" : "text-foreground"
          )}>
            <AnimatedCount value={queueLength} /> job{queueLength === 1 ? "" : "s"}
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            <AnimatedCount value={queued} /> queued · <AnimatedCount value={running} /> running
          </div>
        </div>

        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Last Run</span>
          </div>
          {lastRun ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={lastRun.id + lastRun.status}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.2 }}
                  className={cn("text-sm font-semibold flex items-center gap-1.5", lastRunColor)}
                >
                  <LastRunIcon className={cn("w-3 h-3", lastRun.status === "running" && "animate-spin")} />
                  <span className="capitalize">{lastRun.status}</span>
                </motion.div>
              </AnimatePresence>
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
              Last <AnimatedCount value={recent.length} /> runs
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={healthHelp}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] text-muted-foreground/60 truncate ml-2"
                title={healthHelp}
              >
                {healthHelp}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/40">
            {segments.map((s) => (
              <motion.div
                key={s.key}
                className={cn("h-full", s.color)}
                initial={false}
                animate={{ width: `${(s.count / total) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
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
    <motion.span
      layout
      className={cn("inline-flex items-center gap-1.5 transition-opacity", count === 0 && "opacity-40")}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      <span className="text-muted-foreground">{label}</span>
      <AnimatedCount value={count} className="text-foreground" />
    </motion.span>
  );
}
