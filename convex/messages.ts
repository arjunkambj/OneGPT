import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/users";
import { attachment, messagePart } from "./schema";

const chatMode = v.union(v.literal("chat"), v.literal("search"));

async function getAuthorizedChat(
  ctx: Pick<QueryCtx | MutationCtx, "auth" | "db">,
  chatId: Id<"chats">,
) {
  const user = await getCurrentUser(ctx);
  if (!user) return null;

  const chat = await ctx.db.get(chatId);
  if (!chat || chat.userId !== user._id) return null;

  return chat;
}

async function requireAuthorizedChat(
  ctx: Pick<MutationCtx, "auth" | "db">,
  chatId: Id<"chats">,
) {
  const user = await requireCurrentUser(ctx);
  const chat = await ctx.db.get(chatId);
  if (!chat || chat.userId !== user._id) throw new Error("Chat not found");
  return chat;
}

export const getMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await getAuthorizedChat(ctx, args.chatId);
    if (!chat) return null;

    return await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_createdAt", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .take(500);
  },
});

export const getOlderMessages = query({
  args: {
    chatId: v.id("chats"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const chat = await getAuthorizedChat(ctx, args.chatId);
    if (!chat) return null;

    const messagesPage = await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_createdAt", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      messages: [...messagesPage.page].reverse(),
      hasMoreOlder: !messagesPage.isDone,
      nextCursor: messagesPage.isDone ? null : messagesPage.continueCursor,
    };
  },
});

export const saveUserMessage = mutation({
  args: {
    chatId: v.id("chats"),
    parentMessageId: v.optional(v.id("messages")),
    mode: chatMode,
    parts: v.array(messagePart),
    attachments: v.optional(v.array(attachment)),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedChat(ctx, args.chatId);

    const now = Date.now();
    await ctx.db.patch(args.chatId, { updatedAt: now });

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      parentMessageId: args.parentMessageId,
      role: "user",
      mode: args.mode,
      parts: args.parts,
      attachments: args.attachments,
      createdAt: now,
    });
  },
});

export const saveAssistantMessage = mutation({
  args: {
    chatId: v.id("chats"),
    parentMessageId: v.id("messages"),
    mode: v.optional(chatMode),
    parts: v.array(messagePart),
    model: v.optional(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    completionTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedChat(ctx, args.chatId);

    const now = Date.now();
    await ctx.db.patch(args.chatId, { updatedAt: now });

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      parentMessageId: args.parentMessageId,
      role: "assistant",
      mode: args.mode,
      parts: args.parts,
      model: args.model,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      totalTokens: args.totalTokens,
      completionTime: args.completionTime,
      createdAt: now,
    });
  },
});
