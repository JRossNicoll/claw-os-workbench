import { useState } from "react";
import { Plus, Play, ArrowRight, Layers, Clock, Cog, Zap, CheckCircle, Download, Wifi, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEventStream } from "@/hooks/use-event-stream";
import { useQuery } from "@tanstack/react-query";
import { getWorkflows } from "@/lib/api";

const eventIcons: Record<string, typeof CheckCircle> = {
  installed: Download,
  started: Play,
  completed: CheckCircle,
  warning: AlertTriangle,
  online: Wifi,
};

const eventColors: Record<string, string> = {
  installed: "text-info",
  started: "text-success",
  completed: "text-success",
  warning: "text-warning",
  online: "text-info",
};

const Home = () => {
  const navigate = useNavigate();
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("clawos-onboarded") === "true");
  const { events: liveEvents, connected: wsConnected } = useEventStream(onboarded);

  const { data: workflowsData, isLoading: workflowsLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: getWorkflows,
    enabled: onboarded,
  });

  const automations: any[] = Array.isArray(workflowsData) ? workflowsData : [];
  const activeAutomations = automations.filter((a: any) => a.status === "active");

  const handleComplete = () => {
    localStorage.setItem("clawos-onboarded", "true");
    setOnboarded(true);
  };

  if (!onboarded) {
    return <OnboardingWizard onComplete={handleComplete} />;
  }

  const recentEvents = liveEvents.length > 0 ? liveEvents.slice(0, 5) : [
    { id: "placeholder-1", type: "info", message: "Waiting for live events...", timestamp: "now" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Mission Control</h1>
            <p className="text-sm text-muted-foreground mt-1">Your automation command center</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", wsConnected ? "bg-success animate-pulse" : "bg-muted-foreground/30")} />
            <span className="text-[10px] text-muted-foreground">{wsConnected ? "Live" : "Connecting..."}</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.04 }} className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Create Automation", icon: Plus, path: "/automations" },
          { label: "Install Engine", icon: Cog, path: "/engines" },
          { label: "Run Task", icon: Play, path: "" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => action.path && navigate(action.path)}
            className="flex items-center gap-3 p-3.5 rounded-lg surface-elevated hover:border-primary/20 transition-all duration-200 text-left"
          >
            <action.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Active Automations */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Active Automations</h2>
          <button onClick={() => navigate("/automations")} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        {workflowsLoading ? (
          <div className="flex items-center justify-center py-12 rounded-lg surface-elevated">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeAutomations.length > 0 ? (
          <div className="space-y-1">
            {activeAutomations.slice(0, 4).map((auto: any) => (
              <div key={auto.id} className="flex items-center gap-3 p-3 rounded-lg surface-elevated">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-xs text-foreground flex-1">{auto.name}</span>
                <span className="text-[10px] text-muted-foreground/40">{auto.trigger || "active"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 rounded-lg surface-elevated">
            <Layers className="w-5 h-5 text-muted-foreground/15 mb-2.5" />
            <p className="text-xs text-muted-foreground/50">No automations running</p>
            <button onClick={() => navigate("/automations")} className="mt-4 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors">
              Create automation
            </button>
          </div>
        )}
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Live Activity</h2>
          <button onClick={() => navigate("/activity")} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
            All activity <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="space-y-1">
          {recentEvents.map((event) => {
            const Icon = eventIcons[event.type] || Zap;
            const color = eventColors[event.type] || "text-muted-foreground";
            return (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg surface-elevated">
                <Icon className={cn("w-3 h-3 flex-shrink-0", color)} />
                <span className="text-xs text-foreground flex-1">{event.message}</span>
                <span className="text-[10px] text-muted-foreground/40">{event.timestamp}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
