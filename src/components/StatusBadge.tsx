import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "running" | "success" | "failed" | "pending" | "stopped" | "active" | "inactive";
  children?: ReactNode;
}

const statusStyles: Record<string, string> = {
  running: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  stopped: "bg-muted text-muted-foreground border-border",
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", statusStyles[status])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-info animate-pulse-glow": status === "running",
        "bg-success": status === "success" || status === "active",
        "bg-destructive": status === "failed",
        "bg-warning": status === "pending",
        "bg-muted-foreground": status === "stopped" || status === "inactive",
      })} />
      {children || status}
    </span>
  );
}
