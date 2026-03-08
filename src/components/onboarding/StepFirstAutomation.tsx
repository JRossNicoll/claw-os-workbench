import { ArrowRight, Clock, Radio, Search, Send, Database } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const triggers = [
  { id: "schedule", label: "Schedule", description: "Run on a timer", icon: Clock },
  { id: "signal", label: "Incoming Signal", description: "Triggered by an external event", icon: Radio },
];

const actions = [
  { id: "scan", label: "Run Scanner", description: "Scan tokens or data sources", icon: Search },
  { id: "alert", label: "Send Alert", description: "Notify via Telegram or email", icon: Send },
  { id: "store", label: "Store Result", description: "Save output for later use", icon: Database },
];

export function StepFirstAutomation() {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        Create your first automation
      </h1>
      <p className="text-muted-foreground text-[15px] mt-2.5 mb-10">
        Pick a trigger and an action — you can refine it later
      </p>

      <div className="flex items-start gap-5">
        {/* Trigger */}
        <div className="flex-1 space-y-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">When this happens</span>
          {triggers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTrigger(t.id)}
              className={cn(
                "w-full flex items-center gap-3 p-5 rounded-2xl surface-elevated text-left transition-all duration-300",
                selectedTrigger === t.id
                  ? "border-primary ring-1 ring-primary/25 glow-sm"
                  : "hover:border-primary/15"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                selectedTrigger === t.id ? "bg-primary/20 scale-105" : "bg-muted"
              )}>
                <t.icon className={cn(
                  "w-4 h-4 transition-colors",
                  selectedTrigger === t.id ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Arrow */}
        <div className="flex items-center pt-10">
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
          </div>
        </div>

        {/* Action */}
        <div className="flex-1 space-y-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Do this</span>
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAction(a.id)}
              className={cn(
                "w-full flex items-center gap-3 p-5 rounded-2xl surface-elevated text-left transition-all duration-300",
                selectedAction === a.id
                  ? "border-primary ring-1 ring-primary/25 glow-sm"
                  : "hover:border-primary/15"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                selectedAction === a.id ? "bg-primary/20 scale-105" : "bg-muted"
              )}>
                <a.icon className={cn(
                  "w-4 h-4 transition-colors",
                  selectedAction === a.id ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{a.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTrigger && selectedAction && (
        <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/15 text-sm text-foreground/80">
          <span className="text-primary font-medium">Preview:</span>{" "}
          When {triggers.find((t) => t.id === selectedTrigger)?.label.toLowerCase()} fires →{" "}
          {actions.find((a) => a.id === selectedAction)?.label.toLowerCase()}
        </div>
      )}
    </div>
  );
}
