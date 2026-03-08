import { useState } from "react";
import { Plus, Play, ArrowRight, Layers, Clock, Cog, Zap, CheckCircle, Download, Wifi, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const recentActivity = [
  { icon: Download, color: "text-info", message: "AI Assistant Engine installed", time: "8 min ago" },
  { icon: CheckCircle, color: "text-success", message: "Website Monitor completed run #47", time: "15 min ago" },
  { icon: Wifi, color: "text-info", message: "Worker node-03 came online", time: "22 min ago" },
  { icon: AlertTriangle, color: "text-warning", message: "Telegram rate limit approaching", time: "1h ago" },
];

const workerStatuses = [
  { name: "node-01", status: "online" },
  { name: "node-02", status: "online" },
  { name: "node-03", status: "online" },
  { name: "node-04", status: "offline" },
];

const Home = () => {
  const navigate = useNavigate();
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem("clawos-onboarded") === "true";
  });

  const handleComplete = () => {
    localStorage.setItem("clawos-onboarded", "true");
    setOnboarded(true);
  };

  if (!onboarded) {
    return <OnboardingWizard onComplete={handleComplete} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Mission Control</h1>
        <p className="text-sm text-muted-foreground mt-1">Your automation command center</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-3 gap-2.5"
      >
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Active Automations</h2>
          <button onClick={() => navigate("/automations")} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 rounded-lg surface-elevated">
          <Layers className="w-5 h-5 text-muted-foreground/15 mb-2.5" />
          <p className="text-xs text-muted-foreground/50">No automations running</p>
          <button onClick={() => navigate("/automations")} className="mt-4 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors">
            Create automation
          </button>
        </div>
      </motion.div>

      {/* Recent Activity + Worker Status side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Recent Activity</h2>
            <button onClick={() => navigate("/activity")} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
              All activity <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="space-y-1">
            {recentActivity.map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg surface-elevated">
                <event.icon className={cn("w-3 h-3 flex-shrink-0", event.color)} />
                <span className="text-xs text-foreground flex-1">{event.message}</span>
                <span className="text-[10px] text-muted-foreground/40">{event.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Worker Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Workers</h2>
          <div className="space-y-1">
            {workerStatuses.map((w) => (
              <div key={w.name} className="flex items-center gap-2.5 p-3 rounded-lg surface-elevated">
                <div className={cn("w-1.5 h-1.5 rounded-full", w.status === "online" ? "bg-success" : "bg-muted-foreground/30")} />
                <span className="text-xs text-foreground font-mono">{w.name}</span>
                <span className={cn("text-[10px] ml-auto", w.status === "online" ? "text-success" : "text-muted-foreground/40")}>{w.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
