"use client";

import { Icon } from "@iconify/react";

export function TrustSignals() {
  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:shield-check-bold" className="w-3.5 h-3.5" />
          Secure checkout
        </div>
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:bolt-bold" className="w-3.5 h-3.5" />
          Instant activation
        </div>
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
          Cancel anytime
        </div>
      </div>
    </div>
  );
}
