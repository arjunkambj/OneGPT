import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { NextResponse } from "next/server";
import { chatHomePath } from "@/lib/chat-routes";

const stackProjectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const stackPublishableClientKey =
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
const stackSecretServerKey = process.env.STACK_SECRET_SERVER_KEY;

if (!stackProjectId) {
  throw new Error("Missing NEXT_PUBLIC_STACK_PROJECT_ID");
}

if (!stackPublishableClientKey) {
  throw new Error("Missing NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY");
}

if (!stackSecretServerKey) {
  throw new Error("Missing STACK_SECRET_SERVER_KEY");
}

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: stackProjectId,
  publishableClientKey: stackPublishableClientKey,
  secretServerKey: stackSecretServerKey,
  urls: {
    signIn: "/sign-in",
    afterSignIn: chatHomePath,
    afterSignUp: "/sign-in",
    afterSignOut: chatHomePath,
  },
});

export const getStackConvexToken = async (request: Request) => {
  const token = await stackServerApp.getConvexHttpClientAuth({
    tokenStore: request,
  });

  if (token === "") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return token;
};
