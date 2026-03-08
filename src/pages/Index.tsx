import { useState } from "react";
import { Plus, Puzzle, Play, ArrowRight, Hexagon, Layers, Clock, Cog, Zap, Bell, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Mission Control
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your automation command center
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
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
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Active Automations</h2>
          <button onClick={() => navigate("/automations")} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-14 rounded-lg surface-elevated">
          <Layers className="w-5 h-5 text-muted-foreground/15 mb-2.5" />
          <p className="text-xs text-muted-foreground/50">No automations running</p>
          <button onClick={() => navigate("/automations")} className="mt-4 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors">
            Create automation
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12 rounded-lg surface-elevated">
          <Clock className="w-5 h-5 text-muted-foreground/15 mb-2.5" />
          <p className="text-xs text-muted-foreground/50">Activity will appear here</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
