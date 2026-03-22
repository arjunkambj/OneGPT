import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type UIMessage,
} from "ai";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { after } from "next/server";
import {
  getOpenRouterProviderOptions,
  isSupportedModel,
  mapModelToOpenRouter,
} from "@/lib/ai/model-routing";
import type { ChatMode } from "@/lib/types";
import { stackServerApp } from "@/stack/server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

type StoredPart =
  | { type: "text"; text: string }
  | {
      type: "reasoning";
      reasoning: string;
      details?: { type: string; summary: string }[];
    }
  | {
      type: "source-url";
      sourceId: string;
      url: string;
      title?: string;
      providerMetadata?: unknown;
    }
  | { type: "error"; error: string };

type StoredMessage = {
  _id: string;
  parentMessageId?: string;
  role: "user" | "assistant" | "system";
  mode?: ChatMode;
  parts: StoredPart[];
  createdAt: number;
};

type SourcePart = Extract<StoredPart, { type: "source-url" }>;

type ExaSearchResult = {
  id?: string;
  title?: string;
  url: string;
  text?: string;
  highlights?: string[];
  publishedDate?: string;
  author?: string;
};

function isTextPart(part: unknown): part is { type: "text"; text: string } {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    part.type === "text" &&
    "text" in part &&
    typeof part.text === "string"
  );
}

function isReasoningPart(part: unknown): part is {
  type: "reasoning";
  text: string;
} {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    part.type === "reasoning" &&
    "text" in part &&
    typeof part.text === "string"
  );
}

function isSourceUrlPart(part: unknown): part is SourcePart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    part.type === "source-url" &&
    "sourceId" in part &&
    typeof part.sourceId === "string" &&
    "url" in part &&
    typeof part.url === "string"
  );
}

function isUIMessageArray(value: unknown): value is UIMessage[] {
  return Array.isArray(value);
}

function isChatMode(value: unknown): value is ChatMode {
  return value === "chat" || value === "search";
}

function getTextFromParts(parts: Array<{ type: "text"; text: string }>) {
  return parts
    .map((part) => part.text)
    .join("")
    .trim();
}

function toUIMessage(message: StoredMessage): UIMessage {
  return {
    id: message._id,
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

function buildBranchPath(
  messages: StoredMessage[],
  leafMessageId: string | undefined,
) {
  if (!leafMessageId) return [];

  const messageById = new Map(
    messages.map((message) => [message._id, message]),
  );
  const path: StoredMessage[] = [];
  let currentId: string | undefined = leafMessageId;

  while (currentId) {
    const currentMessage = messageById.get(currentId);
    if (!currentMessage) break;
    path.push(currentMessage);
    currentId = currentMessage.parentMessageId;
  }

  return path.reverse();
}

function parseSearchQueries(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/^\s*[-*\d.)]+\s*/, "").trim())
    .filter(Boolean);

  const unique = new Set<string>();
  for (const line of lines) {
    unique.add(line);
    if (unique.size === 3) break;
  }

  return [...unique];
}

async function generateSearchQueries({
  userText,
  model,
  providerOptions,
}: {
  userText: string;
  model: string;
  providerOptions?: ReturnType<typeof getOpenRouterProviderOptions>;
}) {
  try {
    const result = await generateText({
      model: openrouter(model),
      providerOptions,
      prompt: [
        "Generate three concise web search queries for this question.",
        "Return only the queries, one per line, with no numbering or commentary.",
        `Question: ${userText}`,
      ].join("\n"),
    });

    const queries = parseSearchQueries(result.text);
    if (queries.length > 0) return queries;
  } catch (error) {
    console.error("Failed to generate search queries:", error);
  }

  return [userText];
}

