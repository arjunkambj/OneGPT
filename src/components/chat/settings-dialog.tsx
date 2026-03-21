"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { models, PROVIDERS, getModelProvider } from "@/constant/ai-model";
import { isSupportedModel } from "@/lib/ai/model-routing";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabValue = "profile" | "appearance" | "chat";

interface TabItem {
  value: TabValue;
  label: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const tabItems: TabItem[] = [
  { value: "profile", label: "Profile", icon: "solar:user-linear" },
  { value: "appearance", label: "Appearance", icon: "solar:palette-linear" },
  { value: "chat", label: "Chat Settings", icon: "solar:settings-linear" },
];

const PLACEHOLDER_USER = {
  name: "Jane Doe",
  email: "jane@example.com",
  image: "",
};

// ---------------------------------------------------------------------------
// Profile Tab
// ---------------------------------------------------------------------------

function ProfileTab({ isMobile }: { isMobile: boolean }) {
  const user = PLACEHOLDER_USER;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div
        className={cn("flex items-center gap-4", isMobile ? "pb-2" : "pb-3")}
      >
        <Avatar
          className={cn(
            "ring-2 ring-border/50 ring-offset-2 ring-offset-background",
            isMobile ? "h-16 w-16" : "h-20 w-20",
          )}
        >
          <AvatarImage src={user.image} />
          <AvatarFallback className={isMobile ? "text-base" : "text-lg"}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 min-w-0">
          <h3
            className={cn(
              "font-semibold truncate",
              isMobile ? "text-base" : "text-lg",
            )}
          >
            {user.name}
          </h3>
          <p
            className={cn(
              "text-muted-foreground break-all",
              isMobile ? "text-xs" : "text-sm",
            )}
          >
            {user.email}
          </p>
        </div>
      </div>

      {/* Account details */}
      <div className={isMobile ? "space-y-2.5" : "space-y-3"}>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Account Details
        </h4>
        <div className="rounded-lg border border-border/60 divide-y divide-border/40">
          <div className={cn(isMobile ? "p-3" : "p-4")}>
            <Label className="text-xs text-muted-foreground/70 uppercase tracking-wider">
              Full Name
            </Label>
            <p className="text-sm font-medium mt-1">{user.name}</p>
          </div>
          <div className={cn(isMobile ? "p-3" : "p-4")}>
            <Label className="text-xs text-muted-foreground/70 uppercase tracking-wider">
              Email Address
            </Label>
            <p className="text-sm font-medium mt-1 break-all">{user.email}</p>
          </div>
        </div>

        <div
          className={cn(
            "rounded-lg bg-muted/30 border border-border/40",
            isMobile ? "p-2.5" : "p-3",
          )}
        >
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "text-[11px]" : "text-xs",
            )}
          >
            Profile information is managed through your authentication provider.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appearance Tab
// ---------------------------------------------------------------------------

function AppearanceTab() {
  const { theme, setTheme } = useTheme();

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

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Theme
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          Choose how the interface looks
        </p>
      </div>

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
            {/* Swatch preview */}
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
                theme === t.value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
            </span>
            {/* Active indicator */}
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
  );
}

// ---------------------------------------------------------------------------
// Chat Settings Tab
// ---------------------------------------------------------------------------

function ChatSettingsTab() {
  const supportedModels = useMemo(
    () => models.filter((model) => isSupportedModel(model.value)),
    [],
  );
  const [selectedModel, setSelectedModel] = useState(
    supportedModels[0]?.value ?? "onegpt-default",
  );
  const [customInstructions, setCustomInstructions] = useState("");
  const [instructionsEnabled, setInstructionsEnabled] = useState(true);

  // Group models by provider
  const groupedModels = supportedModels.reduce<Record<string, typeof supportedModels>>(
    (acc, model) => {
      const provider =
        model.provider || getModelProvider(model.value, model.label);
      const providerName = PROVIDERS[provider]?.name ?? provider;
      if (!acc[providerName]) acc[providerName] = [];
      acc[providerName].push(model);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      {/* Default model */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Default Model
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Choose which AI model is selected by default for new chats
        </p>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
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

      {/* Custom instructions */}
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
            <Textarea
              id="instructions"
              placeholder="e.g. 'Always provide code examples' or 'Keep responses concise and practical'"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="min-h-[100px] resize-y text-sm rounded-lg border-border/60"
              style={{ maxHeight: "25dvh" }}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs rounded-lg px-3"
                disabled={!customInstructions.trim()}
              >
                <Icon icon="solar:diskette-linear" className="w-3 h-3 mr-1.5" />
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Dialog (main export)
// ---------------------------------------------------------------------------

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [currentTab, setCurrentTab] = useState<TabValue>("profile");
  const isMobile = useIsMobile();

  const contentSections = (
    <>
      {currentTab === "profile" && <ProfileTab isMobile={isMobile} />}
      {currentTab === "appearance" && <AppearanceTab />}
      {currentTab === "chat" && <ChatSettingsTab />}
    </>
  );

  // ── Mobile: Drawer ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full max-h-full">
            {/* Header */}
            <DrawerHeader className="pb-2 px-4 pt-3 shrink-0 border-b border-border/40">
              <DrawerTitle className="text-base font-medium flex items-center gap-2">
                <Icon
                  icon="solar:settings-linear"
                  className="size-4 text-muted-foreground"
                />
                <span>Settings</span>
              </DrawerTitle>
            </DrawerHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain">
              {contentSections}
            </div>

            {/* Bottom tab navigation */}
            <div className="border-t border-border/40 bg-background/95 backdrop-blur shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <div className="w-full py-1.5 px-3 flex gap-1.5 overflow-x-auto">
                {tabItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setCurrentTab(item.value)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 h-14 rounded-lg relative px-4 min-w-[4.5rem] shrink-0 transition-colors flex-1",
                      currentTab === item.value
                        ? "bg-accent/80"
                        : "hover:bg-accent/40",
                    )}
                  >
                    <Icon
                      icon={item.icon}
                      className={cn(
                        "h-4 w-4 transition-colors",
                        currentTab === item.value
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] mt-0.5 transition-colors",
                        currentTab === item.value
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Desktop: Dialog ─────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl !w-full max-h-[85vh] !p-0 !gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 m-0 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2.5">
            <Icon
              icon="solar:settings-linear"
              className="size-5 text-muted-foreground"
            />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Application settings
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar tabs */}
          <div className="w-48 border-r border-border/40 overflow-y-auto">
            <div className="p-3 flex flex-col gap-0.5">
              {tabItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setCurrentTab(item.value)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    "hover:bg-accent/50",
                    currentTab === item.value
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon icon={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(85vh-120px)]">
              <div className="p-6 pb-8">{contentSections}</div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
