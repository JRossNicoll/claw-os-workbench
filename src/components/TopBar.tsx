import { Search, Bell, User, Circle } from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 w-72">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search modules, workflows, jobs..."
          className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
        />
        <kbd className="hidden sm:inline text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* System status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Circle className="w-2 h-2 fill-success text-success" />
          <span className="hidden sm:inline">All systems operational</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 p-1 rounded-md hover:bg-muted transition-colors">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
}
