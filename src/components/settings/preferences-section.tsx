"use client";

import { useTheme } from "next-themes";
import { ChatPreferencesSection } from "@/components/settings/chat-preferences-section";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", bg: "bg-white", fg: "bg-neutral-800" },
  {
    value: "dark",
    label: "Dark",
    bg: "bg-neutral-900",
    fg: "bg-neutral-200",
  },
  {
    value: "system",
    label: "System",
    bg: "bg-gradient-to-br from-white to-neutral-900",
    fg: "bg-neutral-400",
  },
] as const;

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Theme
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          Choose how the interface looks
        </p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "group relative flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all",
                theme === t.value
                  ? "border-primary bg-accent/50 shadow-sm"
                  : "border-border/60 hover:border-border hover:bg-accent/30",
              )}
            >
              <div
                className={cn(
                  "h-14 w-full rounded-lg border border-border/40 overflow-hidden flex items-end p-2",
                  t.bg,
                )}
              >
                <div className={cn("h-1.5 w-8 rounded-full", t.fg)} />
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  theme === t.value
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {t.label}
              </span>
              {theme === t.value && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    aria-hidden="true"
                    className="h-2.5 w-2.5 text-primary-foreground"
                    focusable="false"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator className="opacity-50" />

      <ChatPreferencesSection />
    </div>
  );
}
