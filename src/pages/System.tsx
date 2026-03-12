import { useState, useRef, useEffect } from "react";
import {
  Server, Activity, Play, Square, RotateCcw,
  Loader2, Terminal, ChevronDown, Cpu, Layers, Clock,
  CheckCircle2, XCircle, RefreshCw, Container
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getRuntimeHealth, getStackStatus, getStackLogs, getMetrics } from "@/lib/store";
import { toast } from "sonner";

function StatusDot({ ok, pulse }: { ok: boolean; pulse?: boolean }) {
  return <span className={cn("w-2 h-2 rounded-full inline-block", ok ? "bg-success" : "bg-destructive", ok && pulse && "animate-pulse")} />;
}

function RuntimeHealthPanel() {
  const data = getRuntimeHealth();
  const services = [
    { label: "API", ok: data.api },
    { label: "Redis", ok: data.redis },
    { label: "Postgres", ok: data.postgres },
    { label: "Worker", ok: data.worker },
  ];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Runtime Health</h2>
        <span className="text-[10px] text-muted-foreground font-mono">{data.running_containers} containers</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {services.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 bg-background rounded-md px-3 py-2.5 border border-border">
            <StatusDot ok={s.ok} pulse />
            <span className="text-xs font-medium text-foreground">{s.label}</span>
            <span className={cn("ml-auto text-[10px] font-mono", s.ok ? "text-success" : "text-destructive")}>{s.ok ? "healthy" : "down"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackControlPanel() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setLoading(action);
    setTimeout(() => {
      setLoading(null);
      toast.success(`Stack ${action} successful`);
    }, 1500);
  };

  const actions = [
    { label: "Start", icon: Play, action: "start", cls: "text-success hover:bg-success/10 border-success/20" },
    { label: "Stop", icon: Square, action: "stop", cls: "text-destructive hover:bg-destructive/10 border-destructive/20" },
    { label: "Restart", icon: RotateCcw, action: "restart", cls: "text-warning hover:bg-warning/10 border-warning/20" },
  ];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Stack Control</h2>
      <div className="flex gap-2">
        {actions.map(({ label, icon: Icon, action, cls }) => (
          <button
            key={label}
            onClick={() => handleAction(action)}
            disabled={loading === action}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-all disabled:opacity-50", cls)}
          >
            {loading === action ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
            {loading === action ? `${label}ing...` : label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StackStatusPanel() {
  const data = getStackStatus();
  const containers = data.containers || [];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Stack Containers</h2>
      <div className="space-y-2">
        {containers.map((c) => (
          <div key={c.name} className="flex items-center gap-3 bg-background rounded-md px-3 py-2.5 border border-border">
            <Container className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-xs font-mono text-foreground flex-1">{c.name}</span>
            <CheckCircle2 className="w-3 h-3 text-success" />
            <span className="text-[10px] font-mono text-success">{c.status}</span>
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />{c.uptime}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const LOG_SERVICES = ["api", "worker", "postgres", "redis"] as const;

function LogsViewer() {
  const [service, setService] = useState<string>("api");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lines = getStackLogs(service);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="surface-elevated rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Logs</h2>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1.5 text-xs font-mono text-foreground bg-background border border-border rounded-md px-2.5 py-1 hover:border-primary/30 transition-colors">
              {service}
              <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 z-40 w-32 py-1 rounded-lg bg-card border border-border shadow-lg">
                  {LOG_SERVICES.map((s) => (
                    <button key={s} onClick={() => { setService(s); setDropdownOpen(false); }} className={cn("block w-full text-left px-3 py-1.5 text-xs font-mono transition-colors", s === service ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="bg-terminal-bg p-4 h-64 overflow-y-auto terminal-scrollbar font-mono text-[11px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={cn("whitespace-pre-wrap", line.toLowerCase().includes("error") ? "text-destructive" : line.toLowerCase().includes("warn") ? "text-warning" : "text-terminal-text")}>
            <span className="text-terminal-dim select-none mr-3">{String(i + 1).padStart(3, " ")}</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemMetrics() {
  const data = getMetrics();
  const gauges = [
    { label: "Active Workflows", value: data.active_workflows, icon: Layers },
    { label: "Running Jobs", value: data.running_jobs, icon: Activity },
    { label: "Queued Jobs", value: data.queued_jobs, icon: Cpu },
    { label: "Containers", value: data.runtime_containers, icon: Container },
    { label: "Total Agents", value: data.total_agents, icon: Server },
    { label: "Active Agents", value: data.active_agents, icon: Server },
  ];

  return (
    <div className="surface-elevated rounded-lg p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">System Metrics</h2>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {gauges.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-background rounded-md px-3 py-3 border border-border text-center space-y-1">
            <Icon className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
            <div className="text-lg font-semibold text-foreground font-mono">{value}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const System = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">System Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage runtime stack and monitor system health</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded-md px-2.5 py-1">
          <Server className="w-3 h-3" /> admin
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RuntimeHealthPanel />
        <StackControlPanel />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <SystemMetrics />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <StackStatusPanel />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <LogsViewer />
      </motion.div>
    </div>
  );
};

export default System;
