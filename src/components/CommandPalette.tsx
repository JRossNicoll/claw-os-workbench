import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home, Layers, Cog, Activity, Lock, Settings, Plus, Play,
  Download, Search, Zap,
} from "lucide-react";

const navigationItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Automations", icon: Layers, path: "/automations" },
  { label: "Engine Library", icon: Cog, path: "/engines" },
  { label: "Activity", icon: Activity, path: "/activity" },
  { label: "Secrets", icon: Lock, path: "/secrets" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const actionItems = [
  { label: "Create Automation", icon: Plus, path: "/automations" },
  { label: "Install Engine", icon: Download, path: "/engines" },
  { label: "Run Task", icon: Play, path: "/automations" },
  { label: "View Activity", icon: Activity, path: "/activity" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem key={item.label} onSelect={() => runCommand(item.path)}>
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem key={item.label} onSelect={() => runCommand(item.path)}>
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
