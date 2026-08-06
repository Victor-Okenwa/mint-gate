import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Server-only Drizzle client. Import from API routes / server code only.
 * Uses DATABASE_URL (local Docker Postgres or hosted Supabase Postgres).
 */
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(url, {
    prepare: false,
    max: 10,
  });

  return drizzle(client, { schema });
}

const globalForDb = globalThis as unknown as {
  mintGateDb?: ReturnType<typeof createDb>;
};

export const db = globalForDb.mintGateDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.mintGateDb = db;
}
