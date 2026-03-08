import { Monitor, Zap, Brain, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const purposes = [
  { id: "monitor", label: "Monitor Systems", description: "Track wallets, tokens, and on-chain activity", icon: Monitor },
  { id: "automate", label: "Run Automations", description: "Schedule tasks and trigger workflows automatically", icon: Zap },
  { id: "ai", label: "AI Workflows", description: "Build intelligent pipelines with AI agents", icon: Brain },
  { id: "custom", label: "Custom Automation", description: "Create something unique from scratch", icon: Wrench },
];

interface StepPurposeProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function StepPurpose({ selected, onSelect }: StepPurposeProps) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        What do you want ClawOS to do?
      </h1>
      <p className="text-muted-foreground text-[15px] mt-2 mb-8">
        We'll customize your experience based on your goals
      </p>

      <div className="grid grid-cols-2 gap-3">
        {purposes.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              "flex flex-col items-start p-5 rounded-xl surface-elevated text-left transition-all duration-200",
              selected === p.id
                ? "border-primary ring-1 ring-primary/30 glow-sm"
                : "hover:border-primary/20"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
              selected === p.id ? "bg-primary/20" : "bg-muted"
            )}>
              <p.icon className={cn(
                "w-5 h-5 transition-colors",
                selected === p.id ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-sm font-medium text-foreground">{p.label}</span>
            <span className="text-xs text-muted-foreground mt-1">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
