import { NavLink, useLocation } from "react-router-dom";
import { Home, Layers, Puzzle, Activity, Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Automations", icon: Layers, path: "/automations" },
  { title: "Tools", icon: Puzzle, path: "/tools" },
  { title: "Activity", icon: Activity, path: "/activity" },
  { title: "Secrets", icon: Lock, path: "/secrets" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function WorkspaceNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1 px-6 sm:px-10 py-1.5 border-b border-border/30 bg-background/50 backdrop-blur-xl">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== "/" && location.pathname.startsWith(item.path));

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon
              className={cn(
                "w-[15px] h-[15px] transition-colors",
                isActive ? "text-primary" : ""
              )}
            />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
