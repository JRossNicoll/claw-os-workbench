import { MessageSquare, Webhook, BarChart3, Bot, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "telegram", name: "Telegram Alerts", description: "Send alerts to Telegram channels", icon: MessageSquare },
  { id: "webhook", name: "Webhook Trigger", description: "Listen for incoming webhook events", icon: Webhook },
  { id: "monitor", name: "Data Monitor", description: "Watch data sources for changes", icon: BarChart3 },
  { id: "ai-agent", name: "AI Agent", description: "Intelligent automation with AI reasoning", icon: Bot },
];

interface StepToolsProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function StepTools({ selected, onToggle }: StepToolsProps) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        Choose your tools
      </h1>
      <p className="text-muted-foreground text-[15px] mt-2 mb-8">
        Select tools to install — you can add more later
      </p>

      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => {
          const isSelected = selected.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => onToggle(tool.id)}
              className={cn(
                "relative flex flex-col items-start p-5 rounded-xl surface-elevated text-left transition-all duration-200",
                isSelected
                  ? "border-primary ring-1 ring-primary/30 glow-sm"
                  : "hover:border-primary/20"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                isSelected ? "bg-primary/20" : "bg-muted"
              )}>
                <tool.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className="text-sm font-medium text-foreground">{tool.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{tool.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
