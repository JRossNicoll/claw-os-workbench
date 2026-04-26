import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Globe, Sparkles, Clock, FileText, GitBranch, Wand2, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddAutomation, type StepKind, type BuilderStep } from "@/hooks/use-automations";
import { toast } from "sonner";

const KIND_META: Record<StepKind, { label: string; icon: typeof Globe; color: string; desc: string }> = {
  http: { label: "HTTP Request", icon: Globe, color: "text-info", desc: "Call any REST API" },
  ai: { label: "AI Prompt", icon: Sparkles, color: "text-primary", desc: "Run a Lovable AI completion" },
  delay: { label: "Delay", icon: Clock, color: "text-warning", desc: "Wait N milliseconds" },
  log: { label: "Log Message", icon: FileText, color: "text-muted-foreground", desc: "Write to run logs" },
  condition: { label: "Condition", icon: GitBranch, color: "text-success", desc: "Evaluate an expression" },
  transform: { label: "Transform", icon: Wand2, color: "text-info", desc: "Set a variable from prior output" },
};

const TRIGGERS = ["Manual", "Every 5 min", "Every 1 hour", "Daily 6:00 AM", "Webhook"];

function defaultConfig(kind: StepKind): Record<string, any> {
  switch (kind) {
    case "http": return { method: "GET", url: "https://api.github.com/repos/lovable-dev/lovable" };
    case "ai": return { model: "google/gemini-3-flash-preview", prompt: "Summarize: {{steps.0.output.body.description}}" };
    case "delay": return { ms: 1000 };
    case "log": return { level: "info", message: "Hello from ClawOS" };
    case "condition": return { expr: "{{steps.0.output.ok}} === true" };
    case "transform": return { from: "steps.0.output.body", into: "data" };
  }
}

