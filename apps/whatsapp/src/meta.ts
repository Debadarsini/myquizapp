import type { Env } from "./env";

export type OutboundMessage =
  | { kind: "text"; body: string }
  | { kind: "buttons"; body: string; buttons: { id: string; title: string }[] }
  | { kind: "list"; body: string; rows: { id: string; title: string }[] }
  | { kind: "image"; caption: string; link: string }
  | { kind: "audio"; link: string };

export async function sendMessage(
  env: Env,
  to: string,
  message: OutboundMessage,
): Promise<void> {
  if (!env.accessToken || !env.phoneNumberId) {
    console.log("[meta:dry-run]", to, message);
    return;
  }

  const url = `https://graph.facebook.com/${env.apiVersion}/${env.phoneNumberId}/messages`;
  const payload = toGraphPayload(to, message);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta send failed ${res.status}: ${text}`);
  }
}

function toGraphPayload(to: string, message: OutboundMessage): unknown {
  const base = { messaging_product: "whatsapp", to };
  switch (message.kind) {
    case "text":
      return { ...base, type: "text", text: { body: message.body } };
    case "image":
      return {
        ...base,
        type: "image",
        image: { link: message.link, caption: message.caption },
      };
    case "audio":
      return { ...base, type: "audio", audio: { link: message.link } };
    case "buttons":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: message.body },
          action: {
            buttons: message.buttons.slice(0, 3).map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title.slice(0, 20) },
            })),
          },
        },
      };
    case "list":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: message.body },
          action: {
            button: "Choose",
            sections: [
              {
                title: "Answers",
                rows: message.rows.slice(0, 10).map((r) => ({
                  id: r.id,
                  title: r.title.slice(0, 24),
                })),
              },
            ],
          },
        },
      };
  }
}
