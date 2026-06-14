import "server-only";

import { HexclaveServerApp } from "@hexclave/next";
import { chatHomePath } from "@/lib/chat-routes";

const hexclaveProjectId = process.env.NEXT_PUBLIC_HEXCLAVE_PROJECT_ID;
const hexclavePublishableClientKey =
  process.env.NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY;
const hexclaveSecretServerKey = process.env.HEXCLAVE_SECRET_SERVER_KEY;

if (!hexclaveProjectId) {
  throw new Error("Missing NEXT_PUBLIC_HEXCLAVE_PROJECT_ID");
}

if (!hexclavePublishableClientKey) {
  throw new Error("Missing NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY");
}

if (!hexclaveSecretServerKey) {
  throw new Error("Missing HEXCLAVE_SECRET_SERVER_KEY");
}

export const hexclaveServerApp = new HexclaveServerApp({
  tokenStore: "nextjs-cookie",
  projectId: hexclaveProjectId,
  publishableClientKey: hexclavePublishableClientKey,
  secretServerKey: hexclaveSecretServerKey,
  urls: {
    signIn: "/sign-in",
    afterSignIn: chatHomePath,
    afterSignUp: "/sign-in",
    afterSignOut: chatHomePath,
  },
});

export const getHexclaveConvexServerToken = async (request: Request) => {
  const token = await hexclaveServerApp.getConvexHttpClientAuth({
    tokenStore: request,
  });

  return token.length ? token : null;
};
