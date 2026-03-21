import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    stackId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("BystackId", ["stackId"])
    .index("ByEmail", ["email"])
    .index("ByUpdatedAt", ["updatedAt"]),
});

export default schema;
