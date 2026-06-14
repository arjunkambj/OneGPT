import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { hexclaveWebhookHandler } from "./webhooks/hexclave";

const http = httpRouter();

function bytesToBase64(bytes: ArrayBuffer) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function getWebhookSecretBytes(secret: string) {
  const encodedSecret = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : null;
  if (!encodedSecret) return new TextEncoder().encode(secret);

  try {
    return Uint8Array.from(atob(encodedSecret), (char) => char.charCodeAt(0));
  } catch {
    return new TextEncoder().encode(secret);
  }
}

function getWebhookSignatures(signature: string) {
  return signature
    .split(" ")
    .flatMap((part) => part.split(","))
    .map((part) => part.trim())
    .filter((part) => part && part !== "v1")
    .map((part) => (part.startsWith("v1,") ? part.slice(3) : part));
}

async function verifyDodoSignature(
  payload: string,
  id: string,
  signature: string,
  timestamp: string,
  secret: string,
) {
  const providedSignatures = getWebhookSignatures(signature);
  if (!id || providedSignatures.length === 0 || !timestamp) return false;

  const timestampMs = Number.parseInt(timestamp, 10) * 1000;
  if (
    !Number.isFinite(timestampMs) ||
    Math.abs(Date.now() - timestampMs) > 300_000
  ) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    getWebhookSecretBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expectedSignature = bytesToBase64(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${id}.${timestamp}.${payload}`),
    ),
  );

  return providedSignatures.some((providedSignature) =>
    timingSafeEqual(expectedSignature, providedSignature),
  );
}

function toTimestamp(value: unknown) {
  if (typeof value !== "string") return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

type DodoWebhookData = {
  id?: string;
  subscription_id?: string;
  product_id?: string;
  product_cart?: { product_id?: string }[];
  metadata?: { hexclaveId?: string; tier?: "pro" | "max" };
  customer?: { email?: string; customer_id?: string };
  customer_id?: string;
  recurring_pre_tax_amount?: number;
  currency?: string;
  payment_frequency_interval?: string;
  previous_billing_date?: string;
  created_at?: string;
  next_billing_date?: string;
  cancel_at_next_billing_date?: boolean;
  status?: string;
};

function getDodoInterval(interval: string | undefined) {
  const normalized = interval?.toLowerCase();
  if (normalized === "month" || normalized === "year") return normalized;
  return undefined;
}

function getDodoProductId(data: DodoWebhookData) {
  return data.product_id ?? data.product_cart?.[0]?.product_id;
}

function getDodoTier(productId: string | undefined) {
  if (productId === process.env.ONEGPT_MAX_PLAN_PRODUCT_ID) return "max";
  if (productId === process.env.ONEGPT_PRO_PLAN_PRODUCT_ID) return "pro";
  return null;
}

function getDodoMetadata(data: DodoWebhookData) {
  return data.metadata;
}

function getDodoResolvedTier(
  data: DodoWebhookData,
  productId: string | undefined,
) {
  const metadataTier = getDodoMetadata(data)?.tier;
  if (metadataTier === "pro" || metadataTier === "max") return metadataTier;
  return getDodoTier(productId);
}

function getDodoStatus(type: string, data: DodoWebhookData) {
  if (type === "subscription.created" || type === "subscription.trialing") {
    return "trialing";
  }
  if (type === "subscription.on_hold") return "past_due";
  if (
    (type === "subscription.cancelled" || type === "subscription.canceled") &&
    data.cancel_at_next_billing_date &&
    (toTimestamp(data.next_billing_date) ?? 0) > Date.now()
  ) {
    return "active";
  }
  if (
    type === "subscription.cancelled" ||
    type === "subscription.canceled" ||
    type === "subscription.expired" ||
    type === "subscription.revoked"
  ) {
    return "canceled";
  }
  if (type === "subscription.failed") return "paused";
  return "active";
}

http.route({
  path: "/webhook/hexclave",
  method: "POST",
  handler: hexclaveWebhookHandler,
});

http.route({
  path: "/webhook/dodo",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Webhook secret is not configured", { status: 500 });
    }

    const body = await req.text();
    const id = req.headers.get("webhook-id") ?? "";
    const signature = req.headers.get("webhook-signature") ?? "";
    const timestamp = req.headers.get("webhook-timestamp") ?? "";

    if (!(await verifyDodoSignature(body, id, signature, timestamp, secret))) {
      return new Response("Invalid signature", { status: 401 });
    }

    let event: {
      type: string;
      data: DodoWebhookData;
    };

    try {
      event = JSON.parse(body) as typeof event;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    console.log("[Dodo webhook] received", {
      type: event.type,
      subscriptionId: event.data.subscription_id ?? event.data.id,
      customerEmail: event.data.customer?.email,
      productId: getDodoProductId(event.data),
      status: event.data.status,
      interval: event.data.payment_frequency_interval,
      metadata: event.data.metadata,
    });

    if (!event.type.startsWith("subscription.")) {
      return Response.json({ received: true });
    }

    const data = event.data;
    const productId = getDodoProductId(data);
    const tier = getDodoResolvedTier(data, productId);
    const externalId = data.subscription_id ?? data.id;
    const metadata = getDodoMetadata(data);

    if (!externalId) {
      return Response.json({ received: true });
    }

    try {
      await ctx.runMutation(internal.subscriptions.syncFromDodoWebhook, {
        externalId,
        hexclaveId: metadata?.hexclaveId,
        customerEmail: data.customer?.email,
        customerId: data.customer?.customer_id ?? data.customer_id,
        productId,
        status: getDodoStatus(event.type, data),
        tier: tier ?? undefined,
        amount: data.recurring_pre_tax_amount,
        currency: data.currency,
        recurringInterval: getDodoInterval(data.payment_frequency_interval),
        currentPeriodStart: toTimestamp(
          data.previous_billing_date ?? data.created_at,
        ),
        currentPeriodEnd: toTimestamp(data.next_billing_date),
        cancelAtPeriodEnd: data.cancel_at_next_billing_date,
        metadata,
      });
    } catch (error) {
      console.error("[Dodo webhook] failed", {
        type: event.type,
        externalId,
        customerEmail: data.customer?.email,
        productId,
        tier,
        error,
      });
      throw error;
    }

    return Response.json({ received: true });
  }),
});

export default http;
