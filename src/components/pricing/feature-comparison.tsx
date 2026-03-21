"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const comparisonFeatures = [
  {
    name: "Daily messages",
    free: "10 per day",
    pro: "Unlimited",
    max: "Unlimited",
  },
  {
    name: "Base AI models",
    free: "Basic models",
    pro: "All base models",
    max: "All base models",
  },
  {
    name: "Premium AI models (Claude, Gemini Pro)",
    free: false,
    pro: false,
    max: true,
  },
  { name: "Chat history", free: true, pro: true, max: true },
  { name: "Search modes", free: "Basic", pro: "All modes", max: "All modes" },
  { name: "Custom instructions", free: false, pro: true, max: true },
  { name: "Vision support", free: false, pro: true, max: true },
  { name: "File uploads", free: false, pro: true, max: true },
  { name: "Priority support", free: false, pro: true, max: true },
];

export function FeatureComparison() {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-16">
      <h2 className="text-xl font-semibold text-center mb-8">
        Compare features
      </h2>
      <div className="rounded-2xl border border-border/60 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-4 gap-0 bg-muted/30 border-b border-border/40">
          <div className="p-4 text-sm font-medium text-muted-foreground">
            Feature
          </div>
          <div className="p-4 text-sm font-medium text-center text-muted-foreground">
            Free
          </div>
          <div className="p-4 text-sm font-medium text-center text-primary">
            Pro
          </div>
          <div className="p-4 text-sm font-medium text-center text-muted-foreground">
            Max
          </div>
        </div>

        {/* Table rows */}
        {comparisonFeatures.map((feature, index) => (
          <div
            key={feature.name}
            className={cn(
              "grid grid-cols-4 gap-0",
              index !== comparisonFeatures.length - 1 &&
                "border-b border-border/30",
            )}
          >
            <div className="p-4 text-sm text-foreground">{feature.name}</div>
            {(["free", "pro", "max"] as const).map((plan) => {
              const value = feature[plan];
              return (
                <div
                  key={plan}
                  className="p-4 text-sm text-center flex items-center justify-center"
                >
                  {typeof value === "boolean" ? (
                    value ? (
                      <Icon
                        icon="solar:check-circle-bold"
                        className={cn(
                          "w-4 h-4",
                          plan === "pro"
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    ) : (
                      <Icon
                        icon="solar:close-circle-linear"
                        className="w-4 h-4 text-muted-foreground/30"
                      />
                    )
                  ) : (
                    <span
                      className={cn(
                        "text-xs",
                        plan === "pro"
                          ? "text-primary font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
