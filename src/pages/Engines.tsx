import { useState } from "react";
import { Cog, Download, Check, Github, ArrowLeft, Shield, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEngines, installEngine, ApiError } from "@/lib/api";
import { toast } from "sonner";

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
  config_schema?: ConfigField[];
  configSchema?: ConfigField[];
}

const categories = ["All", "AI", "Monitoring", "Notifications", "Data", "Automation", "DevOps"];

const Engines = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  const { data: enginesData, isLoading, error } = useQuery({
    queryKey: ["engines"],
    queryFn: getEngines,
  });

  const engines: Engine[] = Array.isArray(enginesData) ? enginesData : [];
  const selected = engines.find((e) => e.id === selectedId);

  const installMutation = useMutation({
    mutationFn: (engineId: string) => installEngine(engineId, configValues),
    onSuccess: () => {
      toast.success(`${selected?.name || "Engine"} installed successfully`);
      queryClient.invalidateQueries({ queryKey: ["engines"] });
      setConfigValues({});
    },
    onError: (err: ApiError) => {
      toast.error(err.message);
    },
  });

  const filtered = engines.filter((e) => {
    if (activeCategory !== "All" && e.category !== activeCategory) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Detail view
  if (selected) {
    const schema = selected.config_schema || selected.configSchema || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
        <div>
          <button
            onClick={() => { setSelectedId(null); setConfigValues({}); }}
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
            <button
              onClick={() => installMutation.mutate(selected.id)}
              disabled={installMutation.isPending || selected.installed}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {installMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : selected.installed ? (
                <Check className="w-3 h-3" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              {installMutation.isPending ? "Installing..." : selected.installed ? "Installed" : "Install"}
            </button>
          </div>
        </div>

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

        {schema.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Configuration</h3>
            <div className="space-y-3">
              {schema.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    {field.label}
                    {field.required && <span className="text-primary text-[10px]">required</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={configValues[field.key] || ""}
                      onChange={(e) => setConfigValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/30 transition-colors font-mono"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={field.placeholder}
                      value={configValues[field.key] || ""}
                      onChange={(e) => setConfigValues((v) => ({ ...v, [field.key]: e.target.value }))}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-lg surface-elevated">
            <p className="text-sm text-destructive mb-1">Failed to load engines</p>
            <p className="text-xs text-muted-foreground">{(error as ApiError)?.message || "Check your API connection"}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-lg surface-elevated">
            <Cog className="w-8 h-8 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No engines found</p>
          </div>
        ) : (
          filtered.map((engine) => (
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
                  {engine.installed && <Check className="w-3 h-3 text-success" />}
                  <span className="text-[10px] text-muted-foreground/50">v{engine.version}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{engine.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/40 px-2 py-0.5 rounded bg-card">{engine.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
            </button>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Engines;
