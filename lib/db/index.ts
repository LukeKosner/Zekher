import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import { env } from "@/lib/utils/env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be provided");
}

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client);
export const sql: Sql = client;
