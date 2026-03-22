import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { chatHomePath } from "@/lib/chat-routes";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
  urls: {
    signIn: "/sign-in",
    afterSignIn: chatHomePath,
    afterSignUp: "/sign-in",
    afterSignOut: chatHomePath,
  },
});
