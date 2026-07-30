# Marathi Classifieds Marketplace

Production-ready OLX-style classifieds for Marathi users. Single Next.js 15 app (App Router) deployable on Netlify.

## Stack

- Next.js 15 · React 19 · TypeScript · Tailwind CSS · shadcn/ui
- MongoDB Atlas + Mongoose · JWT + Auth.js (Google)
- TanStack Query · Zustand · React Hook Form · Zod
- Cloudinary · Resend · Twilio · Pusher · next-intl (en/mr)

## Quick start

```bash
cp .env.example .env.local
# Fill MONGODB_URI, JWT secrets, and optional provider keys

npm install
npm run seed
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

Default admin (after seed): `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`.

## Atlas checklist

1. Whitelist your IP (or `0.0.0.0/0` for development) in Atlas Network Access.
2. Use a database user with read/write on `marathi_classifieds`.
3. **Rotate any credentials that were shared in chat.**

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed categories + admin |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Architecture

```
app/            pages + API route handlers
components/     UI
features/       feature compositions
services/       business logic
repositories/   MongoDB access
models/         Mongoose schemas
validators/     Zod schemas
lib/            auth, security, db, i18n
```

## Netlify

`netlify.toml` uses `@netlify/plugin-nextjs`. Set all secrets in Netlify environment variables (never commit `.env.local`).

## OTP

- Email OTP via Resend (logs to console if `RESEND_API_KEY` is missing)
- Phone OTP via Twilio (logs to console if Twilio env vars are missing)

## Realtime chat

Pusher Channels. Without Pusher keys, events are logged server-side and the UI still works via polling/refetch.
