import { useState } from "react";
import {
  FileCode, ArrowLeft, Plus, GitBranch, RotateCcw, ChevronRight,
  Layers, Zap, Timer, CheckCircle, SkipForward, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, installTemplate, ApiError } from "@/lib/api";
import { toast } from "sonner";

const categories = ["All", "Trading", "Monitoring", "Reporting"];

const Templates = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: templatesData, isLoading, error } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const templates: any[] = Array.isArray(templatesData) ? templatesData : [];
  const selected = templates.find((t: any) => t.id === selectedId);

  const installMutation = useMutation({
    mutationFn: (templateId: string) => installTemplate(templateId),
    onSuccess: () => {
      toast.success("Template installed — automation created");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      navigate("/automations");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const filtered = templates.filter((t: any) => activeCategory === "All" || t.category === activeCategory);

  if (selected) {
    const steps = selected.steps || [];
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
            <button
              onClick={() => installMutation.mutate(selected.id)}
              disabled={installMutation.isPending}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {installMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {installMutation.isPending ? "Installing..." : "Use Template"}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-md bg-muted">{selected.category}</span>
            <span>{selected.failureMode === "stop_on_failure" ? "Stops on failure" : "Continues on failure"}</span>
            <span>{steps.length} steps</span>
          </div>
        </div>

        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">Pipeline Steps</h2>
          <div className="space-y-2">
            {steps.map((step: any, i: number) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-[19px] top-[44px] w-px h-[calc(100%-28px)] bg-border" />
                )}
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
        <h1 className="text-xl font-semibold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">Pre-built automation pipelines</p>
      </motion.div>

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
              activeCategory === cat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
            <p className="text-sm text-destructive mb-1">Failed to load templates</p>
            <p className="text-xs text-muted-foreground">{(error as ApiError)?.message || "Check your API connection"}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
            <FileCode className="w-8 h-8 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No templates available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((template: any, i: number) => (
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
                      {(template.steps || []).length} steps
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Templates;
