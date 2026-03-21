export function PricingHero() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 mb-4 block">
            Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-4">
            Simple, <span className="font-semibold">honest</span> pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Start free. Upgrade when you need unlimited power.
          </p>
          <p className="text-xs text-muted-foreground">
            Cancel anytime &middot; No hidden fees &middot; Secure checkout
          </p>
        </div>
      </div>
    </div>
  );
}
