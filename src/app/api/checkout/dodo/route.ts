import DodoPayments from "dodopayments";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

const tierProductIds = {
  pro: process.env.ONEGPT_PRO_PLAN_PRODUCT_ID,
  max: process.env.ONEGPT_MAX_PLAN_PRODUCT_ID,
} as const;

function getDodoEnvironment() {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
    ? "live_mode"
    : "test_mode";
}

function getBaseUrl(req: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  const user = await stackServerApp.getUser({ tokenStore: req });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = (await req.json().catch(() => ({}))) as {
    tier?: "pro" | "max";
  };

  if (tier !== "pro" && tier !== "max") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const productId = tierProductIds[tier];
  if (!productId) {
    return NextResponse.json(
      { error: "Plan product ID is not configured" },
      { status: 500 },
    );
  }

  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Dodo Payments API key is not configured" },
      { status: 500 },
    );
  }

  const client = new DodoPayments({
    bearerToken: apiKey,
    environment: getDodoEnvironment(),
  });
  const baseUrl = getBaseUrl(req);
  const email = user.primaryEmail ?? "";

  if (!email) {
    return NextResponse.json(
      { error: "Your account needs an email before checkout" },
      { status: 400 },
    );
  }

  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email,
        name: user.displayName ?? undefined,
      },
      metadata: {
        stackId: user.id,
        tier,
      },
      return_url: `${baseUrl}/settings?tab=subscription&checkout=success`,
    });

    return NextResponse.json({
      checkoutUrl: session.checkout_url,
    });
  } catch (error) {
    const status =
      error instanceof Error && "status" in error ? error.status : 500;
    const message =
      status === 401
        ? "Dodo Payments rejected the API key for the configured environment"
        : "Failed to create checkout session";

    return NextResponse.json({ error: message }, { status: Number(status) });
  }
}
