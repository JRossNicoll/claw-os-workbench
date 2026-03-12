import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Hexagon, Settings, LogOut, RefreshCw, X } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceNav } from "./WorkspaceNav";
import { useActivity, timeAgo } from "@/hooks/use-activity";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";


export function CommandBar() {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: events = [] } = useActivity();
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recentNotifs = events.slice(0, 8);
  const unreadCount = Math.min(events.length, 9);

  const openSearch = () => {
    (window as any).__openCommandPalette?.();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-12 flex items-center justify-between px-4 sm:px-8 md:px-12 sticky top-0 z-20 bg-background/80 backdrop-blur-2xl"
    >
      {/* Brand + Nav */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <img src={logoImg} alt="ClawOS" className="w-5 h-5 object-contain" />
          <span className="font-semibold text-foreground tracking-tight text-sm hidden sm:inline">ClawOS</span>
        </motion.div>
        <div className="w-px h-4 bg-border hidden sm:block" />
        <WorkspaceNav />
      </div>

      {/* Search — responsive */}
      <motion.button
        onClick={openSearch}
        whileHover={{ scale: 1.01, borderColor: "hsl(var(--primary) / 0.25)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-10 sm:w-48 md:w-72 group cursor-pointer mx-2 sm:mx-0"
      >
        <Search className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground/50 flex-1 text-left hidden sm:inline truncate">Search or ⌘K...</span>
        <kbd className="hidden md:inline text-[9px] text-muted-foreground/40 border border-border rounded px-1 py-px">
          ⌘K
        </kbd>
      </motion.button>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <motion.button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="relative p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-50 w-80 rounded-xl bg-card border border-border shadow-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-xs font-semibold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">{unreadCount}</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">No notifications yet</div>
                  ) : (
                    recentNotifs.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => { setNotifOpen(false); navigate("/activity"); }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground leading-snug">{event.message}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {event.category && (
                              <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">{event.category}</span>
                            )}
                            <span className="text-[9px] text-muted-foreground/40">{timeAgo(event.created_at)}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => { setNotifOpen(false); navigate("/activity"); }}
                  className="w-full py-2.5 text-[11px] text-primary hover:bg-accent/50 transition-colors border-t border-border font-medium"
                >
                  View all activity
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <motion.button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
          >
            <User className="w-3.5 h-3.5" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-50 w-48 py-1.5 rounded-xl bg-card border border-border shadow-xl"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <div className="text-xs font-medium text-foreground">ClawOS Operator</div>
                  <div className="text-[10px] text-muted-foreground">Local workspace</div>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/settings"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/integrations"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Hexagon className="w-3.5 h-3.5" />
                  Integrations
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    localStorage.removeItem("clawos-onboarded");
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
