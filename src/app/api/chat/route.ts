import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  generateText,
  streamText,
  type UIMessage,
} from "ai";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { isSupportedModel, mapModelToOpenRouter } from "@/lib/ai/model-routing";
import { stackServerApp } from "@/stack/server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

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

function isUIMessageArray(value: unknown): value is UIMessage[] {
  return Array.isArray(value);
}

export async function POST(req: Request) {
  const user = await stackServerApp.getUser({ tokenStore: req });
  if (!user) return new Response("Unauthorized", { status: 401 });

  const authJson = await user.getAuthJson();
  const token = authJson.accessToken ?? undefined;
  if (!token) return new Response("Missing auth token", { status: 401 });

  const body = await req.json();
  const { messages, chatId, model } = body as {
    messages?: unknown;
    chatId?: unknown;
    model?: unknown;
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

  const openRouterModelId = mapModelToOpenRouter(model);

  const startTime = Date.now();

  type ConvexPart =
    | { type: "text"; text: string }
    | { type: "reasoning"; reasoning: string };

  let tokenUsage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  } = {};

  const result = streamText({
    model: openrouter(openRouterModelId),
    messages: await convertToModelMessages(messages),
    onFinish: ({ usage }) => {
      tokenUsage = {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      };
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: allMessages }) => {
      const completionTime = Date.now() - startTime;

      const lastMessage = allMessages[allMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        const parts: ConvexPart[] = [];
        for (const part of lastMessage.parts) {
          if (isTextPart(part)) {
            parts.push({ type: "text", text: part.text });
          } else if (isReasoningPart(part)) {
            parts.push({ type: "reasoning", reasoning: part.text });
          }
        }

        if (parts.length > 0) {
          try {
            await fetchMutation(
              api.messages.saveAssistantMessage,
              {
                chatId: chatId as Id<"chats">,
                parts,
                model: openRouterModelId,
                completionTime,
                ...tokenUsage,
              },
              { token },
            );
          } catch (e) {
            console.error("Failed to save assistant message:", e);
          }
        }
      }

      const userMessages = allMessages.filter((m) => m.role === "user");
      if (userMessages.length === 1) {
        try {
          const chat = await fetchQuery(
            api.chats.getChat,
            { chatId: chatId as Id<"chats"> },
            { token },
          );
          if (!chat || chat.title !== "New Chat") return;

          const userText = userMessages[0]?.parts
            .filter(isTextPart)
            .map((p) => p.text)
            .join("");

          if (userText) {
            const titleResult = await generateText({
              model: openrouter("minimax/minimax-m2.7"),
              prompt: `Generate an exact five-word title for a chat that starts with: "${userText.slice(0, 200)}". Return only the five words, with no quotes and no punctuation.`,
            });
            const title = titleResult.text.trim().replace(/\s+/g, " ");
            if (title.split(" ").length === 5) {
              await fetchMutation(
                api.chats.updateChatTitle,
                { chatId: chatId as Id<"chats">, title },
                { token },
              );
            }
          }
        } catch (e) {
          console.error("Failed to generate title:", e);
        }
      }
    },
  });
}
