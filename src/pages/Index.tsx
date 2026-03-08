import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Play, Plus, Puzzle, ArrowRight, Clock, Zap, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Good afternoon
        </h1>
        <p className="text-muted-foreground text-[15px] mt-1">
          3 automations running · All systems healthy
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "Create Automation", icon: Plus, description: "Build a new workflow" },
          { label: "Add Tool", icon: Puzzle, description: "Install from marketplace" },
          { label: "Run Task", icon: Play, description: "Execute one-off task" },
        ].map((action) => (
          <button
            key={action.label}
            className="group flex flex-col items-start p-5 rounded-xl surface-elevated hover:border-primary/20 transition-all duration-200 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
              <action.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{action.description}</span>
          </button>
        ))}
      </motion.div>

      {/* Active Automations */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium text-foreground">Active Automations</h2>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {activeAutomations.map((auto, i) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 + i * 0.04 }}
            >
              <button className="w-full flex items-center gap-4 p-4 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{auto.name}</span>
                    <StatusIndicator status={auto.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {auto.trigger.includes("Every") ? <Timer className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {auto.trigger}
                    </span>
                    <span className="text-xs text-muted-foreground/60">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {auto.lastRun}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h2 className="text-[15px] font-medium text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-1">
          {recentActivity.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
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
