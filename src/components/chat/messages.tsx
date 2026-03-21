"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Message } from "@/components/chat/message";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface MessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  suggestedQuestions?: string[];
  onSuggestedQuestionClick?: (question: string) => void;
}

const Messages: React.FC<MessagesProps> = ({
  messages,
  isLoading,
  suggestedQuestions = [],
  onSuggestedQuestionClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      if (message.role === "user") return true;
      if (message.role === "assistant") {
        return message.parts && message.parts.length > 0;
      }
      return false;
    });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {filteredMessages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLast={index === filteredMessages.length - 1}
          />
        ))}

        {isLoading && filteredMessages.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="animate-bounce [animation-delay:-0.3s]">·</span>
              <span className="animate-bounce [animation-delay:-0.15s]">·</span>
              <span className="animate-bounce">·</span>
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        {suggestedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-1.5 px-3 rounded-full"
                onClick={() => onSuggestedQuestionClick?.(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        )}

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
