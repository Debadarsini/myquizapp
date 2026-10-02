# Wonder Path (myquizapp)

A Duolingo-shaped general-knowledge path for one child, delivered over WhatsApp.

Product paper: [docs/PRODUCT_PAPER.md](docs/PRODUCT_PAPER.md)

## Code structure

```
myquizapp/
  apps/whatsapp/              Cloud API webhook (thin adapter)
    src/webhook.ts            Verify token, accept Meta POSTs
    src/router.ts             Inbound message → play / answer / parent
    src/render.ts             Engine result → buttons / list / text
    src/meta.ts               Graph API send client
    src/db/                   Drizzle tables (progress, reviews, allowlist)
    src/store/session.ts      In-flight lesson (memory for laptop demo)
  packages/engine/            Scoring, hearts, SM-2, unlock — no WhatsApp imports
  packages/schema/            Zod: FactCard, Item, Lesson, World
  packages/content/           JSON worlds + `pnpm content:check`
  docs/PRODUCT_PAPER.md
```

WhatsApp only renders what `packages/engine` returns. A later Expo app can reuse the same engine and JSON.

## Commands

```bash
pnpm install
pnpm content:check
pnpm test
pnpm dev          # Fastify webhook on :3000 (needs ngrok for Meta)
```

Copy `.env.example` to `.env` before talking to Meta.

## WhatsApp cost (family laptop/phone)

You do **not** pay WhatsApp to use the normal app on a phone or laptop. The child still chats in free WhatsApp.

You **cannot** host the official bot *inside* personal WhatsApp. The bot is a small Node server (this laptop or later Fly/Railway). WhatsApp is only the chat UI.

Official path: **WhatsApp Cloud API** (Meta). Setup is a Meta developer app + a **business** test number, not your personal WhatsApp number.

- **Development:** Meta’s test number + a few allowlisted phones. You pay Meta $0 for that sandbox. You may still pay for **ngrok** (optional) or later a tiny VPS.
- **Production messages:** Meta bills **per message**, not a monthly WhatsApp “hosting” fee. She messages first → 24-hour window. Until 30 Sep 2026, non-template replies in that window were free. **From 1 Oct 2026**, Meta charges **service** messages after **1,000 free service messages per business number per month**.
- Do **not** scrape WhatsApp Web on the laptop to skip Meta. That breaks WhatsApp’s terms and can ban the number.

For one child, stay well under 1,000 bot replies/month at first (short lessons). If you go over, India service rates apply only after the free tier. Do not send marketing templates.
