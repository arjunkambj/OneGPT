"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { models, PROVIDERS, getModelProvider } from "@/constant/ai-model";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { isSupportedModel } from "@/lib/ai/model-routing";
import { cn } from "@/lib/utils";
import { useCustomInstructions } from "@/hooks/use-custom-instructions";

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
  const { defaultModel, saveDefaultModel } = useUserPreferences();
  const {
    content: savedContent,
    isEnabled,
    isLoading: instructionsLoading,
    save: saveInstructions,
  } = useCustomInstructions();

  const [content, setContent] = useState("");
  const [instructionsEnabled, setInstructionsEnabled] = useState(true);

  useEffect(() => {
    if (savedContent) setContent(savedContent);
  }, [savedContent]);

  useEffect(() => {
    setInstructionsEnabled(isEnabled);
  }, [isEnabled]);

  const supportedModels = useMemo(
    () => models.filter((model) => isSupportedModel(model.value)),
    [],
  );

  const groupedModels = useMemo(
    () =>
      supportedModels.reduce<Record<string, typeof supportedModels>>(
        (acc, model) => {
          const provider =
            model.provider || getModelProvider(model.value, model.label);
          const providerName = PROVIDERS[provider]?.name ?? provider;
          if (!acc[providerName]) acc[providerName] = [];
          acc[providerName].push(model);
          return acc;
        },
        {},
      ),
    [supportedModels],
  );

  const selectedModel =
    defaultModel && isSupportedModel(defaultModel)
      ? defaultModel
      : supportedModels[0]?.value ?? "onegpt-default";

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Custom instructions cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      await saveInstructions(content, instructionsEnabled);
      toast.success("Custom instructions saved");
    } catch {
      toast.error("Failed to save instructions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleModelChange = async (model: string) => {
    if (!isSupportedModel(model)) {
      toast.error("That model is no longer available");
      return;
    }

    try {
      await saveDefaultModel(model);
      toast.success("Default model updated");
    } catch {
      toast.error("Failed to save model preference");
    }
  };

  useEffect(() => {
    if (!defaultModel || isSupportedModel(defaultModel)) return;

    void (async () => {
      try {
        await saveDefaultModel(selectedModel);
      } catch {
        console.error("Failed to repair unsupported default model");
      }
    })();
  }, [defaultModel, saveDefaultModel, selectedModel]);

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
                    className="h-2.5 w-2.5 text-primary-foreground"
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

      {/* Default Model */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Default Model
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Choose which AI model is selected by default for new chats
        </p>
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger className="w-full h-9 text-sm rounded-lg">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedModels).map(
              ([providerName, providerModels]) => (
                <div key={providerName}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {providerName}
                  </div>
                  {providerModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <span>{model.label}</span>
                    </SelectItem>
                  ))}
                </div>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <Separator className="opacity-50" />

      {/* Custom Instructions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Custom Instructions
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Personalise how the AI responds to you
            </p>
          </div>
          <Switch
            id="enable-instructions"
            checked={instructionsEnabled}
            onCheckedChange={setInstructionsEnabled}
          />
        </div>

        {instructionsEnabled && (
          <div className="space-y-2.5">
            {instructionsLoading ? (
              <Skeleton className="h-20 w-full rounded-lg" />
            ) : (
              <Textarea
                id="instructions"
                placeholder="e.g. 'Always provide code examples' or 'Keep responses concise and practical'"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-y text-sm rounded-lg border-border/60"
                style={{ maxHeight: "25dvh" }}
              />
            )}
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs rounded-lg px-3"
              disabled={!content.trim() || isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
