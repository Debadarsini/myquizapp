import { createHash } from "node:crypto";
import { emptyProgress, nextUnlockedLesson, startLesson, submitAnswer } from "@wonderpath/engine";
import { loadAnimals } from "@wonderpath/content";
import type { Env } from "./env";
import { renderFeedback, renderHome, renderItem } from "./render";
import { sendMessage, type OutboundMessage } from "./meta";
import { getSession, setSession } from "./store/session";

const pack = loadAnimals();

export type Inbound = {
  from: string;
  text?: string;
  buttonId?: string;
};

export async function routeInbound(env: Env, inbound: Inbound): Promise<void> {
  if (env.allowlist.size > 0 && !env.allowlist.has(inbound.from)) {
    return;
  }

  const hash = phoneHash(inbound.from);
  const raw = (inbound.buttonId ?? inbound.text ?? "").trim();
  const command = raw.toLowerCase();

  if (!raw || command === "hi" || command === "play" || command === "home") {
    await send(env, inbound.from, homeMessage());
    return;
  }

  if (command === "stop" || command === "pause") {
    await send(env, inbound.from, {
      kind: "text",
      body: "Paused. Say play when you want to continue. Streak is safe.",
    });
    return;
  }

  if (command === "continue") {
    const lesson = nextUnlockedLesson(pack, new Set());
    if (!lesson) {
      await send(env, inbound.from, { kind: "text", body: "All lessons in this world are done." });
      return;
    }
    const started = startLesson(pack, lesson.id, emptyProgress());
    setSession(hash, started.session);
    await send(env, inbound.from, renderItem(started.item, 0, started.session.itemIds.length));
    return;
  }

  const session = getSession(hash);
  if (!session) {
    await send(env, inbound.from, {
      kind: "buttons",
      body: "Tap a button below.",
      buttons: [{ id: "play", title: "Play" }],
    });
    return;
  }

  const result = submitAnswer(pack, session, raw);
  setSession(hash, result.session);
  await send(env, inbound.from, renderFeedback(result));
  if (result.nextItem) {
    await send(
      env,
      inbound.from,
      renderItem(result.nextItem, result.session.itemIndex, result.session.itemIds.length),
    );
  }
}

function homeMessage(): OutboundMessage {
  return renderHome({
    worldTitle: pack.world.title,
    streakDays: 0,
    hearts: 5,
  });
}

function phoneHash(phone: string): string {
  return createHash("sha256").update(phone).digest("hex");
}

async function send(env: Env, to: string, message: OutboundMessage): Promise<void> {
  await sendMessage(env, to, message);
}
