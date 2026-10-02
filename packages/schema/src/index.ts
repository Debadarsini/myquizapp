import { z } from "zod";

export const ItemKind = z.enum(["mcq", "tf"]);
export type ItemKind = z.infer<typeof ItemKind>;

export const FactCard = z.object({
  id: z.string().min(1),
  worldId: z.string().min(1),
  prompt: z.string().min(1),
  teachText: z.string().min(1),
  image: z.string().min(1).optional(),
  audioText: z.string().min(1).optional(),
  tags: z.array(z.string()).default([]),
});
export type FactCard = z.infer<typeof FactCard>;

export const Item = z.object({
  id: z.string().min(1),
  kind: ItemKind,
  cardId: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).max(4),
  correct: z.string().min(1),
});
export type Item = z.infer<typeof Item>;

export const Lesson = z.object({
  id: z.string().min(1),
  skillId: z.string().min(1),
  itemIds: z.array(z.string().min(1)).min(1),
  unlockAfter: z.string().min(1).nullable(),
});
export type Lesson = z.infer<typeof Lesson>;

export const Skill = z.object({
  id: z.string().min(1),
  worldId: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  lessonIds: z.array(z.string().min(1)).min(1),
});
export type Skill = z.infer<typeof Skill>;

export const World = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
});
export type World = z.infer<typeof World>;

export const Attempt = z.object({
  itemId: z.string().min(1),
  correct: z.boolean(),
  ms: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
});
export type Attempt = z.infer<typeof Attempt>;

export const Review = z.object({
  cardId: z.string().min(1),
  ease: z.number(),
  intervalDays: z.number(),
  dueAt: z.string().datetime(),
  lapses: z.number().int().nonnegative(),
});
export type Review = z.infer<typeof Review>;

export const Progress = z.object({
  xp: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  hearts: z.number().int().min(0).max(5),
  lastPlayedDate: z.string().nullable(),
});
export type Progress = z.infer<typeof Progress>;

export const ContentPack = z.object({
  world: World,
  skills: z.array(Skill),
  lessons: z.array(Lesson),
  cards: z.array(FactCard),
  items: z.array(Item),
});
export type ContentPack = z.infer<typeof ContentPack>;
