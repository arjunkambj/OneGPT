"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import Messages from "@/components/chat/messages";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sharePath } from "@/lib/chat-routes";
import type { ChatMessage } from "@/lib/types";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ShareViewerProps {
  shareToken: string;
}

function fromStoredMessage(message: {
  _id: string;
  parentMessageId?: string;
  role: "user" | "assistant" | "system";
  mode?: "chat" | "search";
  parts: ChatMessage["parts"];
  attachments?: ChatMessage["attachments"];
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  completionTime?: number;
  createdAt: number;
}): ChatMessage {
  return {
    id: message._id,
    parentMessageId: message.parentMessageId,
    role: message.role,
    mode: message.mode,
    parts: message.parts,
    attachments: message.attachments,
    model: message.model,
    inputTokens: message.inputTokens,
    outputTokens: message.outputTokens,
    totalTokens: message.totalTokens,
    completionTime: message.completionTime,
    createdAt: message.createdAt,
  };
}

export function ShareViewer({ shareToken }: ShareViewerProps) {
  const chat = useQuery(api.chats.getSharedChat, { shareToken });
  const messagesData = useQuery(
    api.chats.getSharedMessages,
    chat?._id ? { chatId: chat._id as Id<"chats"> } : "skip",
  );
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${sharePath(shareToken)}`
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

  // Loading state
  if (chat === undefined) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 pt-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Not found / no longer shared
  if (chat === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Icon
            icon="solar:link-broken-linear"
            width={48}
            height={48}
            className="mx-auto text-muted-foreground"
          />
          <h1 className="text-xl font-semibold">Chat not found</h1>
          <p className="text-muted-foreground text-sm">
            This chat doesn&apos;t exist or is no longer shared.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Go to OneGPT</Link>
          </Button>
        </div>
      </div>
    );
  }

  const messages: ChatMessage[] = (messagesData ?? []).map(fromStoredMessage);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 border-b border-border/40">
        <div className="flex w-full max-w-2xl mx-auto items-center justify-between px-4 h-12">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/" className="shrink-0">
              <img
                src="/Black.svg"
                alt="OneGPT"
                className="h-6 w-6 dark:invert"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold tracking-tight text-foreground truncate">
                {chat.title}
              </h1>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                Shared chat
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-7 w-7 p-0 rounded-lg shrink-0"
            title="Copy link"
          >
            <Icon
              icon={copied ? "solar:check-circle-linear" : "solar:copy-linear"}
              width={16}
              height={16}
            />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 pb-28 pt-16">
        {messagesData === undefined ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <Messages messages={messages} />
        )}
      </div>

      {/* Floating bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="w-full max-w-2xl mx-auto px-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border/50 bg-background/90 backdrop-blur-xl px-4 py-3 shadow-lg shadow-black/5">
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                icon="solar:chat-round-dots-linear"
                width={20}
                height={20}
                className="shrink-0 text-foreground/70"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">
                  You&apos;re viewing a shared chat
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                  Sign in to start your own conversations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 text-xs rounded-lg gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Icon icon="solar:copy-linear" width={14} height={14} />
                Copy link
              </Button>
              <Button
                size="sm"
                asChild
                className="h-8 text-xs rounded-lg gap-1.5 px-3"
              >
                <Link href="/">
                  Open OneGPT
                  <Icon
                    icon="solar:arrow-right-linear"
                    width={14}
                    height={14}
                  />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
