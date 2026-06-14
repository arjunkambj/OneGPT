import hexclaveComponent from "@hexclave/next/convex.config";
import { type ComponentDefinition, defineApp } from "convex/server";

const app = defineApp();
app.use(hexclaveComponent as ComponentDefinition);

export default app;
