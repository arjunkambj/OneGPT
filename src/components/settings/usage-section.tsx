"use client";

import { Icon } from "@iconify/react";

export function UsageSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Icon
              icon="solar:chat-round-dots-linear"
              className="h-4 w-4 text-muted-foreground"
            />
            <p className="text-sm font-medium">Messages Today</p>
          </div>
          <p className="text-3xl font-semibold tracking-tight">0</p>
          <p className="text-xs text-muted-foreground mt-1">Daily usage</p>
        </div>

        <div className="p-5 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Icon
              icon="solar:magnifer-linear"
              className="h-4 w-4 text-muted-foreground"
            />
            <p className="text-sm font-medium">Searches Today</p>
          </div>
          <p className="text-3xl font-semibold tracking-tight">0</p>
          <p className="text-xs text-muted-foreground mt-1">Daily usage</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-muted/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon icon="solar:info-circle-linear" className="h-4 w-4 shrink-0" />
          <p>
            Detailed usage analytics will be available once chat is connected to
            the backend.
          </p>
        </div>
      </div>
    </div>
  );
}
