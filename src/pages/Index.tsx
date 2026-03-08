import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Play, Plus, Puzzle, ArrowRight, Clock, Zap, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

const activeAutomations = [
  { id: "1", name: "Token Scanner", status: "running" as const, lastRun: "2 min ago", trigger: "Every 10 minutes" },
  { id: "2", name: "Telegram Alerts", status: "running" as const, lastRun: "Just now", trigger: "Price spike detected" },
  { id: "3", name: "Wallet Monitor", status: "running" as const, lastRun: "5 min ago", trigger: "Every 15 minutes" },
  { id: "4", name: "DEX Arbitrage", status: "failed" as const, lastRun: "1h ago", trigger: "Spread > 0.5%" },
  { id: "5", name: "Portfolio Sync", status: "success" as const, lastRun: "30 min ago", trigger: "Every hour" },
];

const recentActivity = [
  { id: "1", message: "Token Scanner found 8 new tokens", time: "2 min ago", type: "success" as const },
  { id: "2", message: "Telegram alert sent to #signals", time: "3 min ago", type: "success" as const },
  { id: "3", message: "DEX Arbitrage failed — insufficient liquidity", time: "1h ago", type: "failed" as const },
  { id: "4", message: "Wallet Monitor detected 500 ETH transfer", time: "5 min ago", type: "success" as const },
];

const Home = () => {
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
          3 automations running · All systems healthy
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
          { label: "Create Automation", icon: Plus, description: "Build a new automation" },
          { label: "Install Engine", icon: Puzzle, description: "Browse the Engine Library" },
          { label: "Run Task", icon: Play, description: "Execute a one-off task" },
        ].map((action) => (
          <button
            key={action.label}
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

      {/* Active Automations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-foreground">Active Automations</h2>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {activeAutomations.map((auto, i) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.14 + i * 0.04 }}
            >
              <button className="w-full flex items-center gap-4 p-5 rounded-2xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{auto.name}</span>
                    <StatusIndicator status={auto.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {auto.trigger.includes("Every") ? <Timer className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {auto.trigger}
                    </span>
                    <span className="text-xs text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {auto.lastRun}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/60 transition-colors" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        <h2 className="text-base font-medium text-foreground mb-5">Recent Activity</h2>
        <div className="space-y-1">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group"
            >
              <StatusIndicator status={item.type} />
              <span className="text-sm text-foreground/80 flex-1">{item.message}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
