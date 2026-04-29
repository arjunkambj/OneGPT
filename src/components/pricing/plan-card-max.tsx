"use client";

import { Icon } from "@iconify/react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

const features = ["Anthropic Claude models (60/week)"];

export function PlanCardMax() {
  const router = useRouter();
  const user = useUser();
  const { tier, status, isLoading: isSubscriptionLoading } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const isCurrentPlan = tier === "max" && status !== "canceled";

  async function startCheckout() {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout/dodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "max" }),
      });
      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Failed to start checkout");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8 lg:p-10 flex flex-col rounded-2xl border border-border/50 bg-card relative overflow-hidden">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-lg font-semibold text-foreground">Max</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        All Pro features + premium AI models
      </p>

      <div className="mb-8">
        <div className="space-y-1">
          <div className="flex items-baseline">
            <span className="text-5xl font-semibold tracking-tight text-foreground">
              $60
            </span>
            <span className="text-sm text-muted-foreground ml-2">/month</span>
          </div>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        <li className="flex items-center gap-2.5 text-sm text-foreground/80 font-medium">
          <Icon
            icon="solar:check-circle-linear"
            className="w-3.5 h-3.5 text-primary shrink-0"
          />
          All Pro features included
        </li>
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
          disabled={isLoading || isSubscriptionLoading || isCurrentPlan}
          onClick={startCheckout}
        >
          {isCurrentPlan
            ? "Current plan"
            : isLoading
              ? "Starting checkout..."
              : "Get started with Max"}
          <Icon
            icon="solar:arrow-right-linear"
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
          />
        </Button>
      </div>
    </div>
  );
}
