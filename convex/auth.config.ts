import { getConvexProvidersConfig } from "@stackframe/stack";

const getEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

export default {
  providers: getConvexProvidersConfig({
    projectId: getEnv("NEXT_PUBLIC_STACK_PROJECT_ID"),
  }),
};
