"use client";

import { Icon } from "@iconify/react";
import type { FileUIPart } from "ai";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ModelSelector } from "@/components/chat/model-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { models } from "@/constant/ai-model";
import {
  ACCEPTED_TYPES,
  filesToFileUIParts,
  validateFiles,
} from "@/lib/attachments";
import type { ChatMode } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  searchMode: ChatMode;
  onSearchModeChange: (mode: ChatMode) => void;
  files?: FileUIPart[];
  onFilesChange?: (files: FileUIPart[]) => void;
  attachmentsEnabled?: boolean;
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

const estimateDataUrlSize = (url: string) => Math.ceil((url.length * 3) / 4);

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ---------------------------------------------------------------------------
// Attachment preview chip
// ---------------------------------------------------------------------------

function AttachmentPreview({
  file,
  onRemove,
}: {
  file: FileUIPart;
  onRemove: () => void;
}) {
  const isImage = file.mediaType?.startsWith("image/");

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
      {isImage && file.url ? (
        // biome-ignore lint/performance/noImgElement: data URLs from file selection are rendered directly.
        <img
          src={file.url}
          alt={file.filename ?? "attachment"}
          className="size-8 rounded object-cover"
        />
      ) : (
        <div className="flex items-center justify-center size-8 rounded bg-muted">
          <Icon
            icon="solar:file-text-linear"
            className="size-4 text-muted-foreground"
          />
        </div>
      )}

      {/* File info */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium truncate max-w-[120px]">
          {truncateFilename(file.filename ?? "unnamed")}
        </span>
        {file.url && (
          <span className="text-[10px] text-muted-foreground">
            {formatFileSize(estimateDataUrlSize(file.url))}
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
  searchMode,
  onSearchModeChange,
  files = [],
  onFilesChange,
  attachmentsEnabled = true,
}: FormComponentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Model info for the inline trigger
  const currentModel = models.find((m) => m.value === selectedModel);
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
  }, [resizeTextarea]);

  // ------ Handlers ------
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [setInput],
  );

  const canSubmit = (input.trim().length > 0 || files.length > 0) && !isLoading;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        if (canSubmit) {
          onSubmit(e as unknown as React.FormEvent);
        }
      }
    },
    [canSubmit, onSubmit],
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

  // ------ File handling ------
  const addFiles = useCallback(
    async (rawFiles: File[]) => {
      if (!onFilesChange) return;
      const { valid, errors } = validateFiles(rawFiles, files);
      for (const error of errors) toast.error(error);
      if (valid.length === 0) return;

      const newParts = await filesToFileUIParts(valid);
      onFilesChange([...files, ...newParts]);
    },
    [files, onFilesChange],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (!selected) return;
      await addFiles(Array.from(selected));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [addFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      if (!onFilesChange) return;
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  // ------ Paste handler (Ctrl+V) ------
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!attachmentsEnabled || !onFilesChange) return;

      const pastedFiles: File[] = [];
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length === 0) return;
      e.preventDefault();
      await addFiles(pastedFiles);
    },
    [attachmentsEnabled, onFilesChange, addFiles],
  );

  // ------ Drag and drop ------
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!attachmentsEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    [attachmentsEnabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only leave if we're actually leaving the container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (!attachmentsEnabled || !onFilesChange) return;

      const droppedFiles: File[] = [];
      for (const item of e.dataTransfer.files) {
        droppedFiles.push(item);
      }
      if (droppedFiles.length === 0) return;
      await addFiles(droppedFiles);
    },
    [attachmentsEnabled, onFilesChange, addFiles],
  );

  // ------ Render ------
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <TooltipProvider>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop zone needs drag events */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative w-full flex flex-col gap-1 rounded-xl transition-all duration-300",
            attachmentsEnabled && files.length > 0
              ? "bg-primary/5 border border-ring/20 backdrop-blur-md p-1"
              : "bg-transparent",
            isDragging && "ring-2 ring-primary/50 bg-primary/5",
          )}
        >
          {attachmentsEnabled && (
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              multiple
              accept={ACCEPTED_TYPES}
              onChange={handleFileSelect}
              tabIndex={-1}
            />
          )}

          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-primary/5 border-2 border-dashed border-primary/40">
              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <Icon icon="solar:upload-linear" className="size-5" />
                Drop files here
              </div>
            </div>
          )}

          {/* Attachment previews */}
          <AnimatePresence>
            {attachmentsEnabled && files.length > 0 && (
              <div className="flex flex-row gap-2 overflow-x-auto py-2 max-h-28 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {files.map((file, index) => (
                  <AttachmentPreview
                    key={`${file.filename}-${index}`}
                    file={file}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Form container */}
          <div>
            <div
              className={cn(
                "rounded-xl bg-muted",
                "transition-colors duration-200",
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
                onPaste={handlePaste}
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
                {/* Left side: attach */}
                <div className="flex items-center gap-1.5">
                  {attachmentsEnabled && (
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
                          <Icon icon="tabler:plus" className="size-4" />
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
                  )}
                </div>

                {/* Right side: search + model selector + submit/stop */}
                <div className="flex items-center shrink-0 gap-1.5">
                  {/* Search toggle */}
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() =>
                          onSearchModeChange(
                            searchMode === "search" ? "chat" : "search",
                          )
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                          "border text-xs font-medium transition-all duration-200 cursor-pointer",
                          searchMode === "search"
                            ? "border-border bg-foreground/10 text-foreground"
                            : "border-transparent bg-foreground/5 text-muted-foreground hover:border-border/50 hover:bg-foreground/10 hover:text-foreground",
                        )}
                      >
                        <Icon
                          icon={
                            searchMode === "search"
                              ? "solar:magnifer-bold"
                              : "solar:magnifer-linear"
                          }
                          className="size-3.5"
                        />
                        <span>Search</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {searchMode === "search" ? "Disable" : "Enable"} web
                        search
                      </p>
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
                      <span className="truncate max-w-[140px]">
                        {displayName}
                      </span>
                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        className="h-3 w-3 opacity-50"
                      />
                    </button>
                  </ModelSelector>

                  {/* Submit / Stop */}
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
                              <Icon
                                icon="solar:stop-linear"
                                className="size-3.5"
                              />
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
                              <Icon
                                icon="solar:arrow-up-linear"
                                className="size-4"
                              />
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
