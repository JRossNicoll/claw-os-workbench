import { Search, Bell, User } from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 sticky top-0 z-10 bg-background/60 backdrop-blur-xl">
      {/* Search */}
      <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3.5 py-2 w-64 group focus-within:bg-muted focus-within:ring-1 focus-within:ring-primary/30 transition-all">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground w-full"
        />
        <kbd className="hidden sm:inline text-[10px] text-muted-foreground/60 border border-border rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button className="relative p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
        </button>
      </div>
    </header>
  );
}
