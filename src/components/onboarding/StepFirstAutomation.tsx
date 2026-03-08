import { ArrowRight, Clock, Radio, Cog, Send, Database } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const triggers = [
  { id: "schedule", label: "Every 10 minutes", icon: Clock },
  { id: "signal", label: "Incoming Signal", icon: Radio },
];

const doActions = [
  { id: "scanner", label: "Run Market Scanner Engine", icon: Cog },
  { id: "store", label: "Store Result", icon: Database },
];

const thenActions = [
  { id: "alert", label: "Send Telegram Alert", icon: Send },
  { id: "store", label: "Save to database", icon: Database },
];

export function StepFirstAutomation() {
  const [when, setWhen] = useState<string | null>(null);
  const [doAction, setDoAction] = useState<string | null>(null);
  const [then, setThen] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground tracking-tight text-center">Your first automation</h2>
      <p className="text-xs text-muted-foreground text-center mt-1.5 mb-8">WHEN → DO → THEN</p>

      <div className="space-y-5">
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
            <div className="flex justify-center"><ArrowRight className="w-3 h-3 text-muted-foreground/20 rotate-90" /></div>
            {/* DO */}
            <div>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest ml-0.5">Do</span>
              <div className="space-y-1 mt-2">
                {doActions.map((a) => (
                  <button key={a.id} onClick={() => setDoAction(a.id)} className={cn("w-full flex items-center gap-3 p-3 rounded-lg surface-elevated text-left transition-all duration-200", doAction === a.id ? "border-primary/40" : "hover:border-primary/15")}>
                    <a.icon className={cn("w-3.5 h-3.5", doAction === a.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium text-foreground">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {doAction && (
          <>
            <div className="flex justify-center"><ArrowRight className="w-3 h-3 text-muted-foreground/20 rotate-90" /></div>
            {/* THEN */}
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

        {when && doAction && then && (
          <div className="p-3 rounded-lg border border-primary/15 text-[11px] text-foreground/60 text-center">
            <span className="text-primary font-medium">Preview:</span>{" "}
            {triggers.find((t) => t.id === when)?.label} → {doActions.find((a) => a.id === doAction)?.label} → {thenActions.find((a) => a.id === then)?.label}
          </div>
        )}
      </div>
    </div>
  );
}
