import { ArrowDown, Clock, Radio, Cog, Send, Database, Globe, Bot } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const triggers = [
  { id: "schedule", label: "Every 10 minutes", icon: Clock },
  { id: "signal", label: "When a signal arrives", icon: Radio },
  { id: "webhook", label: "On webhook call", icon: Globe },
];

const runActions = [
  { id: "scanner", label: "Market Scanner Engine", icon: Cog },
  { id: "ai", label: "AI Assistant Engine", icon: Bot },
  { id: "monitor", label: "Website Monitor Engine", icon: Globe },
];

const thenActions = [
  { id: "alert", label: "Send Telegram notification", icon: Send },
  { id: "store", label: "Save results to database", icon: Database },
];

export function StepFirstAutomation() {
  const [when, setWhen] = useState<string | null>(null);
  const [run, setRun] = useState<string | null>(null);
  const [then, setThen] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground tracking-tight text-center">Create your first automation</h2>
      <p className="text-xs text-muted-foreground text-center mt-1.5 mb-8">Pick a trigger, an engine to run, and what happens next</p>

      <div className="space-y-4">
        {/* WHEN */}
        <div>
          <span className="text-[10px] font-semibold text-primary uppercase tracking-widest ml-0.5">When</span>
          <div className="space-y-1 mt-2">
            {triggers.map((t) => (
              <button key={t.id} onClick={() => setWhen(t.id)} className={cn("w-full flex items-center gap-3 p-3 rounded-lg surface-elevated text-left transition-all duration-200", when === t.id ? "border-primary/40" : "hover:border-primary/15")}>
                <t.icon className={cn("w-3.5 h-3.5", when === t.id ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-medium text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {when && (
          <>
            <div className="flex justify-center"><ArrowDown className="w-3 h-3 text-muted-foreground/20" /></div>
            <div>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest ml-0.5">Run</span>
              <div className="space-y-1 mt-2">
                {runActions.map((a) => (
                  <button key={a.id} onClick={() => setRun(a.id)} className={cn("w-full flex items-center gap-3 p-3 rounded-lg surface-elevated text-left transition-all duration-200", run === a.id ? "border-primary/40" : "hover:border-primary/15")}>
                    <a.icon className={cn("w-3.5 h-3.5", run === a.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium text-foreground">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {run && (
          <>
            <div className="flex justify-center"><ArrowDown className="w-3 h-3 text-muted-foreground/20" /></div>
            <div>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest ml-0.5">Then</span>
              <div className="space-y-1 mt-2">
                {thenActions.map((a) => (
                  <button key={a.id} onClick={() => setThen(a.id)} className={cn("w-full flex items-center gap-3 p-3 rounded-lg surface-elevated text-left transition-all duration-200", then === a.id ? "border-primary/40" : "hover:border-primary/15")}>
                    <a.icon className={cn("w-3.5 h-3.5", then === a.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium text-foreground">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {when && run && then && (
          <div className="p-3.5 rounded-lg border border-primary/15 bg-primary/3">
            <div className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Preview</div>
            <div className="text-xs text-foreground/70 space-y-1">
              <div><span className="text-muted-foreground">When</span> {triggers.find((t) => t.id === when)?.label}</div>
              <div><span className="text-muted-foreground">Run</span> {runActions.find((a) => a.id === run)?.label}</div>
              <div><span className="text-muted-foreground">Then</span> {thenActions.find((a) => a.id === then)?.label}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
