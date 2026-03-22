"use client";

import { Icon } from "@iconify/react";
import type { SearchStatusData } from "@/lib/types";

export function SearchProgressIndicator({
  status,
}: {
  status: SearchStatusData;
}) {
  if (status.phase === "generating-queries") {
    return (
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Icon icon="solar:magnifer-bold" className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Generating search queries...</span>
      </div>
    );
  }

  if (status.phase === "searching") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <Icon icon="solar:global-bold" className="h-4 w-4 animate-spin" />
          <span className="text-sm">Searching the web...</span>
        </div>
        {status.queries && status.queries.length > 0 && (
          <div className="ml-6.5 space-y-1">
            {status.queries.map((query) => (
              <p key={query} className="text-xs text-muted-foreground/70">
                &ldquo;{query}&rdquo;
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (status.phase === "complete") {
    return (
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Icon
          icon="solar:check-circle-bold"
          className="h-4 w-4 text-green-500"
        />
        <span className="text-sm">Found {status.resultCount ?? 0} results</span>
      </div>
    );
  }

  return null;
}
