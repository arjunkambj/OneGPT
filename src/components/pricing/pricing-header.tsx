"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export function PricingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between h-14 px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/Black.svg" alt="OneGPT" className="size-5 dark:hidden" />
            <img
              src="/white.svg"
              alt="OneGPT"
              className="size-5 hidden dark:block"
            />
            <span className="text-lg font-light tracking-tighter">OneGPT</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" className="w-3.5 h-3.5" />
              Back
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
