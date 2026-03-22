"use client";

import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useConvex, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormComponent } from "@/components/chat/form-component";
import Messages from "@/components/chat/messages";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isSupportedModel } from "@/lib/ai/model-routing";
import { chatHomePath, chatPath } from "@/lib/chat-routes";
import type { ChatMessage, ChatMode } from "@/lib/types";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const ROOT_BRANCH_KEY = "__root__";

interface ChatInterfaceProps {
  initialChatId?: string;
  initialMessages?: ChatMessage[];
  initialChatTitle?: string;
  initialHasMoreOlder?: boolean;
  initialNextCursor?: string | null;
}

interface PendingSubmission {
  chatId: string;
  text: string;
  mode: ChatMode;
  parentMessageId?: string;
}

function getBranchKey(parentMessageId?: string) {
  return parentMessageId ?? ROOT_BRANCH_KEY;
}

function toUIMessage(message: ChatMessage): UIMessage {
  return {
    id: message.id,
    role: message.role as "user" | "assistant",
    parts: message.parts.reduce<UIMessage["parts"]>((parts, part) => {
      if (part.type === "text") {
        parts.push({ type: "text" as const, text: part.text });
        return parts;
      }
      if (part.type === "reasoning") {
        parts.push({ type: "reasoning" as const, text: part.reasoning });
        return parts;
      }
      if (part.type === "source-url") {
        parts.push({
          type: "source-url" as const,
          sourceId: part.sourceId,
          url: part.url,
          title: part.title,
        });
      }
      return parts;
    }, []),
  };
}

function fromStoredMessage(message: {
  _id: string;
  parentMessageId?: string;
  role: "user" | "assistant" | "system";
  mode?: ChatMode;
  parts: ChatMessage["parts"];
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  completionTime?: number;
  createdAt?: number;
}): ChatMessage {
  return {
    id: message._id,
    parentMessageId: message.parentMessageId,
    role: message.role,
    mode: message.mode,
    parts: message.parts,
    model: message.model,
    inputTokens: message.inputTokens,
    outputTokens: message.outputTokens,
    totalTokens: message.totalTokens,
    completionTime: message.completionTime,
    createdAt: message.createdAt,
  };
}

function mergeUniqueMessages(messages: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>();
  for (const message of messages) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort(
    (left, right) => (left.createdAt ?? 0) - (right.createdAt ?? 0),
  );
}

function buildChildrenByParent(messages: ChatMessage[]) {
  const childrenByParent = new Map<string, ChatMessage[]>();

  for (const message of messages) {
    const key = getBranchKey(message.parentMessageId);
    const currentChildren = childrenByParent.get(key) ?? [];
    currentChildren.push(message);
    childrenByParent.set(key, currentChildren);
  }

  for (const [key, children] of childrenByParent.entries()) {
    childrenByParent.set(
      key,
      [...children].sort(
        (left, right) => (left.createdAt ?? 0) - (right.createdAt ?? 0),
      ),
    );
  }

  return childrenByParent;
}

function buildVisiblePath(
  childrenByParent: Map<string, ChatMessage[]>,
  selectedChildByParentId: Record<string, string>,
) {
  const path: ChatMessage[] = [];
  let branchKey = ROOT_BRANCH_KEY;

  while (true) {
    const children = childrenByParent.get(branchKey);
    if (!children || children.length === 0) break;

    const selectedChild =
      children.find(
        (child) => child.id === selectedChildByParentId[branchKey],
      ) ?? children[children.length - 1];

    path.push(selectedChild);
    branchKey = selectedChild.id;
  }

  return path;
}

function toDisplayMessage(
  message: UIMessage,
  options: {
    model?: string;
    mode?: ChatMode;
  } = {},
): ChatMessage {
  const parts = message.parts
    .map((part) => {
      if (part.type === "text") {
        return { type: "text" as const, text: part.text };
      }
      if (part.type === "reasoning") {
        return {
          type: "reasoning" as const,
          reasoning: part.text,
          state: (part as { state?: "streaming" | "done" }).state,
          details: undefined,
        };
      }
      if (part.type === "source-url") {
        return {
          type: "source-url" as const,
          sourceId: part.sourceId,
          url: part.url,
          title: part.title,
          providerMetadata: part.providerMetadata,
        };
      }
      return null;
    })
    .filter((part): part is NonNullable<typeof part> => part !== null);

  return {
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    mode: options.mode,
    parts,
    model: options.model,
  };
}

