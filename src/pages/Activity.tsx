import {
  Download, Play, Pause, CheckCircle, AlertTriangle,
  Wifi, RefreshCw, Shield, Zap, Server, Bot,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getEvents } from "@/lib/store";

const eventConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; ring: string }> = {
  installed: { icon: Download, bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  started: { icon: Play, bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  paused: { icon: Pause, bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
  completed: { icon: CheckCircle, bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  warning: { icon: AlertTriangle, bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
  online: { icon: Wifi, bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  updated: { icon: RefreshCw, bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  security: { icon: Shield, bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive/20" },
};

const fallbackConfig = { icon: Zap, bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" };

const categoryColors: Record<string, string> = {
  Automation: "text-success bg-success/8",
  Engine: "text-info bg-info/8",
  System: "text-primary bg-primary/8",
  Integration: "text-warning bg-warning/8",
  Agent: "text-primary bg-primary/8",
};

const Activity = () => {
  const events = getEvents();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Live system events and audit log</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium">Live</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />
        <div className="space-y-1">
          {events.map((event, i) => {
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
                  {event.detail && <p className="text-[11px] text-muted-foreground mt-1">{event.detail}</p>}
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
