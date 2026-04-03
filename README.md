# TheMiracle App (Next.js + Prisma + PayPal)

## Overview

This is a Next.js full-stack app with:
- Email-based auth + JWT in server-set `auth-token` cookie
- Email verification flow (`isVerified` enforced at login)
- Role-based guards (`admin` and default `user`)
- Prisma/PostgreSQL backend
- PayPal order flow (sandbox/live settings)

## Quickstart

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create a `.env` at project root with:

```env
# Core app
NODE_ENV=development
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database (Prisma)
DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/<db>?schema=public"
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=2

# Auth
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"

# Wallet/AppKit (used by current code paths)
NEXT_PUBLIC_PROJECT_ID="<reown-project-id>"
# Legacy/alternate path still present in lib/appkit.ts
NEXT_PUBLIC_REOWN_PROJECT_ID="<reown-project-id>"

# PayPal
NEXT_PUBLIC_SANDBOX_PAYPAL_ID="<sandbox-client-id>"
NEXT_PUBLIC_SANDBOX_PAYPAL_SECRET="<sandbox-client-secret>"
NEXT_PUBLIC_LIVE_PAYPAL_ID="<live-client-id>"
PAYPAL_CLIENT_SECRET="<live-client-secret>"
```

Notes:
- `POST /api/auth/login` sets an `HttpOnly` `auth-token` cookie server-side; no client-side token storage is required.
- Keep `.env` local only and configure production secrets in your hosting provider.

## Database setup

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

## Running app

```bash
npm run dev
```

## API endpoints

- `POST /api/auth/signup` - create new user (sends verification token via external endpoint in production)
- `POST /api/auth/verify` - verify user by email+token
- `POST /api/auth/login` - login, returns cookie `auth-token`
- `POST /api/auth/logout` - clear cookie and redirect
- `GET /api/auth/me` - returns logged-in user
- `GET /api/test-db` - sanity check DB connection

## Runbook

1. Ensure `.env` is present with all required values above.
2. Ensure PostgreSQL is reachable via `DATABASE_URL`.
3. Install and build Prisma artifacts: `npm install && npx prisma generate`.
4. Apply migrations (dev): `npx prisma migrate dev` and inspect data with `npx prisma studio`.
5. Start app: `npm run dev`.
6. Run auth flow:
   - Sign up a new user via `/signup`.
   - Verify email via `/verify-email` link/token.
   - Attempt login before verification should return `403` with verification message.
   - Login after verification should succeed and set `auth-token` cookie.
7. Confirm session behavior:
   - `auth-token` exists as `HttpOnly` cookie in browser devtools.
   - `/api/auth/me` returns `{ user: ... }` for authenticated sessions.
8. Check protected routes:
   - `/dashboard`, `/profile`, `/settings`
   - `/admin` (admin role only)
9. For PayPal flows, ensure sandbox/live keys are set and `NEXT_PUBLIC_APP_URL` points to deployed host.
10. For logout, confirm `/api/auth/logout` clears cookie and invalidates session.
11. For rollback, restore last working commit, run `npm install`, and re-run migrations as needed.

## Testing and debug

- Use `http://localhost:3000/api/test-db` to validate DB.
- Use `http://localhost:3000/api/auth/me` for current user state after login.
- Inspect cookie in browser devtools; `auth-token` should be `HttpOnly` and not directly readable from JavaScript.

## Deploy

- Build: `npm run build`
- Start production: `npm start`
- Ensure environment vars are set in hosting provider (Vercel, etc.).

