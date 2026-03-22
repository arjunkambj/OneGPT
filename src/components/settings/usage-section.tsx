"use client";

import { Icon } from "@iconify/react";
import { useUsage } from "@/hooks/use-usage";

export function UsageSection() {
  const { messageCount, searchCount } = useUsage();

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
          <p className="text-3xl font-semibold tracking-tight">
            {messageCount}
          </p>
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
          <p className="text-3xl font-semibold tracking-tight">
            {searchCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Daily usage</p>
        </div>
      </div>
    </div>
  );
}
