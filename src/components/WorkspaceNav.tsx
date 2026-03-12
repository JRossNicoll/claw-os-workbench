import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Layers, Cog, Activity, Lock, Settings, ChevronDown, Link2, Server, Bot, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Automations", icon: Layers, path: "/automations" },
  { title: "Agents", icon: Bot, path: "/agents" },
  { title: "Runs", icon: PlayCircle, path: "/runs" },
  { title: "Engines", icon: Cog, path: "/engines" },
  { title: "Integrations", icon: Link2, path: "/integrations" },
  { title: "Activity", icon: Activity, path: "/activity" },
  { title: "Secrets", icon: Lock, path: "/secrets" },
  { title: "System", icon: Server, path: "/system" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function WorkspaceNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const current = navItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path !== "/" && location.pathname.startsWith(item.path))
  ) || navItems[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
      >
        <current.icon className="w-3.5 h-3.5 text-primary" />
        <span>{current.title}</span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-8 left-0 z-40 w-48 py-1.5 rounded-lg bg-card border border-border shadow-lg"
            >
              {navItems.map((item) => {
                const isActive = item.path === current.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 mx-1 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
