import type { Config } from "drizzle-kit";
import { env } from "./lib";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default {
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL
  }
} satisfies Config;
