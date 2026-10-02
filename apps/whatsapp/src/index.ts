import Fastify from "fastify";
import { loadEnv } from "./env";
import { registerWebhook } from "./webhook";

const env = loadEnv();
const app = Fastify({ logger: true });

registerWebhook(app, env);

app.get("/health", async () => ({ ok: true }));

await app.listen({ port: env.port, host: "0.0.0.0" });
