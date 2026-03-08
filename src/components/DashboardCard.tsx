import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function DashboardCard({ title, value, subtitle, icon, children, className }: DashboardCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border p-5 animate-slide-in", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      {value !== undefined && (
        <div className="text-2xl font-semibold text-foreground">{value}</div>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
