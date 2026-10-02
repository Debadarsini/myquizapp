import { describe, expect, it } from "vitest";
import { fakeClock } from "./clock";
import { emptyProgress } from "./progress";
import { startLesson, submitAnswer } from "./lesson";
import type { ContentPack } from "@wonderpath/schema";

const pack: ContentPack = {
  world: { id: "animals", title: "Animals around us", order: 0 },
  skills: [{ id: "pets", worldId: "animals", title: "Pets", order: 0, lessonIds: ["pets-1"] }],
  lessons: [{ id: "pets-1", skillId: "pets", itemIds: ["i1", "i2"], unlockAfter: null }],
  cards: [
    {
      id: "c1",
      worldId: "animals",
      prompt: "Is a cat a mammal?",
      teachText: "Cats are mammals. They have fur and drink milk as babies.",
      tags: ["pets"],
    },
    {
      id: "c2",
      worldId: "animals",
      prompt: "Which animal is a pet?",
      teachText: "Dogs live with people as pets.",
      tags: ["pets"],
    },
  ],
  items: [
    { id: "i1", kind: "tf", cardId: "c1", choices: ["True", "False"], correct: "True" },
    { id: "i2", kind: "mcq", cardId: "c2", choices: ["Dog", "Shark", "Eagle", "Whale"], correct: "Dog" },
  ],
};

describe("lesson runner", () => {
  it("awards XP after a completed lesson", () => {
    const clock = fakeClock("2026-10-02T10:00:00.000Z");
    let { session } = startLesson(pack, "pets-1", emptyProgress(), clock);
    let result = submitAnswer(pack, session, "True", clock);
    expect(result.correct).toBe(true);
    expect(result.complete).toBe(false);
    result = submitAnswer(pack, result.session, "Dog", clock);
    expect(result.complete).toBe(true);
    expect(result.progress.xp).toBe(10);
    expect(result.progress.streakDays).toBe(1);
  });

  it("fails the lesson when hearts run out", () => {
    const clock = fakeClock("2026-10-02T10:00:00.000Z");
    let { session } = startLesson(pack, "pets-1", { ...emptyProgress(), hearts: 1 }, clock);
    const result = submitAnswer(pack, session, "False", clock);
    expect(result.failed).toBe(true);
    expect(result.complete).toBe(false);
    expect(result.progress.xp).toBe(0);
  });
});
