"use client";

import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { ChatMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ExamplePrompt {
  text: string;
  mode?: ChatMode;
}

interface PromptCategory {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  prompts: ExamplePrompt[];
}

interface ExamplePromptsProps {
  onSelect: (prompt: ExamplePrompt) => void;
  className?: string;
}

const promptCategories: PromptCategory[] = [
  {
    id: "write",
    label: "Write",
    icon: "solar:pen-new-square-linear",
    prompts: [
      { text: "Draft a concise product announcement for " },
      { text: "Rewrite this to sound clearer and more confident:\n\n" },
      { text: "Turn these rough notes into a polished email:\n\n" },
    ],
  },
  {
    id: "think",
    label: "Think",
    icon: "solar:lightbulb-linear",
    prompts: [
      { text: "Help me think through the tradeoffs of " },
      { text: "Give me a decision framework for " },
      { text: "Brainstorm practical ideas for " },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    icon: "solar:notebook-linear",
    prompts: [
      { text: "Explain this like I am technical but new to it: " },
      { text: "Create a learning plan for " },
      { text: "Compare the key differences between " },
    ],
  },
  {
    id: "search",
    label: "Research",
    icon: "solar:magnifer-linear",
    badge: "Web",
    prompts: [
      {
        text: "Find the latest credible information about ",
        mode: "search",
      },
      {
        text: "Compare current options for ",
        mode: "search",
      },
      {
        text: "Verify this claim with sources: ",
        mode: "search",
      },
    ],
  },
];

export const ExamplePrompts = memo(
  ({ onSelect, className }: ExamplePromptsProps) => {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
      null,
    );
    const panelRef = useRef<HTMLDivElement>(null);

    const activeCategory = promptCategories.find(
      (category) => category.id === activeCategoryId,
    );

    const handleToggleCategory = useCallback((categoryId: string) => {
      setActiveCategoryId((current) =>
        current === categoryId ? null : categoryId,
      );
    }, []);

    const handleSelect = useCallback(
      (prompt: ExamplePrompt) => {
        onSelect(prompt);
        setActiveCategoryId(null);
      },
      [onSelect],
    );

    useEffect(() => {
      if (!activeCategoryId) return;

      const handlePointerDown = (event: PointerEvent) => {
        if (!panelRef.current?.contains(event.target as Node)) {
          setActiveCategoryId(null);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setActiveCategoryId(null);
      };

      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [activeCategoryId]);

    return (
      <div className={cn("relative w-full max-w-2xl", className)}>
        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-2 transition-opacity duration-150",
            activeCategory && "opacity-0 pointer-events-none",
          )}
        >
          {promptCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleToggleCategory(category.id)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-xs font-medium",
                "text-muted-foreground transition-colors duration-150",
                "hover:border-border hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon icon={category.icon} className="size-3.5" />
              <span>{category.label}</span>
              {category.badge && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  {category.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {activeCategory && (
            <motion.div
              ref={panelRef}
              key={activeCategory.id}
              initial={{ opacity: 0, scale: 0.98, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -4 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-x-0 top-0 z-10 overflow-hidden rounded-md border bg-popover shadow-lg"
            >
              <button
                type="button"
                onClick={() => setActiveCategoryId(null)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon icon={activeCategory.icon} className="size-4" />
                  <span className="text-sm font-medium">
                    {activeCategory.label}
                  </span>
                  {activeCategory.badge && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {activeCategory.badge}
                    </span>
                  )}
                </span>
                <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon icon="solar:close-circle-linear" className="size-4" />
                </span>
              </button>

              <div className="p-1.5 pt-0">
                {activeCategory.prompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    type="button"
                    onClick={() => handleSelect(prompt)}
                    className={cn(
                      "group flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left text-sm",
                      "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="line-clamp-2">{prompt.text}</span>
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

ExamplePrompts.displayName = "ExamplePrompts";
