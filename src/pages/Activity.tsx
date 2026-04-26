import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download, Play, Pause, CheckCircle, AlertTriangle,
  Wifi, RefreshCw, Shield, Zap, Search, Trash2, FileDown, Filter,
  Bookmark, BookmarkPlus, Terminal, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useActivity, timeAgo } from "@/hooks/use-activity";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const eventConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; ring: string }> = {
  installed: { icon: Download, bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  started: { icon: Play, bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  paused: { icon: Pause, bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
  completed: { icon: CheckCircle, bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  warning: { icon: AlertTriangle, bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
  online: { icon: Wifi, bg: "bg-info/10", text: "text-info", ring: "ring-info/20" },
  updated: { icon: RefreshCw, bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  security: { icon: Shield, bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive/20" },
};
const fallbackConfig = { icon: Zap, bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" };

const categoryColors: Record<string, string> = {
  Automation: "text-success bg-success/8",
  Engine: "text-info bg-info/8",
  System: "text-primary bg-primary/8",
  Integration: "text-warning bg-warning/8",
  Agent: "text-primary bg-primary/8",
};

const TIME_RANGES = [
  { label: "All", ms: Infinity },
  { label: "1h", ms: 60 * 60 * 1000 },
  { label: "24h", ms: 24 * 60 * 60 * 1000 },
  { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
];

const PRESETS_KEY = "clawos-activity-presets-v1";
const PREFS_KEY = "clawos-activity-prefs-v1";

interface Preset {
  name: string;
  search: string;
  category: string;
  status: string;
  range: number;
}

const Activity = () => {
  const { data: events = [], isLoading } = useActivity();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [range, setRange] = useState<number>(Infinity);
  const [busy, setBusy] = useState(false);
  const [terminal, setTerminal] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}").terminal ?? false; } catch { return false; }
  });
  const [presets, setPresets] = useState<Preset[]>(() => {
    try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); }, [presets]);
  useEffect(() => { localStorage.setItem(PREFS_KEY, JSON.stringify({ terminal })); }, [terminal]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.category && set.add(e.category));
    return ["All", ...Array.from(set)];
  }, [events]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.type && set.add(e.type));
    return ["All", ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    const cutoff = Date.now() - range;
    return events.filter((e) => {
      if (category !== "All" && e.category !== category) return false;
      if (status !== "All" && e.type !== status) return false;
      if (range !== Infinity && new Date(e.created_at).getTime() < cutoff) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!e.message.toLowerCase().includes(q) && !(e.detail || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [events, category, status, range, search]);

  const savePreset = () => {
    const name = prompt("Preset name?");
    if (!name) return;
    const next: Preset = { name, search, category, status, range };
    setPresets((p) => [...p.filter((x) => x.name !== name), next]);
    toast.success(`Saved preset "${name}"`);
  };
  const applyPreset = (p: Preset) => {
    setSearch(p.search); setCategory(p.category); setStatus(p.status); setRange(p.range);
    toast.success(`Applied "${p.name}"`);
  };
  const deletePreset = (name: string) => {
    setPresets((p) => p.filter((x) => x.name !== name));
  };
  const clearFilters = () => {
    setSearch(""); setCategory("All"); setStatus("All"); setRange(Infinity);
  };
  const hasActiveFilters = search || category !== "All" || status !== "All" || range !== Infinity;

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((e) => {
      const d = new Date(e.created_at);
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();
      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();
      const key = isToday ? "Today" : isYesterday ? "Yesterday" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      (groups[key] = groups[key] || []).push(e);
    });
    return groups;
  }, [filtered]);

  const handleExport = () => {
    const json = JSON.stringify(filtered, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `clawos-activity-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} events`);
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all activity events? This cannot be undone.")) return;
    setBusy(true);
    const { error } = await supabase.from("activity_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Activity cleared");
    qc.invalidateQueries({ queryKey: ["activity"] });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Live system events and audit log</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTerminal((t) => !t)} title="Toggle terminal stream view" className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border border-border transition-colors", terminal ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground hover:bg-card")}>
            <Terminal className="w-3 h-3" /> {terminal ? "Visual" : "Terminal"}
          </button>
          <button onClick={handleExport} disabled={!filtered.length} title="Export filtered events" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors disabled:opacity-40">
            <FileDown className="w-3 h-3" /> Export
          </button>
          <button onClick={handleClearAll} disabled={busy || !events.length} title="Clear all events" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-destructive/70 hover:text-destructive border border-border hover:bg-destructive/5 transition-colors disabled:opacity-40">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
          <span className="flex items-center gap-1.5 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-medium">Live</span>
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.04 }} className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
            />
          </div>
          <div className="flex gap-1">
            {TIME_RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r.ms)}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                  range === r.ms ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3 h-3 text-muted-foreground/40" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                  category === c ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground bg-card border border-border"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground/50">
          Showing {filtered.length} of {events.length} events
        </p>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
          <Zap className="w-8 h-8 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">{events.length === 0 ? "No activity yet" : "No events match your filters"}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{events.length === 0 ? "Events will appear here as you use the system" : "Try clearing filters or expanding the time range"}</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-6">
          <AnimatePresence>
            {Object.entries(grouped).map(([day, dayEvents]) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">{day}</h3>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground/40 font-mono">{dayEvents.length}</span>
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event, i) => {
                    const config = eventConfig[event.type] || fallbackConfig;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
                        className="flex items-start gap-3.5 p-3.5 rounded-lg surface-elevated group hover:border-primary/10 transition-all duration-200"
                      >
                        <div className={cn("w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 ring-1", config.bg, config.ring)}>
                          <Icon className={cn("w-3 h-3", config.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] text-foreground font-medium">{event.message}</p>
                            {event.category && (
                              <span className={cn("text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", categoryColors[event.category] || "text-muted-foreground bg-muted")}>
                                {event.category}
                              </span>
                            )}
                          </div>
                          {event.detail && <p className="text-[11px] text-muted-foreground mt-1">{event.detail}</p>}
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 mt-0.5 font-mono">{timeAgo(event.created_at)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Activity;
