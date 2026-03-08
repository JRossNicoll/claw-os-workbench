import { ArrowRight, Clock, Radio, Search, Send, Database } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const triggers = [
  { id: "schedule", label: "Schedule", description: "Run on a timer", icon: Clock },
  { id: "signal", label: "Incoming Signal", description: "External event", icon: Radio },
];

const actions = [
  { id: "scan", label: "Run Scanner", description: "Scan data sources", icon: Search },
  { id: "alert", label: "Send Alert", description: "Notify via channel", icon: Send },
  { id: "store", label: "Store Result", description: "Save output", icon: Database },
];

export function StepFirstAutomation() {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground tracking-tight text-center">
        Your first automation
      </h2>
      <p className="text-sm text-muted-foreground text-center mt-1.5 mb-10">
        Pick a trigger and an action
      </p>

      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest ml-1">When</span>
          {triggers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTrigger(t.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-lg surface-elevated text-left transition-all duration-200",
                selectedTrigger === t.id ? "border-primary/40" : "hover:border-primary/15"
              )}
            >
              <t.icon className={cn("w-3.5 h-3.5 transition-colors", selectedTrigger === t.id ? "text-primary" : "text-muted-foreground")} />
              <div>
                <div className="text-[13px] font-medium text-foreground">{t.label}</div>
                <div className="text-[11px] text-muted-foreground">{t.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center pt-8">
          <ArrowRight className="w-4 h-4 text-muted-foreground/25" />
        </div>

        <div className="flex-1 space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest ml-1">Then</span>
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAction(a.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-lg surface-elevated text-left transition-all duration-200",
                selectedAction === a.id ? "border-primary/40" : "hover:border-primary/15"
              )}
            >
              <a.icon className={cn("w-3.5 h-3.5 transition-colors", selectedAction === a.id ? "text-primary" : "text-muted-foreground")} />
              <div>
                <div className="text-[13px] font-medium text-foreground">{a.label}</div>
                <div className="text-[11px] text-muted-foreground">{a.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTrigger && selectedAction && (
        <div className="mt-8 p-3.5 rounded-lg border border-primary/15 text-xs text-foreground/70 text-center">
          <span className="text-primary font-medium">Preview:</span>{" "}
          {triggers.find((t) => t.id === selectedTrigger)?.label} → {actions.find((a) => a.id === selectedAction)?.label}
        </div>
      )}
    </div>
  );
}
