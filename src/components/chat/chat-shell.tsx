import type React from "react";
import { SidebarLayout } from "@/components/chat/sidebar-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarLayout>{children}</SidebarLayout>
      </SidebarProvider>
    </TooltipProvider>
  );
}
