This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-ccc-app`](https://github.com/CKBFansDAO/create-ccc-app) 

## Getting Started

### Local database (Docker + Drizzle)

Community data uses **Postgres via Drizzle** in Next.js API routes only (no browser DB client). Local DB is a small `postgres:16-alpine` container (`docker-compose.yml`), not the full Supabase CLI stack.

1. Start Docker Desktop / Engine (WSL2-compatible).
2. Start Postgres:

```bash
pnpm db:start
```

3. Copy env if needed (`DATABASE_URL` should match Compose):

```bash
cp .env.example .env.local
# DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

4. Apply schema migrations, then run the app:

```bash
pnpm drizzle:migrate
pnpm dev
```

Useful commands:

- `pnpm db:stop` / `pnpm db:status` — stop or inspect the container
- `pnpm drizzle:generate` — generate SQL from `lib/db/schema.ts`
- `pnpm drizzle:migrate` — apply migrations
- `pnpm drizzle:studio` — Drizzle Studio UI ([https://local.drizzle.studio](https://local.drizzle.studio))

Production uses the same Drizzle schema against hosted Supabase Postgres (`DATABASE_URL`).

If you previously ran `supabase start`, you can reclaim disk with `pnpm db:stop` (Compose) and Docker prune of unused Supabase images/volumes when you no longer need them.

### Dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

### Next.js
To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!


### CCC
To learn more about CCC, take a look at the following resources:

- [CCC Documentation](https://docs.ckbccc.com/) - learn about CCC features and API.
- [CCC Demo](https://app.ckbccc.com) - Code examples for invoking CCC in various use cases.

You can check out [the CCC GitHub repository](https://github.com/ckb-devrel/ccc) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
