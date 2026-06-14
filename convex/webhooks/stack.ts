import { v } from "convex/values";
import { Webhook } from "svix";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { httpAction, internalMutation } from "../_generated/server";
import { getUserByHexclaveId } from "../lib/users";

type HexclaveWebhookEvent = {
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

export const hexclaveWebhookHandler = httpAction(async (ctx, request) => {
  const payload = await request.text();
  const webhookSecret = process.env.HEXCLAVE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing HEXCLAVE_WEBHOOK_SECRET in environment variables");
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
    }) as HexclaveWebhookEvent;

    console.log(`Webhook received: ${evt.type}`);

    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const data = asObject(evt.data);
        if (!data) {
          return new Response("Invalid webhook payload", { status: 400 });
        }

        const hexclaveId = asString(data.id);
        if (!hexclaveId) {
          return new Response("Missing user id", { status: 400 });
        }

        const name = asString(data.display_name) ?? "Unknown";
        const email = asString(data.primary_email) ?? "";
        const imageUrl = asString(data.profile_image_url);

        await ctx.runMutation(
          internal.webhooks.stack.upsertFromHexclaveWebhook,
          {
            hexclaveId,
            name,
            email,
            imageUrl,
          },
        );
        break;
      }

      case "user.deleted": {
        const data = asObject(evt.data);
        const hexclaveId = data ? asString(data.id) : undefined;
        if (!hexclaveId) {
          break;
        }

        await ctx.runMutation(
          internal.webhooks.stack.deleteFromHexclaveWebhook,
          { hexclaveId },
        );
        break;
      }

      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Invalid Hexclave webhook signature or payload:", err);
    return new Response("Invalid signature", { status: 400 });
  }
});

export const upsertFromHexclaveWebhook = internalMutation({
  args: {
    hexclaveId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = args.email.trim().toLowerCase();
    const existingUser = await getUserByHexclaveId(ctx, args.hexclaveId);

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        hexclaveId: args.hexclaveId,
        name: args.name,
        email,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existingUser._id;
    }

    const insertDoc = {
      hexclaveId: args.hexclaveId,
      name: args.name,
      email,
      imageUrl: args.imageUrl,
      updatedAt: now,
      createdAt: now,
    } satisfies Omit<Doc<"users">, "_id" | "_creationTime">;

    return await ctx.db.insert("users", insertDoc);
  },
});

export const deleteFromHexclaveWebhook = internalMutation({
  args: {
    hexclaveId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await getUserByHexclaveId(ctx, args.hexclaveId);

    if (!existingUser) {
      return;
    }

    await ctx.db.delete(existingUser._id);
  },
});
