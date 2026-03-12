import { useState } from "react";
import {
  FileCode, ArrowLeft, Plus, GitBranch, RotateCcw, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: "tpl-1", name: "Website Uptime Monitor", description: "Monitor any URL for uptime, response time, and SSL validity. Get alerts on failures.",
    category: "Monitoring", steps: [
      { name: "Configure target URLs", hasCondition: false },
      { name: "Set check interval", hasCondition: false },
      { name: "Define alert thresholds", hasCondition: true },
      { name: "Choose notification channel", hasCondition: false },
    ],
  },
  {
    id: "tpl-2", name: "AI Code Review Pipeline", description: "Automatically review PRs using AI models. Post suggestions and approve safe changes.",
    category: "AI", steps: [
      { name: "Connect GitHub repository", hasCondition: false },
      { name: "Fetch PR diff on webhook", hasCondition: false },
      { name: "Run AI analysis", hasCondition: false, retry: { maxRetries: 3, delay: "5s" } },
      { name: "Post review comments", hasCondition: true },
      { name: "Auto-approve if safe", hasCondition: true },
    ],
  },
  {
    id: "tpl-3", name: "Data Aggregation Report", description: "Collect metrics from APIs and databases, transform data, and generate daily reports.",
    category: "Data", steps: [
      { name: "Connect data sources", hasCondition: false },
      { name: "Fetch and normalize data", hasCondition: false },
      { name: "Run transformations", hasCondition: false },
      { name: "Generate report", hasCondition: false },
      { name: "Distribute via email/Slack", hasCondition: false },
    ],
  },
  {
    id: "tpl-4", name: "Security Scan & Alert", description: "Scan infrastructure and code for vulnerabilities. Alert on critical findings.",
    category: "Security", steps: [
      { name: "Scan repositories", hasCondition: false },
      { name: "Check container images", hasCondition: false },
      { name: "Audit dependencies", hasCondition: false, retry: { maxRetries: 2, delay: "10s" } },
      { name: "Generate security report", hasCondition: false },
      { name: "Alert on critical CVEs", hasCondition: true },
    ],
  },
  {
    id: "tpl-5", name: "Multi-Agent Research", description: "Deploy multiple AI agents to research a topic, synthesize findings, and produce a brief.",
    category: "AI", steps: [
      { name: "Define research scope", hasCondition: false },
      { name: "Deploy researcher agents", hasCondition: false },
      { name: "Collect agent outputs", hasCondition: false },
      { name: "Synthesize findings", hasCondition: false },
      { name: "Generate final brief", hasCondition: false },
    ],
  },
  {
    id: "tpl-6", name: "Incident Response Runbook", description: "Automated incident response: detect, diagnose, remediate, and notify stakeholders.",
    category: "DevOps", steps: [
      { name: "Detect anomaly", hasCondition: false },
      { name: "Gather diagnostics", hasCondition: false },
      { name: "Attempt auto-remediation", hasCondition: true, retry: { maxRetries: 3, delay: "30s" } },
      { name: "Escalate if unresolved", hasCondition: true },
      { name: "Post incident report", hasCondition: false },
    ],
  },
];

const categories = ["All", "Monitoring", "AI", "Data", "Security", "DevOps"];

const Templates = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  const selected = TEMPLATES.find((t) => t.id === selectedId);

  const handleInstall = async (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setInstalling(true);
    try {
      // Insert automation
      const { data: auto, error: autoErr } = await supabase
        .from("automations")
        .insert({
          name: tpl.name,
          description: tpl.description,
          status: "inactive",
          trigger: "Not configured",
        })
        .select()
        .single();
      if (autoErr) throw autoErr;

      // Insert steps
      const steps = tpl.steps.map((s, i) => ({
        automation_id: auto.id,
        name: s.name,
        step_order: i,
        status: "pending",
        condition: s.hasCondition ? "conditional" : null,
        retry_config: s.retry ? s.retry : null,
      }));
      const { error: stepsErr } = await supabase.from("automation_steps").insert(steps);
      if (stepsErr) throw stepsErr;

      // Log activity
      await supabase.from("activity_events").insert({
        type: "installed",
        message: `Template "${tpl.name}" installed as automation`,
        category: "Automation",
      });

      qc.invalidateQueries({ queryKey: ["automations"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Template installed — automation created");
      navigate("/automations");
    } catch (err: any) {
      toast.error(err.message || "Install failed");
    } finally {
      setInstalling(false);
    }
  };

  const filtered = TEMPLATES.filter((t) => activeCategory === "All" || t.category === activeCategory);

  if (selected) {
    const steps = selected.steps || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to templates
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{selected.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>
            <button
              onClick={() => handleInstall(selected.id)}
              disabled={installing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {installing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              {installing ? "Installing..." : "Use Template"}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-md bg-muted">{selected.category}</span>
            <span>{steps.length} steps</span>
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Pipeline Steps</h2>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && <div className="absolute left-[19px] top-[44px] w-px h-[calc(100%-28px)] bg-border" />}
                <div className="p-4 rounded-xl surface-elevated">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-medium text-muted-foreground">{i + 1}</span>
                    </div>
                    <span className="text-xs text-foreground flex-1">{step.name}</span>
                  </div>
                  <div className="ml-9 mt-2 flex items-center gap-2 flex-wrap">
                    {step.hasCondition && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        <GitBranch className="w-2.5 h-2.5" /> Conditional
                      </div>
                    )}
                    {step.retry && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        <RotateCcw className="w-2.5 h-2.5" /> {step.retry.maxRetries} retries
                      </div>
                    )}
                  </div>
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button onClick={() => navigate("/automations")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3 h-3" /> Automations
        </button>
        <h1 className="text-lg font-semibold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">Pre-built automation pipelines</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
              activeCategory === cat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((template, i) => (
            <motion.div key={template.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 + i * 0.03 }}>
              <button
                onClick={() => setSelectedId(template.id)}
                className="w-full text-left p-5 rounded-xl surface-elevated hover:border-primary/15 transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                    <FileCode className="w-5 h-5 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-foreground">{template.name}</div>
                    <span className="text-[10px] text-muted-foreground">{template.category}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{template.description}</p>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{template.steps.length} steps</span>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Templates;
