import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { LogViewer } from "@/components/LogViewer";
import { DataTable } from "@/components/DataTable";
import { X, Cpu, HardDrive } from "lucide-react";

const jobsData = [
  { id: "job-4a2f", module: "token_scanner", status: "running" as const, started: "14:30:12", duration: "2m 14s" },
  { id: "job-8b1c", module: "telegram_bot", status: "success" as const, started: "14:15:00", duration: "0m 48s" },
  { id: "job-2e9d", module: "dex_monitor", status: "failed" as const, started: "13:30:00", duration: "5m 22s" },
  { id: "job-7f3a", module: "wallet_tracker", status: "success" as const, started: "12:30:00", duration: "1m 03s" },
  { id: "job-1d4e", module: "price_oracle", status: "success" as const, started: "12:00:00", duration: "0m 22s" },
  { id: "job-9c8b", module: "token_scanner", status: "success" as const, started: "11:30:00", duration: "1m 45s" },
];

const jobLogs = [
  { timestamp: "14:30:12", level: "info" as const, message: "Job started on worker-01" },
  { timestamp: "14:30:13", level: "info" as const, message: "Connecting to data source..." },
  { timestamp: "14:30:14", level: "info" as const, message: "Connection established" },
  { timestamp: "14:30:18", level: "info" as const, message: "Scanning 1,247 tokens..." },
  { timestamp: "14:31:02", level: "warn" as const, message: "Rate limit warning: 80% capacity" },
  { timestamp: "14:31:45", level: "info" as const, message: "Processed 800/1247 tokens" },
  { timestamp: "14:32:10", level: "info" as const, message: "Processing remaining batch..." },
];

const Jobs = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const selected = jobsData.find((j) => j.id === selectedJob);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and inspect job executions</p>
      </div>

      <div className="flex gap-6">
        {/* Jobs table */}
        <div className="flex-1 min-w-0">
          <DataTable
            columns={[
              { key: "id", header: "Job ID", render: (j) => <span className="font-mono text-xs">{j.id}</span> },
              { key: "module", header: "Module", render: (j) => <span className="font-mono text-xs">{j.module}</span> },
              { key: "status", header: "Status", render: (j) => <StatusBadge status={j.status} /> },
              { key: "started", header: "Started" },
              { key: "duration", header: "Duration" },
            ]}
            data={jobsData}
            onRowClick={(j) => setSelectedJob(j.id)}
          />
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-96 bg-card rounded-lg border border-border p-5 animate-slide-in flex-shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-sm text-foreground">{selected.id}</div>
                <div className="text-xs text-muted-foreground">{selected.module}</div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <StatusBadge status={selected.status} />

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Started</span>
                <span className="text-foreground">{selected.started}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-foreground">{selected.duration}</span>
              </div>
            </div>

            {/* Resource usage */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resources</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Cpu className="w-3 h-3" /> CPU</span>
                  <span className="text-foreground">45%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-info rounded-full" style={{ width: "45%" }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><HardDrive className="w-3 h-3" /> Memory</span>
                  <span className="text-foreground">128/256 Mi</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: "50%" }} />
                </div>
              </div>
            </div>

            {/* Live logs */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Live Logs</h4>
              <LogViewer logs={jobLogs} maxHeight="200px" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
