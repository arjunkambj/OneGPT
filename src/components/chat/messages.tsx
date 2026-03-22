"use client";

import { Icon } from "@iconify/react";
import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type AssistantBranchState, Message } from "@/components/chat/message";
import { SearchProgressIndicator } from "@/components/chat/search-progress";
import { Button } from "@/components/ui/button";
import type { ChatMessage, SearchStatusData } from "@/lib/types";

interface MessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  searchStatus?: SearchStatusData | null;
  hasMoreOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => Promise<void>;
  getAssistantBranchState?: (
    message: ChatMessage,
  ) => AssistantBranchState | null;
  onQuote?: (text: string) => void;
}

const Messages: React.FC<MessagesProps> = ({
  messages,
  isLoading,
  searchStatus,
  hasMoreOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  getAssistantBranchState,
  onQuote,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prependScrollHeightRef = useRef<number | null>(null);
  const previousMessageCountRef = useRef(messages.length);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const filteredMessages = useMemo(
    () =>
      messages.filter((message) => {
        if (message.role === "user") return true;
        if (message.role === "assistant") {
          return message.parts && message.parts.length > 0;
        }
        return false;
      }),
    [messages],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLoadOlder = async () => {
    if (!onLoadOlder || isLoadingOlder) return;

    const container = containerRef.current;
    if (container) {
      prependScrollHeightRef.current = container.scrollHeight;
    }

    await onLoadOlder();
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (prependScrollHeightRef.current !== null) {
      const delta = container.scrollHeight - prependScrollHeightRef.current;
      container.scrollTop += delta;
      prependScrollHeightRef.current = null;
      previousMessageCountRef.current = filteredMessages.length;
      return;
    }

    if (filteredMessages.length !== previousMessageCountRef.current) {
      scrollToBottom();
      previousMessageCountRef.current = filteredMessages.length;
    }
  }, [filteredMessages.length, scrollToBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-32 space-y-6">
        {hasMoreOlder && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLoadOlder()}
              disabled={isLoadingOlder}
            >
              {isLoadingOlder ? "Loading..." : "Load older messages"}
            </Button>
          </div>
        )}

        {filteredMessages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLast={index === filteredMessages.length - 1}
            branchState={
              message.role === "assistant"
                ? (getAssistantBranchState?.(message) ?? null)
                : null
            }
            onQuote={message.role === "assistant" ? onQuote : undefined}
          />
        ))}

        {isLoading &&
          filteredMessages.length > 0 &&
          (() => {
            const last = filteredMessages[filteredMessages.length - 1];
            if (last?.role !== "assistant") return true;
            return !last.parts.some(
              (p) =>
                (p.type === "text" && p.text.trim()) || p.type === "reasoning",
            );
          })() &&
          (searchStatus ? (
            <SearchProgressIndicator status={searchStatus} />
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <span className="animate-bounce [animation-delay:-0.3s]">
                  ·
                </span>
                <span className="animate-bounce [animation-delay:-0.15s]">
                  ·
                </span>
                <span className="animate-bounce">·</span>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          ))}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-32 right-8 z-10 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <Icon icon="solar:arrow-down-linear" className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Messages;
