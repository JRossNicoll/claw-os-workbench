import { ArrowRight, Clock, Zap, Bell, Database, Search, Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const triggers = [
  { id: "schedule", label: "Schedule", description: "Run on a timer", icon: Clock },
  { id: "webhook", label: "Webhook", description: "Triggered by external event", icon: Zap },
];

const actions = [
  { id: "scan", label: "Run Scanner", description: "Scan tokens or data", icon: Search },
  { id: "alert", label: "Send Alert", description: "Notify via Telegram or Discord", icon: Send },
  { id: "store", label: "Store Result", description: "Save data for later", icon: Database },
];

export function StepFirstAutomation() {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        Create your first automation
      </h1>
      <p className="text-muted-foreground text-[15px] mt-2 mb-8">
        Pick a trigger and an action — you can customize it later
      </p>

      <div className="flex items-start gap-4">
        {/* Trigger */}
        <div className="flex-1 space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trigger</span>
          {triggers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTrigger(t.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl surface-elevated text-left transition-all duration-200",
                selectedTrigger === t.id
                  ? "border-primary ring-1 ring-primary/30 glow-sm"
                  : "hover:border-primary/20"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                selectedTrigger === t.id ? "bg-primary/20" : "bg-muted"
              )}>
                <t.icon className={cn(
                  "w-4 h-4 transition-colors",
                  selectedTrigger === t.id ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Arrow */}
        <div className="flex items-center pt-8">
          <ArrowRight className="w-5 h-5 text-muted-foreground/40" />
        </div>

        {/* Action */}
        <div className="flex-1 space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</span>
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAction(a.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl surface-elevated text-left transition-all duration-200",
                selectedAction === a.id
                  ? "border-primary ring-1 ring-primary/30 glow-sm"
                  : "hover:border-primary/20"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                selectedAction === a.id ? "bg-primary/20" : "bg-muted"
              )}>
                <a.icon className={cn(
                  "w-4 h-4 transition-colors",
                  selectedAction === a.id ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{a.label}</div>
                <div className="text-xs text-muted-foreground">{a.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTrigger && selectedAction && (
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-foreground/80">
          <span className="text-primary font-medium">Preview:</span>{" "}
          When {triggers.find((t) => t.id === selectedTrigger)?.label.toLowerCase()} fires →{" "}
          {actions.find((a) => a.id === selectedAction)?.label.toLowerCase()}
        </div>
      )}
    </div>
  );
}
