import { useState } from "react";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { Plus, Play, ChevronRight } from "lucide-react";

const workflows = [
  {
    id: "wf-001",
    name: "Token Launch Pipeline",
    status: "active" as const,
    lastRun: "5 min ago",
    runs: 142,
    steps: [
      { id: "1", name: "scan_tokens", status: "success" as const },
      { id: "2", name: "filter_volume", status: "success" as const },
      { id: "3", name: "launch_token", status: "success" as const },
      { id: "4", name: "notify_telegram", status: "success" as const },
    ],
  },
  {
    id: "wf-002",
    name: "Wallet Monitor",
    status: "active" as const,
    lastRun: "12 min ago",
    runs: 89,
    steps: [
      { id: "1", name: "track_wallets", status: "success" as const },
      { id: "2", name: "detect_movement", status: "running" as const },
      { id: "3", name: "alert_user", status: "pending" as const },
    ],
  },
  {
    id: "wf-003",
    name: "DEX Arbitrage",
    status: "inactive" as const,
    lastRun: "2h ago",
    runs: 34,
    steps: [
      { id: "1", name: "fetch_prices", status: "pending" as const },
      { id: "2", name: "find_spread", status: "pending" as const },
      { id: "3", name: "execute_swap", status: "pending" as const },
      { id: "4", name: "log_result", status: "pending" as const },
    ],
  },
];

const executionHistory = [
  { id: "run-a1", workflow: "Token Launch Pipeline", status: "success" as const, started: "14:25:00", duration: "1m 32s" },
  { id: "run-a2", workflow: "Wallet Monitor", status: "running" as const, started: "14:20:00", duration: "—" },
  { id: "run-a3", workflow: "Token Launch Pipeline", status: "failed" as const, started: "13:55:00", duration: "0m 48s" },
  { id: "run-a4", workflow: "DEX Arbitrage", status: "success" as const, started: "12:10:00", duration: "3m 14s" },
];

const Workflows = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">Design and manage multi-step automation pipelines</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Create Workflow
        </button>
      </div>

      {/* Workflow cards */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="bg-card rounded-lg border border-border p-5 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => setSelectedWorkflow(selectedWorkflow === wf.id ? null : wf.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{wf.name}</div>
                  <div className="text-xs text-muted-foreground">{wf.runs} runs · Last: {wf.lastRun}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={wf.status} />
                <button
                  className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedWorkflow === wf.id ? "rotate-90" : ""}`} />
              </div>
            </div>
            <WorkflowDiagram steps={wf.steps} />
          </div>
        ))}
      </div>

      {/* Execution History */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Execution History</h3>
        <DataTable
          columns={[
            { key: "id", header: "Run ID", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
            { key: "workflow", header: "Workflow" },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "started", header: "Started" },
            { key: "duration", header: "Duration" },
          ]}
          data={executionHistory}
        />
      </div>
    </div>
  );
};

export default Workflows;
