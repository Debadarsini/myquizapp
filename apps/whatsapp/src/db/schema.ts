import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Phone is stored hashed; never persist the raw number. */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  phoneHash: text("phone_hash").notNull().unique(),
  role: text("role", { enum: ["child", "parent"] }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const progress = sqliteTable("progress", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  xp: integer("xp").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  hearts: integer("hearts").notNull().default(5),
  lastPlayedDate: text("last_played_date"),
});

export const reviews = sqliteTable("reviews", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  cardId: text("card_id").notNull(),
  ease: integer("ease").notNull(),
  intervalDays: integer("interval_days").notNull(),
  dueAt: text("due_at").notNull(),
  lapses: integer("lapses").notNull().default(0),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind").notNull(),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
