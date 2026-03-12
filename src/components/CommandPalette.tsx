import { useEffect, useState, useMemo } from "react";
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
  Download, Bot, PlayCircle, Link2, Server, Search,
} from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useAutomations } from "@/hooks/use-automations";
import { useEngines } from "@/hooks/use-engines";

const navigationItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Automations", icon: Layers, path: "/automations" },
  { label: "Agents", icon: Bot, path: "/agents" },
  { label: "Runs", icon: PlayCircle, path: "/runs" },
  { label: "Engine Library", icon: Cog, path: "/engines" },
  { label: "Integrations", icon: Link2, path: "/integrations" },
  { label: "Activity", icon: Activity, path: "/activity" },
  { label: "Secrets", icon: Lock, path: "/secrets" },
  { label: "System", icon: Server, path: "/system" },
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

  const { data: agents = [] } = useAgents();
  const { data: automations = [] } = useAutomations();
  const { data: engines = [] } = useEngines();

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

  // Expose open function globally so CommandBar can trigger it
  useEffect(() => {
    (window as any).__openCommandPalette = () => setOpen(true);
    return () => { delete (window as any).__openCommandPalette; };
  }, []);

  const runCommand = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search agents, automations, engines..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Real data search results */}
        {agents.length > 0 && (
          <CommandGroup heading="Agents">
            {agents.map((agent) => (
              <CommandItem key={agent.id} onSelect={() => runCommand("/agents")} keywords={[agent.name, agent.description, agent.type, agent.engine]}>
                <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span>{agent.name}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{agent.type} · {agent.engine}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {automations.length > 0 && (
          <CommandGroup heading="Automations">
            {automations.map((auto) => (
              <CommandItem key={auto.id} onSelect={() => runCommand("/automations")} keywords={[auto.name, auto.description, auto.trigger]}>
                <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span>{auto.name}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{auto.trigger}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {engines.length > 0 && (
          <CommandGroup heading="Engines">
            {engines.filter(e => e.installed).map((engine) => (
              <CommandItem key={engine.id} onSelect={() => runCommand("/engines")} keywords={[engine.name, engine.description, engine.category]}>
                <Cog className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span>{engine.name}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{engine.category} · v{engine.version}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

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
