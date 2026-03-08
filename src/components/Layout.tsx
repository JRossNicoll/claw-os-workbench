import { ReactNode } from "react";
import { WorkspaceNav } from "./WorkspaceNav";
import { CommandBar } from "./CommandBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CommandBar />
      <WorkspaceNav />
      <main className="flex-1 overflow-auto px-8 sm:px-12 py-10">
        {children}
      </main>
    </div>
  );
}
