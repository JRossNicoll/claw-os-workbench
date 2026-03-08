import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, CheckCircle, Loader2, XCircle, Clock, Terminal as TerminalIcon } from "lucide-react";

interface PipelineStep {
  id: string;
  name: string;
  status: "success" | "running" | "failed" | "pending";
  duration?: string;
  logs?: { timestamp: string; level: "info" | "warn" | "error" | "debug"; message: string }[];
}

interface PipelineViewProps {
  steps: PipelineStep[];
  className?: string;
}

const statusConfig = {
  success: { icon: CheckCircle, color: "text-success", border: "border-success/30", bg: "bg-success/5", line: "bg-success/40" },
  running: { icon: Loader2, color: "text-info", border: "border-info/30", bg: "bg-info/5", line: "bg-info/40" },
  failed: { icon: XCircle, color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5", line: "bg-destructive/40" },
  pending: { icon: Clock, color: "text-muted-foreground", border: "border-border", bg: "bg-muted/30", line: "bg-border" },
};

const levelColors: Record<string, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

export function PipelineView({ steps, className }: PipelineViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, i) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;
        const isOpen = expanded[step.id];
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            {/* Vertical connector line */}
            {!isLast && (
              <div className={cn("absolute left-[17px] top-[40px] w-px", config.line, isOpen ? "h-[calc(100%-40px)]" : "h-[calc(100%-24px)]")} />
            )}

            {/* Step */}
            <button
              onClick={() => step.logs && toggle(step.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left group",
                config.border, config.bg,
                step.logs ? "cursor-pointer hover:border-foreground/20" : "cursor-default"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", config.color, step.status === "running" && "animate-spin")} />
              <span className="font-mono text-sm text-foreground flex-1">{step.name}</span>
              {step.duration && (
                <span className="text-xs text-muted-foreground font-mono">{step.duration}</span>
              )}
              {step.logs && (
                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              )}
            </button>

            {/* Expanded logs */}
            {isOpen && step.logs && (
              <div className="ml-[17px] pl-6 border-l border-border">
                <div className="mt-1 mb-3 bg-terminal-bg rounded-md border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30">
                    <TerminalIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">output</span>
                  </div>
                  <div className="p-3 font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto terminal-scrollbar">
                    {step.logs.map((log, j) => (
                      <div key={j} className="flex gap-2 leading-5">
                        <span className="text-terminal-dim flex-shrink-0">{log.timestamp}</span>
                        <span className={cn("flex-shrink-0 w-12", levelColors[log.level])}>[{log.level}]</span>
                        <span className="text-terminal-text">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Spacer for non-last items */}
            {!isLast && <div className="h-1" />}
          </div>
        );
      })}
    </div>
  );
}
