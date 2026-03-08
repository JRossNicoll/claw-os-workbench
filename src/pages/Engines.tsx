import { useState } from "react";
import { Cog, Download, Check, Github, ArrowLeft, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface Engine {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  verified: boolean;
  installed: boolean;
  dependencies?: string[];
  configSchema?: ConfigField[];
}

const engines: Engine[] = [
  {
    id: "market-scanner", name: "Market Scanner", description: "Scan markets for token launches, price movements, and volume spikes across multiple chains",
    category: "Monitoring", version: "2.1.0", verified: true, installed: false,
    dependencies: ["Price Oracle"],
    configSchema: [
      { key: "chains", label: "Chains to monitor", type: "text", placeholder: "ethereum, polygon, arbitrum", required: true },
      { key: "interval", label: "Scan interval (seconds)", type: "number", placeholder: "600" },
      { key: "min_volume", label: "Minimum volume ($)", type: "number", placeholder: "50000" },
    ],
  },
  {
    id: "telegram-alerts", name: "Telegram Alerts", description: "Send formatted alerts and reports to Telegram channels and groups",
    category: "Notifications", version: "1.4.2", verified: true, installed: false,
    configSchema: [
      { key: "bot_token", label: "Bot token", type: "text", placeholder: "123456:ABC-DEF...", required: true },
      { key: "chat_id", label: "Chat ID", type: "text", placeholder: "-1001234567890", required: true },
      { key: "parse_mode", label: "Parse mode", type: "select", options: ["HTML", "Markdown", "MarkdownV2"] },
    ],
  },
  {
    id: "ai-assistant", name: "AI Assistant", description: "Intelligent reasoning engine for data analysis, summarization, and decision support",
    category: "AI", version: "3.0.1", verified: true, installed: false,
    dependencies: ["Data Pipeline"],
    configSchema: [
      { key: "model", label: "Model", type: "select", options: ["gpt-4o", "claude-3.5-sonnet", "llama-3.1"], required: true },
      { key: "max_tokens", label: "Max tokens", type: "number", placeholder: "4096" },
      { key: "temperature", label: "Temperature", type: "number", placeholder: "0.7" },
    ],
  },
  {
    id: "website-monitor", name: "Website Monitor", description: "Monitor websites for uptime, content changes, and performance degradation",
    category: "Monitoring", version: "1.2.0", verified: true, installed: false,
    configSchema: [
      { key: "url", label: "URL to monitor", type: "text", placeholder: "https://example.com", required: true },
      { key: "check_interval", label: "Check interval (seconds)", type: "number", placeholder: "300" },
    ],
  },
  {
    id: "data-pipeline", name: "Data Pipeline", description: "ETL engine for transforming and routing data between sources and destinations",
    category: "Data", version: "2.0.0", verified: true, installed: false,
    configSchema: [
      { key: "buffer_size", label: "Buffer size", type: "number", placeholder: "1000" },
    ],
  },
  {
    id: "discord-alerts", name: "Discord Alerts", description: "Post formatted alerts and embeds to Discord channels via webhooks",
    category: "Notifications", version: "1.1.0", verified: false, installed: false,
    configSchema: [
      { key: "webhook_url", label: "Webhook URL", type: "text", placeholder: "https://discord.com/api/webhooks/...", required: true },
    ],
  },
  {
    id: "k8s-deployer", name: "K8s Deployer", description: "Deploy and manage Kubernetes workloads with rollback support",
    category: "DevOps", version: "1.0.0", verified: false, installed: false,
    configSchema: [
      { key: "cluster", label: "Cluster name", type: "text", required: true },
      { key: "namespace", label: "Namespace", type: "text", placeholder: "default" },
    ],
  },
  {
    id: "price-oracle", name: "Price Oracle", description: "Multi-source price aggregation with TWAP, VWAP, and weighted median",
    category: "Data", version: "1.8.0", verified: true, installed: false,
    configSchema: [
      { key: "sources", label: "Price sources", type: "text", placeholder: "binance, coinbase, kraken" },
      { key: "update_interval", label: "Update interval (seconds)", type: "number", placeholder: "60" },
    ],
  },
  {
    id: "cron-scheduler", name: "Cron Scheduler", description: "Schedule recurring tasks with cron expressions and timezone support",
    category: "Automation", version: "1.3.0", verified: true, installed: false,
    configSchema: [
      { key: "timezone", label: "Timezone", type: "text", placeholder: "UTC" },
    ],
  },
];

const categories = ["All", "AI", "Monitoring", "Notifications", "Data", "Automation", "DevOps"];

const Engines = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = engines.find((e) => e.id === selectedId);

  const filtered = engines.filter((e) => {
    if (activeCategory !== "All" && e.category !== activeCategory) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Detail view
  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
          >
            <ArrowLeft className="w-3 h-3" /> Engine Library
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-foreground">{selected.name}</h1>
                {selected.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                    <Shield className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1.5">{selected.description}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                <span>v{selected.version}</span>
                <span className="text-border">·</span>
                <span>{selected.category}</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              <Download className="w-3 h-3" /> Install
            </button>
          </div>
        </div>

        {/* Dependencies */}
        {selected.dependencies && selected.dependencies.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Dependencies</h3>
            <div className="flex gap-2">
              {selected.dependencies.map((dep) => (
                <span key={dep} className="text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">{dep}</span>
              ))}
            </div>
          </div>
        )}

        {/* Config schema */}
        {selected.configSchema && selected.configSchema.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Configuration</h3>
            <div className="space-y-3">
              {selected.configSchema.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    {field.label}
                    {field.required && <span className="text-primary text-[10px]">required</span>}
                  </label>
                  {field.type === "select" ? (
                    <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/30 transition-colors font-mono">
                      <option value="">Select...</option>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={field.placeholder}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors font-mono"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-foreground">Engine Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Engines power your automations</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-card border border-border transition-all">
          <Github className="w-3 h-3" /> Install from GitHub
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search engines..."
          className="w-full max-w-xs bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
        />
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                activeCategory === cat ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2"
      >
        {filtered.map((engine) => (
          <button
            key={engine.id}
            onClick={() => setSelectedId(engine.id)}
            className="w-full flex items-center gap-4 p-4 rounded-lg surface-elevated hover:border-primary/20 transition-all duration-200 text-left group"
          >
            <Cog className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-foreground">{engine.name}</span>
                {engine.verified && <Shield className="w-3 h-3 text-primary/60" />}
                <span className="text-[10px] text-muted-foreground/50">v{engine.version}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{engine.description}</p>
            </div>
            <span className="text-[10px] text-muted-foreground/40 px-2 py-0.5 rounded bg-card">{engine.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default Engines;
