import DodoPayments from "dodopayments";
import { NextResponse } from "next/server";
import { hexclaveServerApp } from "@/hexclave/server";

const tierProductIds = {
  pro: process.env.ONEGPT_PRO_PLAN_PRODUCT_ID,
  max: process.env.ONEGPT_MAX_PLAN_PRODUCT_ID,
} as const;

export async function POST(req: Request) {
  const user = await hexclaveServerApp.getUser({ tokenStore: req });
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

  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT;
  if (environment !== "test_mode" && environment !== "live_mode") {
    return NextResponse.json(
      { error: "Dodo Payments environment is not configured" },
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
    environment,
  });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "App URL is not configured" },
      { status: 500 },
    );
  }

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
        hexclaveId: user.id,
        tier,
      },
      return_url: `${baseUrl.replace(/\/$/, "")}/settings?tab=subscription&checkout=success`,
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
