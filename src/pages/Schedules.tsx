import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Clock, Plus } from "lucide-react";

const schedules = [
  { name: "Token Scan", cron: "*/5 * * * *", module: "token_scanner", status: "active" as const, nextRun: "in 2 min", lastRun: "3 min ago" },
  { name: "Wallet Check", cron: "*/15 * * * *", module: "wallet_tracker", status: "active" as const, nextRun: "in 8 min", lastRun: "7 min ago" },
  { name: "Price Update", cron: "*/1 * * * *", module: "price_oracle", status: "active" as const, nextRun: "in 30s", lastRun: "30s ago" },
  { name: "DEX Sweep", cron: "0 * * * *", module: "dex_monitor", status: "inactive" as const, nextRun: "—", lastRun: "2h ago" },
  { name: "Daily Report", cron: "0 0 * * *", module: "telegram_bot", status: "active" as const, nextRun: "in 9h", lastRun: "15h ago" },
];

const Schedules = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Schedules</h1>
        <p className="text-sm text-muted-foreground mt-1">Cron-based job scheduling</p>
      </div>
      <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="w-4 h-4" /> New Schedule
      </button>
    </div>
    <DataTable
      columns={[
        { key: "name", header: "Name" },
        { key: "cron", header: "Cron", render: (s) => <span className="font-mono text-xs">{s.cron}</span> },
        { key: "module", header: "Module", render: (s) => <span className="font-mono text-xs">{s.module}</span> },
        { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
        { key: "nextRun", header: "Next Run" },
        { key: "lastRun", header: "Last Run" },
      ]}
      data={schedules}
    />
  </div>
);

export default Schedules;
