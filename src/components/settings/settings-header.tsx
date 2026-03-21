"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { tabs } from "./tabs-config";

interface SettingsHeaderProps {
  activeTab: string;
}

export function SettingsHeader({ activeTab }: SettingsHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
            <span className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.15em] hidden sm:inline-block">
              {tabs.find((t) => t.value === activeTab)?.number || "01"}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {tabs.find((t) => t.value === activeTab)?.label}
        </p>
      </div>
    </header>
  );
}
