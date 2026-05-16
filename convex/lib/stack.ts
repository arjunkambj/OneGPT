import { StackServerApp } from "@stackframe/js";

const getEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

export const stackServerApp = new StackServerApp({
  tokenStore: "memory",
  projectId: getEnv("NEXT_PUBLIC_STACK_PROJECT_ID"),
  secretServerKey: getEnv("STACK_SECRET_SERVER_KEY"),
  noAutomaticPrefetch: true,
});
