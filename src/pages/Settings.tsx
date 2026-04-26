import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Download, Upload, Trash2, Database, Cpu, GitBranch, Keyboard } from "lucide-react";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const settingsMeta = [
  { key: "name", label: "Instance Name", type: "text", placeholder: "ClawOS Production" },
  { key: "endpoint", label: "API Endpoint", type: "text", placeholder: "https://api.clawos.lol" },
  { key: "retention", label: "Log Retention (days)", type: "text", placeholder: "30" },
];

const togglesMeta = [
  { key: "autorestart", label: "Auto-restart failed tasks", description: "Automatically retry failed automation runs" },
  { key: "notifications", label: "Push notifications", description: "Get notified when automations complete or fail" },
  { key: "analytics", label: "Usage analytics", description: "Help improve ClawOS by sharing anonymous usage data" },
  { key: "compact_mode", label: "Compact density", description: "Tighter spacing across the workspace" },
  { key: "verbose_logs", label: "Verbose run logs", description: "Capture step-level debug output during automation runs" },
];

const SHORTCUTS = [
  { keys: "⌘ K", action: "Open command palette" },
  { keys: "G then A", action: "Go to Automations" },
  { keys: "G then R", action: "Go to Runs" },
  { keys: "G then S", action: "Go to System" },
  { keys: "?", action: "Show all shortcuts" },
];

const TABLES_TO_BACKUP = ["automations", "automation_steps", "agents", "engines", "integrations", "secrets", "settings"] as const;