async function searchExa(queries: string[]) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXA_API_KEY");
  }

  const responses = await Promise.all(
    queries.map(async (query) => {
      const response = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          query,
          numResults: 4,
          contents: {
            highlights: {
              maxCharacters: 700,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Exa search failed with status ${response.status}`);
      }

      const data = (await response.json()) as { results?: ExaSearchResult[] };
      return data.results ?? [];
    }),
  );

  const deduped = new Map<string, ExaSearchResult>();
  for (const results of responses) {
    for (const result of results) {
      if (!result.url || deduped.has(result.url)) continue;
      deduped.set(result.url, result);
      if (deduped.size === 6) {
        return [...deduped.values()];
      }
    }
  }

  return [...deduped.values()];
}

function buildSourceParts(results: ExaSearchResult[]): SourcePart[] {
  return results.map((result, index) => ({
    type: "source-url",
    sourceId: result.id ?? `source-${index + 1}`,
    url: result.url,
    title: result.title,
    providerMetadata: {
      author: result.author,
      publishedDate: result.publishedDate,
    },
  }));
}

function buildSearchSystemPrompt(results: ExaSearchResult[]) {
  const formattedResults = results
    .map((result, index) => {
      const snippets = (result.highlights ?? [])
        .map((highlight) => `- ${highlight}`)
        .join("\n");
      const text = result.text?.trim();

      return [
        `Source ${index + 1}: ${result.title ?? result.url}`,
        `URL: ${result.url}`,
        snippets || (text ? `Excerpt: ${text.slice(0, 900)}` : ""),
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [
    "You are answering with grounded web research.",
    "Use only the provided search evidence for factual claims.",
    "If the sources are incomplete or conflicting, say so plainly.",
    "Do not invent citations or facts not supported by the evidence.",
    "",
    "Search evidence:",
    formattedResults,
  ].join("\n");
}

function buildAssistantPartsFromMessage(message: UIMessage): StoredPart[] {
  return message.parts.reduce<StoredPart[]>((parts, part) => {
    if (isTextPart(part)) {
      parts.push({ type: "text" as const, text: part.text });
      return parts;
    }
    if (isReasoningPart(part)) {
      parts.push({ type: "reasoning" as const, reasoning: part.text });
      return parts;
    }
    if (isSourceUrlPart(part)) {
      parts.push({
        type: "source-url" as const,
        sourceId: part.sourceId,
        url: part.url,
        title: part.title,
        providerMetadata: part.providerMetadata,
      });
    }
    return parts;
  }, []);
}

async function persistAssistantError({
  chatId,
  token,
  parentMessageId,
  mode,
  model,
  errorText,
}: {
  chatId: Id<"chats">;
  token: string;
  parentMessageId: Id<"messages">;
  mode: ChatMode;
  model: string;
  errorText: string;
}) {
  await fetchMutation(
    api.messages.saveAssistantMessage,
    {
      chatId,
      parentMessageId,
      mode,
      model,
      parts: [{ type: "error", error: errorText }],
    },
    { token },
  );
}

function createErrorStreamResponse({
  messages,
  errorText,
}: {
  messages: UIMessage[];
  errorText: string;
}) {
  const stream = createUIMessageStream({
    originalMessages: messages,
    execute({ writer }) {
      writer.write({ type: "text-start", id: "error-text" });
      writer.write({
        type: "text-delta",
        id: "error-text",
        delta: errorText,
      });
      writer.write({ type: "text-end", id: "error-text" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
  const user = await stackServerApp.getUser({ tokenStore: req });
  if (!user) return new Response("Unauthorized", { status: 401 });

  const authJson = await user.getAuthJson();
  const token = authJson.accessToken ?? undefined;
  if (!token) return new Response("Missing auth token", { status: 401 });

  const body = await req.json();
  const { messages, chatId, model, mode, trigger, messageId, parentMessageId } =
    body as {
      messages?: unknown;
      chatId?: unknown;
      model?: unknown;
      mode?: unknown;
      trigger?: unknown;
      messageId?: unknown;
      parentMessageId?: unknown;
    };

  if (!isUIMessageArray(messages)) {
    return new Response("Invalid messages payload", { status: 400 });
  }

  if (typeof chatId !== "string" || chatId.length === 0) {
    return new Response("Missing chatId", { status: 400 });
  }

  if (typeof model !== "string" || !isSupportedModel(model)) {
    return new Response("Unsupported model", { status: 400 });
  }

  const typedChatId = chatId as Id<"chats">;
  const storedMessages = await fetchQuery(
    api.messages.getMessages,
    { chatId: typedChatId },
    { token },
  );
  if (!storedMessages) {
    return new Response("Chat not found", { status: 404 });
  }

  const storedChat = await fetchQuery(
    api.chats.getChat,
    { chatId: typedChatId },
    { token },
  );
  if (!storedChat) {
    return new Response("Chat not found", { status: 404 });
  }

  const branchMessages = storedMessages as StoredMessage[];
  const openRouterModelId = mapModelToOpenRouter(model);
  const openRouterProviderOptions = getOpenRouterProviderOptions(model);
  const isRegenerate = trigger === "regenerate-message";
  const latestUserMessage = [...messages].reverse().find((candidate) => {
    if (candidate.role !== "user") return false;
    return candidate.parts.some(isTextPart);
  });

  let requestMode: ChatMode = isChatMode(mode) ? mode : "chat";
  let currentUserMessageId: Id<"messages">;
  let requestMessages: UIMessage[] = [];
  let currentUserText = "";
  let shouldGenerateTitle = false;

  if (isRegenerate) {
    if (typeof messageId !== "string" || messageId.length === 0) {
      return new Response("Missing messageId", { status: 400 });
    }

    const assistantMessage = branchMessages.find(
      (storedMessage) => storedMessage._id === messageId,
    );
    if (!assistantMessage || assistantMessage.role !== "assistant") {
      return new Response("Assistant message not found", { status: 404 });
    }

    if (!assistantMessage.parentMessageId) {
      return new Response("Assistant branch is missing a parent", {
        status: 400,
      });
    }

    const parentUserMessage = branchMessages.find(
      (storedMessage) => storedMessage._id === assistantMessage.parentMessageId,
    );
    if (!parentUserMessage || parentUserMessage.role !== "user") {
      return new Response("Retry target is invalid", { status: 400 });
    }

    requestMode = parentUserMessage.mode ?? requestMode;
    currentUserMessageId = parentUserMessage._id as Id<"messages">;
    currentUserText = getTextFromParts(
      parentUserMessage.parts.filter(isTextPart),
    );
    requestMessages = buildBranchPath(
      branchMessages,
      parentUserMessage._id,
    ).map(toUIMessage);
  } else {
    if (!latestUserMessage) {
      return new Response("Missing user message", { status: 400 });
    }

    const latestUserParts = latestUserMessage.parts
      .filter(isTextPart)
      .map((part) => ({ type: "text" as const, text: part.text }));
    currentUserText = getTextFromParts(latestUserParts);
    if (!currentUserText) {
      return new Response("Missing user text", { status: 400 });
    }

    const branchLeafId =
      typeof parentMessageId === "string" && parentMessageId.length > 0
        ? parentMessageId
        : undefined;
    const parentPath = buildBranchPath(branchMessages, branchLeafId);

    currentUserMessageId = await fetchMutation(
      api.messages.saveUserMessage,
      {
        chatId: typedChatId,
        parentMessageId: branchLeafId as Id<"messages"> | undefined,
        mode: requestMode,
        parts: latestUserParts,
      },
      { token },
    );

    await fetchMutation(
      api.usage.trackChatTurn,
      { mode: requestMode },
      { token },
    );

    requestMessages = [
      ...parentPath.map(toUIMessage),
      {
        id: currentUserMessageId,
        role: "user",
        parts: latestUserParts,
      },
    ];
    shouldGenerateTitle =
      storedChat.title === "New Chat" && branchMessages.length === 0;
  }

  const startTime = Date.now();
  let tokenUsage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  } = {};

  let sourceParts: SourcePart[] = [];
  let systemPrompt: string | undefined;

  if (requestMode === "search") {
    try {
      const queries = await generateSearchQueries({
        userText: currentUserText,
        model: openRouterModelId,
        providerOptions: openRouterProviderOptions,
      });
      const searchResults = await searchExa(queries);
      if (searchResults.length === 0) {
        throw new Error("No relevant search results were found.");
      }

      sourceParts = buildSourceParts(searchResults);
      systemPrompt = buildSearchSystemPrompt(searchResults);
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : "Search failed before the answer could be generated.";

      await persistAssistantError({
        chatId: typedChatId,
        token,
        parentMessageId: currentUserMessageId,
        mode: requestMode,
        model,
        errorText,
      });

      return createErrorStreamResponse({
        messages,
        errorText,
      });
    }
  }

  const result = streamText({
    model: openrouter(openRouterModelId),
    providerOptions: openRouterProviderOptions,
    system: systemPrompt,
    messages: await convertToModelMessages(requestMessages),
    onFinish: ({ usage }) => {
      tokenUsage = {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      };
    },
  });

  const stream = createUIMessageStream({
    originalMessages: messages,
    onFinish: async ({ messages: allMessages }) => {
      const completionTime = Date.now() - startTime;
      const lastMessage = allMessages[allMessages.length - 1];

      if (lastMessage?.role === "assistant") {
        const parts = buildAssistantPartsFromMessage(lastMessage);

        if (parts.length > 0) {
          try {
            await fetchMutation(
              api.messages.saveAssistantMessage,
              {
                chatId: typedChatId,
                parentMessageId: currentUserMessageId,
                mode: requestMode,
                model,
                parts,
                completionTime,
                ...tokenUsage,
              },
              { token },
            );
          } catch (error) {
            console.error("Failed to save assistant message:", error);
          }
        }
      }

      if (!shouldGenerateTitle || !currentUserText) return;

      after(async () => {
        try {
          const titleResult = await generateText({
            model: openrouter("minimax/minimax-m2.7"),
            prompt: `Generate an exact five-word title for a chat that starts with: "${currentUserText.slice(0, 200)}". Return only the five words, with no quotes and no punctuation.`,
          });
          const title = titleResult.text.trim().replace(/\s+/g, " ");
          if (title.split(" ").length !== 5) return;

          await fetchMutation(
            api.chats.updateChatTitle,
            { chatId: typedChatId, title },
            { token },
          );
        } catch (error) {
          console.error("Failed to generate title:", error);
        }
      });
    },
    execute({ writer }) {
      for (const sourcePart of sourceParts) {
        writer.write({
          type: "source-url",
          sourceId: sourcePart.sourceId,
          url: sourcePart.url,
          title: sourcePart.title,
        });
      }

      writer.merge(
        result.toUIMessageStream({
          originalMessages: messages,
          sendReasoning: true,
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
