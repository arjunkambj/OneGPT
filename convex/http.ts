import { httpRouter } from "convex/server";
import { stackWebhookHandler } from "./webhooks/stack";

const http = httpRouter();

http.route({
  path: "/webhook/stack",
  method: "POST",
  handler: stackWebhookHandler,
});

export default http;
