# Wonder Path — product paper

**Repo:** `myquizapp`  
**Audience:** one child (assumed ages 7–11) plus a parent  
**Subject:** general knowledge (Animals, Space, Earth, India, Body)  
**Channel (v1):** WhatsApp chatbot, not a full Android/iOS app  
**Date:** 2 October 2026

This paper is design first, then requirements, then language/tools and code structure. It updates the earlier native-app plan: the *learning design* stays; the *delivery* becomes WhatsApp.

---

## 0. Why WhatsApp instead of a store app

For a family product used by one daughter, WhatsApp is the shorter path.

| Native app | WhatsApp bot |
| --- | --- |
| App Store / Play accounts, certificates, reviews | She already has WhatsApp (or uses a parent phone) |
| Custom path UI, mascot, match-pairs, haptics | Buttons, lists, images, voice notes |
| Offline after install | Needs network; Meta sees message traffic |
| Weeks of shell UI before the first quiz | First lesson can ship as messages |
| No install friction once installed | No install; parent sends a chat link |

**Decision:** v1 is a WhatsApp skill path. A tablet app is a later skin over the same lesson engine and JSON content — not the first ship target.

WhatsApp is weaker at “pretty Duolingo.” That is acceptable. The product is still short lessons, XP, streak, hearts, and spaced review. The path is a text map plus a “Continue” button, not a winding illustration.

---

## 1. Design

### North star

Ten focused minutes that feel like a game, teach one true fact cluster, and leave her wanting the next node. No ads, no stranger chat, no public leaderboard.

### What we copy from Duolingo — and what we drop

**Keep**

- A skill path (worlds → skills → lessons)
- Tiny lessons (8–12 items, about 8 minutes)
- Immediate right/wrong
- XP and a daily streak
- Hearts so a lesson can fail without shame
- A mascot line after each item (“The Sun is a star.”)
- Read-aloud (WhatsApp voice note or TTS audio)
- A “practice weak skills” bucket (spaced repetition)

**Drop**

- Language drills (translate, speak-repeat)
- Public social
- Energy systems that lock her out for money
- Infinite live-generated trivia
- Child accounts, app stores, in-app chrome

### Learning model

Knowledge is organized as **worlds** (Animals, Space, Earth, Body, India, World stories, How things work). Each world is a path of **skills**. A skill is 3–5 **lessons** plus a checkpoint. A lesson: introduce, check, mix, celebrate.

| Moment | On WhatsApp | Why |
| --- | --- | --- |
| Teach | Image + one sentence + optional audio | Never quiz a fact she has not seen in this lesson |
| Check | Reply buttons (True/False) or list (4 choices) | Large taps; no typing |
| Mix | “Which does not belong”, picture + 3 captions | Same facts, different prompt |
| Repair | Wrong → teach card again → retry | Correction is the lesson |
| Close | XP, streak, next-node button | End on competence |

**First world:** Animals around us — high pictures, high curiosity, easy to author. Write ~40 cards before adding a second world.

### Session loop

Home path (message) → Continue → lesson items → update memory (SRS) → XP + hearts → unlock next node → “Play again?”  

If hearts empty: offer a short practice of only missed cards.

### WhatsApp interaction design

WhatsApp Cloud API gives a tight palette. Design *to* it; do not pretend it is a native canvas.

- **Start:** parent (or child) messages the business number: `hi` / `play`
- **Home:** one message listing today’s world, streak, hearts, and a single **Continue** button
- **Lesson:** one item per message. Progress as `3/10`. Speaker as a short audio message when the card has `audioText`
- **Choices:**
  - 2 options → reply **buttons** (max 3 buttons per message)
  - 4 options → **list** message (rows)
  - Picture tap → send image, then list of labels (true picture-tap is not available)
- **Parent:** message `parent` + PIN. Commands: `stats`, `cap 20`, `pause streak`, `next`
- **Stop:** `stop` / `pause` ends the session; streak is not punished mid-lesson if she used `pause`

