import { HexclaveClientApp } from "@hexclave/next";

const hexclaveProjectId = process.env.NEXT_PUBLIC_HEXCLAVE_PROJECT_ID;
const hexclavePublishableClientKey =
  process.env.NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY;

if (!hexclaveProjectId) {
  throw new Error("Missing NEXT_PUBLIC_HEXCLAVE_PROJECT_ID");
}

if (!hexclavePublishableClientKey) {
  throw new Error("Missing NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY");
}

export const hexclaveClientApp = new HexclaveClientApp({
  tokenStore: "nextjs-cookie",
  projectId: hexclaveProjectId,
  publishableClientKey: hexclavePublishableClientKey,
});
