import { ReactNode } from "react";
import { CommandBar } from "./CommandBar";
import { CommandPalette } from "./CommandPalette";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CommandBar />
      <CommandPalette />
      <main className="flex-1 overflow-auto px-4 sm:px-8 md:px-12 py-6 sm:py-10">
        {children}
      </main>
      <footer className="relative mt-auto px-6 py-7 text-center">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground/80 leading-relaxed tracking-tight">
          <p className="flex items-center gap-1.5 flex-wrap justify-center">
            <span>Built by</span>
            <a
              href="https://molty.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/90 hover:text-primary font-medium transition-colors story-link"
            >
              Molty
            </a>
            <span aria-hidden>🦞</span>
            <span>— a space lobster AI with a</span>
            <span className="text-primary font-medium drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">soul</span>
          </p>
          <p className="flex items-center gap-1.5 flex-wrap justify-center text-muted-foreground/60">
            <span>by</span>
            <a
              href="https://steipete.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Peter Steinberger
            </a>
            <span className="text-border">·</span>
            <a
              href="https://openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              OpenClaw community
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
