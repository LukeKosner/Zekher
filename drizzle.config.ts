import type { Config } from "drizzle-kit";
import { env } from "./lib";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default {
  schema: "./lib/database/schema.ts",
  dialect: "postgresql",
  out: "./lib/database/migrations",
  dbCredentials: {
    url: env.DATABASE_URL
  }
} satisfies Config;
