import { MessageSquare, Radio, BarChart3, Bot, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const engines = [
  { id: "telegram", name: "Telegram Alerts", description: "Real-time alerts to Telegram", icon: MessageSquare },
  { id: "incoming-signal", name: "Incoming Signal", description: "Listen for external events", icon: Radio },
  { id: "monitor", name: "Data Monitor", description: "Watch sources for changes", icon: BarChart3 },
  { id: "ai-agent", name: "AI Assistant", description: "AI-powered reasoning engine", icon: Bot },
  { id: "email", name: "Email Notifications", description: "Formatted email alerts", icon: Mail },
];

interface StepToolsProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function StepTools({ selected, onToggle }: StepToolsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground tracking-tight text-center">
        Install engines
      </h2>
      <p className="text-sm text-muted-foreground text-center mt-1.5 mb-10">
        Engines power your automations — add more anytime
      </p>

      <div className="space-y-2">
        {engines.map((engine) => {
          const isSelected = selected.includes(engine.id);
          return (
            <button
              key={engine.id}
              onClick={() => onToggle(engine.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg surface-elevated text-left transition-all duration-200",
                isSelected ? "border-primary/40" : "hover:border-primary/15"
              )}
            >
              <engine.icon className={cn(
                "w-4 h-4 flex-shrink-0 transition-colors",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">{engine.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{engine.description}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
