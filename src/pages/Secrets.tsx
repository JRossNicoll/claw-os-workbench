import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Plus, Trash2, Eye, EyeOff, Lock } from "lucide-react";

const secretsData = [
  { name: "TELEGRAM_BOT_TOKEN", createdAt: "2024-01-15", lastUsed: "2 min ago", modules: 2 },
  { name: "ETHERSCAN_API_KEY", createdAt: "2024-01-10", lastUsed: "15 min ago", modules: 3 },
  { name: "ALCHEMY_API_KEY", createdAt: "2024-01-08", lastUsed: "1h ago", modules: 5 },
  { name: "PRIVATE_KEY_MAIN", createdAt: "2024-01-05", lastUsed: "30 min ago", modules: 1 },
  { name: "DISCORD_WEBHOOK_URL", createdAt: "2024-02-01", lastUsed: "3h ago", modules: 1 },
];

const Secrets = () => {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Secrets Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">Securely manage API keys and credentials</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Secret
        </button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-lg border border-border p-5 animate-slide-in space-y-4">
          <h3 className="text-sm font-medium text-foreground">New Secret</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Name</label>
              <input placeholder="MY_API_KEY" className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Value</label>
              <input type="password" placeholder="••••••••" className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary font-mono" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Save Secret
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border p-1">
        <DataTable
          columns={[
            {
              key: "name",
              header: "Name",
              render: (s) => (
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-xs">{s.name}</span>
                </div>
              ),
            },
            { key: "createdAt", header: "Created" },
            { key: "lastUsed", header: "Last Used" },
            { key: "modules", header: "Used By", render: (s) => <span>{s.modules} module{s.modules > 1 ? "s" : ""}</span> },
            {
              key: "actions",
              header: "",
              render: () => (
                <div className="flex items-center gap-1 justify-end">
                  <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
              className: "w-20",
            },
          ]}
          data={secretsData}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>Secret values are encrypted and never displayed after creation.</span>
      </div>
    </div>
  );
};

export default Secrets;
