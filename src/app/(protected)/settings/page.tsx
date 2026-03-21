"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full">
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40">
            <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-3">
                <div className="md:hidden h-6 w-6 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="hidden lg:block lg:w-64 shrink-0 space-y-4">
                <div className="rounded-xl border border-border/60 p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-24 mx-auto" />
                      <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 p-2 space-y-1">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </main>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
