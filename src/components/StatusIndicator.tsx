import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatusIndicatorProps {
  status: "running" | "success" | "failed" | "pending" | "active" | "inactive";
  children?: ReactNode;
  size?: "sm" | "md";
}

const statusStyles: Record<string, { dot: string; text: string; bg: string }> = {
  running: { dot: "bg-info animate-pulse-soft", text: "text-info", bg: "bg-info/8" },
  success: { dot: "bg-success", text: "text-success", bg: "bg-success/8" },
  failed: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/8" },
  pending: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", bg: "bg-muted" },
  active: { dot: "bg-success animate-pulse-soft", text: "text-success", bg: "bg-success/8" },
  inactive: { dot: "bg-muted-foreground/40", text: "text-muted-foreground", bg: "bg-muted" },
};

export function StatusIndicator({ status, children, size = "sm" }: StatusIndicatorProps) {
  const style = statusStyles[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium capitalize",
      style.text,
      size === "sm" ? "text-xs" : "text-sm"
    )}>
      <span className={cn("rounded-full", style.dot, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      {children || status}
    </span>
  );
}
