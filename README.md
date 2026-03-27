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
# PostgreSQL
DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/<db>?schema=public"
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=2

# JWT auth
JWT_SECRET="<strong-secret>"
JWT_EXPIRES_IN="7d"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PROJECT_ID="<wallet-project-id>"

# PayPal (sandbox/live)
NEXT_PUBLIC_SANDBOX_PAYPAL_ID="<paypal-sandbox-client-id>"
NEXT_PUBLIC_SANDBOX_PAYPAL_SECRET="<paypal-sandbox-client-secret>"
NEXT_PUBLIC_LIVE_PAYPAL_ID="<paypal-live-client-id>"
PAYPAL_CLIENT_SECRET="<paypal-live-client-secret>"

# Optional
NODE_ENV=development
```

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

1. Ensure `.env` has correct values and secrets are rotated monthly.
2. Ensure PostgreSQL is reachable via `DATABASE_URL`.
3. Rebuild prisma client after schema changes: `npx prisma generate`.
4. Migrate DB (dev): `npx prisma migrate dev` and confirm on `npx prisma studio`.
5. Start app: `npm run dev`; verify homepage and auth flows.
6. Signup with new user, verify email (or check console URL in dev), then login.
7. Check protected routes:
   - `/dashboard`, `/profile`, `/settings`
   - `/admin` (admin role only)
8. For PayPal flows, ensure sandbox/live keys are set and `NEXT_PUBLIC_APP_URL` points to deployed host.
9. For logout, confirm `/api/auth/logout` clears cookie and invalidates session.
10. For emergency rollback, restore last working commit and re-run `npm install` + `npm run dev`.

## Testing and debug

- Use `http://localhost:3000/api/test-db` to validate DB.
- Use `http://localhost:3000/api/auth/me` for current user state after login.
- Inspect cookie in browser devtools; `auth-token` should be `HttpOnly` and not directly readable from JavaScript.

## Deploy

- Build: `npm run build`
- Start production: `npm start`
- Ensure environment vars are set in hosting provider (Vercel, etc.).