export function AutomationBuilder({ onClose }: { onClose: () => void }) {
  const addAutomation = useAddAutomation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("Manual");
  const [steps, setSteps] = useState<BuilderStep[]>([
    { name: "Fetch repo info", kind: "http", config: defaultConfig("http") },
  ]);
  const [openStep, setOpenStep] = useState<number | null>(0);

  const addStep = (kind: StepKind) => {
    setSteps((s) => [
      ...s,
      { name: KIND_META[kind].label, kind, config: defaultConfig(kind) },
    ]);
    setOpenStep(steps.length);
  };
  const removeStep = (i: number) => setSteps((s) => s.filter((_, idx) => idx !== i));
  const updateStep = (i: number, patch: Partial<BuilderStep>) =>
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));
  const updateConfig = (i: number, patch: Record<string, any>) =>
    setSteps((s) =>
      s.map((st, idx) => (idx === i ? { ...st, config: { ...st.config, ...patch } } : st)),
    );

  const handleSave = () => {
    if (!name.trim()) return toast.error("Name is required");
    if (steps.length === 0) return toast.error("Add at least one step");
    addAutomation.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        trigger,
        steps,
        status: "active",
      },
      {
        onSuccess: () => {
          toast.success("Automation created");
          onClose();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        className="w-full max-w-2xl my-8 surface-elevated rounded-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">New Automation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Compose typed steps that actually execute on your Lovable Cloud backend.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground font-medium">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GitHub PR digest"
                className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground font-medium">Trigger</label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-muted-foreground font-medium">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this automation do?"
              className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Steps</span>
              <span className="text-[10px] text-muted-foreground/60">{steps.length} step{steps.length === 1 ? "" : "s"}</span>
            </div>

            {steps.map((s, i) => {
              const Meta = KIND_META[s.kind];
              const Icon = Meta.icon;
              const isOpen = openStep === i;
              return (
                <div key={i} className="rounded-lg border border-border bg-background/40">
                  <button
                    onClick={() => setOpenStep(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-mono">{i + 1}</div>
                    <Icon className={cn("w-3.5 h-3.5", Meta.color)} />
                    <input
                      value={s.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStep(i, { name: e.target.value })}
                      className="flex-1 bg-transparent text-xs text-foreground focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground">{Meta.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeStep(i); }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border">
                          {s.kind === "http" && (
                            <>
                              <div className="grid grid-cols-[80px_1fr] gap-2">
                                <select
                                  value={s.config.method ?? "GET"}
                                  onChange={(e) => updateConfig(i, { method: e.target.value })}
                                  className="px-2 py-1.5 rounded-md text-xs bg-background border border-border"
                                >
                                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m}>{m}</option>)}
                                </select>
                                <input
                                  value={s.config.url ?? ""}
                                  onChange={(e) => updateConfig(i, { url: e.target.value })}
                                  placeholder="https://api.example.com/..."
                                  className="px-2 py-1.5 rounded-md text-xs bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              {!["GET", "HEAD"].includes(String(s.config.method ?? "GET")) && (
                                <textarea
                                  value={typeof s.config.body === "string" ? s.config.body : JSON.stringify(s.config.body ?? {}, null, 2)}
                                  onChange={(e) => updateConfig(i, { body: e.target.value })}
                                  placeholder='{"key":"value"}'
                                  rows={3}
                                  className="w-full px-2 py-1.5 rounded-md text-[11px] font-mono bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                              )}
                            </>
                          )}
                          {s.kind === "ai" && (
                            <>
                              <select
                                value={s.config.model ?? "google/gemini-3-flash-preview"}
                                onChange={(e) => updateConfig(i, { model: e.target.value })}
                                className="w-full px-2 py-1.5 rounded-md text-xs bg-background border border-border"
                              >
                                <option value="google/gemini-3-flash-preview">Gemini 3 Flash (fast, default)</option>
                                <option value="google/gemini-2.5-pro">Gemini 2.5 Pro (deep reasoning)</option>
                                <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (balanced)</option>
                                <option value="openai/gpt-5">GPT-5 (powerful)</option>
                                <option value="openai/gpt-5-mini">GPT-5 Mini</option>
                              </select>
                              <textarea
                                value={s.config.prompt ?? ""}
                                onChange={(e) => updateConfig(i, { prompt: e.target.value })}
                                placeholder="Prompt — supports {{steps.0.output.body}} interpolation"
                                rows={3}
                                className="w-full px-2 py-1.5 rounded-md text-[11px] bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                              />
                            </>
                          )}
                          {s.kind === "delay" && (
                            <input
                              type="number"
                              value={s.config.ms ?? 1000}
                              onChange={(e) => updateConfig(i, { ms: Number(e.target.value) })}
                              min={0} max={30000}
                              className="w-full px-2 py-1.5 rounded-md text-xs bg-background border border-border"
                            />
                          )}
                          {s.kind === "log" && (
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                              <select
                                value={s.config.level ?? "info"}
                                onChange={(e) => updateConfig(i, { level: e.target.value })}
                                className="px-2 py-1.5 rounded-md text-xs bg-background border border-border"
                              >
                                {["info", "warn", "error", "debug"].map((l) => <option key={l}>{l}</option>)}
                              </select>
                              <input
                                value={s.config.message ?? ""}
                                onChange={(e) => updateConfig(i, { message: e.target.value })}
                                placeholder="Log message"
                                className="px-2 py-1.5 rounded-md text-xs bg-background border border-border"
                              />
                            </div>
                          )}
                          {s.kind === "condition" && (
                            <input
                              value={s.config.expr ?? ""}
                              onChange={(e) => updateConfig(i, { expr: e.target.value })}
                              placeholder="{{steps.0.output.status}} === 200"
                              className="w-full px-2 py-1.5 rounded-md text-[11px] font-mono bg-background border border-border"
                            />
                          )}
                          {s.kind === "transform" && (
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                value={s.config.from ?? ""}
                                onChange={(e) => updateConfig(i, { from: e.target.value })}
                                placeholder="from path e.g. steps.0.output.body"
                                className="px-2 py-1.5 rounded-md text-[11px] font-mono bg-background border border-border"
                              />
                              <input
                                value={s.config.into ?? ""}
                                onChange={(e) => updateConfig(i, { into: e.target.value })}
                                placeholder="into var name"
                                className="px-2 py-1.5 rounded-md text-[11px] font-mono bg-background border border-border"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <input
                              value={s.condition ?? ""}
                              onChange={(e) => updateStep(i, { condition: e.target.value || null })}
                              placeholder="Run only if (optional) — e.g. {{steps.0.output.ok}} === true"
                              className="px-2 py-1.5 rounded-md text-[10px] font-mono bg-background border border-border"
                            />
                            <input
                              type="number"
                              value={s.retry?.maxRetries ?? 0}
                              onChange={(e) => updateStep(i, { retry: { maxRetries: Number(e.target.value), delay: "400ms" } })}
                              min={0} max={5}
                              placeholder="Max retries"
                              className="px-2 py-1.5 rounded-md text-[10px] font-mono bg-background border border-border"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(Object.keys(KIND_META) as StepKind[]).map((k) => {
                const M = KIND_META[k];
                const Icon = M.icon;
                return (
                  <button
                    key={k}
                    onClick={() => addStep(k)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border bg-background/40 hover:border-primary/30 transition-colors text-left"
                  >
                    <Icon className={cn("w-3.5 h-3.5", M.color)} />
                    <div>
                      <div className="text-[11px] text-foreground font-medium leading-tight">{M.label}</div>
                      <div className="text-[9px] text-muted-foreground">{M.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-background/40">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-card">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={addAutomation.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {addAutomation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Create automation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
