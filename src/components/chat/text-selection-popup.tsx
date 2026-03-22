"use client";

import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PopupPosition {
  x: number;
  y: number;
  text: string;
}

interface TextSelectionPopupProps {
  children: React.ReactNode;
  onQuote?: (text: string) => void;
  className?: string;
}

export function TextSelectionPopup({
  children,
  onQuote,
  className,
}: TextSelectionPopupProps) {
  const [popup, setPopup] = useState<PopupPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const closePopup = () => {
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  const handlePointerUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setPopup(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      setPopup(null);
      return;
    }

    if (
      containerRef.current &&
      !containerRef.current.contains(range.commonAncestorContainer)
    ) {
      setPopup(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPopup({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 8,
        text,
      });
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (popupRef.current?.contains(event.target as Node)) return;
    setPopup(null);
  };

  useEffect(() => {
    const dismiss = () => setPopup(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
    >
      {children}

      {popup && (
        <div
          ref={popupRef}
          className="absolute z-50 rounded-lg border border-border bg-popover p-1 shadow-lg"
          style={{
            left: popup.x,
            top: popup.y,
            transform: "translateX(-50%) translateY(-100%)",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(popup.text);
                toast.success("Copied to clipboard");
                closePopup();
              }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-popover-foreground transition-colors hover:bg-muted"
            >
              <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
              Copy
            </button>
            {onQuote && (
              <button
                type="button"
                onClick={() => {
                  onQuote(popup.text);
                  closePopup();
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-popover-foreground transition-colors hover:bg-muted"
              >
                <Icon
                  icon="solar:chat-square-like-linear"
                  className="h-3.5 w-3.5"
                />
                Quote
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
