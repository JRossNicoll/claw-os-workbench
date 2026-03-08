import { NavLink, useLocation } from "react-router-dom";
import {
  Radar,
  Package,
  GitBranch,
  Play,
  Clock,
  Zap,
  Store,
  Lock,
  ScrollText,
  Settings,
  ChevronLeft,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Mission Control", icon: Radar, path: "/" },
  { title: "Workflows", icon: GitBranch, path: "/workflows" },
  { title: "Jobs", icon: Play, path: "/jobs" },
  { title: "Modules", icon: Package, path: "/modules" },
  { title: "Marketplace", icon: Store, path: "/registry" },
  { title: "Schedules", icon: Clock, path: "/schedules" },
  { title: "Triggers", icon: Zap, path: "/triggers" },
  { title: "Vault", icon: Lock, path: "/secrets" },
  { title: "Logs", icon: ScrollText, path: "/logs" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border gap-2">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 glow-sm">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground tracking-tight text-sm">
            Claw<span className="text-primary">OS</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
              )} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* System status */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
            <span>4 workers online</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse-glow" />
            <span>3 runs active</span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="h-10 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
