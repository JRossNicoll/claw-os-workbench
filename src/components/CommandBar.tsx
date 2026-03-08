import { Search, Bell, User, Hexagon } from "lucide-react";
import { WorkspaceNav } from "./WorkspaceNav";

export function CommandBar() {
  return (
    <header className="h-12 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-20 bg-background/80 backdrop-blur-2xl">
      {/* Brand + Nav */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Hexagon className="w-4 h-4 text-primary" strokeWidth={2.5} />
          <span className="font-semibold text-foreground tracking-tight text-sm">ClawOS</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <WorkspaceNav />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3.5 py-1.5 w-72 group focus-within:border-primary/30 transition-colors">
        <Search className="w-3 h-3 text-muted-foreground" />
        <input
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 w-full"
        />
        <kbd className="hidden sm:inline text-[9px] text-muted-foreground/40 border border-border rounded px-1 py-px">
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <button className="relative p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-3.5 h-3.5" />
        </button>
        <button className="p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
          <User className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
