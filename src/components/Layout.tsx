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
      <footer className="py-4 text-center">
        <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors">
          OpenClaw
        </a>
      </footer>
    </div>
  );
}
