import { Monitor, Zap, Brain, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const purposes = [
  { id: "monitor", label: "Monitor something", description: "Track wallets, prices, or on-chain activity in real time", icon: Monitor },
  { id: "automate", label: "Run automations", description: "Schedule tasks and trigger actions automatically", icon: Zap },
  { id: "ai", label: "AI workflows", description: "Build intelligent pipelines powered by AI agents", icon: Brain },
  { id: "custom", label: "Connect apps", description: "Wire up services and build custom integrations", icon: Wrench },
];

interface StepPurposeProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function StepPurpose({ selected, onSelect }: StepPurposeProps) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        What would you like ClawOS to help with?
      </h1>
      <p className="text-muted-foreground text-[15px] mt-2.5 mb-10">
        Pick your primary goal — you can always do more later
      </p>

      <div className="grid grid-cols-2 gap-4">
        {purposes.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              "flex flex-col items-start p-6 rounded-2xl surface-elevated text-left transition-all duration-300",
              selected === p.id
                ? "border-primary ring-1 ring-primary/25 glow-sm"
                : "hover:border-primary/15"
            )}
          >
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
              selected === p.id ? "bg-primary/20 scale-105" : "bg-muted"
            )}>
              <p.icon className={cn(
                "w-5 h-5 transition-colors",
                selected === p.id ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-sm font-medium text-foreground">{p.label}</span>
            <span className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
