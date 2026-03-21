import { v } from "convex/values";
import { Webhook } from "svix";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { httpAction, internalMutation } from "../_generated/server";

type StackWebhookEvent = {
  type: string;
  data?: unknown;
};

function asObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export const stackWebhookHandler = httpAction(async (ctx, request) => {
  const payload = await request.text();
  const webhookSecret = process.env.STACK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STACK_WEBHOOK_SECRET in environment variables");
  }

  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as StackWebhookEvent;

    console.log(`Webhook received: ${evt.type}`);

    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const data = asObject(evt.data);
        if (!data) {
          return new Response("Invalid webhook payload", { status: 400 });
        }

        const stackId = asString(data.id);
        if (!stackId) {
          return new Response("Missing user id", { status: 400 });
        }

        const name = asString(data.display_name) ?? "Unknown";
        const email = asString(data.primary_email) ?? "";
        const imageUrl = asString(data.profile_image_url);

        await ctx.runMutation(internal.webhooks.stack.upsertFromStackWebhook, {
          stackId,
          name,
          email,
          imageUrl,
        });
        break;
      }

      case "user.deleted": {
        const data = asObject(evt.data);
        const stackId = data ? asString(data.id) : undefined;
        if (!stackId) {
          break;
        }

        await ctx.runMutation(internal.webhooks.stack.deleteFromStackWebhook, {
          stackId,
        });
        break;
      }

      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Invalid Stack webhook signature or payload:", err);
    return new Response("Invalid signature", { status: 400 });
  }
});

export const upsertFromStackWebhook = internalMutation({
  args: {
    stackId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = args.email.trim().toLowerCase();
    const existingUser = await ctx.db
      .query("users")
      .withIndex("BystackId", (q) => q.eq("stackId", args.stackId))
      .first();

    if (existingUser) {
      const patch: Partial<Doc<"users">> = {
        name: args.name,
        email,
        imageUrl: args.imageUrl,
        updatedAt: now,
      };

      await ctx.db.patch(existingUser._id, patch);
      return existingUser._id;
    }

    const insertDoc = {
      stackId: args.stackId,
      name: args.name,
      email,
      imageUrl: args.imageUrl,
      updatedAt: now,
      createdAt: now,
    } satisfies Omit<Doc<"users">, "_id" | "_creationTime">;

    return await ctx.db.insert("users", insertDoc);
  },
});

export const deleteFromStackWebhook = internalMutation({
  args: {
    stackId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("BystackId", (q) => q.eq("stackId", args.stackId))
      .first();

    if (!existingUser) {
      return;
    }

    await ctx.db.delete(existingUser._id);
  },
});
