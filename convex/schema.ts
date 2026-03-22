import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// Shared validators
// =============================================================================

export const messagePart = v.union(
  v.object({ type: v.literal("text"), text: v.string() }),
  v.object({
    type: v.literal("reasoning"),
    reasoning: v.string(),
    details: v.optional(
      v.array(v.object({ type: v.string(), summary: v.string() })),
    ),
  }),
  v.object({
    type: v.literal("tool-invocation"),
    toolInvocationId: v.string(),
    toolName: v.string(),
    args: v.any(),
    result: v.optional(v.any()),
    state: v.union(
      v.literal("pending"),
      v.literal("result"),
      v.literal("error"),
    ),
  }),
  v.object({
    type: v.literal("source-url"),
    sourceId: v.string(),
    url: v.string(),
    title: v.optional(v.string()),
    providerMetadata: v.optional(v.any()),
  }),
  v.object({ type: v.literal("error"), error: v.string() }),
);

export const attachment = v.object({
  name: v.string(),
  contentType: v.optional(v.string()),
  mediaType: v.optional(v.string()),
  url: v.string(),
  size: v.number(),
});

// =============================================================================
// Schema
// =============================================================================

const schema = defineSchema({
  // -------------------------------------------------------------------------
  // Users (existing — unchanged)
  // -------------------------------------------------------------------------
  users: defineTable({
    stackId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_stackId", ["stackId"])
    .index("by_email", ["email"])
    .index("by_updatedAt", ["updatedAt"]),

  // -------------------------------------------------------------------------
  // Chats
  // -------------------------------------------------------------------------
  chats: defineTable({
    userId: v.id("users"),
    title: v.string(),
    isPinned: v.boolean(),
    visibility: v.union(v.literal("public"), v.literal("private")),
    shareToken: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId_and_updatedAt", ["userId", "updatedAt"])
    .index("by_userId_and_isPinned_and_updatedAt", [
      "userId",
      "isPinned",
      "updatedAt",
    ])
    .index("by_shareToken", ["shareToken"]),

  // -------------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------------
  messages: defineTable({
    chatId: v.id("chats"),
    parentMessageId: v.optional(v.id("messages")),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    mode: v.optional(v.union(v.literal("chat"), v.literal("search"))),
    parts: v.array(messagePart),
    attachments: v.optional(v.array(attachment)),
    model: v.optional(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    completionTime: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_chatId_and_createdAt", ["chatId", "createdAt"])
    .index("by_chatId_and_parentMessageId_and_createdAt", [
      "chatId",
      "parentMessageId",
      "createdAt",
    ]),

  // -------------------------------------------------------------------------
  // Custom Instructions
  // -------------------------------------------------------------------------
  customInstructions: defineTable({
    userId: v.id("users"),
    content: v.string(),
    isEnabled: v.boolean(),
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // -------------------------------------------------------------------------
  // User Preferences
  // -------------------------------------------------------------------------
  userPreferences: defineTable({
    userId: v.id("users"),
    defaultModel: v.optional(v.string()),
    preferences: v.optional(v.any()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // -------------------------------------------------------------------------
  // Usage (unified daily counters)
  // -------------------------------------------------------------------------
  usage: defineTable({
    userId: v.id("users"),
    date: v.string(),
    messageCount: v.number(),
    searchCount: v.number(),
    tokensByProvider: v.optional(v.any()),
    resetAt: v.number(),
  })
    .index("by_userId_and_date", ["userId", "date"])
    .index("by_userId", ["userId"]),

  // -------------------------------------------------------------------------
  // Subscriptions
  // -------------------------------------------------------------------------
  subscriptions: defineTable({
    userId: v.id("users"),
    externalId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("max")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("paused"),
    ),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    recurringInterval: v.optional(
      v.union(v.literal("month"), v.literal("year")),
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    customerId: v.optional(v.string()),
    productId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_externalId", ["externalId"])
    .index("by_customerId", ["customerId"]),
});

export default schema;
