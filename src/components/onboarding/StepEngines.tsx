import { MessageSquare, BarChart3, Bot, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const engines = [
  { id: "telegram", name: "Telegram Alerts Engine", description: "Send alerts to Telegram", icon: MessageSquare },
  { id: "monitor", name: "Website Monitor Engine", description: "Track uptime and changes", icon: Globe },
  { id: "ai", name: "AI Assistant Engine", description: "AI-powered analysis", icon: Bot },
  { id: "data", name: "Data Monitor Engine", description: "Watch data sources", icon: BarChart3 },
];

interface StepEnginesProps { selected: string[]; onToggle: (id: string) => void; }

export function StepEngines({ selected, onToggle }: StepEnginesProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground tracking-tight text-center">Install engines</h2>
      <p className="text-xs text-muted-foreground text-center mt-1.5 mb-8">Engines power your automations</p>
      <div className="space-y-1.5">
        {engines.map((engine) => {
          const isSelected = selected.includes(engine.id);
          return (
            <button key={engine.id} onClick={() => onToggle(engine.id)} className={cn("w-full flex items-center gap-3.5 p-3.5 rounded-lg surface-elevated text-left transition-all duration-200", isSelected ? "border-primary/40" : "hover:border-primary/15")}>
              <engine.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isSelected ? "text-primary" : "text-muted-foreground")} />
              <div className="flex-1">
                <span className="text-[13px] font-medium text-foreground">{engine.name}</span>
                <span className="text-[11px] text-muted-foreground ml-2">{engine.description}</span>
              </div>
              {isSelected && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
