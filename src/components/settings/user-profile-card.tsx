"use client";

import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserProfileCardProps {
  userName: string;
  userEmail: string;
  userImage: string;
  initials: string;
  isProUser: boolean;
  tier: string;
  onSignOut: () => void;
  variant: "mobile" | "desktop";
}

export function UserProfileCard({
  userName,
  userEmail,
  userImage,
  initials,
  isProUser,
  tier,
  onSignOut,
  variant,
}: UserProfileCardProps) {
  if (variant === "mobile") {
    return (
      <div className="lg:hidden mb-6">
        <Card className="p-4 shadow-none border-border/60">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-border/50 ring-offset-2 ring-offset-background">
              <AvatarImage src={userImage} />
              <AvatarFallback className="text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate">{userName}</h3>
                {isProUser && (
                  <span className="inline-block text-xs leading-4 px-2.5 py-0.5 rounded-xl shadow-sm bg-primary/10 text-primary ring-1 ring-primary/20">
                    {tier === "max" ? "max" : "pro"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
              onClick={onSignOut}
            >
              <Icon icon="solar:logout-2-linear" className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6 shadow-none border-border/60">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-border/50 ring-offset-2 ring-offset-background">
          <AvatarImage src={userImage} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1 w-full">
          <h3 className="font-semibold text-base">{userName}</h3>
          <p className="text-xs text-muted-foreground break-all">{userEmail}</p>
          {isProUser && (
            <span className="inline-block text-xs leading-4 px-2.5 py-0.5 rounded-xl shadow-sm bg-primary/10 text-primary ring-1 ring-primary/20 mt-2">
              {tier === "max" ? "max" : "pro"}
            </span>
          )}
        </div>
        <div className="w-full pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={onSignOut}
          >
            <Icon icon="solar:logout-2-linear" className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </Card>
  );
}
