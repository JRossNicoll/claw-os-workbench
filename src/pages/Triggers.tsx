import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Zap, Plus } from "lucide-react";

const triggers = [
  { name: "New Token Detected", event: "chain.token.created", module: "token_scanner", workflow: "Token Launch Pipeline", status: "active" as const, fires: 247 },
  { name: "Large Transfer", event: "wallet.transfer.large", module: "wallet_tracker", workflow: "Wallet Monitor", status: "active" as const, fires: 89 },
  { name: "Price Threshold", event: "oracle.price.threshold", module: "price_oracle", workflow: "—", status: "active" as const, fires: 34 },
  { name: "DEX Spread Found", event: "dex.spread.detected", module: "dex_monitor", workflow: "DEX Arbitrage", status: "inactive" as const, fires: 12 },
];

const Triggers = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Event Triggers</h1>
        <p className="text-sm text-muted-foreground mt-1">Reactive automation based on system events</p>
      </div>
      <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="w-4 h-4" /> New Trigger
      </button>
    </div>
    <DataTable
      columns={[
        { key: "name", header: "Trigger" },
        { key: "event", header: "Event", render: (t) => <span className="font-mono text-xs">{t.event}</span> },
        { key: "module", header: "Module", render: (t) => <span className="font-mono text-xs">{t.module}</span> },
        { key: "workflow", header: "Workflow" },
        { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
        { key: "fires", header: "Fires", render: (t) => <span className="text-muted-foreground">{t.fires}</span> },
      ]}
      data={triggers}
    />
  </div>
);

export default Triggers;
