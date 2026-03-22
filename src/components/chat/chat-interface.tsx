"use client";

import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart } from "ai";
import { useConvex, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FormComponent } from "@/components/chat/form-component";
import Messages from "@/components/chat/messages";
import { ShareDialog } from "@/components/chat/share-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isSupportedModel } from "@/lib/ai/model-routing";
import { chatHomePath, chatPath } from "@/lib/chat-routes";
import type {
  Attachment,
  ChatMessage,
  ChatMode,
  SearchStatusData,
} from "@/lib/types";
import { cn } from "@/lib/utils";
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
  files?: FileUIPart[];
  mode: ChatMode;
  parentMessageId?: string;
}

function getBranchKey(parentMessageId?: string) {
  return parentMessageId ?? ROOT_BRANCH_KEY;
}

function toUIMessage(message: ChatMessage): UIMessage {
  const parts = message.parts.reduce<UIMessage["parts"]>((acc, part) => {
    if (part.type === "text") {
      acc.push({ type: "text" as const, text: part.text });
    } else if (part.type === "reasoning") {
      acc.push({ type: "reasoning" as const, text: part.reasoning });
    } else if (part.type === "source-url") {
      acc.push({
        type: "source-url" as const,
        sourceId: part.sourceId,
        url: part.url,
        title: part.title,
      });
    } else if (part.type === "file") {
      acc.push({
        type: "file" as const,
        mediaType: part.mediaType,
        url: part.url,
        filename: part.filename,
      });
    }
    return acc;
  }, []);

  // Also include stored attachments as file parts
  if (message.attachments?.length) {
    for (const att of message.attachments) {
      parts.push({
        type: "file" as const,
        mediaType:
          att.mediaType ?? att.contentType ?? "application/octet-stream",
        url: att.url,
        filename: att.name,
      });
    }
  }

  return {
    id: message.id,
    role: message.role as "user" | "assistant",
    parts,
  };
}