**Mascot:** a named companion in text (pick one: owl, fox, or kite). One short line after feedback. Never sarcastic.

**Safety by design**

- Allowlist: only approved WhatsApp numbers (hers + parent)
- No group chats
- No free-text answers in v1 (buttons only) so she cannot wander into open chat with a bot that “talks about anything”
- Unknown text → “Tap a button below” + re-send the last item
- No web search, no comments, no ads
- Content lives in this repo; generated questions (if ever) sit in a parent-approve queue

### Visual language (within WhatsApp)

You do not control chrome. Control **cards**: consistent image size, short teach lines (reading age 7–11), numbered path messages that look like a map:

```
Animals
1. Pets     ✓
2. Wild     ← you are here
3. Homes    locked
4. Food     locked
```

One accent is unnecessary; world emoji in copy is optional and should stay rare so the chat does not become a sticker pack.

---

## 2. Requirements

### Actors

| Actor | Goal | Constraint |
| --- | --- | --- |
| Child | Play a lesson, see progress, hear facts | Buttons only; allowlisted number |
| Parent | Author cards, set limits, see minutes | PIN in chat or later a tiny web form |

### Must-have (v1)

| ID | Requirement | Acceptance |
| --- | --- | --- |
| C1 | Skill path as a WhatsApp message + Continue | Continue opens the next unlocked lesson |
| C2 | Lesson runner: MCQ list + true/false buttons | Both types complete a 8–12 item lesson |
| C3 | Hearts and XP persist | Process restart; same number restores state |
| C4 | Streak by local calendar day (Asia/Kolkata) | One completed lesson marks today |
| C5 | Read-aloud on teach cards | Audio message with the fact sentence |
| C6 | Spaced review queue | Missed/aging cards appear in Practice |
| P1 | Number allowlist + parent PIN + daily time cap | Cap → “come back tomorrow” |
| P2 | Content pack from JSON | New card file appears after process reload |
| N1 | Works on WhatsApp iOS and Android | Same flow on parent phone and tablet WhatsApp |
| N2 | Session timeout | 15 min idle → “Say play to continue” without losing lesson pointer |

### Explicitly out of v1

Native App Store apps, match-the-pairs drag UI, winding illustrated path, multiplayer, cloud login for the child, live AI questions, speech recognition, paid store, third-party analytics, open-ended chatbot.

### Non-functional

- **Latency:** bot reply under 2 seconds for button taps
- **Privacy:** store number hashes + progress; do not log full message bodies in production; no ads SDK
- **Reliability:** idempotent webhook (Meta retries); do not double-award XP
- **Maintainability:** add a lesson by editing JSON, not by redeploying UI
- **Cost:** Meta Cloud API conversation charges apply; keep sessions short; template messages only for the 24-hour window reminder if you use one

### Age is a product requirement

Younger than 7: shorter sentences, two-choice only, more pictures. Older than 11: optional typed answers later. Confirm before writing the 40 cards.

---

## 3. Language, tools, and WhatsApp stack

One language: **TypeScript**.

| Choice | Why | Rejected |
| --- | --- | --- |
| TypeScript | One type system from webhook to content schema; Cursor-friendly | Python-only (fine later, not first) |
| Node.js 22 | WhatsApp webhook + JSON | Serverless-only from day one |
| WhatsApp Cloud API (Meta) | Official buttons, lists, media | Twilio (extra bill), unofficial WhatsApp Web scrapers (against ToS, fragile) |
| Fastify | Fast webhook, simple | Express (ok), Next.js (unnecessary for a bot) |
| PostgreSQL (or SQLite for laptop demo) | Progress, SRS, allowlist | Firebase (account gravity) |
| Drizzle ORM | Typed SQL | Raw SQL sprawl |
| Zod | Validate lesson JSON and webhook payloads | Unchecked `JSON.parse` |
| Same `packages/engine` as a future app | UI-dumb scoring, hearts, SM-2 | Put rules inside webhook handlers |
| Optional: Expo later | Same engine, native skin | Building Expo *first* |

