import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  name: string;
  status: "success" | "running" | "failed" | "pending";
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  className?: string;
}

const stepStatusColors: Record<string, string> = {
  success: "border-success bg-success/10 text-success",
  running: "border-info bg-info/10 text-info",
  failed: "border-destructive bg-destructive/10 text-destructive",
  pending: "border-border bg-muted text-muted-foreground",
};

const arrowStatusColors: Record<string, string> = {
  success: "bg-success/50",
  running: "bg-info/50",
  failed: "bg-destructive/50",
  pending: "bg-border",
};

export function WorkflowDiagram({ steps, className }: WorkflowDiagramProps) {
  return (
    <div className={cn("flex items-center gap-0 overflow-x-auto py-2", className)}>
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={cn(
            "px-4 py-2 rounded-md border text-xs font-mono whitespace-nowrap transition-all",
            stepStatusColors[step.status]
          )}>
            {step.name}
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-center mx-1">
              <div className={cn("w-8 h-px", arrowStatusColors[steps[i + 1].status])} />
              <div className={cn(
                "w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent",
                steps[i + 1].status === "success" ? "border-l-success/50" :
                steps[i + 1].status === "running" ? "border-l-info/50" :
                steps[i + 1].status === "failed" ? "border-l-destructive/50" :
                "border-l-border"
              )} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