function fromStoredMessage(message: {
  _id: string;
  parentMessageId?: string;
  role: "user" | "assistant" | "system";
  mode?: ChatMode;
  parts: ChatMessage["parts"];
  attachments?: Attachment[];
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
    attachments: message.attachments,
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
      if (part.type === "file") {
        return {
          type: "file" as const,
          mediaType: (part as FileUIPart).mediaType,
          url: (part as FileUIPart).url,
          filename: (part as FileUIPart).filename,
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

function getLeafMessageId(messages: UIMessage[] | ChatMessage[]) {
  return messages.at(-1)?.id;
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
  const { state: sidebarState } = useSidebar();
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
  const [pendingFiles, setPendingFiles] = useState<FileUIPart[]>([]);
  const lastAppliedStoredLeafIdRef = useRef<string | undefined>(
    getLeafMessageId(initialMessages),
  );

  const createChat = useMutation(api.chats.createChat);
  const updateTitleMutation = useMutation(api.chats.updateChatTitle);
  const deleteChatMutation = useMutation(api.chats.deleteChat);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const headerGroupRef = useRef<HTMLDivElement>(null);

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
  const chatSessionId = chatId ?? "new-chat";

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
    setMessages,
    sendMessage,
    regenerate,
    status,
    stop,
  } = useChat({
    id: chatSessionId,
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
    setPendingFiles([]);
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
    const storedLeafId = getLeafMessageId(visibleStoredUiMessages);
    if (storedLeafId === lastAppliedStoredLeafIdRef.current) return;

    if (status !== "ready") {
      stop();
    }

    setMessages(visibleStoredUiMessages);
    lastAppliedStoredLeafIdRef.current = storedLeafId;
  }, [setMessages, stop, status, visibleStoredUiMessages]);

  useEffect(() => {
    if (!pendingSubmission || chatId !== pendingSubmission.chatId) return;

    const branchKey = getBranchKey(pendingSubmission.parentMessageId);
    setPendingFocusParentId(
      branchKey === ROOT_BRANCH_KEY
        ? undefined
        : pendingSubmission.parentMessageId,
    );
    setActiveRequestMode(pendingSubmission.mode);

    const sendArgs: { text: string; files?: FileUIPart[] } = {
      text: pendingSubmission.text,
    };
    if (pendingSubmission.files?.length) {
      sendArgs.files = pendingSubmission.files;
    }
    void sendMessage(sendArgs, {
      body: {
        chatId: pendingSubmission.chatId,
        model: selectedModel,
        mode: pendingSubmission.mode,
        parentMessageId: pendingSubmission.parentMessageId,
      },
    });
    setPendingSubmission(null);
  }, [chatId, pendingSubmission, selectedModel, sendMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = input.trim();
    const hasFiles = pendingFiles.length > 0;
    if ((!messageText && !hasFiles) || isLoading) return;

    const lastVisibleMessage =
      visibleStoredMessages[visibleStoredMessages.length - 1];
    const parentMessageId =
      lastVisibleMessage?.role === "assistant"
        ? lastVisibleMessage.id
        : undefined;

    const filesToSend = hasFiles ? [...pendingFiles] : undefined;

    let nextChatId = chatId;
    if (!nextChatId) {
      nextChatId = await createChat({ title: "New Chat" });
      setChatId(nextChatId);
      window.history.replaceState(null, "", chatPath(nextChatId));
      setPendingSubmission({
        chatId: nextChatId,
        text: messageText,
        files: filesToSend,
        mode: searchMode,
        parentMessageId,
      });
    } else {
      setPendingFocusParentId(parentMessageId);
      setActiveRequestMode(searchMode);
      const sendArgs: { text: string; files?: FileUIPart[] } = {
        text: messageText,
      };
      if (filesToSend) sendArgs.files = filesToSend;
      void sendMessage(sendArgs, {
        body: {
          chatId: nextChatId,
          model: selectedModel,
          mode: searchMode,
          parentMessageId,
        },
      });
    }

    setInput("");
    setPendingFiles([]);
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

  const searchStatus = useMemo((): SearchStatusData | null => {
    if (!isLoading || activeRequestMode !== "search") return null;
    const lastMsg = streamingMessages[streamingMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return null;
    const dataPart = [...lastMsg.parts]
      .reverse()
      .find(
        (p) =>
          "type" in p && (p as { type: string }).type === "data-search-status",
      );
    if (!dataPart || !("data" in dataPart)) return null;
    return (dataPart as { data: SearchStatusData }).data;
  }, [isLoading, activeRequestMode, streamingMessages]);

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

  const handleQuote = useCallback((text: string) => {
    const quoted = `> ${text.split("\n").join("\n> ")}\n\n`;
    setInput((prev) => quoted + prev);
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[placeholder*="Ask"]',
      ) as HTMLTextAreaElement | null;
      textarea?.focus();
    }, 100);
  }, []);

  const hasMessages = displayMessages.length > 0;
  const displayTitle = bootstrap?.chat.title ?? initialChatTitle;
  const showHeaderDropdown =
    Boolean(chatId) && displayTitle && displayTitle !== "New Chat";
  const isBootstrappingExistingChat =
    Boolean(initialChatId) &&
    bootstrap === undefined &&
    initialMessages.length === 0;

  const handleStartEditTitle = () => {
    if (!chatId) return;
    setTitleInput(displayTitle || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveTitle = async () => {
    if (!chatId) return;
    const trimmed = titleInput.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }
    setIsSavingTitle(true);
    try {
      await updateTitleMutation({
        chatId: chatId as Id<"chats">,
        title: trimmed,
      });
      toast.success("Title updated");
      setIsEditDialogOpen(false);
    } catch {
      toast.error("Failed to update title");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!chatId) return;
    setIsDeleting(true);
    try {
      await deleteChatMutation({ chatId: chatId as Id<"chats"> });
      toast.success("Chat deleted");
      setIsDeleteOpen(false);
      router.push(chatHomePath);
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isBootstrappingExistingChat) {
    return (
      <div className="relative flex h-dvh flex-col">
        <div className="flex items-center gap-2 p-2">
          <SidebarTrigger className="text-muted-foreground" />
          <Skeleton className="h-5 w-32" />
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
            <Skeleton className="h-16 w-2/3 rounded-2xl" />
            <Skeleton className="ml-auto h-20 w-3/4 rounded-2xl" />
            <Skeleton className="h-24 w-1/2 rounded-2xl" />
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="mx-auto max-w-2xl">
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
        {showHeaderDropdown && (
          <div className="flex items-center gap-2 min-w-0">
            <DropdownMenu
              open={headerMenuOpen}
              onOpenChange={setHeaderMenuOpen}
            >
              <div ref={headerGroupRef} className="inline-flex">
                <ButtonGroup className="group gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-2 w-auto max-w-[250px] justify-start rounded-md hover:bg-accent group-hover:bg-accent",
                      headerMenuOpen && "bg-accent",
                    )}
                    onClick={handleStartEditTitle}
                    disabled={isLoading}
                  >
                    <span className="text-sm font-medium truncate whitespace-nowrap text-left">
                      {displayTitle}
                    </span>
                  </Button>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-md hover:bg-accent group-hover:bg-accent",
                        headerMenuOpen && "bg-accent",
                      )}
                      disabled={isLoading}
                    >
                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        className="size-4"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                </ButtonGroup>
              </div>
              <DropdownMenuContent
                side="bottom"
                align="start"
                className="rounded-md border bg-popover shadow-lg p-1"
              >
                <DropdownMenuItem
                  className="rounded-md"
                  onClick={handleStartEditTitle}
                  disabled={isLoading}
                >
                  <Icon
                    icon="solar:pen-new-square-linear"
                    className="size-4"
                  />
                  Edit title
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-md"
                  onClick={() => setIsShareOpen(true)}
                  disabled={isLoading}
                >
                  <Icon icon="solar:share-linear" className="size-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive! hover:text-destructive! rounded-md"
                  disabled={isLoading}
                >
                  <Icon
                    icon="solar:trash-bin-trash-linear"
                    className="size-4 text-destructive"
                  />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {hasMessages ? (
        <>
          <Messages
            messages={displayMessages}
            isLoading={isLoading}
            searchStatus={searchStatus}
            hasMoreOlder={hasMoreOlder}
            isLoadingOlder={isLoadingOlder}
            onLoadOlder={handleLoadOlder}
            getAssistantBranchState={getAssistantBranchState}
            onQuote={handleQuote}
          />

          <div
            className={`fixed bottom-0 z-20 pb-6 sm:pb-2.5 w-full max-w-[95%] sm:max-w-2xl mx-auto ${
              sidebarState === "expanded"
                ? "left-0 right-0 md:left-[calc(var(--sidebar-width))] md:right-0"
                : "left-0 right-0 md:left-[calc(var(--sidebar-width-icon))] md:right-0"
            }`}
          >
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
              files={pendingFiles}
              onFilesChange={setPendingFiles}
            />
          </div>

          {/* Gradient backdrop behind fixed input */}
          <div
            className={`fixed right-0 bottom-0 h-24 sm:h-20 z-10 bg-linear-to-t from-background via-background/95 to-background/80 backdrop-blur-sm pointer-events-none ${
              sidebarState === "expanded"
                ? "left-0 md:left-[calc(var(--sidebar-width))]"
                : "left-0 md:left-[calc(var(--sidebar-width-icon))]"
            }`}
          />
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
            files={pendingFiles}
            onFilesChange={setPendingFiles}
          />

          <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
            {(
              [
                {
                  label: "Summarize text",
                  icon: "solar:document-text-linear",
                  prompt: "Summarize the following: ",
                },
                {
                  label: "Help me write",
                  icon: "solar:pen-new-square-linear",
                  prompt: "Help me write ",
                },
                {
                  label: "Brainstorm ideas",
                  icon: "solar:stars-linear",
                  prompt: "Brainstorm ideas for ",
                },
                {
                  label: "Analyze & explain",
                  icon: "solar:lightbulb-linear",
                  prompt: "Analyze and explain ",
                },
              ] as const
            ).map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  if ("action" in chip && chip.action === "search") {
                    setSearchMode("search");
                  } else if ("prompt" in chip) {
                    setInput(chip.prompt);
                  }
                }}
                className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground"
              >
                <Icon
                  icon={chip.icon}
                  className="size-3.5 transition-colors duration-200 group-hover:text-foreground"
                />
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit Title Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit title</DialogTitle>
          </DialogHeader>
          <Input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
            }}
            maxLength={100}
            autoFocus
            placeholder="Chat title"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTitle} disabled={isSavingTitle}>
              {isSavingTitle ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              conversation and its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      {chatId && (
        <ShareDialog
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          chatId={chatId}
          initialVisibility={bootstrap?.chat.visibility ?? "private"}
          initialShareToken={bootstrap?.chat.shareToken}
        />
      )}
    </div>
  );
}
