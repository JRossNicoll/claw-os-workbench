import { ReactNode, useState } from "react";
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
      <main className="flex-1 overflow-auto px-6 sm:px-10 py-8">
        {children}
      </main>
    </div>
  );
}
