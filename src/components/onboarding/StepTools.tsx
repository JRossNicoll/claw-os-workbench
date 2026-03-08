import { MessageSquare, Radio, BarChart3, Bot, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "telegram", name: "Telegram Alerts", description: "Send real-time alerts to Telegram channels", icon: MessageSquare },
  { id: "incoming-signal", name: "Incoming Signal", description: "Listen for events from external services", icon: Radio },
  { id: "monitor", name: "Data Monitor", description: "Watch data sources and detect changes", icon: BarChart3 },
  { id: "ai-agent", name: "AI Assistant", description: "Intelligent automation with AI reasoning", icon: Bot },
  { id: "email", name: "Email Notifications", description: "Send formatted email alerts and reports", icon: Mail },
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
      <p className="text-muted-foreground text-[15px] mt-2.5 mb-10">
        Select the tools you'd like to install — add more anytime from the Tool Library
      </p>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => {
          const isSelected = selected.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => onToggle(tool.id)}
              className={cn(
                "relative flex flex-col items-start p-6 rounded-2xl surface-elevated text-left transition-all duration-300",
                isSelected
                  ? "border-primary ring-1 ring-primary/25 glow-sm"
                  : "hover:border-primary/15"
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                isSelected ? "bg-primary/20 scale-105" : "bg-muted"
              )}>
                <tool.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className="text-sm font-medium text-foreground">{tool.name}</span>
              <span className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{tool.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
