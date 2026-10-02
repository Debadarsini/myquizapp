import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "./env";
import { routeInbound } from "./router";

type WebhookQuery = {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
};

export function registerWebhook(app: FastifyInstance, env: Env): void {
  app.get("/webhook", async (request: FastifyRequest<{ Querystring: WebhookQuery }>, reply: FastifyReply) => {
    const mode = request.query["hub.mode"];
    const token = request.query["hub.verify_token"];
    const challenge = request.query["hub.challenge"];
    if (mode === "subscribe" && token === env.verifyToken && challenge) {
      return reply.type("text/plain").send(challenge);
    }
    return reply.code(403).send("forbidden");
  });

  app.post("/webhook", async (request, reply) => {
    const inbound = extractInbound(request.body);
    if (inbound) {
      await routeInbound(env, inbound);
    }
    return reply.code(200).send({ ok: true });
  });
}

function extractInbound(body: unknown): { from: string; text?: string; buttonId?: string } | null {
  const payload = body as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{
            from: string;
            type: string;
            text?: { body: string };
            interactive?: {
              type: string;
              button_reply?: { id: string; title: string };
              list_reply?: { id: string; title: string };
            };
          }>;
        };
      }>;
    }>;
  };

  const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return null;

  if (message.type === "text") {
    return { from: message.from, text: message.text?.body };
  }
  if (message.type === "interactive") {
    const id = message.interactive?.button_reply?.id ?? message.interactive?.list_reply?.id;
    const title = message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title;
    return { from: message.from, buttonId: id, text: title };
  }
  return { from: message.from };
}
