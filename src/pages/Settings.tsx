import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const settings = [
  { key: "name", label: "Instance Name", value: "clawos-prod", type: "text" },
  { key: "endpoint", label: "API Endpoint", value: "https://api.clawos.io", type: "text" },
  { key: "retention", label: "Log Retention", value: "30 days", type: "text" },
];

const toggles = [
  { key: "autorestart", label: "Auto-restart failed tasks", description: "Automatically retry failed automation runs", enabled: true },
  { key: "notifications", label: "Push notifications", description: "Get notified when automations complete or fail", enabled: true },
  { key: "analytics", label: "Usage analytics", description: "Help improve ClawOS by sharing anonymous usage data", enabled: false },
];

const SettingsPage = () => {
  const [toggleState, setToggleState] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map((t) => [t.key, t.enabled]))
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your ClawOS instance</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-3"
      >
        {settings.map((s) => (
          <div key={s.key} className="p-5 rounded-xl surface-elevated space-y-2">
            <label className="text-xs text-muted-foreground font-medium">{s.label}</label>
            <input
              type={s.type}
              defaultValue={s.value}
              className="w-full bg-muted/60 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground font-mono outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between p-5 rounded-xl surface-elevated">
            <div>
              <div className="text-sm text-foreground font-medium">{t.label}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            </div>
            <button
              onClick={() => setToggleState((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
              className={cn(
                "w-10 h-[22px] rounded-full relative transition-colors duration-200",
                toggleState[t.key] ? "bg-primary" : "bg-muted"
              )}
            >
              <span className={cn(
                "absolute top-[3px] w-4 h-4 rounded-full bg-foreground transition-all duration-200",
                toggleState[t.key] ? "right-[3px]" : "left-[3px]"
              )} />
            </button>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SettingsPage;
