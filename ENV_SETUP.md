# Environment variables

This repo intentionally ignores `.env*` files via `.gitignore`.

## Required

- `DATABASE_URL`: Neon/Postgres connection string (must include SSL / `sslmode=require`).
- `NEXTAUTH_SECRET`: random secret string for NextAuth (JWT signing).
- `NEXTAUTH_URL`: the canonical site URL (used by NextAuth). For local dev: `http://localhost:3000`. For production: `https://your-domain.com`.

## Optional (but recommended)

- `NEXT_PUBLIC_SITE_URL`: used for metadata base URL (defaults to `http://localhost:3000`).

## Optional payment destinations (shown on the order confirmation page)

These are **public identifiers**, not secrets:

- `CASHAPP_TAG` (example: `$1uplabs`)
- `VENMO_HANDLE` (example: `@Shop_1-upLabs`)
- `ZELLE_RECIPIENT` (example: `you@example.com`)
- `BTC_ADDRESS` (example: `bc1q8rtqf33xn8mjhcwuwrrcamcpvcyvg39u0qfn36`)