**Meta setup (ops, not code):** Meta developer app, WhatsApp Business Account, a test number, then a production number. Webhook URL must be HTTPS. Start in Meta’s test mode with the parent phone allowlisted.

**TTS:** generate audio files at content-build time (or `expo-speech` equivalent on a small worker) and send as WhatsApp audio. Avoid calling a cloud TTS on every tap.

**Hosting (when not on a laptop):** a small VPS or Fly.io/Railway with a public HTTPS URL. ngrok is for local development only.

---

## 4. Code structure

Monorepo, pnpm workspaces. The WhatsApp adapter is a thin I/O layer over a pure lesson engine.

```
myquizapp/
  apps/whatsapp/           Cloud API webhook, message templates, allowlist
  packages/engine/         scoring, hearts, SM-2, unlock rules (no WhatsApp imports)
  packages/schema/         Zod: FactCard, Item, Lesson, World
  packages/content/        JSON worlds + art + `pnpm content:check`
  docs/PRODUCT_PAPER.md    this paper
```

### WhatsApp app folders

| Path | Owns |
| --- | --- |
| `apps/whatsapp/src/webhook.ts` | Verify token, signature, enqueue |
| `apps/whatsapp/src/router.ts` | Map inbound message → command or answer |
| `apps/whatsapp/src/render.ts` | Engine state → WhatsApp buttons/list/image |
| `apps/whatsapp/src/meta.ts` | Send API client |
| `src/db/` | Drizzle: users (phone hash), progress, reviews, events |
| `src/store/` | In-flight lesson session (Redis or Postgres) |

### Core types (engine, not WhatsApp)

| Type | Fields that matter |
| --- | --- |
| `FactCard` | id, worldId, prompt, teachText, image, audioText, tags |
| `Item` | kind: `mcq` \| `tf`; cardId; choices; correct |
| `Lesson` | id, skillId, itemIds, unlockAfter |
| `Attempt` | itemId, correct, ms, timestamp |
| `Review` | cardId, ease, intervalDays, dueAt, lapses |
| `Progress` | xp, streakDays, hearts, lastPlayedDate |

### Engine API (keep the adapter dumb)

- `startLesson(id)` → session  
- `submitAnswer(session, choice)` → `{ correct, heartsLeft, nextItem, feedback }`  
- `completeLesson` writes XP, unlocks, schedules reviews  
- `dueReviews(now)` feeds Practice  

Unit-test with a fake clock. WhatsApp only renders what the engine returns.

### Build order

| Week | Slice | Done when |
| --- | --- | --- |
| 1 | Schema + 40 animal cards + `content:check` | JSON validates; a lesson is readable on paper |
| 2 | Engine tests + database progress | Hearts, XP, SRS work in Node tests |
| 3 | Meta test number + webhook + TF/MCQ | She finishes one lesson in WhatsApp |
| 4 | Images, audio, result + Continue | Full loop for Animals |
| 5 | Parent PIN, time cap, practice queue | You can limit play and add a card |
| 6 | Space world + production number | Daily use for two weeks |

---

## 5. Native app — parked, not discarded

If WhatsApp feels too cramped after two weeks of real use, wrap the same `packages/engine` and `packages/content` in Expo. Do not fork the rules. The paper’s original native screens (home path, lesson chrome, parent PIN UI) remain the design target for that phase.

---

## 6. Decision log

| Decision | Choice |
| --- | --- |
| Delivery | WhatsApp Cloud API |
| Language | TypeScript |
| First world | Animals |
| Typing | None in v1 |
| Social | None |
| Backend | Required (webhook); no child login |
| GitHub | `github.com:Debadarsini/myquizapp.git` |
