import { useState } from "react";
import { Bot, Play, Square, ArrowLeft, Zap, Clock, CheckCircle, Plus, X, Loader2, Trash2, MessageSquare } from "lucide-react";
import { AgentChat } from "@/components/AgentChat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAgents, useToggleAgent, useCreateAgent, useDeleteAgent } from "@/hooks/use-agents";
import { useEngines } from "@/hooks/use-engines";
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

const agentTypes = [
  { value: "autonomous", label: "Autonomous", desc: "Runs independently on triggers" },
  { value: "reactive", label: "Reactive", desc: "Responds to events in real-time" },
  { value: "scheduled", label: "Scheduled", desc: "Runs on a time-based schedule" },
];

function CreateAgentForm({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateAgent();
  const { data: engines = [] } = useEngines();
  const installedEngines = engines.filter((e) => e.installed);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("autonomous");
  const [engine, setEngine] = useState(installedEngines[0]?.id || "");
  const [model, setModel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedName = name.trim();
    if (!trimmedName) errs.name = "Name is required";
    else if (trimmedName.length > 100) errs.name = "Max 100 characters";
    if (description.trim().length > 500) errs.description = "Max 500 characters";
    if (!engine) errs.engine = "Select an engine";
    if (model.trim().length > 100) errs.model = "Max 100 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createMutation.mutate(
      { name: name.trim(), description: description.trim(), type, engine, model: model.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Agent "${name.trim()}" created`);
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl surface-elevated p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">New Agent</h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-muted-foreground font-medium">Name *</label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
          placeholder="e.g. Market Sentinel"
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-muted-foreground font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
          placeholder="What does this agent do?"
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        {errors.description && <p className="text-[10px] text-destructive">{errors.description}</p>}
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-muted-foreground font-medium">Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {agentTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "p-2.5 rounded-lg border text-left transition-all",
                type === t.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/20"
              )}
            >
              <div className={cn("text-[11px] font-medium", type === t.value ? "text-primary" : "text-foreground")}>{t.label}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Engine */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-muted-foreground font-medium">Engine *</label>
        {installedEngines.length > 0 ? (
          <select
            value={engine}
            onChange={(e) => { setEngine(e.target.value); setErrors((p) => ({ ...p, engine: "" })); }}
            className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select engine...</option>
            {installedEngines.map((e) => (
              <option key={e.id} value={e.id}>{e.name} (v{e.version})</option>
            ))}
          </select>
        ) : (
          <p className="text-[11px] text-muted-foreground/60 py-2">No engines installed. Install one from the Engine Library first.</p>
        )}
        {errors.engine && <p className="text-[10px] text-destructive">{errors.engine}</p>}
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-muted-foreground font-medium">Model <span className="text-muted-foreground/40">(optional)</span></label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. gpt-4o, claude-3.5-sonnet"
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Create Agent
        </button>
      </div>
    </motion.div>
  );
}

const Agents = () => {
  const { data: agents = [], isLoading } = useAgents();
  const toggleMutation = useToggleAgent();
  const deleteMutation = useDeleteAgent();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selected = agents.find((a) => a.id === selectedId);

  const handleToggle = (agentId: string) => {
    toggleMutation.mutate(agentId, {
      onSuccess: (newStatus) => {
        const agent = agents.find((a) => a.id === agentId);
        toast.success(`${agent?.name} ${newStatus === "active" ? "started" : "stopped"}`);
      },
    });
  };

  const handleDelete = (agentId: string, agentName: string) => {
    deleteMutation.mutate(agentId, {
      onSuccess: () => {
        toast.success(`${agentName} deleted`);
        setSelectedId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground flex-wrap">
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", typeColors[selected.type])}>{selected.type}</span>
                <span>Engine: {selected.engine}</span>
                {selected.model && <span>Model: {selected.model}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(selected.id, selected.name)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-destructive/70 hover:text-destructive border border-border hover:bg-destructive/5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleToggle(selected.id)}
                disabled={toggleMutation.isPending}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50",
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
        </div>

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
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Autonomous AI workers running on your stack</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success text-[11px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {agents.filter((a) => a.status === "active").length} active
          </span>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" /> New Agent
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCreate && <CreateAgentForm onClose={() => setShowCreate(false)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-2">
        {agents.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
            <Bot className="w-10 h-10 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground mb-1">No agents yet</p>
            <p className="text-xs text-muted-foreground/60 mb-5">Create your first agent to get started</p>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Create Agent
            </button>
          </div>
        ) : (
          agents.map((agent, i) => {
            const sc = statusConfig[agent.status] || statusConfig.stopped;
            return (
              <motion.div key={agent.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}>
                <button
                  onClick={() => setSelectedId(agent.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl surface-elevated hover:border-primary/15 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                    <Bot className="w-5 h-5 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                      <span className="text-[13px] font-medium text-foreground">{agent.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", sc.color, agent.status === "active" && "animate-pulse")} />
                        <span className="text-[10px] text-muted-foreground">{sc.label}</span>
                      </div>
                      <span className={cn("text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", typeColors[agent.type])}>{agent.type}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{agent.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5 hidden sm:block">
                    <div className="text-xs font-mono text-foreground">{agent.successRate}%</div>
                    <div className="text-[10px] text-muted-foreground">{agent.totalRuns} runs</div>
                  </div>
                </button>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};

export default Agents;
