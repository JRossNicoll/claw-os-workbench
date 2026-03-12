import { useState } from "react";
import {
  FileCode, ArrowLeft, Plus, GitBranch, RotateCcw, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getTemplates, installTemplate } from "@/lib/store";
import { toast } from "sonner";

const categories = ["All", "Monitoring", "AI", "Data", "Security", "DevOps"];

const Templates = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  const templates = getTemplates();
  const selected = templates.find((t) => t.id === selectedId);

  const handleInstall = (templateId: string) => {
    setInstalling(true);
    setTimeout(() => {
      installTemplate(templateId);
      toast.success("Template installed — automation created");
      setInstalling(false);
      navigate("/automations");
    }, 800);
  };

  const filtered = templates.filter((t) => activeCategory === "All" || t.category === activeCategory);

  if (selected) {
    const steps = selected.steps || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to templates
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{selected.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>
            <button
              onClick={() => handleInstall(selected.id)}
              disabled={installing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {installing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {installing ? "Installing..." : "Use Template"}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-md bg-muted">{selected.category}</span>
            <span>{steps.length} steps</span>
          </div>
        </div>

        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">Pipeline Steps</h2>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && <div className="absolute left-[19px] top-[44px] w-px h-[calc(100%-28px)] bg-border" />}
                <div className="p-4 rounded-xl surface-elevated">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-medium text-muted-foreground">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground flex-1">{step.name}</span>
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
        <button onClick={() => navigate("/automations")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Automations
        </button>
        <h1 className="text-xl font-semibold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">Pre-built automation pipelines</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
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
                    <div className="text-sm font-medium text-foreground">{template.name}</div>
                    <span className="text-[10px] text-muted-foreground">{template.category}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{template.description}</p>
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
