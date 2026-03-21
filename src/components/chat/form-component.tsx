"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModelSelector } from "@/components/chat/model-selector";
import {
  models,
  getModelProvider,
  PROVIDERS,
  type ModelProvider,
} from "@/constant/ai-model";
import type { Attachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormComponentProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  onStop?: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const truncateFilename = (filename: string, maxLength = 20) => {
  if (filename.length <= maxLength) return filename;
  const extension = filename.split(".").pop();
  const name = filename.substring(0, maxLength - 4);
  return `${name}...${extension}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ---------------------------------------------------------------------------
// Provider icon (renders the provider logo next to the model badge)
// ---------------------------------------------------------------------------

function ProviderIcon({
  provider,
  size = 14,
  className,
}: {
  provider: ModelProvider;
  size?: number;
  className?: string;
}) {
  const props = {
    width: size,
    height: size,
    className: cn("shrink-0", className),
  };

  switch (provider) {
    case "openai":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.392.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      );
    case "anthropic":
      return (
        <svg
          {...props}
          viewBox="0 0 24 24"
          fill="currentColor"
          fillRule="evenodd"
        >
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      );
    case "google":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case "xai":
      return (
        <svg {...props} fill="currentColor" viewBox="0 0 841.89 595.28">
          <path d="m557.09 211.99 8.31 326.37h66.56l8.32-445.18zM640.28 56.91H538.72L379.35 284.53l50.78 72.52zM201.61 538.36h101.56l50.79-72.52-50.79-72.53zM201.61 211.99l228.52 326.37h101.56L303.17 211.99z" />
        </svg>
      );
    case "mistral":
      return (
        <svg {...props} viewBox="0 0 256 233" fill="currentColor">
          <path d="M186.18182 0h46.54545v46.54545h-46.54545z" />
          <path d="M209.45454 0h46.54545v46.54545h-46.54545z" />
          <path d="M0 0h46.54545v46.54545H0zM0 46.54545h46.54545V93.0909H0zM0 93.09091h46.54545v46.54545H0zM0 139.63636h46.54545v46.54545H0zM0 186.18182h46.54545v46.54545H0z" />
          <path d="M209.45454 186.18182h46.54545v46.54545h-46.54545z" />
        </svg>
      );
    case "deepseek":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588z" />
        </svg>
      );
    default:
      return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Attachment preview chip
// ---------------------------------------------------------------------------

function AttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: () => void;
}) {
  const isImage = attachment.contentType?.startsWith("image/");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative flex items-center group",
        "bg-background/90 backdrop-blur-sm",
        "border border-border/80",
        "rounded-lg p-2 pr-8 gap-2.5",
        "shrink-0",
        "hover:bg-background",
        "transition-all duration-200",
      )}
    >
      {/* Thumbnail / icon */}
      {isImage && attachment.url ? (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="size-8 rounded object-cover"
        />
      ) : (
        <div className="flex items-center justify-center size-8 rounded bg-muted">
          <Icon icon="solar:file-text-linear" className="size-4 text-muted-foreground" />
        </div>
      )}

      {/* File info */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium truncate max-w-[120px]">
          {truncateFilename(attachment.name)}
        </span>
        {attachment.size > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {formatFileSize(attachment.size)}
          </span>
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "absolute top-1 right-1",
          "flex items-center justify-center size-5 rounded-full",
          "bg-foreground/10 text-foreground/60",
          "opacity-0 group-hover:opacity-100",
          "hover:bg-foreground/20 hover:text-foreground",
          "transition-all duration-150",
        )}
        aria-label="Remove attachment"
      >
        <Icon icon="solar:close-circle-linear" className="size-3" />
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

export function FormComponent({
  input,
  setInput,
  onSubmit,
  isLoading = false,
  onStop,
  selectedModel,
  onModelChange,
  attachments = [],
  onAttachmentsChange,
}: FormComponentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Model info for the inline trigger
  const currentModel = models.find((m) => m.value === selectedModel);
  const provider = getModelProvider(selectedModel);
  const displayName = currentModel?.label ?? selectedModel;

  // ------ Auto-resize textarea ------
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    const maxHeight = 300;
    const prevScroll = window.scrollY;

    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;

    if (scrollHeight > maxHeight) {
      el.style.height = `${maxHeight}px`;
      el.style.overflowY = "auto";
    } else {
      el.style.height = `${scrollHeight}px`;
      el.style.overflowY = "hidden";
    }

    window.scrollTo({ top: prevScroll });
  }, []);

  const resizeRafRef = useRef<number>(0);
  useEffect(() => {
    cancelAnimationFrame(resizeRafRef.current);
    resizeRafRef.current = requestAnimationFrame(resizeTextarea);
    return () => cancelAnimationFrame(resizeRafRef.current);
  }, [input, resizeTextarea]);

  // ------ Handlers ------
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [setInput],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        if (input.trim().length > 0 || attachments.length > 0) {
          onSubmit(e as unknown as React.FormEvent);
        }
      }
    },
    [input, attachments.length, onSubmit],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      const el = e.target;
      if (
        el.value.length > 0 &&
        el.selectionStart === 0 &&
        el.selectionEnd === 0
      ) {
        el.setSelectionRange(el.value.length, el.value.length);
      }
    },
    [],
  );

  // ------ File attachment (visual only — no upload logic) ------
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !onAttachmentsChange) return;

      const newAttachments: Attachment[] = Array.from(files).map((file) => ({
        name: file.name,
        contentType: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
      }));

      onAttachmentsChange([...attachments, ...newAttachments]);

      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [attachments, onAttachmentsChange],
  );

  const removeAttachment = useCallback(
    (index: number) => {
      if (!onAttachmentsChange) return;
      const next = attachments.filter((_, i) => i !== index);
      onAttachmentsChange(next);
    },
    [attachments, onAttachmentsChange],
  );

  const canSubmit =
    (input.trim().length > 0 || attachments.length > 0) && !isLoading;

  // ------ Render ------
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <TooltipProvider>
        <div
          className={cn(
            "relative w-full flex flex-col gap-1 rounded-xl transition-all duration-300",
            attachments.length > 0
              ? "bg-primary/5 border border-ring/20 backdrop-blur-md p-1"
              : "bg-transparent",
          )}
        >
          {/* Hidden file input */}
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            multiple
            onChange={handleFileSelect}
            tabIndex={-1}
          />

          {/* Attachment previews */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto py-2 max-h-28 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {attachments.map((attachment, index) => (
                  <AttachmentPreview
                    key={`${attachment.name}-${index}`}
                    attachment={attachment}
                    onRemove={() => removeAttachment(index)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Form container */}
          <div>
            <div
              className={cn(
                "rounded-xl bg-muted border border-ring/10",
                "focus-within:border-ring/5 transition-colors duration-200",
              )}
            >
              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                placeholder="Ask anything..."
                value={input}
                onChange={handleInput}
                onFocus={handleFocus}
                onInput={resizeTextarea}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-xl rounded-b-none text-[16px]",
                  "leading-normal",
                  "border-0",
                  "text-foreground",
                  "focus:ring-0 focus-visible:ring-0",
                  "min-h-0",
                  "px-4 py-3.5",
                  "bg-muted",
                  "shadow-none",
                  "resize-none",
                  isLoading && "text-muted-foreground cursor-wait",
                )}
                style={{
                  minHeight: undefined,
                  resize: "none",
                }}
                rows={1}
                autoFocus
              />

              {/* Bottom toolbar row */}
              <div
                className={cn(
                  "flex justify-between items-center rounded-t-none rounded-b-xl",
                  "bg-muted",
                  "border-0",
                  "px-2.5 py-2 gap-2",
                  "transition-all duration-200",
                )}
              >
                {/* Left side: attach + model badge */}
                <div className="flex items-center gap-1.5">
                  {/* Attach button */}
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center justify-center size-8 rounded-full",
                          "text-muted-foreground hover:text-foreground",
                          "bg-transparent hover:bg-foreground/5",
                          "border border-transparent hover:border-border/50",
                          "transition-all duration-200",
                        )}
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Attach files"
                      >
                        <Icon icon="solar:paperclip-2-linear" className="size-[15px]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      sideOffset={6}
                      className="border-0 backdrop-blur-sm py-2 px-3"
                    >
                      <span className="font-medium text-[11px]">
                        Attach files
                      </span>
                    </TooltipContent>
                  </Tooltip>

                  {/* Model selector */}
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "rounded-full px-2.5 py-1",
                        "text-xs font-medium",
                        "bg-foreground/5 hover:bg-foreground/10",
                        "text-muted-foreground hover:text-foreground",
                        "border border-transparent hover:border-border/50",
                        "transition-all duration-200",
                      )}
                    >
                      {provider && (
                        <ProviderIcon provider={provider} size={12} />
                      )}
                      <span className="truncate max-w-[140px]">
                        {displayName}
                      </span>
                      <Icon icon="solar:alt-arrow-down-linear" className="h-3 w-3 opacity-50" />
                    </button>
                  </ModelSelector>
                </div>

                {/* Right side: submit / stop */}
                <div className="flex items-center shrink-0 gap-1.5">

                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="stop"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="rounded-full size-8 transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onStop?.();
                              }}
                            >
                              <Icon icon="solar:stop-linear" className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            sideOffset={6}
                            className="border-0 backdrop-blur-sm py-2 px-3"
                          >
                            <span className="font-medium text-[11px]">
                              Stop generation
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="rounded-full size-8 transition-colors"
                              disabled={!canSubmit}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSubmit(e as unknown as React.FormEvent);
                              }}
                            >
                              <Icon icon="lucide:arrow-up" className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            sideOffset={6}
                            className="border-0 backdrop-blur-sm py-2 px-3"
                          >
                            <span className="font-medium text-[11px]">
                              Send message
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
