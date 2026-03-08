import { useState } from "react";
import { Plus, Puzzle, Play, ArrowRight, Hexagon } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center min-h-[75vh]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        <Hexagon className="w-8 h-8 text-primary mx-auto mb-6" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          What would you like to do?
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          ClawOS is ready
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 w-full max-w-sm space-y-2"
      >
        {[
          { label: "Create Automation", desc: "Build a new automated workflow", icon: Plus, path: "/automations" },
          { label: "Install Engine", desc: "Browse the engine library", icon: Puzzle, path: "/engines" },
          { label: "Run Task", desc: "Execute a one-off task", icon: Play, path: "" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className="w-full flex items-center gap-4 p-4 rounded-lg surface-elevated hover:border-primary/25 transition-all duration-200 text-left group"
          >
            <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1">
              <span className="text-[13px] font-medium text-foreground">{item.label}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/60 transition-colors" />
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
