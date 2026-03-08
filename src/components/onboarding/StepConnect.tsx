import { Link2, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const services = [
  { id: "telegram", name: "Telegram Bot", description: "Bot token for sending alerts and notifications" },
  { id: "etherscan", name: "Etherscan", description: "API key for blockchain data and analytics" },
  { id: "alchemy", name: "Alchemy", description: "Node provider for Web3 calls and data" },
  { id: "discord", name: "Discord", description: "Webhook for posting updates to Discord channels" },
];

export function StepConnect() {
  const [connected, setConnected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setConnected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        Connect your services
      </h1>
      <p className="text-muted-foreground text-[15px] mt-2.5 mb-10">
        Link your accounts and API keys — you can always do this later
      </p>

      <div className="space-y-3">
        {services.map((service) => {
          const isConnected = connected.includes(service.id);
          return (
            <button
              key={service.id}
              onClick={() => toggle(service.id)}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-2xl surface-elevated text-left transition-all duration-300",
                isConnected ? "border-primary/25" : "hover:border-primary/15"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isConnected ? "bg-primary/20 scale-105" : "bg-muted"
              )}>
                {isConnected ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{service.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{service.description}</div>
              </div>
              <span className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-300",
                isConnected
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
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
