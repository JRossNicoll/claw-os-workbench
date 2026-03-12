import { useState } from "react";
import { Cog, Download, Check, ArrowLeft, Shield, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEngines, useInstallEngine } from "@/hooks/use-engines";
import { toast } from "sonner";

const categories = ["All", "AI", "Monitoring", "Notifications", "Data", "Automation", "DevOps"];

const Engines = () => {
  const { data: engines = [], isLoading } = useEngines();
  const installMutation = useInstallEngine();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = engines.find((e) => e.id === selectedId);

  const handleInstall = (engineId: string) => {
    installMutation.mutate(engineId, {
      onSuccess: () => {
        const engine = engines.find((e) => e.id === engineId);
        toast.success(`${engine?.name || "Engine"} installed successfully`);
      },
      onError: (err) => toast.error(`Install failed: ${err.message}`),
    });
  };

  const filtered = engines.filter((e) => {
    if (activeCategory !== "All" && e.category !== activeCategory) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selected) {
    const isInstalling = installMutation.isPending;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
        <div>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5">
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
                {selected.stars && (
                  <>
                    <span className="text-border">·</span>
                    <span>★ {selected.stars}</span>
                  </>
                )}
                {selected.language && (
                  <>
                    <span className="text-border">·</span>
                    <span>{selected.language}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selected.url && (
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors">
                  <ExternalLink className="w-3 h-3" /> GitHub
                </a>
              )}
              <button
                onClick={() => handleInstall(selected.id)}
                disabled={selected.installed || isInstalling}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {selected.installed ? <Check className="w-3 h-3" /> : isInstalling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {selected.installed ? "Installed" : isInstalling ? "Installing..." : "Install"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Engine Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Real engines from the open-source ecosystem</p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {engines.filter((e) => e.installed).length}/{engines.length} installed
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }} className="space-y-3">
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }} className="space-y-2">
        {filtered.map((engine, i) => (
          <motion.div
            key={engine.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 + i * 0.02 }}
          >
            <button
              onClick={() => setSelectedId(engine.id)}
              className="w-full flex items-center gap-4 p-4 rounded-lg surface-elevated hover:border-primary/20 transition-all duration-200 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                {engine.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{engine.name}</span>
                  {engine.verified && <Shield className="w-3 h-3 text-primary/60" />}
                  {engine.installed && <Check className="w-3 h-3 text-success" />}
                  <span className="text-[10px] text-muted-foreground/50">v{engine.version}</span>
                  {engine.stars && <span className="text-[10px] text-muted-foreground/40">★ {engine.stars}</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{engine.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/40 px-2 py-0.5 rounded bg-card">{engine.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Engines;
