import { StackClientApp } from "@stackframe/stack";

const stackProjectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const stackPublishableClientKey =
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

if (!stackProjectId) {
  throw new Error("Missing NEXT_PUBLIC_STACK_PROJECT_ID");
}

if (!stackPublishableClientKey) {
  throw new Error("Missing NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY");
}

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  projectId: stackProjectId,
  publishableClientKey: stackPublishableClientKey,
});
