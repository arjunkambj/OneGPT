/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chats from "../chats.js";
import type * as customInstructions from "../customInstructions.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_users from "../lib/users.js";
import type * as maintenance from "../maintenance.js";
import type * as messages from "../messages.js";
import type * as subscriptions from "../subscriptions.js";
import type * as usage from "../usage.js";
import type * as userPreferences from "../userPreferences.js";
import type * as webhooks_hexclave from "../webhooks/hexclave.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chats: typeof chats;
  customInstructions: typeof customInstructions;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/users": typeof lib_users;
  maintenance: typeof maintenance;
  messages: typeof messages;
  subscriptions: typeof subscriptions;
  usage: typeof usage;
  userPreferences: typeof userPreferences;
  "webhooks/hexclave": typeof webhooks_hexclave;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  stack_auth: import("@hexclave/next/_generated/component.js").ComponentApi<"stack_auth">;
};
