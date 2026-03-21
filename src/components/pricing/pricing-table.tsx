"use client";

import Link from "next/link";
import { PricingHeader } from "./pricing-header";
import { PricingHero } from "./pricing-hero";
import { PlanCardFree } from "./plan-card-free";
import { PlanCardPro } from "./plan-card-pro";
import { PlanCardMax } from "./plan-card-max";
import { FeatureComparison } from "./feature-comparison";
import { TrustSignals } from "./trust-signals";

export default function PricingTable() {
  return (
    <div className="min-h-screen bg-background">
      <PricingHeader />
      <PricingHero />

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <PlanCardFree />
          <PlanCardPro />
          <PlanCardMax />
        </div>
      </div>

      <FeatureComparison />
      <TrustSignals />

      {/* Legal Links */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <span className="w-px h-3 bg-border/50" />
          <Link
            href="/privacy-policy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
