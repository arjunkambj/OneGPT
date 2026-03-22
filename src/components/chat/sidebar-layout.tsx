"use client";

import type React from "react";
import { AppSidebar } from "@/components/chat/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
