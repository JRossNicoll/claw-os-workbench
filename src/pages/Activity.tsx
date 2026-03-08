import {
  Download, Play, Pause, CheckCircle, AlertTriangle,
  Wifi, RefreshCw, Shield, Zap, Server,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const eventConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; ring: string }> = {
  installed: { icon: Download, bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  started:   { icon: Play, bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  paused:    { icon: Pause, bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
  completed: { icon: CheckCircle, bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  warning:   { icon: AlertTriangle, bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
  online:    { icon: Wifi, bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  updated:   { icon: RefreshCw, bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  security:  { icon: Shield, bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive/20" },
};

const fallbackConfig = { icon: Zap, bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" };

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  detail?: string;
  category?: string;
}

const mockEvents: ActivityEvent[] = [
  { id: "1", type: "started", message: "Market Scanner automation started", timestamp: "2 min ago", detail: "Triggered by schedule", category: "Automation" },
  { id: "2", type: "installed", message: "AI Assistant Engine installed", timestamp: "8 min ago", detail: "v3.0.1 · Verified", category: "Engine" },
  { id: "3", type: "completed", message: "Website Monitor completed run #47", timestamp: "15 min ago", detail: "All checks passed · 1.2s", category: "Automation" },
  { id: "4", type: "online", message: "Worker node-03 came online", timestamp: "22 min ago", category: "System" },
  { id: "5", type: "paused", message: "Data Pipeline paused for approval", timestamp: "35 min ago", detail: "Awaiting manual confirmation", category: "Automation" },
  { id: "6", type: "warning", message: "Telegram Alerts rate limit approaching", timestamp: "1h ago", detail: "42/50 messages sent this window", category: "Integration" },
  { id: "7", type: "updated", message: "Price Oracle Engine updated to v1.8.1", timestamp: "2h ago", category: "Engine" },
  { id: "8", type: "started", message: "Nightly report automation triggered", timestamp: "3h ago", category: "Automation" },
  { id: "9", type: "completed", message: "GitHub Monitor finished scan", timestamp: "4h ago", detail: "3 new commits detected", category: "Automation" },
  { id: "10", type: "installed", message: "Discord Alerts Engine installed", timestamp: "5h ago", detail: "v1.1.0", category: "Engine" },
];

const categoryColors: Record<string, string> = {
  Automation: "text-success bg-success/8",
  Engine: "text-info bg-info/8",
  System: "text-primary bg-primary/8",
  Integration: "text-warning bg-warning/8",
};

const Activity = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-foreground">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Live system events and audit log</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium">Live</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative"
      >
        {/* Timeline line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />

        <div className="space-y-1">
          {mockEvents.map((event, i) => {
            const config = eventConfig[event.type] || fallbackConfig;
            const Icon = config.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
                className="flex items-start gap-3.5 p-3.5 rounded-lg surface-elevated group hover:border-primary/10 transition-all duration-200 relative"
              >
                <div className={cn("w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 ring-1", config.bg, config.ring)}>
                  <Icon className={cn("w-3 h-3", config.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] text-foreground font-medium">{event.message}</p>
                    {event.category && (
                      <span className={cn("text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", categoryColors[event.category] || "text-muted-foreground bg-muted")}>
                        {event.category}
                      </span>
                    )}
                  </div>
                  {event.detail && (
                    <p className="text-[11px] text-muted-foreground mt-1">{event.detail}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 mt-0.5 font-mono">{event.timestamp}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Activity;
