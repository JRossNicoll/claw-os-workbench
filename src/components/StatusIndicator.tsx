import { cn } from "@/lib/utils";
import { forwardRef, ReactNode } from "react";

interface StatusIndicatorProps {
  status: "running" | "success" | "failed" | "pending" | "active" | "inactive" | "skipped" | "retrying" | "error";
  children?: ReactNode;
  size?: "sm" | "md";
}

const statusStyles: Record<string, { dot: string; text: string }> = {
  running: { dot: "bg-info animate-pulse-soft", text: "text-info" },
  success: { dot: "bg-success", text: "text-success" },
  failed: { dot: "bg-destructive", text: "text-destructive" },
  pending: { dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  active: { dot: "bg-success animate-pulse-soft", text: "text-success" },
  inactive: { dot: "bg-muted-foreground/30", text: "text-muted-foreground" },
  skipped: { dot: "bg-muted-foreground/20", text: "text-muted-foreground" },
  retrying: { dot: "bg-warning animate-pulse-soft", text: "text-warning" },
  error: { dot: "bg-destructive animate-pulse-soft", text: "text-destructive" },
};

export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ status, children, size = "sm" }, ref) => {
    const style = statusStyles[status] || statusStyles.inactive;
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium capitalize",
          style.text,
          size === "sm" ? "text-[11px]" : "text-xs"
        )}
      >
        <span className={cn("rounded-full", style.dot, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
        {children || status}
      </span>
    );
  }
);
StatusIndicator.displayName = "StatusIndicator";
