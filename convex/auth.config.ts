import { getConvexProvidersConfig } from "@hexclave/next/convex-auth.config";

const getEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

export default {
  providers: getConvexProvidersConfig({
    projectId: getEnv("NEXT_PUBLIC_HEXCLAVE_PROJECT_ID"),
  }),
};
