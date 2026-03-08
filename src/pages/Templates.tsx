import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import {
  FileCode, ArrowLeft, Plus, GitBranch, RotateCcw, ChevronRight,
  Layers, Zap, Timer, CheckCircle, SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface TemplateStep {
  name: string;
  hasCondition?: boolean;
  conditionExpression?: string;
  onFalse?: "skip_step" | "jump_to_step";
  retry?: { maxRetries: number; delaySeconds: number };
}

interface Template {
  id: string;
  name: string;
  description: string;
  failureMode: "stop_on_failure" | "continue_on_failure";
  category: string;
  steps: TemplateStep[];
}

const templates: Template[] = [
  {
    id: "t1",
    name: "Token Launch Pipeline",
    description: "Scan for new tokens, filter by volume, optionally trade, and notify via Telegram",
    failureMode: "stop_on_failure",
    category: "Trading",
    steps: [
      { name: "Scan tokens", retry: { maxRetries: 2, delaySeconds: 5 } },
      { name: "Filter by volume", hasCondition: true, conditionExpression: "${steps.scan_tokens.output.count} > 0", onFalse: "skip_step" },
      { name: "Check liquidity", hasCondition: true, conditionExpression: "${steps.filter_volume.output.volume} > 1000000", onFalse: "jump_to_step" },
      { name: "Execute trade", retry: { maxRetries: 3, delaySeconds: 10 } },
      { name: "Notify Telegram" },
    ],
  },
  {
    id: "t2",
    name: "Whale Watcher",
    description: "Monitor wallets for large transfers and send real-time alerts",
    failureMode: "continue_on_failure",
    category: "Monitoring",
    steps: [
      { name: "Track wallets", retry: { maxRetries: 3, delaySeconds: 5 } },
      { name: "Detect large transfer", hasCondition: true, conditionExpression: "${steps.track_wallets.output.amount} > 100", onFalse: "skip_step" },
      { name: "Send alert" },
    ],
  },
  {
    id: "t3",
    name: "DEX Arbitrage Scanner",
    description: "Find price spreads across DEXs and execute profitable swaps",
    failureMode: "stop_on_failure",
    category: "Trading",
    steps: [
      { name: "Fetch prices" },
      { name: "Calculate spread", hasCondition: true, conditionExpression: "${steps.fetch_prices.output.spread} > 0.5", onFalse: "skip_step" },
      { name: "Execute swap", retry: { maxRetries: 2, delaySeconds: 15 } },
      { name: "Log result" },
    ],
  },
  {
    id: "t4",
    name: "Portfolio Daily Report",
    description: "Aggregate portfolio data and send a daily summary report",
    failureMode: "continue_on_failure",
    category: "Reporting",
    steps: [
      { name: "Fetch balances", retry: { maxRetries: 2, delaySeconds: 10 } },
      { name: "Calculate P&L" },
      { name: "Generate report" },
      { name: "Send via Telegram" },
    ],
  },
  {
    id: "t5",
    name: "NFT Floor Monitor",
    description: "Track NFT floor prices and alert on significant drops",
    failureMode: "stop_on_failure",
    category: "Monitoring",
    steps: [
      { name: "Index collections" },
      { name: "Check floor delta", hasCondition: true, conditionExpression: "${steps.index_collections.output.floor_change} < -10", onFalse: "skip_step" },
      { name: "Send alert", retry: { maxRetries: 1, delaySeconds: 5 } },
    ],
  },
];

const categories = ["All", "Trading", "Monitoring", "Reporting"];

const Templates = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = templates.find((t) => t.id === selectedId);

  const filtered = templates.filter((t) => activeCategory === "All" || t.category === activeCategory);

  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to templates
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{selected.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Use Template
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-md bg-muted">{selected.category}</span>
            <span>{selected.failureMode === "stop_on_failure" ? "Stops on failure" : "Continues on failure"}</span>
            <span>{selected.steps.length} steps</span>
          </div>
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">Pipeline Steps</h2>
          <div className="space-y-2">
            {selected.steps.map((step, i) => (
              <div key={i} className="relative">
                {i < selected.steps.length - 1 && (
                  <div className="absolute left-[19px] top-[44px] w-px h-[calc(100%-28px)] bg-border" />
                )}
                <div className="p-4 rounded-xl surface-elevated">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-medium text-muted-foreground">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground flex-1">{step.name}</span>
                  </div>

                  {/* Meta tags */}
                  <div className="ml-9 mt-2 flex items-center gap-2 flex-wrap">
                    {step.hasCondition && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        <GitBranch className="w-2.5 h-2.5" /> Conditional
                      </div>
                    )}
                    {step.retry && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        <RotateCcw className="w-2.5 h-2.5" /> {step.retry.maxRetries} retries · {step.retry.delaySeconds}s
                      </div>
                    )}
                    {step.onFalse === "skip_step" && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        <SkipForward className="w-2.5 h-2.5" /> Skip if false
                      </div>
                    )}
                    {step.onFalse === "jump_to_step" && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        <ChevronRight className="w-2.5 h-2.5" /> Jump if false
                      </div>
                    )}
                  </div>

                  {step.conditionExpression && (
                    <div className="ml-9 mt-2">
                      <code className="text-[10px] font-mono text-foreground/60 bg-background px-2 py-1 rounded block">
                        {step.conditionExpression}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
      >
        <button
          onClick={() => navigate("/automations")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Automations
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">Pre-built automation pipelines with conditions and retry policies</p>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-2"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeCategory === cat
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Template grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {filtered.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.03 }}
          >
            <button
              onClick={() => setSelectedId(template.id)}
              className="w-full text-left p-5 rounded-xl surface-elevated hover:border-primary/15 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                  <FileCode className="w-5 h-5 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{template.name}</div>
                  <span className="text-[10px] text-muted-foreground">{template.category}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{template.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {template.steps.length} steps
                </span>
                {template.steps.some(s => s.hasCondition) && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                    <GitBranch className="w-2.5 h-2.5" /> Branching
                  </span>
                )}
                {template.steps.some(s => s.retry) && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                    <RotateCcw className="w-2.5 h-2.5" /> Retries
                  </span>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Templates;
