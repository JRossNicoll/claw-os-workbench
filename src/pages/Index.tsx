import { DashboardCard } from "@/components/DashboardCard";
import { StatusBadge } from "@/components/StatusBadge";
import { LogViewer } from "@/components/LogViewer";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";
import { DataTable } from "@/components/DataTable";
import { Activity, Package, GitBranch, Play, Server, CheckCircle, XCircle } from "lucide-react";

const recentJobs = [
  { id: "job-4a2f", module: "token_scanner", status: "running" as const, started: "2 min ago", duration: "2m 14s" },
  { id: "job-8b1c", module: "telegram_bot", status: "success" as const, started: "15 min ago", duration: "0m 48s" },
  { id: "job-2e9d", module: "dex_monitor", status: "failed" as const, started: "1h ago", duration: "5m 22s" },
  { id: "job-7f3a", module: "wallet_tracker", status: "success" as const, started: "2h ago", duration: "1m 03s" },
];

const recentLogs = [
  { timestamp: "14:32:01", level: "info" as const, message: "token_scanner started execution on worker-01" },
  { timestamp: "14:31:58", level: "info" as const, message: "telegram_bot job-8b1c completed successfully" },
  { timestamp: "14:31:45", level: "error" as const, message: "dex_monitor connection timeout after 30s" },
  { timestamp: "14:31:30", level: "warn" as const, message: "wallet_tracker rate limit approaching (85%)" },
  { timestamp: "14:31:12", level: "debug" as const, message: "scheduler tick: 3 pending jobs in queue" },
  { timestamp: "14:30:55", level: "info" as const, message: "Module auto-update check completed" },
];

const workflowSteps = [
  { id: "1", name: "scan_tokens", status: "success" as const },
  { id: "2", name: "filter_volume", status: "success" as const },
  { id: "3", name: "launch_token", status: "running" as const },
  { id: "4", name: "notify_telegram", status: "pending" as const },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and real-time monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Active Jobs" value={3} subtitle="+2 from last hour" icon={<Play className="w-4 h-4" />} />
        <DashboardCard title="Installed Modules" value={12} subtitle="2 updates available" icon={<Package className="w-4 h-4" />} />
        <DashboardCard title="Workflows" value={7} subtitle="5 active" icon={<GitBranch className="w-4 h-4" />} />
        <DashboardCard title="Worker Health" icon={<Server className="w-4 h-4" />}>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm text-foreground">3 healthy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-sm text-foreground">1 degraded</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Workflow + Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Active Pipeline</h3>
          <WorkflowDiagram steps={workflowSteps} />
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Workflow Success Rate</h3>
          <div className="flex items-end gap-6 mt-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <div className="text-2xl font-semibold text-foreground">94.2%</div>
                <div className="text-xs text-muted-foreground">Success rate</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <div className="text-2xl font-semibold text-foreground">5.8%</div>
                <div className="text-xs text-muted-foreground">Failure rate</div>
              </div>
            </div>
          </div>
          {/* Simple bar chart */}
          <div className="flex items-end gap-1 mt-6 h-20">
            {[85, 92, 78, 95, 100, 88, 94, 97, 91, 100, 86, 93].map((v, i) => (
              <div key={i} className="flex-1 rounded-sm bg-success/20 relative" style={{ height: `${v}%` }}>
                <div className="absolute bottom-0 left-0 right-0 rounded-sm bg-success/60" style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>12h ago</span><span>now</span>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Recent Jobs</h3>
        <DataTable
          columns={[
            { key: "id", header: "Job ID", render: (j) => <span className="font-mono text-xs">{j.id}</span> },
            { key: "module", header: "Module", render: (j) => <span className="font-mono text-xs">{j.module}</span> },
            { key: "status", header: "Status", render: (j) => <StatusBadge status={j.status} /> },
            { key: "started", header: "Started" },
            { key: "duration", header: "Duration" },
          ]}
          data={recentJobs}
        />
      </div>

      {/* Logs */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Recent Logs</h3>
        <LogViewer logs={recentLogs} maxHeight="200px" />
      </div>
    </div>
  );
};

export default Dashboard;
