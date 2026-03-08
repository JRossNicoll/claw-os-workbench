import { Settings as SettingsIcon } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your ClawOS instance</p>
      </div>

      <div className="space-y-4">
        {[
          { label: "Instance Name", value: "clawos-prod-01", type: "text" },
          { label: "API Endpoint", value: "https://api.clawos.local", type: "text" },
          { label: "Worker Pool Size", value: "4", type: "number" },
          { label: "Log Retention (days)", value: "30", type: "number" },
        ].map((setting) => (
          <div key={setting.label} className="bg-card rounded-lg border border-border p-5">
            <label className="text-sm text-muted-foreground">{setting.label}</label>
            <input
              type={setting.type}
              defaultValue={setting.value}
              className="mt-2 w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}

        <div className="bg-card rounded-lg border border-border p-5">
          <label className="text-sm text-muted-foreground">Auto-restart failed jobs</label>
          <div className="mt-2 flex items-center gap-2">
            <button className="w-10 h-5 rounded-full bg-primary relative transition-colors">
              <span className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform" />
            </button>
            <span className="text-xs text-muted-foreground">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
