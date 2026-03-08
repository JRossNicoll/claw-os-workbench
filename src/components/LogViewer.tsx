import { cn } from "@/lib/utils";

interface LogLine {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

interface LogViewerProps {
  logs: LogLine[];
  className?: string;
  maxHeight?: string;
}

const levelColors: Record<string, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

export function LogViewer({ logs, className, maxHeight = "400px" }: LogViewerProps) {
  return (
    <div
      className={cn(
        "bg-terminal-bg rounded-lg border border-border font-mono text-xs overflow-auto terminal-scrollbar",
        className
      )}
      style={{ maxHeight }}
    >
      <div className="p-4 space-y-0.5">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 leading-5">
            <span className="text-terminal-dim flex-shrink-0">{log.timestamp}</span>
            <span className={cn("flex-shrink-0 uppercase w-12", levelColors[log.level])}>[{log.level}]</span>
            <span className="text-terminal-text">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
