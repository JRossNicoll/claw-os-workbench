import { Search, Bell, User, Sparkles } from "lucide-react";

export function CommandBar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-20 bg-background/70 backdrop-blur-2xl border-b border-border/50">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="font-semibold text-foreground tracking-tight text-[15px]">ClawOS</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2 w-80 group focus-within:bg-muted focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          placeholder="Search automations, tools..."
          className="bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground/60 w-full"
        />
        <kbd className="hidden sm:inline text-[10px] text-muted-foreground/50 border border-border/60 rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="relative p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
        <button className="p-1.5 rounded-xl hover:bg-muted/60 transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
        </button>
      </div>
    </header>
  );
}
