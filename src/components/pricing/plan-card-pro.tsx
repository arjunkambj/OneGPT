"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

const features = [
  "Unlimited messages",
  "All base AI models",
  "Vision support",
  "File uploads",
  "Custom instructions",
  "Priority support",
];

export function PlanCardPro() {
  const router = useRouter();

  return (
    <div className="p-8 lg:p-10 flex flex-col rounded-2xl border border-primary/20 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-lg font-semibold text-foreground">Pro</h3>
        <span className="text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">
          Popular
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Unlimited power for professionals
      </p>

      <div className="mb-8">
        <div className="space-y-1">
          <div className="flex items-baseline">
            <span className="text-5xl font-semibold tracking-tight text-foreground">
              $15
            </span>
            <span className="text-sm text-muted-foreground ml-2">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Less than a coffee a day
          </p>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 text-sm text-foreground/80"
          >
            <Icon
              icon="solar:check-circle-linear"
              className="w-3.5 h-3.5 text-primary shrink-0"
            />
            {item}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <Button
          className="w-full h-11 rounded-xl group"
          onClick={() => router.push("/sign-in")}
        >
          Get started with Pro
          <Icon
            icon="solar:arrow-right-linear"
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
          />
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Credit/Debit Cards & more (auto-renews monthly)
        </p>
      </div>
    </div>
  );
}
