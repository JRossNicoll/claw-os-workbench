import { Download, Play, Pause, CheckCircle, AlertTriangle, Wifi, Cog, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const eventIcons: Record<string, typeof CheckCircle> = {
  installed: Download,
  started: Play,
  paused: Pause,
  completed: CheckCircle,
  warning: AlertTriangle,
  online: Wifi,
  updated: RefreshCw,
};

const eventColors: Record<string, string> = {
  installed: "text-info",
  started: "text-success",
  paused: "text-warning",
  completed: "text-success",
  warning: "text-warning",
  online: "text-info",
  updated: "text-primary",
};

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  detail?: string;
}

const mockEvents: ActivityEvent[] = [
  { id: "1", type: "started", message: "Market Scanner automation started", timestamp: "2 min ago", detail: "Triggered by schedule" },
  { id: "2", type: "installed", message: "AI Assistant Engine installed", timestamp: "8 min ago", detail: "v3.0.1 · Verified" },
  { id: "3", type: "completed", message: "Website Monitor completed run #47", timestamp: "15 min ago", detail: "All checks passed · 1.2s" },
  { id: "4", type: "online", message: "Worker node-03 came online", timestamp: "22 min ago" },
  { id: "5", type: "paused", message: "Data Pipeline paused for approval", timestamp: "35 min ago", detail: "Awaiting manual confirmation" },
  { id: "6", type: "warning", message: "Telegram Alerts rate limit approaching", timestamp: "1h ago", detail: "42/50 messages sent this window" },
  { id: "7", type: "updated", message: "Price Oracle Engine updated to v1.8.1", timestamp: "2h ago" },
  { id: "8", type: "started", message: "Nightly report automation triggered", timestamp: "3h ago" },
  { id: "9", type: "completed", message: "GitHub Monitor finished scan", timestamp: "4h ago", detail: "3 new commits detected" },
  { id: "10", type: "installed", message: "Discord Alerts Engine installed", timestamp: "5h ago", detail: "v1.1.0" },
];

const Activity = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-lg font-semibold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Live system events</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-1"
      >
        {mockEvents.map((event, i) => {
          const Icon = eventIcons[event.type] || Cog;
          const color = eventColors[event.type] || "text-muted-foreground";
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
              className="flex items-start gap-3.5 p-3.5 rounded-lg surface-elevated"
            >
              <div className={cn("mt-0.5 flex-shrink-0", color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground">{event.message}</p>
                {event.detail && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{event.detail}</p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 mt-0.5">{event.timestamp}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Activity;
