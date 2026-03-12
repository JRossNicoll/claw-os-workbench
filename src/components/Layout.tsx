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
      <main className="flex-1 overflow-auto px-8 sm:px-12 py-10">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground leading-relaxed">
        <p>
          Built by{" "}
          <a href="https://molty.me/" target="_blank" rel="noopener noreferrer" className="text-destructive hover:text-destructive/80 font-medium transition-colors">Molty</a>
          {" "}🦞, a space lobster AI with a{" "}
          <span className="text-destructive font-medium">soul</span>, by
        </p>
        <p>
          <a href="https://steipete.me/" target="_blank" rel="noopener noreferrer" className="text-destructive hover:text-destructive/80 font-medium transition-colors">Peter Steinberger</a>
          {" & "}
          <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-destructive hover:text-destructive/80 font-medium transition-colors">community</a>.
        </p>
      </footer>
    </div>
  );
}
