import { Monitor, Zap, Brain, Link, Bell, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const purposes = [
  { id: "monitor", label: "Monitor something", description: "Track websites, APIs, or data sources", icon: Monitor },
  { id: "ai", label: "Run AI tasks", description: "Analyze data with intelligent engines", icon: Brain },
  { id: "alerts", label: "Send alerts or notifications", description: "Get notified on Telegram, Discord, or email", icon: Bell },
  { id: "automate", label: "Automate workflows", description: "Schedule and chain tasks together", icon: Workflow },
  { id: "connect", label: "Analyze data", description: "Aggregate, transform, and report on data", icon: Zap },
];

interface StepPurposeProps { selected: string | null; onSelect: (id: string) => void; }

export function StepPurpose({ selected, onSelect }: StepPurposeProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground tracking-tight text-center">What do you want to automate?</h2>
      <p className="text-xs text-muted-foreground text-center mt-1.5 mb-8">Pick one to get started — you can always do more later</p>
      <div className="space-y-1.5">
        {purposes.map((p) => (
          <button key={p.id} onClick={() => onSelect(p.id)} className={cn("w-full flex items-center gap-3.5 p-3.5 rounded-lg surface-elevated text-left transition-all duration-200", selected === p.id ? "border-primary/40" : "hover:border-primary/15")}>
            <p.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", selected === p.id ? "text-primary" : "text-muted-foreground")} />
            <div>
              <span className="text-[13px] font-medium text-foreground">{p.label}</span>
              <span className="text-[11px] text-muted-foreground ml-2">{p.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
