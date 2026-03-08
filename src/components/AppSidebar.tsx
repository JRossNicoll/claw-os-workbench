import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Layers,
  Puzzle,
  Activity,
  Lock,
  Settings,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Automations", icon: Layers, path: "/automations" },
  { title: "Tools", icon: Puzzle, path: "/tools" },
  { title: "Activity", icon: Activity, path: "/activity" },
  { title: "Secrets", icon: Lock, path: "/secrets" },
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
        "h-screen sticky top-0 flex flex-col bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-[200px]"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground tracking-tight text-[15px]">
            ClawOS
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2.5 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-2.5 py-[9px] rounded-lg text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                isActive ? "text-primary" : ""
              )} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse */}
      <button
        onClick={onToggle}
        className="h-10 mx-2.5 mb-2 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
