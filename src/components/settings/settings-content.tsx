"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSubscription } from "@/hooks/use-subscription";
import { tabs } from "./tabs-config";
import { SettingsHeader } from "./settings-header";
import { UserProfileCard } from "./user-profile-card";
import { PreferencesSection } from "./preferences-section";
import { UsageSection } from "./usage-section";
import { SubscriptionSection } from "./subscription-section";

export function SettingsContent() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "preferences";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { tier, isProUser } = useSubscription();

  const userName = user?.displayName ?? "User";
  const userEmail = user?.primaryEmail ?? "";
  const userImage = user?.profileImageUrl || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    toast.promise(
      user.signOut().then(() => router.push("/sign-in")),
      {
        loading: "Signing out...",
        success: "Signed out successfully",
        error: "Failed to sign out",
      },
    );
  };

  const profileProps = {
    userName,
    userEmail,
    userImage,
    initials,
    isProUser,
    tier,
    onSignOut: handleSignOut,
  };

  return (
    <div className="w-full">
      <SettingsHeader activeTab={activeTab} />

      <main className="flex-1 overflow-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
        <UserProfileCard {...profileProps} variant="mobile" />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Mobile Dropdown */}
          <div className="lg:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {tabs.find((t) => t.value === activeTab) && (
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={tabs.find((t) => t.value === activeTab)!.icon}
                        className="h-4 w-4"
                      />
                      <span>
                        {tabs.find((t) => t.value === activeTab)!.label}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground/40 w-4">
                        {tab.number}
                      </span>
                      <Icon icon={tab.icon} className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:w-64 shrink-0 space-y-4">
            <UserProfileCard {...profileProps} variant="desktop" />

            <Card className="p-2 shadow-none border-border/60">
              <TabsList className="flex flex-col h-auto w-full bg-transparent gap-0.5">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                      "hover:bg-accent/50 transition-colors shadow-none! rounded-lg",
                    )}
                  >
                    <span className="text-[9px] text-muted-foreground/40 w-4">
                      {tab.number}
                    </span>
                    <Icon icon={tab.icon} className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Card>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <TabsContent value="preferences" className="m-0">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/30">01</span>
                    <h2 className="text-lg font-semibold">Preferences</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customize your experience
                  </p>
                </div>
                <PreferencesSection />
              </div>
            </TabsContent>

            <TabsContent value="usage" className="m-0">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/30">02</span>
                    <h2 className="text-lg font-semibold">Usage Statistics</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track your daily and monthly usage
                  </p>
                </div>
                <UsageSection />
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="m-0">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/30">03</span>
                    <h2 className="text-lg font-semibold">Subscription</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription and billing
                  </p>
                </div>
                <SubscriptionSection />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
