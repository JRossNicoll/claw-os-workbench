import { Search, Bell, User, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import { WorkspaceNav } from "./WorkspaceNav";

interface CommandBarProps {
  onOpenSearch?: () => void;
}

export function CommandBar({ onOpenSearch }: CommandBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-12 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-20 bg-background/80 backdrop-blur-2xl"
    >
      {/* Brand + Nav */}
      <div className="flex items-center gap-4">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Hexagon className="w-4 h-4 text-primary" strokeWidth={2.5} />
          <span className="font-semibold text-foreground tracking-tight text-sm">ClawOS</span>
        </motion.div>
        <div className="w-px h-4 bg-border" />
        <WorkspaceNav />
      </div>

      {/* Search */}
      <motion.button
        onClick={onOpenSearch}
        whileHover={{ scale: 1.01, borderColor: "hsl(var(--primary) / 0.25)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center gap-2 bg-card border border-border rounded-lg px-3.5 py-1.5 w-72 group cursor-pointer"
      >
        <Search className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground/50 flex-1 text-left">Search or run command...</span>
        <kbd className="hidden sm:inline text-[9px] text-muted-foreground/40 border border-border rounded px-1 py-px">
          ⌘K
        </kbd>
      </motion.button>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
        >
          <User className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.header>
  );
}
