import { motion } from "framer-motion";
import { Activity, Cpu, ListOrdered, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRuns } from "@/hooks/use-runs";
import { timeAgo } from "@/hooks/use-activity";
import { useEffect, useState } from "react";

type Health = "operational" | "degraded" | "idle" | "down";

export function SystemStatusWidget() {
  const { data: runs = [] } = useRuns();
  const [now, setNow] = useState(() => Date.now());

  // Tick once a minute so "last run" + worker freshness re-evaluate
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const queued = runs.filter((r) => r.status === "queued").length;
  const running = runs.filter((r) => r.status === "running").length;
  const queueLength = queued + running;

  // Worker heartbeat: most recent run start
  const lastStart = runs.reduce<number>((acc, r) => {
    const t = new Date(r.started_at).getTime();
    return t > acc ? t : acc;
  }, 0);
  const minutesSinceLast = lastStart ? Math.floor((now - lastStart) / 60_000) : Infinity;

  // Recent failure ratio in last 20 runs
  const recent = runs.slice(0, 20);
  const recentFailed = recent.filter((r) => r.status === "failed").length;
  const failureRate = recent.length ? recentFailed / recent.length : 0;

  let health: Health = "operational";
  let healthLabel = "All workers operational";
  if (running > 0) {
    health = "operational";
    healthLabel = `${running} worker${running > 1 ? "s" : ""} active`;
  } else if (lastStart === 0) {
    health = "idle";
    healthLabel = "Idle · awaiting first run";
  } else if (minutesSinceLast > 60 * 24) {
    health = "idle";
    healthLabel = "Idle";
  } else if (failureRate >= 0.5) {
    health = "degraded";
    healthLabel = "Degraded · elevated failures";
  } else if (failureRate >= 0.25) {
    health = "degraded";
    healthLabel = "Degraded";
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

  // Last automation run state
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.06 }}
      className="p-4 rounded-lg surface-elevated"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          System Status
        </h2>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", healthDot[health])} />
          <span className={cn("text-[10px] font-medium", healthColor[health])}>
            {healthLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Worker Health */}
        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Cpu className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Workers</span>
          </div>
          <div className={cn("text-sm font-semibold font-mono", healthColor[health])}>
            {running > 0 ? `${running} active` : health === "idle" ? "Idle" : "Standby"}
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            {lastStart ? `Heartbeat ${timeAgo(new Date(lastStart).toISOString())}` : "No heartbeat yet"}
          </div>
        </div>

        {/* Queue Length */}
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

        {/* Last Automation Run */}
        <div className="p-3 rounded-md bg-background/40 border border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Last Run</span>
          </div>
          {lastRun ? (
            <>
              <div className={cn("text-sm font-semibold flex items-center gap-1.5", lastRunColor)}>
                <lastRunIcon className={cn("w-3 h-3", lastRun.status === "running" && "animate-spin")} />
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
    </motion.div>
  );
}
