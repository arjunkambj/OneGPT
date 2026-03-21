import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/users";
import { attachment, messagePart } from "./schema";

export const getMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return null;
    return await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_createdAt", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .take(500);
  },
});

export const saveUserMessage = mutation({
  args: {
    chatId: v.id("chats"),
    parts: v.array(messagePart),
    attachments: v.optional(v.array(attachment)),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Chat not found");

    const now = Date.now();
    await ctx.db.patch(args.chatId, { updatedAt: now });

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: "user",
      parts: args.parts,
      attachments: args.attachments,
      createdAt: now,
    });
  },
});

export const saveAssistantMessage = mutation({
  args: {
    chatId: v.id("chats"),
    parts: v.array(messagePart),
    model: v.optional(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    completionTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Chat not found");

    const now = Date.now();
    await ctx.db.patch(args.chatId, { updatedAt: now });

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: "assistant",
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
