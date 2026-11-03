This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Neon setup

This app is linked to a Neon project through `.neon` and declares its services in `neon.ts`
(Postgres is implicit; Neon Auth is enabled). Provisioning and env pull:

```bash
neon deploy        # applies neon.ts and pulls the branch env into .env.local
```

`neon deploy` writes `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`,
`NEON_AUTH_BASE_URL`, and `NEON_AUTH_JWKS_URL`. One variable is application config and
must be set by hand:

```bash
openssl rand -base64 32   # paste into NEON_AUTH_COOKIE_SECRET in .env.local
```

Apply the database schema (uses the direct, non-pooled connection):

```bash
pnpm db:push
```

### How the services are wired

| Service | Where | Notes |
| --- | --- | --- |
| Postgres | `lib/db.ts` | `pg` `Pool` on the pooled `DATABASE_URL`, cached on `globalThis`, released on Vercel Fluid compute via `attachDatabasePool`. Chosen because Cache Components requires the Node.js runtime. |
| Postgres schema | `db/schema.sql`, `scripts/db-push.mjs` | Idempotent `public.notes` table, applied with `pnpm db:push`. |
| Neon Auth | `lib/auth/server.ts`, `app/api/auth/[...path]/route.ts` | Managed Better Auth via `@neondatabase/auth/next/server`; the browser client talks to the same-origin `/api/auth` proxy. |
| Route protection | `proxy.ts` | Redirects unauthenticated visitors away from `/notes`. API routes check the session themselves and return 401. |
| Notes API | `app/api/notes/route.ts` | `GET` lists the signed-in user's notes, `POST` inserts one; both return 401 without a session. |


You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
