import type { Item } from "@wonderpath/schema";
import type { SubmitResult } from "@wonderpath/engine";
import type { OutboundMessage } from "./meta";

export function renderHome(opts: { worldTitle: string; streakDays: number; hearts: number }): OutboundMessage {
  return {
    kind: "buttons",
    body: `${opts.worldTitle}\nStreak ${opts.streakDays} day(s) · Hearts ${opts.hearts}\nTap Continue for the next lesson.`,
    buttons: [{ id: "continue", title: "Continue" }],
  };
}

export function renderItem(item: Item, index: number, total: number): OutboundMessage {
  const body = `${index + 1}/${total}\n${itemPrompt(item)}`;
  if (item.kind === "tf") {
    return {
      kind: "buttons",
      body,
      buttons: item.choices.map((c) => ({ id: c, title: c })),
    };
  }
  return {
    kind: "list",
    body,
    rows: item.choices.map((c) => ({ id: c, title: c })),
  };
}

export function renderFeedback(result: SubmitResult): OutboundMessage {
  if (result.failed) {
    return {
      kind: "buttons",
      body: `${result.feedback}\nHearts are empty. Try a short practice?`,
      buttons: [
        { id: "practice", title: "Practice" },
        { id: "home", title: "Home" },
      ],
    };
  }
  if (result.complete) {
    return {
      kind: "buttons",
      body: `${result.feedback}\n+${result.progress.xp ? "10 XP" : "XP"} · streak ${result.progress.streakDays}`,
      buttons: [{ id: "continue", title: "Continue" }],
    };
  }
  return { kind: "text", body: result.feedback };
}

function itemPrompt(item: Item): string {
  return item.kind === "tf" ? "True or false?" : "Pick one:";
}
