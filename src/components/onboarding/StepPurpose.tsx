import { Monitor, Zap, Brain, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const purposes = [
  { id: "monitor", label: "Monitor", description: "Track systems, wallets, or data in real time", icon: Monitor },
  { id: "automate", label: "Automate", description: "Schedule and trigger tasks automatically", icon: Zap },
  { id: "ai", label: "AI Workflows", description: "Build pipelines powered by AI agents", icon: Brain },
  { id: "custom", label: "Connect Apps", description: "Wire up services and build integrations", icon: Wrench },
];

interface StepPurposeProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function StepPurpose({ selected, onSelect }: StepPurposeProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground tracking-tight text-center">
        What will ClawOS do for you?
      </h2>
      <p className="text-sm text-muted-foreground text-center mt-1.5 mb-10">
        You can always change this later
      </p>

      <div className="space-y-2">
        {purposes.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-lg surface-elevated text-left transition-all duration-200",
              selected === p.id
                ? "border-primary/40"
                : "hover:border-primary/15"
            )}
          >
            <p.icon className={cn(
              "w-4 h-4 flex-shrink-0 transition-colors",
              selected === p.id ? "text-primary" : "text-muted-foreground"
            )} />
            <div>
              <span className="text-sm font-medium text-foreground">{p.label}</span>
              <span className="text-xs text-muted-foreground ml-2">{p.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
