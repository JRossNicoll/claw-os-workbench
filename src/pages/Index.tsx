import { useState } from "react";
import { Plus, Play, ArrowRight, Layers, Clock, Cog, Zap, CheckCircle, Download, Wifi, AlertTriangle, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isOnboarded, getEvents } from "@/lib/store";
import { useAgents } from "@/hooks/use-agents";
import { useAutomations } from "@/hooks/use-automations";

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
  const [onboarded, setOnboarded] = useState(isOnboarded);
  const [, setTick] = useState(0);
  const { data: automations = [] } = useAutomations();
  const { data: agents = [] } = useAgents();

  const handleComplete = () => {
    setOnboarded(true);
    setTick((t) => t + 1);
  };

  if (!onboarded) {
    return <OnboardingWizard onComplete={handleComplete} />;
  }

  const events = getEvents();
  const activeAutomations = automations.filter((a) => a.status === "active");
  const activeAgents = agents.filter((a) => a.status === "active");
  const metrics = {
    active_workflows: activeAutomations.length,
    running_jobs: 0,
    active_agents: activeAgents.length,
    runtime_containers: 6,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Mission Control</h1>
            <p className="text-sm text-muted-foreground mt-1">Your automation command center</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
        </div>
      </motion.div>

      {/* Metrics Strip */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.02 }} className="grid grid-cols-4 gap-2.5">
        {[
          { label: "Active Workflows", value: metrics.active_workflows, color: "text-success" },
          { label: "Running Jobs", value: metrics.running_jobs, color: "text-info" },
          { label: "Active Agents", value: metrics.active_agents, color: "text-primary" },
          { label: "Containers", value: metrics.runtime_containers, color: "text-warning" },
        ].map((m) => (
          <div key={m.label} className="p-3.5 rounded-lg surface-elevated text-center">
            <div className={cn("text-lg font-semibold font-mono", m.color)}>{m.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.04 }} className="grid grid-cols-4 gap-2.5">
        {[
          { label: "New Automation", icon: Plus, path: "/automations" },
          { label: "Install Engine", icon: Cog, path: "/engines" },
          { label: "View Agents", icon: Bot, path: "/agents" },
          { label: "View Runs", icon: Play, path: "/runs" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
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
        {activeAutomations.length > 0 ? (
          <div className="space-y-1">
            {activeAutomations.slice(0, 4).map((auto) => (
              <div key={auto.id} className="flex items-center gap-3 p-3 rounded-lg surface-elevated">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-xs text-foreground flex-1">{auto.name}</span>
                <span className="text-[10px] text-muted-foreground/40">{auto.trigger}</span>
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

      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Active Agents</h2>
            <button onClick={() => navigate("/agents")} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="space-y-1">
            {activeAgents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg surface-elevated">
                <Bot className="w-3 h-3 text-primary" />
                <span className="text-xs text-foreground flex-1">{agent.name}</span>
                <span className="text-[10px] text-muted-foreground/40">{agent.model}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Live Activity Feed */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Live Activity</h2>
          <button onClick={() => navigate("/activity")} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
            All activity <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="space-y-1">
          {events.slice(0, 5).map((event) => {
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
