"use client";

import React, { useReducer, useState, useCallback } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Messages from "@/components/chat/messages";
import { FormComponent } from "@/components/chat/form-component";
import { chatReducer, createInitialState } from "@/components/chat/chat-state";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { ChatMessage } from "@/lib/types";

interface ChatInterfaceProps {
  initialChatId?: string;
  initialMessages?: ChatMessage[];
}

export function ChatInterface({
  initialChatId,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [state, dispatch] = useReducer(chatReducer, createInitialState());
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useLocalStorage(
    "selected-model",
    "scira-default",
  );
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: input }],
        attachments: state.attachments,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      dispatch({ type: "SET_HAS_SUBMITTED", payload: true });
      dispatch({ type: "SET_ATTACHMENTS", payload: [] });

      // Simulate assistant response for UI demo
      setIsLoading(true);
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [
            {
              type: "text",
              text:
                'This is a demo response. The chat backend is not yet connected. Your message was: "' +
                input +
                '"',
            },
          ],
          model: selectedModel,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    },
    [input, state.attachments, selectedModel],
  );

  const handleStop = useCallback(() => {
    setIsLoading(false);
  }, []);

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex flex-col h-dvh">
      {/* Minimal sidebar trigger */}
      <div className="absolute top-0 left-0 z-10 p-2">
        <SidebarTrigger className="text-muted-foreground" />
      </div>

      {hasMessages ? (
        <>
          {/* Messages */}
          <Messages
            messages={messages}
            isLoading={isLoading}
            suggestedQuestions={state.suggestedQuestions}
            onSuggestedQuestionClick={(q) => {
              setInput(q);
            }}
          />

          {/* Input at bottom */}
          <div className="px-4 py-3">
            <FormComponent
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onStop={handleStop}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              attachments={state.attachments}
              onAttachmentsChange={(attachments) =>
                dispatch({ type: "SET_ATTACHMENTS", payload: attachments })
              }
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/Black.svg" alt="OneGPT" className="size-8 dark:hidden" />
            <img src="/white.svg" alt="OneGPT" className="size-8 hidden dark:block" />
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              OneGPT
            </h1>
          </div>

          {/* Centered form */}
          <FormComponent
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={handleStop}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            attachments={state.attachments}
            onAttachmentsChange={(attachments) =>
              dispatch({ type: "SET_ATTACHMENTS", payload: attachments })
            }
          />

          {/* Quick action suggestions */}
          <div className="flex flex-wrap gap-2 mt-4 max-w-2xl justify-center">
            {[
              "Rewrite this",
              "Explain concept",
              "Summarize text",
              "Brainstorm ideas",
            ].map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
