import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { toast } from "sonner";

const settingsMeta = [
  { key: "name", label: "Instance Name", type: "text" },
  { key: "endpoint", label: "API Endpoint", type: "text" },
  { key: "retention", label: "Log Retention", type: "text" },
];

const togglesMeta = [
  { key: "autorestart", label: "Auto-restart failed tasks", description: "Automatically retry failed automation runs" },
  { key: "notifications", label: "Push notifications", description: "Get notified when automations complete or fail" },
  { key: "analytics", label: "Usage analytics", description: "Help improve ClawOS by sharing anonymous usage data" },
];

const SettingsPage = () => {
  const { data: settings = {}, isLoading } = useSettings();
  const updateMutation = useUpdateSetting();
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});

  const getValue = (key: string) => localEdits[key] ?? settings[key] ?? "";

  const handleBlur = (key: string) => {
    const val = localEdits[key];
    if (val !== undefined && val !== settings[key]) {
      updateMutation.mutate({ key, value: val }, {
        onSuccess: () => toast.success("Setting saved"),
      });
    }
  };

  const handleToggle = (key: string) => {
    const current = settings[key] === "true";
    const newVal = current ? "false" : "true";
    setLocalEdits((p) => ({ ...p, [key]: newVal }));
    updateMutation.mutate({ key, value: newVal });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your ClawOS instance</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-3">
        {settingsMeta.map((s) => (
          <div key={s.key} className="p-5 rounded-xl surface-elevated space-y-2">
            <label className="text-[11px] text-muted-foreground font-medium">{s.label}</label>
            <input
              type={s.type}
              value={getValue(s.key)}
              onChange={(e) => setLocalEdits((p) => ({ ...p, [s.key]: e.target.value }))}
              onBlur={() => handleBlur(s.key)}
              className="w-full bg-muted/60 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-3">
        {togglesMeta.map((t) => {
          const isOn = (localEdits[t.key] ?? settings[t.key]) === "true";
          return (
            <div key={t.key} className="flex items-center justify-between p-5 rounded-xl surface-elevated">
              <div>
                <div className="text-sm text-foreground font-medium">{t.label}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
              </div>
              <button
                onClick={() => handleToggle(t.key)}
                className={cn(
                  "w-10 h-[22px] rounded-full relative transition-colors duration-200",
                  isOn ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "absolute top-[3px] w-4 h-4 rounded-full bg-foreground transition-all duration-200",
                  isOn ? "right-[3px]" : "left-[3px]"
                )} />
              </button>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default SettingsPage;
