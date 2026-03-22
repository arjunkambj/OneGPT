import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/users";

export const listChats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("chats")
      .withIndex("by_userId_and_updatedAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const getChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return null;
    return chat;
  },
});

export const getChatBootstrap = query({
  args: {
    chatId: v.id("chats"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return null;

    const messagesPage = await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_createdAt", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      chat,
      messages: [...messagesPage.page].reverse(),
      hasMoreOlder: !messagesPage.isDone,
      nextCursor: messagesPage.isDone ? null : messagesPage.continueCursor,
    };
  },
});

export const createChat = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("chats", {
      userId: user._id,
      title: args.title ?? "New Chat",
      isPinned: false,
      visibility: "private",
      updatedAt: now,
      createdAt: now,
    });
  },
});

export const updateChatTitle = mutation({
  args: { chatId: v.id("chats"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Chat not found");
    await ctx.db.patch(args.chatId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const togglePin = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Chat not found");
    await ctx.db.patch(args.chatId, {
      isPinned: !chat.isPinned,
      updatedAt: Date.now(),
    });
  },
});

export const deleteChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Chat not found");

    // Delete messages in batches
    let messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_createdAt", (q) => q.eq("chatId", args.chatId))
      .take(200);

    while (messages.length > 0) {
      for (const msg of messages) {
        await ctx.db.delete(msg._id);
      }
      messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId_and_createdAt", (q) =>
          q.eq("chatId", args.chatId),
        )
        .take(200);
    }

    await ctx.db.delete(args.chatId);
  },
});
