"use client";

import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMutation } from "convex/react";
import Image from "next/image";
import type React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { chatReducer, createInitialState } from "@/components/chat/chat-state";
import { FormComponent } from "@/components/chat/form-component";
import Messages from "@/components/chat/messages";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isSupportedModel } from "@/lib/ai/model-routing";
import type { ChatMessage } from "@/lib/types";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ChatInterfaceProps {
  initialChatId?: string;
  initialMessages?: ChatMessage[];
}

interface PendingSubmission {
  chatId: string;
  text: string;
}

export function ChatInterface({
  initialChatId,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [state, dispatch] = useReducer(chatReducer, createInitialState());
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const chatIdRef = useRef(chatId);
  const [selectedModel, setSelectedModel] = useLocalStorage(
    "selected-model",
    "onegpt-default",
  );
  const modelRef = useRef(selectedModel);
  const [input, setInput] = useState("");
  const [pendingSubmission, setPendingSubmission] =
    useState<PendingSubmission | null>(null);

  chatIdRef.current = chatId;
  modelRef.current = selectedModel;

  const createChat = useMutation(api.chats.createChat);
  const saveUserMessage = useMutation(api.messages.saveUserMessage);

  const convertedInitialMessages: UIMessage[] = useMemo(
    () =>
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: m.parts.map((p) => {
          if (p.type === "text") return { type: "text" as const, text: p.text };
          if (p.type === "reasoning")
            return { type: "reasoning" as const, text: p.reasoning };
          return { type: "text" as const, text: "" };
        }),
      })),
    [initialMessages],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          chatId: chatIdRef.current,
          model: modelRef.current,
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: chatId,
    messages: convertedInitialMessages,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    setChatId(initialChatId);
    setPendingSubmission(null);
    setInput("");
    dispatch({ type: "RESET_UI_STATE" });
  }, [initialChatId]);

  useEffect(() => {
    if (isSupportedModel(selectedModel)) return;
    setSelectedModel("onegpt-default");
  }, [selectedModel, setSelectedModel]);

  const persistUserMessage = useCallback(
    async (nextChatId: string, text: string) => {
      try {
        await saveUserMessage({
          chatId: nextChatId as Id<"chats">,
          parts: [{ type: "text", text }],
        });
      } catch (error) {
        console.error("Failed to save user message:", error);
      }
    },
    [saveUserMessage],
  );

  useEffect(() => {
    if (!pendingSubmission || chatId !== pendingSubmission.chatId) return;

    void persistUserMessage(pendingSubmission.chatId, pendingSubmission.text);
    void sendMessage({ text: pendingSubmission.text });
    setPendingSubmission(null);
  }, [chatId, pendingSubmission, persistUserMessage, sendMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = input.trim();
    if (!messageText) return;

    let currentChatId = chatId;

    if (!currentChatId) {
      currentChatId = await createChat({ title: "New Chat" });
      setChatId(currentChatId);
      chatIdRef.current = currentChatId;
      window.history.replaceState(null, "", `/chat/${currentChatId}`);
      setPendingSubmission({ chatId: currentChatId, text: messageText });
    } else {
      void persistUserMessage(currentChatId, messageText);
      void sendMessage({ text: messageText });
    }

    dispatch({ type: "SET_HAS_SUBMITTED", payload: true });
    setInput("");
  };

  const displayMessages: ChatMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    parts: m.parts
      .map((p) => {
        if (p.type === "text") return { type: "text" as const, text: p.text };
        if (p.type === "reasoning")
          return {
            type: "reasoning" as const,
            reasoning: p.text,
            details: undefined,
          };
        return null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null),
    model: m.role === "assistant" ? selectedModel : undefined,
  }));

  const hasMessages = displayMessages.length > 0;

  return (
    <div className="relative flex flex-col h-dvh">
      <div className="absolute top-0 left-0 z-10 p-2">
        <SidebarTrigger className="text-muted-foreground" />
      </div>

      {hasMessages ? (
        <>
          <Messages
            messages={displayMessages}
            isLoading={isLoading}
            suggestedQuestions={state.suggestedQuestions}
            onSuggestedQuestionClick={(q) => {
              setInput(q);
            }}
          />

          <div className="px-4 py-3">
            <FormComponent
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onStop={stop}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              attachmentsEnabled={false}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/Black.svg"
              alt="OneGPT"
              width={32}
              height={32}
              className="size-8 dark:hidden"
            />
            <Image
              src="/white.svg"
              alt="OneGPT"
              width={32}
              height={32}
              className="size-8 hidden dark:block"
            />
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              OneGPT
            </h1>
          </div>

          <FormComponent
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={stop}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            attachmentsEnabled={false}
          />

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
