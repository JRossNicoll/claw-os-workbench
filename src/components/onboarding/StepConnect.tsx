import { Link2, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const services = [
  { id: "telegram", name: "Telegram Bot", description: "Bot token for alerts" },
  { id: "etherscan", name: "Etherscan", description: "Blockchain data API key" },
  { id: "alchemy", name: "Alchemy", description: "Web3 node provider" },
  { id: "discord", name: "Discord", description: "Webhook for channel updates" },
];

export function StepConnect() {
  const [connected, setConnected] = useState<string[]>([]);
  const toggle = (id: string) => setConnected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground tracking-tight text-center">
        Connect services
      </h2>
      <p className="text-sm text-muted-foreground text-center mt-1.5 mb-10">
        Link API keys — you can skip this step
      </p>

      <div className="space-y-2">
        {services.map((service) => {
          const isConnected = connected.includes(service.id);
          return (
            <button
              key={service.id}
              onClick={() => toggle(service.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg surface-elevated text-left transition-all duration-200",
                isConnected ? "border-primary/40" : "hover:border-primary/15"
              )}
            >
              {isConnected ? (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              ) : (
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">{service.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{service.description}</span>
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-colors",
                isConnected ? "text-primary" : "text-muted-foreground/50"
              )}>
                {isConnected ? "Connected" : "Connect"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
