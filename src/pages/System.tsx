import { useState, useEffect, useRef } from "react";
import {
  Server, Database, Activity, Container, Play, Square, RotateCcw,
  Loader2, Terminal, ChevronDown, Cpu, Layers, Clock, Wifi, WifiOff,
  CheckCircle2, XCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRuntimeHealth, getStackStatus, getStackLogs,
  startStack, stopStack, restartStack, getMetrics
} from "@/lib/api";
import { toast } from "sonner";

// ─── Status Dot ─────────────────────────────────────
function StatusDot({ ok, pulse }: { ok: boolean; pulse?: boolean }) {
  return (
    <span className={cn(
      "w-2 h-2 rounded-full inline-block",
      ok ? "bg-success" : "bg-destructive",
      ok && pulse && "animate-pulse-soft"
    )} />
  );
}

// ─── Runtime Health Panel ───────────────────────────
function RuntimeHealthPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["runtime-health"],
    queryFn: getRuntimeHealth,
    refetchInterval: 10000,
  });

  const services = data ? [
    { label: "API", ok: data.api },
    { label: "Redis", ok: data.redis },
    { label: "Postgres", ok: data.postgres },
    { label: "Worker", ok: data.worker },
  ] : [];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Runtime Health</h2>
        {data && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {data.running_containers ?? "—"} containers
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
      ) : error ? (
        <p className="text-xs text-destructive">Failed to load health data</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {services.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 bg-background rounded-md px-3 py-2.5 border border-border">
              <StatusDot ok={s.ok} pulse />
              <span className="text-xs font-medium text-foreground">{s.label}</span>
              <span className={cn("ml-auto text-[10px] font-mono", s.ok ? "text-success" : "text-destructive")}>
                {s.ok ? "healthy" : "down"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stack Control Panel ────────────────────────────
function StackControlPanel() {
  const queryClient = useQueryClient();

  const mutation = (fn: () => Promise<any>, label: string) =>
    useMutation({
      mutationFn: fn,
      onSuccess: () => {
        toast.success(`Stack ${label} successful`);
        queryClient.invalidateQueries({ queryKey: ["stack-status"] });
        queryClient.invalidateQueries({ queryKey: ["runtime-health"] });
      },
      onError: (err: any) => toast.error(err?.message || `Failed to ${label} stack`),
    });

  const startMut = mutation(startStack, "start");
  const stopMut = mutation(stopStack, "stop");
  const restartMut = mutation(restartStack, "restart");

  const actions = [
    { label: "Start", icon: Play, mut: startMut, cls: "text-success hover:bg-success/10 border-success/20" },
    { label: "Stop", icon: Square, mut: stopMut, cls: "text-destructive hover:bg-destructive/10 border-destructive/20" },
    { label: "Restart", icon: RotateCcw, mut: restartMut, cls: "text-warning hover:bg-warning/10 border-warning/20" },
  ];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Stack Control</h2>
      <div className="flex gap-2">
        {actions.map(({ label, icon: Icon, mut, cls }) => (
          <button
            key={label}
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-all disabled:opacity-50",
              cls
            )}
          >
            {mut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
            {mut.isPending ? `${label}ing...` : label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stack Status ───────────────────────────────────
function StackStatusPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["stack-status"],
    queryFn: getStackStatus,
    refetchInterval: 15000,
  });

  const containers = Array.isArray(data) ? data : data?.containers || [];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Stack Containers</h2>
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
      ) : containers.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">No containers running</p>
      ) : (
        <div className="space-y-2">
          {containers.map((c: any) => (
            <div key={c.name} className="flex items-center gap-3 bg-background rounded-md px-3 py-2.5 border border-border">
              <Container className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="text-xs font-mono text-foreground flex-1">{c.name}</span>
              <span className="flex items-center gap-1.5">
                {c.status === "running" ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <XCircle className="w-3 h-3 text-destructive" />
                )}
                <span className={cn("text-[10px] font-mono", c.status === "running" ? "text-success" : "text-destructive")}>
                  {c.status}
                </span>
              </span>
              {c.uptime && (
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {c.uptime}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Logs Viewer ────────────────────────────────────
const LOG_SERVICES = ["api", "worker", "postgres", "redis"] as const;

function LogsViewer() {
  const [service, setService] = useState<string>("api");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["stack-logs", service],
    queryFn: () => getStackLogs(service),
    refetchInterval: 5000,
  });

  const lines: string[] = Array.isArray(data) ? data : (typeof data === "string" ? data.split("\n") : data?.lines || []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="surface-elevated rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Logs</h2>
          {/* Service selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-mono text-foreground bg-background border border-border rounded-md px-2.5 py-1 hover:border-primary/30 transition-colors"
            >
              {service}
              <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 z-40 w-32 py-1 rounded-lg bg-card border border-border shadow-lg">
                  {LOG_SERVICES.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setService(s); setDropdownOpen(false); }}
                      className={cn(
                        "block w-full text-left px-3 py-1.5 text-xs font-mono transition-colors",
                        s === service ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="bg-terminal-bg p-4 h-64 overflow-y-auto terminal-scrollbar font-mono text-[11px] leading-relaxed"
      >
        {isLoading ? (
          <span className="text-terminal-dim">Loading logs...</span>
        ) : lines.length === 0 ? (
          <span className="text-terminal-dim">No logs available for {service}</span>
        ) : (
          lines.map((line, i) => (
            <div key={i} className={cn(
              "whitespace-pre-wrap",
              line.toLowerCase().includes("error") ? "text-destructive" :
              line.toLowerCase().includes("warn") ? "text-warning" :
              "text-terminal-text"
            )}>
              <span className="text-terminal-dim select-none mr-3">{String(i + 1).padStart(3, " ")}</span>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── System Metrics ─────────────────────────────────
function SystemMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    refetchInterval: 10000,
  });

  const gauges = data ? [
    { label: "Active Workflows", value: data.active_workflows ?? 0, icon: Layers },
    { label: "Running Jobs", value: data.running_jobs ?? 0, icon: Activity },
    { label: "Queued Jobs", value: data.queued_jobs ?? 0, icon: Cpu },
    { label: "Containers", value: data.runtime_containers ?? 0, icon: Container },
  ] : [];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">System Metrics</h2>
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {gauges.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-background rounded-md px-4 py-3 border border-border text-center space-y-1">
              <Icon className="w-4 h-4 text-muted-foreground/50 mx-auto" />
              <div className="text-xl font-semibold text-foreground font-mono">{value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────
const System = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-foreground">System Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage runtime stack and monitor system health</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded-md px-2.5 py-1">
          <Server className="w-3 h-3" /> admin
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <RuntimeHealthPanel />
        <StackControlPanel />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <SystemMetrics />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <StackStatusPanel />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <LogsViewer />
      </motion.div>
    </div>
  );
};

export default System;
