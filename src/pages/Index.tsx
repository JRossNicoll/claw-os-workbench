import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { PipelineView } from "@/components/PipelineView";
import { Play, Plus, Package, ArrowRight, X, Radar } from "lucide-react";
import { cn } from "@/lib/utils";

const activeRuns = [
  {
    id: "run-7a2f",
    workflow: "Token Launch Pipeline",
    status: "running" as const,
    startedAt: "14:30:12",
    steps: [
      { id: "s1", name: "scan_tokens", status: "success" as const, duration: "12s", logs: [
        { timestamp: "14:30:12", level: "info" as const, message: "Scanning 1,247 tokens across 3 chains..." },
        { timestamp: "14:30:18", level: "info" as const, message: "Found 8 new tokens matching criteria" },
        { timestamp: "14:30:24", level: "info" as const, message: "Scan complete. 8 candidates forwarded." },
      ]},
      { id: "s2", name: "filter_volume", status: "success" as const, duration: "4s", logs: [
        { timestamp: "14:30:25", level: "info" as const, message: "Filtering by volume > $50k..." },
        { timestamp: "14:30:28", level: "info" as const, message: "3/8 tokens passed volume filter" },
        { timestamp: "14:30:29", level: "info" as const, message: "Filter complete." },
      ]},
      { id: "s3", name: "launch_token", status: "running" as const, logs: [
        { timestamp: "14:30:30", level: "info" as const, message: "Preparing launch for TOKEN_A..." },
        { timestamp: "14:30:35", level: "info" as const, message: "Submitting transaction to DEX..." },
        { timestamp: "14:30:42", level: "warn" as const, message: "Gas price elevated: 45 gwei, proceeding..." },
      ]},
      { id: "s4", name: "notify_telegram", status: "pending" as const },
    ],
  },
  {
    id: "run-3b8e",
    workflow: "Wallet Monitor",
    status: "running" as const,
    startedAt: "14:28:00",
    steps: [
      { id: "s1", name: "track_wallets", status: "success" as const, duration: "8s", logs: [
        { timestamp: "14:28:00", level: "info" as const, message: "Monitoring 24 wallets..." },
        { timestamp: "14:28:08", level: "info" as const, message: "Snapshot complete." },
      ]},
      { id: "s2", name: "detect_movement", status: "running" as const, logs: [
        { timestamp: "14:28:09", level: "info" as const, message: "Analyzing transaction patterns..." },
        { timestamp: "14:28:15", level: "info" as const, message: "Detected 500 ETH transfer from 0xdead..." },
      ]},
      { id: "s3", name: "alert_user", status: "pending" as const },
    ],
  },
  {
    id: "run-9c1d",
    workflow: "Token Launch Pipeline",
    status: "success" as const,
    startedAt: "14:15:00",
    steps: [
      { id: "s1", name: "scan_tokens", status: "success" as const, duration: "11s" },
      { id: "s2", name: "filter_volume", status: "success" as const, duration: "3s" },
      { id: "s3", name: "launch_token", status: "success" as const, duration: "28s" },
      { id: "s4", name: "notify_telegram", status: "success" as const, duration: "2s" },
    ],
  },
  {
    id: "run-4e7f",
    workflow: "DEX Arbitrage",
    status: "failed" as const,
    startedAt: "13:55:00",
    steps: [
      { id: "s1", name: "fetch_prices", status: "success" as const, duration: "5s" },
      { id: "s2", name: "find_spread", status: "success" as const, duration: "2s" },
      { id: "s3", name: "execute_swap", status: "failed" as const, duration: "15s", logs: [
        { timestamp: "13:55:22", level: "info" as const, message: "Spread detected: 0.8% on ETH/USDC" },
        { timestamp: "13:55:30", level: "error" as const, message: "Transaction reverted: insufficient liquidity" },
        { timestamp: "13:55:37", level: "error" as const, message: "Swap failed. Aborting pipeline." },
      ]},
      { id: "s4", name: "log_result", status: "pending" as const },
    ],
  },
];

const MissionControl = () => {
  const [selectedRun, setSelectedRun] = useState<string | null>("run-7a2f");
  const selected = activeRuns.find((r) => r.id === selectedRun);

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center glow-sm">
            <Radar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Mission Control</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Live operations overview</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        {[
          { label: "Run Workflow", icon: Play, accent: true },
          { label: "Install Module", icon: Package, accent: false },
          { label: "Create Workflow", icon: Plus, accent: false },
        ].map((action) => (
          <button
            key={action.label}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              action.accent
                ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-sm"
                : "bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-foreground"
            )}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Main split: Runs list + Pipeline view */}
      <div className="flex gap-4 min-h-0" style={{ height: "calc(100vh - 220px)" }}>
        {/* Active Runs List */}
        <div className="w-80 flex-shrink-0 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Runs</span>
              <span className="text-xs text-muted-foreground">{activeRuns.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeRuns.map((run) => (
              <button
                key={run.id}
                onClick={() => setSelectedRun(run.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border transition-colors",
                  selectedRun === run.id
                    ? "bg-accent/80"
                    : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{run.id}</span>
                  <StatusBadge status={run.status} />
                </div>
                <div className="text-sm text-foreground font-medium">{run.workflow}</div>
                <div className="text-xs text-muted-foreground mt-1">Started {run.startedAt}</div>

                {/* Mini pipeline preview */}
                <div className="flex items-center gap-1 mt-2">
                  {run.steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        step.status === "success" && "bg-success",
                        step.status === "running" && "bg-info animate-pulse-glow",
                        step.status === "failed" && "bg-destructive",
                        step.status === "pending" && "bg-muted-foreground/30",
                      )} />
                      {i < run.steps.length - 1 && <div className="w-2 h-px bg-border" />}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline Detail */}
        <div className="flex-1 border border-border rounded-lg bg-card overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{selected.workflow}</div>
                    <div className="text-xs text-muted-foreground font-mono">{selected.id} · started {selected.startedAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <button
                    onClick={() => setSelectedRun(null)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <PipelineView steps={selected.steps} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a run to inspect the pipeline</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
