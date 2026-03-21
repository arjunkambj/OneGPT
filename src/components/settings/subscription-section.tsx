"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

const tierConfig = {
  free: {
    label: "Free",
    color: "bg-muted text-muted-foreground",
    description: "Basic access with daily limits",
  },
  pro: {
    label: "Pro",
    color: "bg-primary/10 text-primary",
    description: "Unlimited searches, all base models, and more",
  },
  max: {
    label: "Max",
    color: "bg-gradient-to-br from-primary/20 to-accent/20 text-foreground",
    description: "All Pro features plus premium AI models",
  },
};

export function SubscriptionSection() {
  const { tier, isProUser, status } = useSubscription();
  const router = useRouter();

  const current =
    tierConfig[tier as keyof typeof tierConfig] ?? tierConfig.free;

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:wallet-money-linear"
              className="h-5 w-5 text-muted-foreground"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{current.label}</h3>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    current.color,
                  )}
                >
                  {status === "active"
                    ? "Active"
                    : tier === "free"
                      ? "Current"
                      : (status ?? "Active")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        {!isProUser && (
          <Button
            className="w-full rounded-xl"
            onClick={() => router.push("/pricing")}
          >
            <Icon icon="solar:arrow-right-linear" className="h-4 w-4 mr-2" />
            View Plans & Upgrade
          </Button>
        )}

        {isProUser && (
          <Button variant="outline" className="w-full rounded-xl" disabled>
            Manage Subscription
          </Button>
        )}
      </div>
    </div>
  );
}
