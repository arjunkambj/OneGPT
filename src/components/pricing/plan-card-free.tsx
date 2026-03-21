"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

const features = [
  "10 messages per day",
  "Basic AI models",
  "Chat history",
  "Web search",
];

export function PlanCardFree() {
  return (
    <div className="p-8 lg:p-10 flex flex-col rounded-2xl border border-border/50 bg-card/30">
      <h3 className="text-lg font-semibold mb-2 text-foreground">Free</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Get started with the essentials
      </p>
      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-semibold tracking-tight text-foreground">
          $0
        </span>
        <span className="text-sm text-muted-foreground ml-2">/month</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 text-sm text-muted-foreground"
          >
            <Icon
              icon="solar:check-circle-linear"
              className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0"
            />
            {item}
          </li>
        ))}
      </ul>
      <Button variant="outline" className="w-full h-11 rounded-xl" disabled>
        Current plan
      </Button>
    </div>
  );
}
