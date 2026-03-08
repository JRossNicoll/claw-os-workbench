import { useState } from "react";
import { Play, Plus, Puzzle, ArrowRight, Clock, Layers } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Mission Control
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Your automation command center
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "Create Automation", icon: Plus, onClick: () => navigate("/automations") },
          { label: "Install Engine", icon: Puzzle, onClick: () => navigate("/engines") },
          { label: "Run Task", icon: Play, onClick: () => {} },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group flex items-center gap-3 p-4 rounded-lg surface-elevated hover:border-primary/25 transition-all duration-200 text-left"
          >
            <action.icon className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-[13px] font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Active Automations</h2>
          <button
            onClick={() => navigate("/automations")}
            className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 rounded-lg surface-elevated">
          <Layers className="w-6 h-6 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground/60">No automations running</p>
          <button
            onClick={() => navigate("/automations")}
            className="mt-5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Create your first automation
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-16 rounded-lg surface-elevated">
          <Clock className="w-6 h-6 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground/60">Activity will appear here</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
