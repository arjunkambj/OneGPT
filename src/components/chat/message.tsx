"use client";

import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ChatMessage, MessagePart } from "@/lib/types";
import { Markdown } from "./markdown";

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
}

function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          aria-label="Copy message"
        >
          {copied ? (
            <Icon icon="solar:check-circle-linear" className="h-4 w-4" />
          ) : (
            <Icon icon="solar:copy-linear" className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy message</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ReasoningSection({
  reasoning,
  details,
}: {
  reasoning: string;
  details?: { type: string; summary: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const summaryText =
    details?.map((d) => d.summary).join(", ") || "View reasoning";

  return (
    <div className="my-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? (
          <Icon icon="solar:alt-arrow-up-linear" className="h-3.5 w-3.5" />
        ) : (
          <Icon icon="solar:alt-arrow-down-linear" className="h-3.5 w-3.5" />
        )}
        <span className="font-medium">{summaryText}</span>
      </button>
      {isOpen && (
        <div className="mt-2 pl-5 border-l-2 border-muted">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 overflow-hidden">
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5">
          <div className="bg-destructive/10 p-1.5 rounded-full">
            <Icon
              icon="solar:danger-circle-linear"
              className="h-4 w-4 text-destructive"
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-destructive">Error</h3>
          <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
        </div>
      </div>
    </div>
  );
}

function getTextContent(parts: MessagePart[]): string {
  return parts
    .filter(
      (p): p is Extract<MessagePart, { type: "text" }> => p.type === "text",
    )
    .map((p) => p.text)
    .join("")
    .trim();
}

export function Message({ message, isLast }: MessageProps) {
  if (message.role === "user") {
    const text = getTextContent(message.parts);

    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="max-w-[85%]">
          <div className="bg-accent/80 rounded-md px-4 py-2.5">
            <p className="text-foreground whitespace-pre-wrap break-words">
              {text}
            </p>
          </div>
        </div>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-muted">
            <Icon
              icon="solar:user-linear"
              className="h-4 w-4 text-muted-foreground"
            />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  if (message.role === "assistant") {
    const textContent = getTextContent(message.parts);

    return (
      <div className={cn("group/message flex items-start gap-3", isLast && "min-h-[200px]")}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10">
            <Icon icon="solar:bot-linear" className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-1">
          {message.parts.map((part, index) => {
            const key = `${message.id}-part-${index}`;

            if (part.type === "reasoning") {
              return (
                <ReasoningSection
                  key={key}
                  reasoning={part.reasoning}
                  details={part.details}
                />
              );
            }

            if (part.type === "text" && part.text.trim()) {
              return (
                <div key={key}>
                  <Markdown content={part.text} />
                </div>
              );
            }

            if (part.type === "error") {
              return <ErrorDisplay key={key} error={part.error} />;
            }

            return null;
          })}

          {/* Action bar */}
          {textContent && (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 [.group\/message:hover_&]:opacity-100">
              <CopyMessageButton text={textContent} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
