import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Play, Plus, Puzzle, ArrowRight, Clock, Zap, Timer, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Mission Control
        </h1>
        <p className="text-muted-foreground text-[15px] mt-2">
          Your automation command center
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Create Automation", icon: Plus, description: "Build a new automation", onClick: () => navigate("/automations") },
          { label: "Install Engine", icon: Puzzle, description: "Browse the Engine Library", onClick: () => navigate("/engines") },
          { label: "Run Task", icon: Play, description: "Execute a one-off task", onClick: () => {} },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group flex flex-col items-start p-6 rounded-2xl surface-elevated hover:border-primary/20 transition-all duration-300 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
              <action.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
            <span className="text-xs text-muted-foreground mt-1">{action.description}</span>
          </button>
        ))}
      </motion.div>

      {/* Active Automations — empty state */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-foreground">Active Automations</h2>
          <button
            onClick={() => navigate("/automations")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 rounded-2xl surface-elevated">
          <Layers className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No automations running yet</p>
          <button
            onClick={() => navigate("/automations")}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create your first automation
          </button>
        </div>
      </motion.div>

      {/* Recent Activity — empty state */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        <h2 className="text-base font-medium text-foreground mb-5">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl surface-elevated">
          <Clock className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No activity yet — it'll show up here once automations run</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