export function ChatInterface({
  initialChatId,
  initialMessages = [],
  initialChatTitle,
  initialHasMoreOlder = false,
  initialNextCursor = null,
}: ChatInterfaceProps) {
  const router = useRouter();
  const convex = useConvex();
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [selectedModel, setSelectedModel] = useLocalStorage(
    "selected-model",
    "onegpt-default",
  );
  const [input, setInput] = useState("");
  const [searchMode, setSearchMode] = useState<ChatMode>("chat");
  const [pendingSubmission, setPendingSubmission] =
    useState<PendingSubmission | null>(null);
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(initialHasMoreOlder);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [selectedChildByParentId, setSelectedChildByParentId] = useState<
    Record<string, string>
  >({});
  const [pendingFocusParentId, setPendingFocusParentId] = useState<
    string | undefined
  >();
  const [activeRequestMode, setActiveRequestMode] = useState<ChatMode | null>(
    null,
  );

  const createChat = useMutation(api.chats.createChat);

  const bootstrap = useQuery(
    api.chats.getChatBootstrap,
    chatId
      ? {
          chatId: chatId as Id<"chats">,
          paginationOpts: { cursor: null, numItems: 50 },
        }
      : "skip",
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest({ body, messages, trigger, messageId }) {
          return {
            body: {
              ...body,
              messages,
              trigger,
              messageId,
            },
          };
        },
      }),
    [],
  );

  const authoritativeMessages = useMemo(() => {
    const queriedMessages =
      bootstrap?.messages.map((message) =>
        fromStoredMessage({
          ...message,
          parts: message.parts as ChatMessage["parts"],
        }),
      ) ?? initialMessages;

    return mergeUniqueMessages([...olderMessages, ...queriedMessages]);
  }, [bootstrap?.messages, initialMessages, olderMessages]);

  const childrenByParent = useMemo(
    () => buildChildrenByParent(authoritativeMessages),
    [authoritativeMessages],
  );

  const visibleStoredMessages = useMemo(
    () => buildVisiblePath(childrenByParent, selectedChildByParentId),
    [childrenByParent, selectedChildByParentId],
  );

  const visibleStoredUiMessages = useMemo(
    () => visibleStoredMessages.map(toUIMessage),
    [visibleStoredMessages],
  );
  const activeBranchId = useMemo(
    () =>
      `${chatId ?? "new-chat"}:${visibleStoredMessages.at(-1)?.id ?? "root"}`,
    [chatId, visibleStoredMessages],
  );

  const assistantModelById = useMemo(() => {
    const modelsById = new Map<string, string>();
    for (const message of authoritativeMessages) {
      if (message.model) {
        modelsById.set(message.id, message.model);
      }
    }
    return modelsById;
  }, [authoritativeMessages]);

  const modeById = useMemo(() => {
    const modesById = new Map<string, ChatMode>();
    for (const message of authoritativeMessages) {
      if (message.mode) {
        modesById.set(message.id, message.mode);
      }
    }
    return modesById;
  }, [authoritativeMessages]);

  const {
    messages: streamingMessages,
    sendMessage,
    regenerate,
    status,
    stop,
  } = useChat({
    id: activeBranchId,
    messages: visibleStoredUiMessages,
    transport,
    experimental_throttle: 100,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    setChatId(initialChatId);
    setInput("");
    setSearchMode("chat");
    setPendingSubmission(null);
    setOlderMessages([]);
    setHasMoreOlder(initialHasMoreOlder);
    setNextCursor(initialNextCursor);
    setSelectedChildByParentId({});
    setPendingFocusParentId(undefined);
    setActiveRequestMode(null);
  }, [initialChatId, initialHasMoreOlder, initialNextCursor]);

  useEffect(() => {
    if (!bootstrap || olderMessages.length > 0) return;
    setHasMoreOlder(bootstrap.hasMoreOlder);
    setNextCursor(bootstrap.nextCursor);
  }, [bootstrap, olderMessages.length]);

  useEffect(() => {
    if (!initialChatId || chatId !== initialChatId || bootstrap !== null)
      return;
    router.replace(chatHomePath);
  }, [bootstrap, chatId, initialChatId, router]);

  useEffect(() => {
    if (isSupportedModel(selectedModel)) return;
    setSelectedModel("onegpt-default");
  }, [selectedModel, setSelectedModel]);

  useEffect(() => {
    setSelectedChildByParentId((current) => {
      let changed = false;
      const next = { ...current };

      for (const [branchKey, children] of childrenByParent.entries()) {
        const selectedChildId = next[branchKey];
        const selectedChildExists = children.some(
          (child) => child.id === selectedChildId,
        );

        if (!selectedChildExists) {
          next[branchKey] = children[children.length - 1].id;
          changed = true;
        }
      }

      if (pendingFocusParentId) {
        const branchKey = getBranchKey(pendingFocusParentId);
        const branchChildren = childrenByParent.get(branchKey);
        if (branchChildren && branchChildren.length > 0) {
          const newestChild = branchChildren[branchChildren.length - 1];
          if (next[branchKey] !== newestChild.id) {
            next[branchKey] = newestChild.id;
            changed = true;
          }
        }
      }

      return changed ? next : current;
    });
  }, [childrenByParent, pendingFocusParentId]);

  useEffect(() => {
    if (!pendingFocusParentId) return;

    const branchKey = getBranchKey(pendingFocusParentId);
    if (childrenByParent.get(branchKey)?.length) {
      setPendingFocusParentId(undefined);
    }
  }, [childrenByParent, pendingFocusParentId]);

  useEffect(() => {
    if (status === "ready") {
      setActiveRequestMode(null);
    }
  }, [status]);

  useEffect(() => {
    if (!pendingSubmission || chatId !== pendingSubmission.chatId) return;

    const branchKey = getBranchKey(pendingSubmission.parentMessageId);
    setPendingFocusParentId(
      branchKey === ROOT_BRANCH_KEY
        ? undefined
        : pendingSubmission.parentMessageId,
    );
    setActiveRequestMode(pendingSubmission.mode);

    void sendMessage(
      { text: pendingSubmission.text },
      {
        body: {
          chatId: pendingSubmission.chatId,
          model: selectedModel,
          mode: pendingSubmission.mode,
          parentMessageId: pendingSubmission.parentMessageId,
        },
      },
    );
    setPendingSubmission(null);
  }, [chatId, pendingSubmission, selectedModel, sendMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    const lastVisibleMessage =
      visibleStoredMessages[visibleStoredMessages.length - 1];
    const parentMessageId =
      lastVisibleMessage?.role === "assistant"
        ? lastVisibleMessage.id
        : undefined;

    let nextChatId = chatId;
    if (!nextChatId) {
      nextChatId = await createChat({ title: "New Chat" });
      setChatId(nextChatId);
      window.history.replaceState(null, "", chatPath(nextChatId));
      setPendingSubmission({
        chatId: nextChatId,
        text: messageText,
        mode: searchMode,
        parentMessageId,
      });
    } else {
      setPendingFocusParentId(parentMessageId);
      setActiveRequestMode(searchMode);
      void sendMessage(
        { text: messageText },
        {
          body: {
            chatId: nextChatId,
            model: selectedModel,
            mode: searchMode,
            parentMessageId,
          },
        },
      );
    }

    setInput("");
    setSearchMode("chat");
  };

  const handleRetry = useCallback(
    (message: ChatMessage, model: string) => {
      if (!chatId || !message.parentMessageId || isLoading) return;

      const parentUserMessage = authoritativeMessages.find(
        (candidate) => candidate.id === message.parentMessageId,
      );
      const retryMode = parentUserMessage?.mode ?? "chat";

      setPendingFocusParentId(message.parentMessageId);
      setActiveRequestMode(retryMode);
      void regenerate({
        messageId: message.id,
        body: {
          chatId,
          model,
          mode: retryMode,
          parentMessageId: message.parentMessageId,
        },
      });
    },
    [authoritativeMessages, chatId, isLoading, regenerate],
  );

  const handleLoadOlder = useCallback(async () => {
    if (!chatId || !nextCursor || isLoadingOlder) return;

    setIsLoadingOlder(true);
    try {
      const olderPage = await convex.query(api.messages.getOlderMessages, {
        chatId: chatId as Id<"chats">,
        paginationOpts: { cursor: nextCursor, numItems: 50 },
      });
      if (!olderPage) return;

      setOlderMessages((current) =>
        mergeUniqueMessages([
          ...olderPage.messages.map((message) =>
            fromStoredMessage({
              ...message,
              parts: message.parts as ChatMessage["parts"],
            }),
          ),
          ...current,
        ]),
      );
      setHasMoreOlder(olderPage.hasMoreOlder);
      setNextCursor(olderPage.nextCursor);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [chatId, convex, isLoadingOlder, nextCursor]);

  const displayedStreamingMessages = useMemo(() => {
    const lastStreamingUser = [...streamingMessages]
      .reverse()
      .find((message) => message.role === "user");

    return streamingMessages.map((message) =>
      toDisplayMessage(message, {
        model:
          message.role === "assistant"
            ? (assistantModelById.get(message.id) ?? selectedModel)
            : undefined,
        mode:
          message.role === "user"
            ? (modeById.get(message.id) ??
              (message.id === lastStreamingUser?.id
                ? (activeRequestMode ?? undefined)
                : undefined))
            : undefined,
      }),
    );
  }, [
    activeRequestMode,
    assistantModelById,
    modeById,
    selectedModel,
    streamingMessages,
  ]);

  const shouldUseStreamingMessages =
    isLoading || streamingMessages.length > visibleStoredUiMessages.length;
  const displayMessages = shouldUseStreamingMessages
    ? displayedStreamingMessages
    : visibleStoredMessages;

  const getAssistantBranchState = useCallback(
    (message: ChatMessage) => {
      const branchKey = getBranchKey(message.parentMessageId);
      const siblings = (childrenByParent.get(branchKey) ?? []).filter(
        (candidate) => candidate.role === "assistant",
      );

      const siblingIndex = siblings.findIndex(
        (candidate) => candidate.id === message.id,
      );
      if (siblingIndex === -1) return null;

      return {
        siblingIndex,
        siblingCount: siblings.length,
        onSelectPrevious:
          siblingIndex > 0
            ? () =>
                setSelectedChildByParentId((current) => ({
                  ...current,
                  [branchKey]: siblings[siblingIndex - 1].id,
                }))
            : undefined,
        onSelectNext:
          siblingIndex < siblings.length - 1
            ? () =>
                setSelectedChildByParentId((current) => ({
                  ...current,
                  [branchKey]: siblings[siblingIndex + 1].id,
                }))
            : undefined,
        onRetryWithModel: isLoading
          ? undefined
          : (model: string) => handleRetry(message, model),
      };
    },
    [childrenByParent, handleRetry, isLoading],
  );

  const hasMessages = displayMessages.length > 0;
  const displayTitle = bootstrap?.chat.title ?? initialChatTitle;
  const isBootstrappingExistingChat =
    Boolean(chatId) && bootstrap === undefined && initialMessages.length === 0;

  if (isBootstrappingExistingChat) {
    return (
      <div className="relative flex h-dvh flex-col">
        <div className="flex items-center gap-2 p-2">
          <SidebarTrigger className="text-muted-foreground" />
          <Skeleton className="h-5 w-32" />
        </div>

        <div className="flex flex-1 flex-col gap-4 px-4 py-6">
          <Skeleton className="h-16 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-20 w-3/4 rounded-2xl" />
          <Skeleton className="h-24 w-1/2 rounded-2xl" />
          <div className="mt-auto py-3">
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh flex-col">
      <div className="flex items-center gap-2 p-2">
        <SidebarTrigger className="text-muted-foreground" />
        {displayTitle && displayTitle !== "New Chat" && (
          <h2 className="truncate text-sm font-medium text-foreground">
            {displayTitle}
          </h2>
        )}
      </div>

      {hasMessages ? (
        <>
          <Messages
            messages={displayMessages}
            isLoading={isLoading}
            hasMoreOlder={hasMoreOlder}
            isLoadingOlder={isLoadingOlder}
            onLoadOlder={handleLoadOlder}
            getAssistantBranchState={getAssistantBranchState}
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
              searchMode={searchMode}
              onSearchModeChange={setSearchMode}
              attachmentsEnabled={false}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/Black.svg"
              alt="OneGPT"
              width={32}
              height={32}
              className="size-8 logo-dark"
            />
            <Image
              src="/white.svg"
              alt="OneGPT"
              width={32}
              height={32}
              className="size-8 hidden logo-light"
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
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            attachmentsEnabled={false}
          />

          <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
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
