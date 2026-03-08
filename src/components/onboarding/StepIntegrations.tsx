import { Github, Hexagon, MessageSquare, Key, Check, Link2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const integrations = [
  { id: "github", name: "GitHub", description: "Connect repositories", icon: Github },
  { id: "openclaw", name: "OpenClaw", description: "ClawOS ecosystem", icon: Hexagon },
  { id: "telegram", name: "Telegram", description: "Bot integration", icon: MessageSquare },
  { id: "api-keys", name: "API Keys", description: "Custom service credentials", icon: Key },
];

export function StepIntegrations() {
  const [connected, setConnected] = useState<string[]>([]);
  const toggle = (id: string) => setConnected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground tracking-tight text-center">Connect integrations</h2>
      <p className="text-xs text-muted-foreground text-center mt-1.5 mb-8">Link your services — you can skip this</p>
      <div className="space-y-1.5">
        {integrations.map((item) => {
          const isConnected = connected.includes(item.id);
          return (
            <button key={item.id} onClick={() => toggle(item.id)} className={cn("w-full flex items-center gap-3.5 p-3.5 rounded-lg surface-elevated text-left transition-all duration-200", isConnected ? "border-primary/40" : "hover:border-primary/15")}>
              {isConnected ? <Check className="w-4 h-4 text-primary flex-shrink-0" /> : <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <div className="flex-1">
                <span className="text-[13px] font-medium text-foreground">{item.name}</span>
                <span className="text-[11px] text-muted-foreground ml-2">{item.description}</span>
              </div>
              <span className={cn("text-[10px] font-medium", isConnected ? "text-primary" : "text-muted-foreground/40")}>{isConnected ? "Connected" : "Connect"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
