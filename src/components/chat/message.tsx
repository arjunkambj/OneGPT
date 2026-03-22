"use client";

import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getModelConfig } from "@/constant/ai-model";
import type { ChatMessage, MessagePart } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Markdown } from "./markdown";
import { ModelSelector } from "./model-selector";

export interface AssistantBranchState {
  siblingIndex: number;
  siblingCount: number;
  onSelectPrevious?: () => void;
  onSelectNext?: () => void;
  onRetryWithModel?: (model: string) => void;
}

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
  branchState?: AssistantBranchState | null;
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
  state,
}: {
  reasoning: string;
  details?: { type: string; summary: string }[];
  state?: "streaming" | "done";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isComplete = state === "done" || state === undefined;
  const [isThinking, setIsThinking] = useState(!isComplete);
  const [autoExpanded, setAutoExpanded] = useState(!isComplete);
  const [expandedOverride, setExpandedOverride] = useState<boolean | undefined>(
    undefined,
  );

  const isExpanded = expandedOverride ?? autoExpanded;
  const hasContent = reasoning.trim().length > 0;
  const reasoningLength = reasoning.length;

  // Debounced thinking state — 150ms delay on done transition to prevent flicker
  useEffect(() => {
    if (!isComplete) {
      if (thinkingTimerRef.current != null) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      setIsThinking(true);
    } else {
      if (thinkingTimerRef.current == null) {
        thinkingTimerRef.current = setTimeout(() => {
          setIsThinking(false);
          thinkingTimerRef.current = null;
        }, 150);
      }
    }
    return () => {
      if (thinkingTimerRef.current != null) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
    };
  }, [isComplete]);

  // Auto-expand while thinking, auto-collapse 900ms after done
  useEffect(() => {
    if (collapseTimerRef.current != null) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    if (expandedOverride !== undefined) return;

    if (isThinking) {
      setAutoExpanded(true);
      return;
    }

    collapseTimerRef.current = setTimeout(() => {
      setAutoExpanded(false);
      collapseTimerRef.current = null;
    }, 900);

    return () => {
      if (collapseTimerRef.current != null) {
        clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
    };
  }, [expandedOverride, isThinking]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isThinking && scrollRef.current && reasoningLength > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isThinking, reasoningLength]);

  // Hide empty reasoning when done
  if (!hasContent && !isThinking) return null;

  return (
    <div className="my-1">
      <div>
        <button
          type="button"
          onClick={() => !isThinking && setExpandedOverride(!isExpanded)}
          className={cn(
            "flex items-center gap-1.5 py-1 text-muted-foreground/60",
            !isThinking && "cursor-pointer transition-colors hover:text-muted-foreground",
          )}
        >
          {isThinking ? (
            <>
              <Icon
                icon="solar:refresh-circle-2-linear"
                className="h-3 w-3 animate-spin"
              />
              <span className="text-xs">Thinking</span>
            </>
          ) : (
            <>
              <Icon
                icon={
                  isExpanded
                    ? "solar:alt-arrow-up-linear"
                    : "solar:alt-arrow-down-linear"
                }
                className="h-3 w-3"
              />
              <span className="text-xs">Reasoning</span>
            </>
          )}
        </button>

        <AnimatePresence initial={false}>
          {(isThinking || isExpanded) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div
                ref={scrollRef}
                className="max-h-[180px] overflow-y-auto border-l-2 border-border/40 pl-3 ml-1"
              >
                <div className="py-1 text-xs leading-relaxed text-muted-foreground/60">
                  {hasContent ? (
                    <p className="whitespace-pre-wrap break-words">
                      {reasoning}
                    </p>
                  ) : (
                    <span className="text-muted-foreground/40">Thinking…</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-destructive/20 bg-destructive/5">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 rounded-full bg-destructive/10 p-1.5">
          <Icon
            icon="solar:danger-circle-linear"
            className="h-4 w-4 text-destructive"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-destructive">Error</h3>
          <p className="mt-0.5 text-sm text-destructive/80">{error}</p>
        </div>
      </div>
    </div>
  );
}

function ModelLabel({ model }: { model?: string }) {
  if (!model) return null;

  const config = getModelConfig(model);
  return (
    <span className="text-xs text-muted-foreground">
      {config?.label ?? model}
    </span>
  );
}

function RetryWithModelButton({
  onRetryWithModel,
  currentModel,
}: {
  onRetryWithModel?: (model: string) => void;
  currentModel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ModelSelector
      selectedModel={currentModel ?? ""}
      onModelChange={(model) => {
        setOpen(false);
        onRetryWithModel?.(model);
      }}
      open={open}
      onOpenChange={setOpen}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
        disabled={!onRetryWithModel}
      >
        <Icon icon="solar:refresh-linear" className="mr-1.5 h-3.5 w-3.5" />
        Retry
      </Button>
    </ModelSelector>
  );
}

function SourcesSection({
  parts,
}: {
  parts: Extract<MessagePart, { type: "source-url" }>[];
}) {
  if (parts.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <Icon icon="solar:link-round-angle-linear" className="h-3.5 w-3.5" />
        Sources
      </div>

      <div className="space-y-2">
        {parts.map((part) => (
          <a
            key={`${part.sourceId}-${part.url}`}
            href={part.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
          >
            <div className="mt-0.5 rounded-full bg-foreground/6 p-1">
              <Icon icon="solar:globe-linear" className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {part.title ?? part.url}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {part.url}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function getTextContent(parts: MessagePart[]) {
  return parts
    .filter(
      (part): part is Extract<MessagePart, { type: "text" }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("")
    .trim();
}

export const Message = React.memo(function Message({
  message,
  isLast,
  branchState,
}: MessageProps) {
  if (message.role === "user") {
    const text = getTextContent(message.parts);

    return (
      <div className="flex justify-end">
        <div className="max-w-[85%]">
          <div className="rounded-md bg-accent/80 px-4 py-2.5">
            <p className="whitespace-pre-wrap break-words text-foreground">
              {text}
            </p>
          </div>
          {message.mode === "search" && (
            <div className="mt-2 flex justify-end">
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                <Icon icon="solar:magnifer-linear" className="h-3 w-3" />
                Search
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    const textContent = getTextContent(message.parts);
    const sourceParts = message.parts.filter(
      (part): part is Extract<MessagePart, { type: "source-url" }> =>
        part.type === "source-url",
    );

    return (
      <div className={cn("group/message", isLast && "min-h-[200px]")}>
        <div className="space-y-1">
          {message.parts.map((part, index) => {
            const key = `${message.id}-part-${index}`;

            if (part.type === "reasoning") {
              return (
                <ReasoningSection
                  key={key}
                  reasoning={part.reasoning}
                  details={part.details}
                  state={part.state}
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

          <SourcesSection parts={sourceParts} />

          <div className="mt-2 flex flex-wrap items-center gap-1 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/message:opacity-100">
            <ModelLabel model={message.model} />
            {textContent ? <CopyMessageButton text={textContent} /> : null}
            {branchState?.siblingCount && branchState.siblingCount > 1 ? (
              <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-1 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={branchState.onSelectPrevious}
                  disabled={!branchState.onSelectPrevious}
                >
                  <Icon
                    icon="solar:alt-arrow-left-linear"
                    className="h-3.5 w-3.5"
                  />
                </Button>
                <span className="px-1 text-xs text-muted-foreground">
                  {branchState.siblingIndex + 1} / {branchState.siblingCount}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={branchState.onSelectNext}
                  disabled={!branchState.onSelectNext}
                >
                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="h-3.5 w-3.5"
                  />
                </Button>
              </div>
            ) : null}
            <RetryWithModelButton
              onRetryWithModel={branchState?.onRetryWithModel}
              currentModel={message.model}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
});
