"use client";

import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getModelConfig } from "@/constant/ai-model";
import type { ChatMessage, MessagePart } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Markdown } from "./markdown";
import { ModelSelector } from "./model-selector";
import { TextSelectionPopup } from "./text-selection-popup";

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
  onQuote?: (text: string) => void;
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
            !isThinking &&
              "cursor-pointer transition-colors hover:text-muted-foreground",
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

function ResponseInfoButton({
  message,
  className,
}: {
  message: ChatMessage;
  className?: string;
}) {
  const hasMetadata =
    message.model ||
    message.inputTokens ||
    message.outputTokens ||
    message.totalTokens ||
    message.completionTime;
  if (!hasMetadata) return null;

  const config = message.model ? getModelConfig(message.model) : undefined;
  const modelLabel = config?.label ?? message.model;
  const completionSeconds =
    message.completionTime != null
      ? (message.completionTime / 1000).toFixed(1)
      : null;
  const tokenTotal =
    (message.totalTokens ??
      (message.inputTokens ?? 0) + (message.outputTokens ?? 0)) ||
    null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground",
            className,
          )}
          aria-label="Response info"
        >
          <Icon icon="solar:info-circle-linear" className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" sideOffset={8} className="w-72">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon icon="solar:info-circle-linear" className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Response Info</h4>
          </div>

          {modelLabel && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Model</span>
              <Badge className="gap-1">
                <Icon icon="solar:cpu-bolt-linear" className="h-3 w-3" />
                {modelLabel}
              </Badge>
            </div>
          )}

          {completionSeconds && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Generation Time
              </span>
              <div className="flex items-center gap-1 text-xs">
                <Icon icon="solar:clock-circle-linear" className="h-3 w-3" />
                {completionSeconds}s
              </div>
            </div>
          )}

          {(message.inputTokens != null || message.outputTokens != null) && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Token Usage</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {message.inputTokens != null && (
                  <div className="flex items-center justify-between rounded-lg bg-muted px-2 py-1">
                    <span className="flex items-center gap-1">
                      <Icon
                        icon="solar:arrow-left-linear"
                        className="h-3 w-3"
                      />
                      Input
                    </span>
                    <span className="font-medium">
                      {message.inputTokens.toLocaleString()}
                    </span>
                  </div>
                )}
                {message.outputTokens != null && (
                  <div className="flex items-center justify-between rounded-lg bg-muted px-2 py-1">
                    <span className="flex items-center gap-1">
                      <Icon
                        icon="solar:arrow-right-linear"
                        className="h-3 w-3"
                      />
                      Output
                    </span>
                    <span className="font-medium">
                      {message.outputTokens.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              {tokenTotal != null && (
                <div className="flex items-center justify-between rounded-lg bg-accent px-2 py-1 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <Icon icon="solar:hashtag-linear" className="h-3 w-3" />
                    Total
                  </span>
                  <span className="font-semibold">
                    {tokenTotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
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

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFavicon(hostname: string) {
  return `/api/proxy-image?url=${encodeURIComponent(`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`)}`;
}

function SourcesSection({
  parts,
}: {
  parts: Extract<MessagePart, { type: "source-url" }>[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (parts.length === 0) return null;

  const uniqueSources = parts.reduce<
    Extract<MessagePart, { type: "source-url" }>[]
  >((acc, part) => {
    if (!acc.some((s) => s.url === part.url)) acc.push(part);
    return acc;
  }, []);

  return (
    <div className="my-1">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 py-1 text-muted-foreground/60 cursor-pointer transition-colors hover:text-muted-foreground"
      >
        <Icon
          icon={
            isExpanded
              ? "solar:alt-arrow-up-linear"
              : "solar:alt-arrow-down-linear"
          }
          className="h-3 w-3"
        />
        <Icon icon="solar:global-linear" className="h-3 w-3" />
        <span className="text-xs">
          {uniqueSources.length}{" "}
          {uniqueSources.length === 1 ? "Source" : "Sources"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 border-l-2 border-border/40 pl-3 ml-1 py-1">
              {uniqueSources.map((part, index) => {
                const hostname = getHostname(part.url);
                const displayTitle =
                  part.title?.trim() && part.title !== part.url
                    ? part.title
                    : hostname;

                return (
                  <a
                    key={`${part.sourceId}-${part.url}`}
                    href={part.url}
                    target="_blank"
                    rel="noreferrer"
                    title={displayTitle}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-card/30 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent/40 hover:border-border hover:text-foreground"
                  >
                    <span className="flex h-4 min-w-4 items-center justify-center rounded bg-muted text-[10px] font-medium tabular-nums">
                      {index + 1}
                    </span>
                    <img
                      src={getFavicon(hostname)}
                      alt=""
                      className="size-3 rounded shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                    <span className="max-w-[180px] truncate">{hostname}</span>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  onQuote,
}: MessageProps) {
  if (message.role === "user") {
    const text = getTextContent(message.parts);

    // Collect file parts from parts array
    const fileParts = message.parts.filter(
      (p): p is Extract<MessagePart, { type: "file" }> => p.type === "file",
    );
    // Also include stored attachments
    const attachmentImages = (message.attachments ?? []).filter(
      (a) =>
        a.mediaType?.startsWith("image/") ||
        a.contentType?.startsWith("image/"),
    );
    const attachmentFiles = (message.attachments ?? []).filter(
      (a) =>
        !a.mediaType?.startsWith("image/") &&
        !a.contentType?.startsWith("image/"),
    );

    const imageFileParts = fileParts.filter((fp) =>
      fp.mediaType.startsWith("image/"),
    );
    const nonImageFileParts = fileParts.filter(
      (fp) => !fp.mediaType.startsWith("image/"),
    );

    const hasImages = imageFileParts.length > 0 || attachmentImages.length > 0;
    const hasNonImageFiles =
      nonImageFileParts.length > 0 || attachmentFiles.length > 0;

    return (
      <div className="group/message flex justify-end">
        <div className="max-w-[85%]">
          {/* Image attachments */}
          {hasImages && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {imageFileParts.map((fp) => (
                // biome-ignore lint/performance/noImgElement: data URLs rendered directly
                <img
                  key={`file-${fp.filename ?? fp.url.slice(-20)}`}
                  src={fp.url}
                  alt={fp.filename ?? "uploaded image"}
                  className="max-h-48 max-w-full rounded-lg object-cover"
                />
              ))}
              {attachmentImages.map((att) => (
                // biome-ignore lint/performance/noImgElement: data URLs rendered directly
                <img
                  key={`att-${att.name}-${att.url.slice(-20)}`}
                  src={att.url}
                  alt={att.name}
                  className="max-h-48 max-w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* Non-image file chips */}
          {hasNonImageFiles && (
            <div className="flex flex-wrap gap-1.5 mb-2 justify-end">
              {nonImageFileParts.map((fp) => (
                <div
                  key={`nif-${fp.filename ?? fp.url.slice(-20)}`}
                  className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs"
                >
                  <Icon
                    icon="solar:file-text-linear"
                    className="size-3.5 text-muted-foreground"
                  />
                  <span className="truncate max-w-[150px]">
                    {fp.filename ?? "file"}
                  </span>
                </div>
              ))}
              {attachmentFiles.map((att) => (
                <div
                  key={`naf-${att.name}-${att.url.slice(-20)}`}
                  className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs"
                >
                  <Icon
                    icon="solar:file-text-linear"
                    className="size-3.5 text-muted-foreground"
                  />
                  <span className="truncate max-w-[150px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Text bubble */}
          {text && (
            <div className="rounded-md bg-accent/80 px-4 py-2.5">
              <p className="whitespace-pre-wrap break-words text-foreground">
                {text}
              </p>
            </div>
          )}
          {text && (
            <div className="mt-1 flex justify-end opacity-0 transition-opacity duration-200 group-hover/message:opacity-100">
              <CopyMessageButton text={text} />
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

    // Merge all reasoning parts into one to prevent duplicate reasoning sections
    const reasoningParts = message.parts.filter(
      (part): part is Extract<MessagePart, { type: "reasoning" }> =>
        part.type === "reasoning",
    );
    const mergedReasoning =
      reasoningParts.length > 0
        ? {
            reasoning: reasoningParts.map((p) => p.reasoning).join(""),
            details: reasoningParts[0]?.details,
            state: reasoningParts[reasoningParts.length - 1]?.state,
          }
        : null;

    return (
      <div className={cn("group/message", isLast && "min-h-[200px]")}>
        <TextSelectionPopup onQuote={onQuote}>
          <div className="space-y-1">
            {mergedReasoning && (
              <ReasoningSection
                key={`${message.id}-reasoning`}
                reasoning={mergedReasoning.reasoning}
                details={mergedReasoning.details}
                state={mergedReasoning.state}
              />
            )}

            {message.parts.map((part, index) => {
              const key = `${message.id}-part-${index}`;

              if (part.type === "reasoning") {
                return null; // Skip individual reasoning parts since we merged them
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
          </div>
        </TextSelectionPopup>

        <div className="mt-1 flex items-center">
          <div className="flex items-center -ml-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/message:opacity-100">
            {textContent ? <CopyMessageButton text={textContent} /> : null}
            {branchState?.siblingCount && branchState.siblingCount > 1 ? (
              <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-background/70 px-1 py-0.5">
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
                <span className="px-0.5 text-xs text-muted-foreground">
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
          <ResponseInfoButton message={message} className="ml-auto" />
        </div>
      </div>
    );
  }

  return null;
});
