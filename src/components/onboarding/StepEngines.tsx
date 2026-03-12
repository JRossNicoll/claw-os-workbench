import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEngines } from "@/hooks/use-engines";

interface StepEnginesProps { selected: string[]; onToggle: (id: string) => void; }

export function StepEngines({ selected, onToggle }: StepEnginesProps) {
  const { data: engines = [] } = useEngines();
  const topEngines = engines.slice(0, 8);

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground tracking-tight text-center">Install engines</h2>
      <p className="text-xs text-muted-foreground text-center mt-1.5 mb-8">Engines power your automations — pick the ones you need</p>
      <div className="space-y-1.5">
        {topEngines.map((engine) => {
          const isSelected = selected.includes(engine.id);
          return (
            <button key={engine.id} onClick={() => onToggle(engine.id)} className={cn("w-full flex items-center gap-3.5 p-3.5 rounded-lg surface-elevated text-left transition-all duration-200", isSelected ? "border-primary/40" : "hover:border-primary/15")}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0", isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                {engine.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{engine.name}</span>
                  {engine.stars && <span className="text-[10px] text-muted-foreground">★ {engine.stars}</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{engine.description}</p>
              </div>
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              ) : (
                <span className="text-[10px] text-muted-foreground/40 font-medium">Install</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
