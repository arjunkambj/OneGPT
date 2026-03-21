import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
  urls: {
    signIn: "/sign-in",
    afterSignIn: "/overview",
    afterSignUp: "/sign-in",
    afterSignOut: "/",
    },
  });
