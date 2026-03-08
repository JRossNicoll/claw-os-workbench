import { NavLink, useLocation } from "react-router-dom";
import { Home, Layers, Cog, Activity, Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Automations", icon: Layers, path: "/automations" },
  { title: "Engines", icon: Cog, path: "/engines" },
  { title: "Activity", icon: Activity, path: "/activity" },
  { title: "Secrets", icon: Lock, path: "/secrets" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function WorkspaceNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-0.5 px-8 sm:px-12 h-10 border-b border-border/50">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== "/" && location.pathname.startsWith(item.path));

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