const SettingsPage = () => {
  const { data: settings = {}, isLoading } = useSettings();
  const updateMutation = useUpdateSetting();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const getValue = (key: string) => localEdits[key] ?? settings[key] ?? "";

  const handleBlur = (key: string) => {
    const val = localEdits[key];
    if (val !== undefined && val !== settings[key]) {
      updateMutation.mutate({ key, value: val }, { onSuccess: () => toast.success("Setting saved") });
    }
  };

  const handleToggle = (key: string) => {
    const current = (localEdits[key] ?? settings[key]) === "true";
    const newVal = current ? "false" : "true";
    setLocalEdits((p) => ({ ...p, [key]: newVal }));
    updateMutation.mutate({ key, value: newVal });
  };

  const handleExportWorkspace = async () => {
    setBusy("export");
    const dump: Record<string, any[]> = {};
    for (const table of TABLES_TO_BACKUP) {
      const { data, error } = await (supabase.from(table as any).select("*") as any);
      if (error) { toast.error(`Failed: ${table}`); setBusy(null); return; }
      dump[table] = data || [];
    }
    const blob = new Blob([JSON.stringify({ version: 1, exported_at: new Date().toISOString(), data: dump }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `clawos-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Workspace exported");
    setBusy(null);
  };

  const handleImportWorkspace = async (file: File) => {
    setBusy("import");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed?.data) throw new Error("Invalid backup file");
      let inserted = 0;
      for (const table of TABLES_TO_BACKUP) {
        const rows = parsed.data[table];
        if (!Array.isArray(rows) || !rows.length) continue;
        const { error } = await (supabase.from(table as any).upsert(rows) as any);
        if (!error) inserted += rows.length;
      }
      toast.success(`Imported ${inserted} records`);
      qc.invalidateQueries();
    } catch (e: any) {
      toast.error(e?.message || "Import failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleClearRuns = async () => {
    if (!confirm("Permanently delete all run history and step traces?")) return;
    setBusy("runs");
    await supabase.from("step_runs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("runs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setBusy(null);
    toast.success("Run history cleared");
    qc.invalidateQueries({ queryKey: ["runs"] });
  };

  const handleResetWorkspace = async () => {
    if (!confirm("This wipes ALL automations, agents, runs and chat history. Continue?")) return;
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;
    setBusy("reset");
    for (const t of ["chat_messages", "step_runs", "runs", "automation_steps", "automations", "agents"]) {
      await supabase.from(t as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }
    setBusy(null);
    toast.success("Workspace reset");
    qc.invalidateQueries();
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

      {/* Instance config */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.04 }} className="space-y-3">
        <h2 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Instance</h2>
        {settingsMeta.map((s) => (
          <div key={s.key} className="p-5 rounded-xl surface-elevated space-y-2">
            <label className="text-[11px] text-muted-foreground font-medium">{s.label}</label>
            <input
              type={s.type}
              value={getValue(s.key)}
              placeholder={s.placeholder}
              onChange={(e) => setLocalEdits((p) => ({ ...p, [s.key]: e.target.value }))}
              onBlur={() => handleBlur(s.key)}
              className="w-full bg-muted/60 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        ))}
      </motion.div>

      {/* Toggles */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className="space-y-3">
        <h2 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Preferences</h2>
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
                  "w-10 h-[22px] rounded-full relative transition-colors duration-200 flex-shrink-0 ml-4",
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

      {/* Backup / Restore */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }} className="space-y-3">
        <h2 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Workspace Backup</h2>
        <div className="p-5 rounded-xl surface-elevated space-y-4">
          <div className="flex items-start gap-3">
            <Database className="w-4 h-4 text-muted-foreground/60 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-foreground font-medium">Export workspace</div>
              <p className="text-xs text-muted-foreground mt-0.5">Snapshot of automations, agents, engines, integrations and settings as JSON.</p>
            </div>
            <button
              onClick={handleExportWorkspace}
              disabled={busy === "export"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-foreground border border-border hover:bg-card transition-colors disabled:opacity-50"
            >
              {busy === "export" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Export
            </button>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-start gap-3">
            <Upload className="w-4 h-4 text-muted-foreground/60 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-foreground font-medium">Import workspace</div>
              <p className="text-xs text-muted-foreground mt-0.5">Upserts records from a previously exported backup file.</p>
            </div>
            <input
              ref={fileRef} type="file" accept="application/json" hidden
              onChange={(e) => e.target.files?.[0] && handleImportWorkspace(e.target.files[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy === "import"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-foreground border border-border hover:bg-card transition-colors disabled:opacity-50"
            >
              {busy === "import" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Import
            </button>
          </div>
        </div>
      </motion.div>

      {/* Shortcuts */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }} className="space-y-3">
        <h2 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
          <Keyboard className="w-3 h-3" /> Keyboard Shortcuts
        </h2>
        <div className="p-5 rounded-xl surface-elevated space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.action} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{s.action}</span>
              <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-[10px] text-muted-foreground font-mono">{s.keys}</kbd>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System info */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }} className="space-y-3">
        <h2 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">System</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Cpu, label: "Build", value: "v1.0.0" },
            { icon: GitBranch, label: "Channel", value: "stable" },
            { icon: Database, label: "Region", value: "us-east-1" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-lg surface-elevated text-center space-y-1">
              <s.icon className="w-3 h-3 text-muted-foreground/40 mx-auto" />
              <div className="text-xs font-mono text-foreground">{s.value}</div>
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }} className="space-y-3">
        <h2 className="text-[11px] font-semibold text-destructive/80 uppercase tracking-widest">Danger Zone</h2>
        <div className="p-5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-foreground font-medium">Clear run history</div>
              <p className="text-xs text-muted-foreground mt-0.5">Removes all run records and step traces.</p>
            </div>
            <button
              onClick={handleClearRuns}
              disabled={busy === "runs"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {busy === "runs" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Clear runs
            </button>
          </div>
          <div className="h-px bg-destructive/15" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-foreground font-medium">Reset workspace</div>
              <p className="text-xs text-muted-foreground mt-0.5">Deletes automations, agents, runs and chat. Settings preserved.</p>
            </div>
            <button
              onClick={handleResetWorkspace}
              disabled={busy === "reset"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {busy === "reset" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Reset
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
