import { useState } from "react";
import { Bot, Play, Square, MoreHorizontal, ArrowLeft, Zap, Clock, CheckCircle, AlertTriangle, Cpu, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getAgents, toggleAgent, type Agent } from "@/lib/store";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  autonomous: "text-primary bg-primary/8",
  reactive: "text-info bg-info/8",
  scheduled: "text-warning bg-warning/8",
};

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "bg-success", label: "Running" },
  idle: { color: "bg-warning", label: "Idle" },
  error: { color: "bg-destructive", label: "Error" },
  stopped: { color: "bg-muted-foreground/30", label: "Stopped" },
};

const Agents = () => {
  const [agents, setAgents] = useState(getAgents);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = agents.find((a) => a.id === selectedId);

  const handleToggle = (agentId: string) => {
    const updated = toggleAgent(agentId);
    setAgents(updated);
    const agent = updated.find((a) => a.id === agentId);
    toast.success(`${agent?.name} ${agent?.status === "active" ? "started" : "stopped"}`);
  };

  if (selected) {
    const sc = statusConfig[selected.status] || statusConfig.stopped;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5">
            <ArrowLeft className="w-3 h-3" /> All Agents
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-foreground">{selected.name}</h1>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", sc.color)} />
                  <span className="text-[10px] text-muted-foreground font-medium">{sc.label}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5">{selected.description}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", typeColors[selected.type])}>{selected.type}</span>
                <span>Engine: {selected.engine}</span>
                {selected.model && <span>Model: {selected.model}</span>}
              </div>
            </div>
            <button
              onClick={() => handleToggle(selected.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                selected.status === "active"
                  ? "text-destructive border border-destructive/20 hover:bg-destructive/10"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {selected.status === "active" ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {selected.status === "active" ? "Stop" : "Start"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Runs", value: selected.totalRuns, icon: Zap },
            { label: "Success Rate", value: `${selected.successRate}%`, icon: CheckCircle },
            { label: "Last Run", value: selected.lastRun || "Never", icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg surface-elevated text-center space-y-1">
              <stat.icon className="w-4 h-4 text-muted-foreground/40 mx-auto" />
              <div className="text-lg font-semibold text-foreground font-mono">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Activity Log */}
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Recent Activity</h3>
          <div className="bg-terminal-bg rounded-lg border border-border p-4 font-mono text-[11px] leading-relaxed space-y-0.5 max-h-48 overflow-y-auto terminal-scrollbar">
            <div className="text-terminal-text"><span className="text-terminal-dim">14:32:01</span> Agent heartbeat: OK</div>
            <div className="text-terminal-text"><span className="text-terminal-dim">14:30:00</span> Processing trigger event...</div>
            <div className="text-terminal-text"><span className="text-terminal-dim">14:30:01</span> Executing pipeline step 1/3</div>
            <div className="text-terminal-text"><span className="text-terminal-dim">14:30:04</span> Pipeline completed successfully (3.2s)</div>
            <div className="text-terminal-text"><span className="text-terminal-dim">14:28:00</span> Monitoring cycle started</div>
            <div className="text-success"><span className="text-terminal-dim">14:28:02</span> All checks passed</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Autonomous AI workers running on your stack</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {agents.filter((a) => a.status === "active").length} active
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-2"
      >
        {agents.map((agent, i) => {
          const sc = statusConfig[agent.status] || statusConfig.stopped;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
            >
              <button
                onClick={() => setSelectedId(agent.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                  <Bot className="w-5 h-5 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <span className="text-[13px] font-medium text-foreground">{agent.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", sc.color, agent.status === "active" && "animate-pulse")} />
                      <span className="text-[10px] text-muted-foreground">{sc.label}</span>
                    </div>
                    <span className={cn("text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", typeColors[agent.type])}>{agent.type}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{agent.description}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <div className="text-xs font-mono text-foreground">{agent.successRate}%</div>
                  <div className="text-[10px] text-muted-foreground">{agent.totalRuns} runs</div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Agents;
