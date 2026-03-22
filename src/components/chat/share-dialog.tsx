"use client";

import { Icon } from "@iconify/react";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sharePath } from "@/lib/chat-routes";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  initialVisibility: "public" | "private";
  initialShareToken?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  chatId,
  initialVisibility,
  initialShareToken,
}: ShareDialogProps) {
  const [isShared, setIsShared] = useState(initialVisibility === "public");
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [isChanging, setIsChanging] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync local state when props change (e.g., bootstrap loads or external update)
  useEffect(() => {
    setIsShared(initialVisibility === "public");
    setShareToken(initialShareToken);
  }, [initialVisibility, initialShareToken]);

  const updateVisibility = useMutation(api.chats.updateChatVisibility);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}${sharePath(shareToken)}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareAndCopy = async () => {
    setIsChanging(true);
    try {
      const result = await updateVisibility({
        chatId: chatId as Id<"chats">,
        visibility: "public",
      });
      setShareToken(result.shareToken);
      setIsShared(true);

      if (result.shareToken) {
        const url = `${window.location.origin}${sharePath(result.shareToken)}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Failed to share chat");
    } finally {
      setIsChanging(false);
    }
  };

  const handleMakePrivate = async () => {
    setIsChanging(true);
    try {
      await updateVisibility({
        chatId: chatId as Id<"chats">,
        visibility: "private",
      });
      setIsShared(false);
      setShareToken(undefined);
      toast.success("Chat is now private");
      onOpenChange(false);
    } catch {
      toast.error("Failed to make chat private");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-100 sm:max-w-130 gap-0 p-0 border-0 shadow-lg">
        <div className="px-5 pt-5 pb-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {isShared ? "Chat shared" : "Share chat"}
            </DialogTitle>
            <p className="text-[13px] text-muted-foreground">
              {isShared
                ? "Future messages won't be included"
                : "Only messages up until now will be shared"}
            </p>
          </DialogHeader>
        </div>

        <div className="px-5 pb-5 overflow-x-hidden">
          {isShared ? (
            <div className="space-y-3">
              {/* Access options */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleMakePrivate}
                  disabled={isChanging}
                  className="w-full flex items-start gap-3 px-3.5 py-3 text-left rounded-xl border hover:bg-muted/50"
                >
                  <div className="mt-0.5">
                    <Icon
                      icon="solar:lock-keyhole-linear"
                      width={16}
                      height={16}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Private</p>
                    <p className="text-xs text-muted-foreground">
                      Only you have access
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  aria-disabled
                  className="w-full flex items-start gap-3 px-3.5 py-3 text-left rounded-xl border border-primary/30 bg-primary/5 cursor-default"
                >
                  <div className="mt-0.5">
                    <Icon icon="solar:earth-linear" width={16} height={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Public access</p>
                      <Icon
                        icon="solar:check-circle-linear"
                        width={16}
                        height={16}
                        className="text-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Anyone with the link can view
                    </p>
                  </div>
                </button>
              </div>

              {/* Link with Copy button */}
              <div className="group relative overflow-hidden rounded-2xl border bg-muted/40">
                <div className="px-4 py-3 overflow-x-hidden">
                  <code
                    className="text-[13px] text-foreground/70 font-medium truncate! text-wrap block"
                    style={{
                      maskImage:
                        "linear-gradient(to right, black 70%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to right, black 70%, transparent 100%)",
                    }}
                  >
                    {shareUrl}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleCopyLink}
                  className={cn(
                    "h-9 px-3 font-medium text-xs absolute right-1 top-1/2 -translate-y-1/2",
                    copied && "bg-primary hover:bg-primary",
                  )}
                >
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Access options */}
              <div className="space-y-2">
                <button
                  type="button"
                  aria-disabled
                  className="w-full flex items-start gap-3 px-3.5 py-3 text-left rounded-xl border border-primary/30 bg-primary/5 cursor-default"
                >
                  <div className="mt-0.5">
                    <Icon
                      icon="solar:lock-keyhole-linear"
                      width={16}
                      height={16}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Private</p>
                      <Icon
                        icon="solar:check-circle-linear"
                        width={16}
                        height={16}
                        className="text-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Only you have access
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleShareAndCopy}
                  disabled={isChanging}
                  className="w-full flex items-start gap-3 px-3.5 py-3 text-left rounded-xl border hover:bg-muted/50"
                >
                  <div className="mt-0.5">
                    <Icon icon="solar:earth-linear" width={16} height={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Public access</p>
                    <p className="text-xs text-muted-foreground">
                      Anyone with the link can view
                    </p>
                  </div>
                </button>
              </div>

              <p className="text-[12px] text-muted-foreground">
                Don&apos;t share personal information or third-party content
                without permission.
              </p>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleShareAndCopy}
                  disabled={isChanging}
                  className="h-10 px-4 font-medium"
                >
                  {isChanging ? "Creating\u2026" : "Create share link"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
